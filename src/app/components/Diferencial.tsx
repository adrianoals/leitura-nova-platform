import { FaCheckCircle } from 'react-icons/fa';

const diferenciais = [
  {
    title: "Duas Opções de Leitura",
    description: "Telemetria remota ou medição visual — você escolhe a melhor modalidade para seu condomínio."
  },
  {
    title: "Obras e Instalações Completas",
    description: "Equipe especializada para executar desde adaptações de tubulação até a entrega final do sistema."
  },
  {
    title: "Tecnologia e Transparência",
    description: "Plataforma intuitiva com acesso às informações em tempo real ou relatórios mensais, conforme sua necessidade."
  },
  {
    title: "Economia Comprovada",
    description: "Estudos de caso mostram até 30% de redução no consumo médio após nossa implantação."
  },
  {
    title: "Atendimento Personalizado",
    description: "Consultoria dedicada e suporte online para dúvidas e esclarecimentos."
  }
];

export default function Diferencial() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Por que Escolher a Leitura Nova
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {diferenciais.map((diferencial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-blue-600 flex-shrink-0">
                  <FaCheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {diferencial.title}
                  </h3>
                  <p className="text-gray-600">
                    {diferencial.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 