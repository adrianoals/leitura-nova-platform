import Card from '../ui/Card';
import { Differentiator } from '@/types';

const differentiators: Differentiator[] = [
  { title: "Duas Opções de Leitura", description: "Telemetria remota ou medição visual — você escolhe a melhor modalidade para seu condomínio." },
  { title: "Obras e Instalações Completas", description: "Equipe especializada para executar desde adaptações de tubulação até a entrega final do sistema." },
  { title: "Tecnologia e Transparência", description: "Plataforma intuitiva com acesso às informações em tempo real ou relatórios mensais, conforme sua necessidade." },
  { title: "Economia Comprovada", description: "Estudos de caso mostram até 30% de redução no consumo médio após nossa implantação." },
  { title: "Atendimento Personalizado", description: "Consultoria dedicada e suporte online para dúvidas e esclarecimentos." }
];

export default function Differentiators() {
  return (
    <section id="diferenciais" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <h2 className="text-3xl font-bold text-center mb-12 text-blue-600 relative">Por que Escolher a Leitura Nova</h2>
      <ul className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative">
        {differentiators.map((diferencial, index) => (
          <li key={index}>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-blue-700 group-hover:text-blue-600 transition-colors">
                {diferencial.title}
              </h3>
              <p className="text-gray-600">{diferencial.description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
} 