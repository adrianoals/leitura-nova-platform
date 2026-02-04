import { FaExchangeAlt, FaHardHat, FaLaptopCode, FaPiggyBank, FaUserCheck } from 'react-icons/fa';
import { Differentiator } from '@/types';

const differentiators: Differentiator[] = [
  { icon: FaExchangeAlt, title: "Duas Opções de Leitura", description: "Telemetria remota ou medição visual — você escolhe a melhor modalidade para seu condomínio." },
  { icon: FaHardHat, title: "Obras e Instalações Completas", description: "Equipe especializada para executar desde adaptações de tubulação até a entrega final do sistema." },
  { icon: FaLaptopCode, title: "Tecnologia e Transparência", description: "Plataforma intuitiva com acesso às informações em tempo real ou relatórios mensais." },
  { icon: FaPiggyBank, title: "Economia Comprovada", description: "Estudos de caso mostram até 30% de redução no consumo médio após nossa implantação." },
  { icon: FaUserCheck, title: "Atendimento Personalizado", description: "Consultoria dedicada e suporte online para dúvidas e esclarecimentos." }
];

const delayClasses = [
  'animate-fade-in',
  'animate-fade-in-delay',
  'animate-fade-in-delay-2',
  'animate-fade-in',
  'animate-fade-in-delay',
];

export default function Differentiators() {
  return (
    <section id="diferenciais" className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/80">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-vscode-blue/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-vscode-blue">
            Nossos Diferenciais
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Por que Escolher a Leitura Nova
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto">
            Combinamos tecnologia, flexibilidade e um serviço completo para oferecer a melhor solução em gestão de consumo para o seu condomínio.
          </p>
        </header>

        {/* Cards grid */}
        <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((diferencial, index) => {
            const Icon = diferencial.icon;
            const isFifth = index === 4;
            return (
              <article
                key={diferencial.title}
                className={`group relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:shadow-lg hover:ring-vscode-blue/30 hover:-translate-y-1 ${isFifth ? 'lg:col-start-2' : ''} ${delayClasses[index % delayClasses.length]}`}
              >
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-vscode-blue text-white shadow-lg shadow-vscode-blue/25 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-vscode-blue/30">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
                  {diferencial.title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  {diferencial.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
} 