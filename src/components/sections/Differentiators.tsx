import { FaExchangeAlt, FaHardHat, FaLaptopCode, FaPiggyBank, FaUserCheck } from 'react-icons/fa';
import { Differentiator } from '@/types';

const differentiators: Differentiator[] = [
  { icon: FaExchangeAlt, title: "Duas Opções de Leitura", description: "Telemetria remota ou medição visual — você escolhe a melhor modalidade para seu condomínio." },
  { icon: FaHardHat, title: "Obras e Instalações Completas", description: "Equipe especializada para executar desde adaptações de tubulação até a entrega final do sistema." },
  { icon: FaLaptopCode, title: "Tecnologia e Transparência", description: "Plataforma intuitiva com acesso às informações em tempo real ou relatórios mensais." },
  { icon: FaPiggyBank, title: "Economia Comprovada", description: "Estudos de caso mostram até 30% de redução no consumo médio após nossa implantação." },
  { icon: FaUserCheck, title: "Atendimento Personalizado", description: "Consultoria dedicada e suporte online para dúvidas e esclarecimentos." }
];

export default function Differentiators() {
  return (
    <section id="diferenciais" className="bg-white py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #d1d5db 0, #d1d5db 1px, transparent 0, transparent 50%)', backgroundSize: '30px 30px', opacity: 0.5 }}></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-blue">Nossos Diferenciais</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Por que Escolher a Leitura Nova
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Combinamos tecnologia, flexibilidade e um serviço completo para oferecer a melhor solução em gestão de consumo para o seu condomínio.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="flex flex-wrap justify-center gap-x-8 gap-y-10 lg:gap-y-16">
            {differentiators.map((diferencial) => (
              <div key={diferencial.title} className="relative pl-16 lg:w-2/5">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue">
                    <diferencial.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {diferencial.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{diferencial.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
} 