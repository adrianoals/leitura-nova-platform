import { FaTools, FaBroadcastTower, FaEye, FaHeadset, FaExchangeAlt, FaShieldAlt, FaFire, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';

const servicos = [
  {
    icon: <FaTools className="w-8 h-8" />,
    title: "Obras de Individualização",
    description: "Projeto, adaptação de tubulações e instalação de hidrômetros e medidores de gás, garantindo a separação individual de cada unidade."
  },
  {
    icon: <FaBroadcastTower className="w-8 h-8" />,
    title: "Leitura por Telemetria",
    description: "Hidrômetros inteligentes com comunicação sem fio para leitura automática e contínua, sem necessidade de visita ao local."
  },
  {
    icon: <FaEye className="w-8 h-8" />,
    title: "Leitura Visual Periódica",
    description: "Inspeção manual por profissionais treinados, com registro de leituras em intervalos definidos."
  },
  {
    icon: <FaHeadset className="w-8 h-8" />,
    title: "Suporte Técnico e Manutenção",
    description: "Calibração, manutenção preventiva e corretiva, com atendimento ágil para qualquer eventualidade."
  },
  {
    icon: <FaExchangeAlt className="w-8 h-8" />,
    title: "Troca ou Manutenção de Equipamentos",
    description: "Substituição de hidrômetros e medidores de gás com garantia de conformidade e desempenho."
  },
  {
    icon: <FaShieldAlt className="w-8 h-8" />,
    title: "Teste de Estanqueidade",
    description: "Verificação da estanqueidade da rede de gás, assegurando total segurança ao condomínio."
  },
  {
    icon: <FaFire className="w-8 h-8" />,
    title: "Instalação e Manutenção de Aquecedores de Gás",
    description: "Serviços completos para aquecedores, desde a instalação até manutenções periódicas."
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: "Análise e Relatórios",
    description: "Portal online com dashboards, comparativos históricos e alertas de desvios de consumo."
  },
  {
    icon: <FaFileInvoiceDollar className="w-8 h-8" />,
    title: "Emissão de Faturas",
    description: "Geração de cobranças precisas e transparentes, integráveis ao sistema de gestão do condomínio."
  }
];

export default function Servicos() {
  return (
    <section id="servicos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Nossos Serviços
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicos.map((servico, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="text-blue-600 mb-4">
                {servico.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {servico.title}
              </h3>
              <p className="text-gray-600">
                {servico.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 