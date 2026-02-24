import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;

    const key = line.slice(0, idx).trim();
    if (!key || process.env[key]) continue;

    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (process.env.ALLOW_DESTRUCTIVE_TESTS !== 'true') {
  console.error('Set ALLOW_DESTRUCTIVE_TESTS=true to run this smoke test.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const createdAuthIds = new Set();
const createdCondominioIds = new Set();

function randomTag(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function deleteAuthUsers(ids) {
  for (const id of ids) {
    if (!id) continue;
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error && !/not found|does not exist/i.test(error.message)) {
      throw new Error(`Failed to delete auth user ${id}: ${error.message}`);
    }
  }
}

async function ensureAuthUserMissing(id) {
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (!error && data?.user) {
    throw new Error(`Auth user still exists: ${id}`);
  }
}

async function createCondominio(nome) {
  const { data, error } = await supabase
    .from('condominios')
    .insert({
      nome,
      tem_agua: true,
      tem_agua_quente: false,
      tem_gas: true,
      envio_leitura_morador_habilitado: false,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create condominio: ${error?.message}`);
  }

  createdCondominioIds.add(data.id);
  return data.id;
}

async function createUnidade(condominioId, apto) {
  const { data, error } = await supabase
    .from('unidades')
    .insert({
      condominio_id: condominioId,
      bloco: 'A',
      apartamento: apto,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create unidade: ${error?.message}`);
  }

  return data.id;
}

async function createAuthMorador(unidadeId, label) {
  const email = `${label}@example.com`;
  const password = `Tmp#${Math.random().toString(36).slice(2)}A1`;

  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'morador' },
  });

  if (authError || !created?.user?.id) {
    throw new Error(`Failed to create auth user: ${authError?.message}`);
  }

  const authUserId = created.user.id;
  createdAuthIds.add(authUserId);

  const { data: morador, error: moradorError } = await supabase
    .from('moradores')
    .insert({
      unidade_id: unidadeId,
      auth_user_id: authUserId,
      nome: `Morador ${label}`,
      email,
    })
    .select('id')
    .single();

  if (moradorError || !morador?.id) {
    await deleteAuthUsers([authUserId]);
    throw new Error(`Failed to create morador: ${moradorError?.message}`);
  }

  return { authUserId, moradorId: morador.id };
}

async function createLeituraWithFoto(unidadeId, mes, tipo = 'agua') {
  const { data: leitura, error: leituraError } = await supabase
    .from('leituras_mensais')
    .insert({
      unidade_id: unidadeId,
      tipo,
      mes_referencia: mes,
      data_leitura: `${mes}-10`,
      medicao: 123.45,
      valor: 67.89,
      criado_por_morador: false,
    })
    .select('id')
    .single();

  if (leituraError || !leitura?.id) {
    throw new Error(`Failed to create leitura: ${leituraError?.message}`);
  }

  const { data: foto, error: fotoError } = await supabase
    .from('fotos_leitura')
    .insert({
      leitura_id: leitura.id,
      storage_path: `smoke/${leitura.id}/foto.jpg`,
    })
    .select('id')
    .single();

  if (fotoError || !foto?.id) {
    throw new Error(`Failed to create foto: ${fotoError?.message}`);
  }

  return { leituraId: leitura.id, fotoId: foto.id };
}

async function rowExists(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed checking ${table}.${id}: ${error.message}`);
  }

  return Boolean(data?.id);
}

async function testDeleteMoradorFlow() {
  const condominioId = await createCondominio(randomTag('smoke-morador-cond'));
  const unidadeId = await createUnidade(condominioId, '901');
  const { authUserId, moradorId } = await createAuthMorador(unidadeId, randomTag('morador'));

  await deleteAuthUsers([authUserId]);
  createdAuthIds.delete(authUserId);

  const { error: deleteMoradorError } = await supabase.from('moradores').delete().eq('id', moradorId);
  if (deleteMoradorError) {
    throw new Error(`Failed deleting morador: ${deleteMoradorError.message}`);
  }

  assertTrue(!(await rowExists('moradores', moradorId)), 'Morador should be deleted');
  assertTrue(await rowExists('unidades', unidadeId), 'Unidade should remain after deleting morador');
  await ensureAuthUserMissing(authUserId);
}

async function testDeleteUnidadeFlow() {
  const condominioId = await createCondominio(randomTag('smoke-unidade-cond'));
  const unidadeId = await createUnidade(condominioId, '902');
  const { authUserId, moradorId } = await createAuthMorador(unidadeId, randomTag('unidade'));
  const { leituraId, fotoId } = await createLeituraWithFoto(unidadeId, '2026-02', 'agua');

  await deleteAuthUsers([authUserId]);
  createdAuthIds.delete(authUserId);

  const { error: deleteUnidadeError } = await supabase.from('unidades').delete().eq('id', unidadeId);
  if (deleteUnidadeError) {
    throw new Error(`Failed deleting unidade: ${deleteUnidadeError.message}`);
  }

  assertTrue(!(await rowExists('unidades', unidadeId)), 'Unidade should be deleted');
  assertTrue(!(await rowExists('moradores', moradorId)), 'Morador should be deleted by cascade');
  assertTrue(!(await rowExists('leituras_mensais', leituraId)), 'Leitura should be deleted by cascade');
  assertTrue(!(await rowExists('fotos_leitura', fotoId)), 'Foto should be deleted by cascade');
  await ensureAuthUserMissing(authUserId);
}

async function testDeleteCondominioFlow() {
  const condominioId = await createCondominio(randomTag('smoke-cond-cond'));
  const unidade1 = await createUnidade(condominioId, '903');
  const unidade2 = await createUnidade(condominioId, '904');

  const morador1 = await createAuthMorador(unidade1, randomTag('cond1'));
  const morador2 = await createAuthMorador(unidade2, randomTag('cond2'));

  const leitura1 = await createLeituraWithFoto(unidade1, '2026-02', 'agua');
  const leitura2 = await createLeituraWithFoto(unidade2, '2026-02', 'gas');

  await deleteAuthUsers([morador1.authUserId, morador2.authUserId]);
  createdAuthIds.delete(morador1.authUserId);
  createdAuthIds.delete(morador2.authUserId);

  const { error: deleteCondominioError } = await supabase.from('condominios').delete().eq('id', condominioId);
  if (deleteCondominioError) {
    throw new Error(`Failed deleting condominio: ${deleteCondominioError.message}`);
  }

  assertTrue(!(await rowExists('condominios', condominioId)), 'Condominio should be deleted');
  assertTrue(!(await rowExists('unidades', unidade1)), 'Unidade 1 should be deleted by cascade');
  assertTrue(!(await rowExists('unidades', unidade2)), 'Unidade 2 should be deleted by cascade');
  assertTrue(!(await rowExists('moradores', morador1.moradorId)), 'Morador 1 should be deleted by cascade');
  assertTrue(!(await rowExists('moradores', morador2.moradorId)), 'Morador 2 should be deleted by cascade');
  assertTrue(!(await rowExists('leituras_mensais', leitura1.leituraId)), 'Leitura 1 should be deleted by cascade');
  assertTrue(!(await rowExists('leituras_mensais', leitura2.leituraId)), 'Leitura 2 should be deleted by cascade');
  assertTrue(!(await rowExists('fotos_leitura', leitura1.fotoId)), 'Foto 1 should be deleted by cascade');
  assertTrue(!(await rowExists('fotos_leitura', leitura2.fotoId)), 'Foto 2 should be deleted by cascade');
  await ensureAuthUserMissing(morador1.authUserId);
  await ensureAuthUserMissing(morador2.authUserId);
}

async function cleanup() {
  if (createdAuthIds.size > 0) {
    await deleteAuthUsers([...createdAuthIds]);
  }

  if (createdCondominioIds.size > 0) {
    await supabase.from('condominios').delete().in('id', [...createdCondominioIds]);
  }
}

async function main() {
  console.log('Running delete smoke tests...');

  await testDeleteMoradorFlow();
  console.log('OK: delete morador flow');

  await testDeleteUnidadeFlow();
  console.log('OK: delete unidade flow');

  await testDeleteCondominioFlow();
  console.log('OK: delete condominio flow');

  console.log('All delete smoke tests passed.');
}

main()
  .catch(async (err) => {
    console.error('Delete smoke tests failed.');
    console.error(err?.stack || err?.message || err);
    await cleanup();
    process.exit(1);
  })
  .then(cleanup);
