import Link from "next/link";
import { FaWater, FaGasPump, FaTools, FaChartLine, FaShieldAlt, FaThermometerHalf, FaFileAlt, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';

export default function Home() {
  const year = new Date().getFullYear();
  return (
    <main className="font-sans text-gray-900">
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600/20"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            Gestão Inteligente de Água e Gás para o Seu Condomínio
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-50 animate-fade-in-delay">
            Monitoramento individual e automatizado, com tecnologia de ponta para redução de custos e total transparência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <a href="#contato" className="group bg-white text-blue-700 font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
              Solicitar Orçamento
              <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#sobre" className="group border-2 border-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-700 transition-all duration-300 flex items-center justify-center gap-2">
              Saiba Mais
              <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section id="sobre" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300 border border-blue-100">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Quem Somos</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            A Leitura Nova é especialista em soluções de leitura e gestão de consumo de água e gás para condomínios. Oferecemos duas modalidades de leitura — telemetria de última geração ou medição visual periódica — sempre suportadas por uma equipe técnica qualificada para garantir acompanhamento mensal, preciso e individualizado de cada unidade. Atuamos desde a instalação dos equipamentos até a análise de dados e validação in loco das leituras, promovendo economia e sustentabilidade para síndicos e condôminos.
          </p>
        </div>
      </section>

      <section id="servicos" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-600 relative">Nossos Serviços</h2>
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto relative">
          {[
            { icon: FaWater, title: "Obras de Individualização", description: "Projeto, adaptação de tubulações e instalação de hidrômetros e medidores de gás, garantindo a separação individual de cada unidade." },
            { icon: FaChartLine, title: "Leitura por Telemetria", description: "Hidrômetros inteligentes com comunicação sem fio para leitura automática e contínua, sem necessidade de visita ao local." },
            { icon: FaTools, title: "Leitura Visual Periódica", description: "Inspeção manual por profissionais treinados, com registro de leituras em intervalos definidos." },
            { icon: FaShieldAlt, title: "Suporte Técnico e Manutenção", description: "Calibração, manutenção preventiva e corretiva, com atendimento ágil para qualquer eventualidade." },
            { icon: FaGasPump, title: "Troca ou Manutenção de Equipamentos", description: "Substituição de hidrômetros e medidores de gás com garantia de conformidade e desempenho." },
            { icon: FaShieldAlt, title: "Teste de Estanqueidade", description: "Verificação da estanqueidade da rede de gás, assegurando total segurança ao condomínio." },
            { icon: FaThermometerHalf, title: "Instalação e Manutenção de Aquecedores de Gás", description: "Serviços completos para aquecedores, desde a instalação até manutenções periódicas." },
            { icon: FaFileAlt, title: "Análise e Relatórios", description: "Portal online com dashboards, comparativos históricos e alertas de desvios de consumo." },
            { icon: FaMoneyBillWave, title: "Emissão de Faturas", description: "Geração de cobranças precisas e transparentes, integráveis ao sistema de gestão do condomínio." }
          ].map((service, index) => (
            <div key={index} className="group bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <div className="text-blue-600 text-3xl mb-4 transform group-hover:scale-110 transition-transform">
                <service.icon />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-700">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="diferenciais" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-600 relative">Por que Escolher a Leitura Nova</h2>
        <ul className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative">
          {[
            { title: "Duas Opções de Leitura", description: "Telemetria remota ou medição visual — você escolhe a melhor modalidade para seu condomínio." },
            { title: "Obras e Instalações Completas", description: "Equipe especializada para executar desde adaptações de tubulação até a entrega final do sistema." },
            { title: "Tecnologia e Transparência", description: "Plataforma intuitiva com acesso às informações em tempo real ou relatórios mensais, conforme sua necessidade." },
            { title: "Economia Comprovada", description: "Estudos de caso mostram até 30% de redução no consumo médio após nossa implantação." },
            { title: "Atendimento Personalizado", description: "Consultoria dedicada e suporte online para dúvidas e esclarecimentos." }
          ].map((diferencial, index) => (
            <li key={index} className="group bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-blue-700 group-hover:text-blue-600 transition-colors">{diferencial.title}</h3>
              <p className="text-gray-600">{diferencial.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="depoimentos" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-600 relative">O que Nossos Clientes Dizem</h2>
        <div className="max-w-3xl mx-auto space-y-8 relative">
          {[
            { quote: "Desde que implantamos a Leitura Nova, tivemos uma queda de 25% na conta de água. A plataforma é super intuitiva!", author: "Síndico do Condomínio Jardim das Flores" },
            { quote: "O suporte técnico resolve tudo muito rápido. Recomendo para qualquer síndico que queira praticidade.", author: "Síndica do Residencial Vista Bela" }
          ].map((depoimento, index) => (
            <blockquote key={index} className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <p className="text-gray-700 text-lg italic mb-4">"{depoimento.quote}"</p>
              <footer className="text-blue-600 font-semibold">— {depoimento.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="contato" className="py-20 px-4 text-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-3xl mx-auto relative">
          <h2 className="text-3xl font-bold mb-6">Pronto para Transformar a Gestão de Consumo do Seu Condomínio?</h2>
          <p className="text-xl mb-8 text-blue-50">Solicite uma avaliação gratuita e descubra como economizar e trazer mais transparência para seus moradores.</p>
          <a href="mailto:contato@leitura-nova.com.br" className="group inline-block bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 mx-auto">
            Falar com um Especialista
            <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-100 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <nav className="flex flex-wrap justify-center gap-8 mb-8">
            {["Sobre", "Serviços", "Blog", "Contato"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-blue-400 transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">
                <span className="text-2xl">📞</span>
                <span>(XX) XXXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">
                <span className="text-2xl">✉️</span>
                <span>contato@leitura-nova.com.br</span>
              </div>
            </div>
            <div className="flex justify-center md:justify-end gap-6">
              {[
                { name: "LinkedIn", color: "blue-400" },
                { name: "Instagram", color: "pink-400" },
                { name: "Facebook", color: "blue-400" }
              ].map((social) => (
                <Link
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className={`hover:text-${social.color} transition-colors`}
                >
                  {social.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-center text-gray-400">
            <p>Endereço comercial</p>
            <p className="mt-2">© {year} Leitura Nova. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
