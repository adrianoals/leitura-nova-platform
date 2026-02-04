import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Leitura Nova',
  description: 'Política de privacidade e proteção de dados da Leitura Nova.',
};

const CNPJ = '53.589.608/0001-60';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-vscode-blue hover:underline mb-10"
        >
          ← Voltar ao início
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-slate-600">
            Leitura Nova — CNPJ {CNPJ}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Última atualização: fevereiro de 2025
          </p>
        </header>

        <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Introdução</h2>
            <p>
              A Leitura Nova respeita sua privacidade e está comprometida com a proteção dos dados pessoais em
              conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Esta política descreve
              como coletamos, usamos e protegemos as informações obtidas por meio do site e no âmbito dos nossos
              serviços.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Dados que coletamos</h2>
            <p className="mb-4">
              Podemos coletar os seguintes tipos de dados:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Dados de identificação e contato (nome, e-mail, telefone) quando você nos envia uma mensagem ou solicita orçamento;</li>
              <li>Dados de navegação no site (endereço IP, tipo de navegador, páginas visitadas), quando aplicável, para melhorar a experiência e a segurança;</li>
              <li>Dados necessários à prestação dos serviços contratados (dados do condomínio, unidades, leituras e faturas), tratados conforme contrato e legislação.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Finalidade do tratamento</h2>
            <p>
              Os dados são utilizados para responder ao seu contato, prestar e melhorar nossos serviços de gestão de
              consumo, cumprir obrigações legais e contratuais e, quando autorizado, enviar comunicações relacionadas
              aos nossos serviços.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Base legal e compartilhamento</h2>
            <p>
              O tratamento é realizado com base em consentimento, execução de contrato ou legítimo interesse, conforme
              a LGPD. Não vendemos seus dados. O compartilhamento ocorre apenas quando necessário para prestação do
              serviço, cumprimento de lei ou determinação judicial, com garantia de confidencialidade dos parceiros.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Seus direitos</h2>
            <p className="mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar, corrigir e atualizar seus dados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
              <li>Revogar o consentimento, quando este for a base do tratamento.</li>
            </ul>
            <p className="mt-4">
              Para exercer esses direitos, entre em contato: contato@leitura-nova.com.br.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Segurança e retenção</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou
              alteração. Os dados são mantidos pelo tempo necessário para as finalidades descritas ou para cumprimento
              de obrigações legais.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Alterações e contato</h2>
            <p>
              Esta política pode ser atualizada. Alterações relevantes serão divulgadas no site. Dúvidas ou solicitações
              relativas à privacidade podem ser enviadas para contato@leitura-nova.com.br.
            </p>
          </section>
        </article>

        <div className="mt-14 pt-8 border-t border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-vscode-blue hover:underline"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
