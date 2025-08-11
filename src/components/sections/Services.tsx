import { FaWater, FaGasPump, FaTools, FaChartLine, FaShieldAlt, FaThermometerHalf, FaFileAlt, FaMoneyBillWave } from 'react-icons/fa';
import ServiceCard from '../ui/ServiceCard';
import { Service } from '@/types';

const services: Service[] = [
  { icon: FaWater, title: "Obras de Individualização", description: "Projeto, adaptação de tubulações e instalação de hidrômetros e medidores de gás." },
  { icon: FaChartLine, title: "Leitura por Telemetria", description: "Hidrômetros inteligentes com comunicação sem fio para leitura automática e contínua." },
  { icon: FaTools, title: "Leitura Visual Periódica", description: "Inspeção manual por profissionais treinados, com registro de leituras em intervalos definidos." },
  { icon: FaShieldAlt, title: "Suporte Técnico e Manutenção", description: "Calibração, manutenção preventiva e corretiva, com atendimento ágil para qualquer eventualidade." },
  { icon: FaGasPump, title: "Troca ou Manutenção de Equipamentos", description: "Substituição de hidrômetros e medidores de gás com garantia de conformidade e desempenho." },
  { icon: FaShieldAlt, title: "Teste de Estanqueidade", description: "Verificação da estanqueidade da rede de gás, assegurando total segurança ao condomínio." },
  { icon: FaThermometerHalf, title: "Instalação de Aquecedores", description: "Serviços completos para aquecedores de gás, desde a instalação até manutenções periódicas." },
  { icon: FaFileAlt, title: "Análise e Relatórios", description: "Portal online com dashboards, comparativos históricos e alertas de desvios de consumo." },
  { icon: FaMoneyBillWave, title: "Emissão de Faturas", description: "Geração de cobranças precisas e transparentes, integráveis ao sistema de gestão do condomínio." }
];

export default function Services() {
  return (
    <section id="servicos" className="bg-gradient-to-br from-brand-blue to-cyan-500 py-20 sm:py-32 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-white">Nossos Serviços</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Soluções Completas para seu Condomínio
          </p>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Oferecemos um portfólio completo de serviços para garantir uma gestão eficiente e transparente do consumo de água e gás.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 