import Card from '../ui/Card';

export default function About() {
  return (
    <section id="sobre" className="py-20 px-4 max-w-4xl mx-auto">
      <Card className="transform hover:scale-[1.02]">
        <h2 className="text-3xl font-bold mb-6 text-blue-600">Quem Somos</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          A Leitura Nova é especialista em soluções de leitura e gestão de consumo de água e gás para condomínios. Oferecemos duas modalidades de leitura — telemetria de última geração ou medição visual periódica — sempre suportadas por uma equipe técnica qualificada para garantir acompanhamento mensal, preciso e individualizado de cada unidade. Atuamos desde a instalação dos equipamentos até a análise de dados e validação in loco das leituras, promovendo economia e sustentabilidade para síndicos e condôminos.
        </p>
      </Card>
    </section>
  );
} 