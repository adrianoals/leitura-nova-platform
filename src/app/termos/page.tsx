import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Leitura Nova',
  description: 'Termos de uso do site e dos serviços da Leitura Nova.',
};

const CNPJ = '53.589.608/0001-60';

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-vscode-blue hover:underline mb-10"
        >
          ← Voltar ao início
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Termos de Uso
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
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Aceitação dos termos</h2>
            <p>
              Ao acessar e utilizar o site da Leitura Nova e os serviços por ela oferecidos, você declara ter lido,
              compreendido e concordado com estes Termos de Uso. Caso não concorde com qualquer disposição, solicitamos
              que não utilize nosso site nem nossos serviços.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Objeto e serviços</h2>
            <p>
              A Leitura Nova atua na gestão de consumo de água e gás para condomínios, oferecendo soluções como
              individualização, leitura por telemetria ou visual, suporte técnico, análise de dados e emissão de
              faturas. Estes termos aplicam-se ao uso do site institucional e à relação comercial com a empresa.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Uso adequado</h2>
            <p>
              O usuário compromete-se a utilizar o site e as informações nele contidas de forma lícita e ética, sem
              praticar atos que prejudiquem o funcionamento do site, a imagem da Leitura Nova ou de terceiros.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo do site (textos, imagens, logotipos, layout) é de propriedade da Leitura Nova ou de
              seus licenciadores. A reprodução não autorizada é vedada.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Contato e alterações</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato por e-mail: contato@leitura-nova.com.br. A Leitura Nova
              reserva-se o direito de alterar estes Termos de Uso a qualquer momento, com divulgação no próprio site.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Lei aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. O foro da comarca de domicílio
              da Leitura Nova fica eleito para dirimir quaisquer questões oriundas destes termos.
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
  );
}
