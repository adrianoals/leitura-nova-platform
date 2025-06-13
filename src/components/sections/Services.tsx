import { FaWater, FaGasPump, FaTools, FaChartLine, FaShieldAlt, FaThermometerHalf, FaFileAlt, FaMoneyBillWave } from 'react-icons/fa';
import ServiceCard from '../ui/ServiceCard';
import { Service } from '@/types';

const services: Service[] = [
  { icon: FaWater, title: "Obras de Individualização", description: "Projeto, adaptação de tubulações e instalação de hidrômetros e medidores de gás, garantindo a separação individual de cada unidade." },
  { icon: FaChartLine, title: "Leitura por Telemetria", description: "Hidrômetros inteligentes com comunicação sem fio para leitura automática e contínua, sem necessidade de visita ao local." },
  { icon: FaTools, title: "Leitura Visual Periódica", description: "Inspeção manual por profissionais treinados, com registro de leituras em intervalos definidos." },
  { icon: FaShieldAlt, title: "Suporte Técnico e Manutenção", description: "Calibração, manutenção preventiva e corretiva, com atendimento ágil para qualquer eventualidade." },
  { icon: FaGasPump, title: "Troca ou Manutenção de Equipamentos", description: "Substituição de hidrômetros e medidores de gás com garantia de conformidade e desempenho." },
  { icon: FaShieldAlt, title: "Teste de Estanqueidade", description: "Verificação da estanqueidade da rede de gás, assegurando total segurança ao condomínio." },
  { icon: FaThermometerHalf, title: "Instalação e Manutenção de Aquecedores de Gás", description: "Serviços completos para aquecedores, desde a instalação até manutenções periódicas." },
  { icon: FaFileAlt, title: "Análise e Relatórios", description: "Portal online com dashboards, comparativos históricos e alertas de desvios de consumo." },
  { icon: FaMoneyBillWave, title: "Emissão de Faturas", description: "Geração de cobranças precisas e transparentes, integráveis ao sistema de gestão do condomínio." }
];

export default function Services() {
  return (
    <section id="servicos" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <h2 className="text-3xl font-bold text-center mb-12 text-blue-600 relative">Nossos Serviços</h2>
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto relative">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </section>
  );
} 