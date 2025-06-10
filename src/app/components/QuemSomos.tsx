import Image from 'next/image';

export default function QuemSomos() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Quem Somos
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
                <Image
                  src="/images/team.jpg"
                  alt="Equipe Leitura Nova"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  A Leitura Nova é especialista em soluções de leitura e gestão de consumo de água e gás para condomínios. 
                  Oferecemos duas modalidades de leitura — telemetria de última geração ou medição visual periódica — 
                  sempre suportadas por uma equipe técnica qualificada para garantir acompanhamento mensal, preciso e 
                  individualizado de cada unidade.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Atuamos desde a instalação dos equipamentos até a análise de dados e validação in loco das leituras, 
                  promovendo economia e sustentabilidade para síndicos e condôminos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 