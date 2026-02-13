'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CondominioSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    tem_agua: z.boolean(),
    tem_agua_quente: z.boolean(),
    tem_gas: z.boolean(),
    envio_leitura_morador_habilitado: z.boolean(),
    leitura_dia_inicio: z.number().min(1).max(31),
    leitura_dia_fim: z.number().min(1).max(31),
});

export async function createCondominio(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'Usuário não autenticado' };
    }

    // Parse data
    const rawData = {
        nome: formData.get('nome'),
        tem_agua: formData.get('tem_agua') === 'on',
        tem_agua_quente: formData.get('tem_agua_quente') === 'on',
        tem_gas: formData.get('tem_gas') === 'on',
        envio_leitura_morador_habilitado: formData.get('envio_leitura_morador_habilitado') === 'on',
        leitura_dia_inicio: Number(formData.get('leitura_dia_inicio')),
        leitura_dia_fim: Number(formData.get('leitura_dia_fim')),
    };

    // Validate
    const validatedFields = CondominioSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro na validação dos campos.',
        };
    }

    // Insert
    const { error } = await supabase
        .from('condominios')
        .insert(validatedFields.data);

    if (error) {
        console.error('Erro ao criar condomínio:', error);
        return { message: 'Erro ao salvar no banco de dados.' };
    }

    revalidatePath('/admin/condominios');
    redirect('/admin/condominios');
}
