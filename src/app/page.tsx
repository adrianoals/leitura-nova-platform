import Link from "next/link";

export default function Home() {
  const year = new Date().getFullYear();
  return (
    <main className="font-sans text-gray-900">
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">Gestão Inteligente de Água e Gás para o Seu Condomínio</h1>
        <p className="max-w-2xl mb-6 text-lg">Monitoramento individual e automatizado, com tecnologia de ponta para redução de custos e total transparência.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#contato" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded shadow">Solicitar Orçamento</a>
          <a href="#sobre" className="border border-white px-6 py-3 rounded">Saiba Mais</a>
        </div>
      </section>

      <section id="sobre" className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Quem Somos</h2>
        <p className="text-gray-700">A Leitura Nova é especialista em soluções de leitura e gestão de consumo de água e gás para condomínios. Oferecemos duas modalidades de leitura — telemetria de última geração ou medição visual periódica — sempre suportadas por uma equipe técnica qualificada para garantir acompanhamento mensal, preciso e individualizado de cada unidade. Atuamos desde a instalação dos equipamentos até a análise de dados e validação in loco das leituras, promovendo economia e sustentabilidade para síndicos e condôminos.</p>
      </section>

      <section id="servicos" className="py-16 px-4 bg-gray-50">
        <h2 className="text-2xl font-semibold text-center mb-8">Nossos Serviços</h2>
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <div>
            <h3 className="font-medium">Obras de Individualização</h3>
            <p className="text-gray-600">Projeto, adaptação de tubulações e instalação de hidrômetros e medidores de gás, garantindo a separação individual de cada unidade.</p>
          </div>
          <div>
            <h3 className="font-medium">Leitura por Telemetria</h3>
            <p className="text-gray-600">Hidrômetros inteligentes com comunicação sem fio para leitura automática e contínua, sem necessidade de visita ao local.</p>
          </div>
          <div>
            <h3 className="font-medium">Leitura Visual Periódica</h3>
            <p className="text-gray-600">Inspeção manual por profissionais treinados, com registro de leituras em intervalos definidos.</p>
          </div>
          <div>
            <h3 className="font-medium">Suporte Técnico e Manutenção</h3>
            <p className="text-gray-600">Calibração, manutenção preventiva e corretiva, com atendimento ágil para qualquer eventualidade.</p>
          </div>
          <div>
            <h3 className="font-medium">Troca ou Manutenção de Equipamentos</h3>
            <p className="text-gray-600">Substituição de hidrômetros e medidores de gás com garantia de conformidade e desempenho.</p>
          </div>
          <div>
            <h3 className="font-medium">Teste de Estanqueidade</h3>
            <p className="text-gray-600">Verificação da estanqueidade da rede de gás, assegurando total segurança ao condomínio.</p>
          </div>
          <div>
            <h3 className="font-medium">Instalação e Manutenção de Aquecedores de Gás</h3>
            <p className="text-gray-600">Serviços completos para aquecedores, desde a instalação até manutenções periódicas.</p>
          </div>
          <div>
            <h3 className="font-medium">Análise e Relatórios</h3>
            <p className="text-gray-600">Portal online com dashboards, comparativos históricos e alertas de desvios de consumo.</p>
          </div>
          <div>
            <h3 className="font-medium">Emissão de Faturas</h3>
            <p className="text-gray-600">Geração de cobranças precisas e transparentes, integráveis ao sistema de gestão do condomínio.</p>
          </div>
        </div>
      </section>

      <section id="diferenciais" className="py-16 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Por que Escolher a Leitura Nova</h2>
        <ul className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto list-disc pl-5">
          <li>
            <h3 className="font-medium">Duas Opções de Leitura</h3>
            <p className="text-gray-600">Telemetria remota ou medição visual — você escolhe a melhor modalidade para seu condomínio.</p>
          </li>
          <li>
            <h3 className="font-medium">Obras e Instalações Completas</h3>
            <p className="text-gray-600">Equipe especializada para executar desde adaptações de tubulação até a entrega final do sistema.</p>
          </li>
          <li>
            <h3 className="font-medium">Tecnologia e Transparência</h3>
            <p className="text-gray-600">Plataforma intuitiva com acesso às informações em tempo real ou relatórios mensais, conforme sua necessidade.</p>
          </li>
          <li>
            <h3 className="font-medium">Economia Comprovada</h3>
            <p className="text-gray-600">Estudos de caso mostram até 30% de redução no consumo médio após nossa implantação.</p>
          </li>
          <li>
            <h3 className="font-medium">Atendimento Personalizado</h3>
            <p className="text-gray-600">Consultoria dedicada e suporte online para dúvidas e esclarecimentos.</p>
          </li>
        </ul>
      </section>

      <section id="depoimentos" className="py-16 px-4 bg-gray-50">
        <h2 className="text-2xl font-semibold text-center mb-8">O que Nossos Clientes Dizem</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <blockquote className="border-l-4 border-blue-600 pl-4 text-gray-700">
            “Desde que implantamos a Leitura Nova, tivemos uma queda de 25% na conta de água. A plataforma é super intuitiva!” — <span className="italic">Síndico do Condomínio Jardim das Flores</span>
          </blockquote>
          <blockquote className="border-l-4 border-blue-600 pl-4 text-gray-700">
            “O suporte técnico resolve tudo muito rápido. Recomendo para qualquer síndico que queira praticidade.” — <span className="italic">Síndica do Residencial Vista Bela</span>
          </blockquote>
        </div>
      </section>

      <section id="contato" className="py-16 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">Pronto para Transformar a Gestão de Consumo do Seu Condomínio?</h2>
        <p className="max-w-2xl mx-auto mb-6">Solicite uma avaliação gratuita e descubra como economizar e trazer mais transparência para seus moradores.</p>
        <a href="mailto:contato@leitura-nova.com.br" className="bg-blue-600 text-white px-6 py-3 rounded font-semibold">Falar com um Especialista</a>
      </section>

      <footer className="bg-gray-800 text-gray-100 py-8 text-center">
        <nav className="flex flex-wrap justify-center gap-6 mb-4">
          <a href="#sobre" className="hover:underline">Sobre</a>
          <a href="#servicos" className="hover:underline">Serviços</a>
          <a href="#blog" className="hover:underline">Blog</a>
          <a href="#contato" className="hover:underline">Contato</a>
        </nav>
        <div className="space-y-2 mb-4">
          <div>📞 (XX) XXXX-XXXX</div>
          <div>✉️ contato@leitura-nova.com.br</div>
          <div className="flex justify-center gap-3">
            <Link href="#" aria-label="LinkedIn" className="hover:text-blue-300">LinkedIn</Link>
            <Link href="#" aria-label="Instagram" className="hover:text-pink-300">Instagram</Link>
            <Link href="#" aria-label="Facebook" className="hover:text-blue-500">Facebook</Link>
          </div>
          <div>Endereço comercial</div>
        </div>
        <p className="text-sm">© {year} Leitura Nova.</p>
      </footer>
    </main>
  );
}
