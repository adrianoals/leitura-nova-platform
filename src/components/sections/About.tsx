export default function About() {
  return (
    <section id="sobre" className="bg-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-4">
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-2xl">
              <img
                className="h-full w-full object-cover"
                src="/images/about2.png"
                alt="Imagem sobre a LeituraNova"
              />
            </div>
          </div>
          <div>
            <div className="text-base leading-7 text-gray-700 lg:max-w-lg">
              <p className="text-base font-semibold leading-7 text-brand-blue">
                Quem Somos
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Especialistas em Gestão de Consumo
              </h2>
              <div className="max-w-xl">
                <p className="mt-6">
                  A Leitura Nova é especialista em soluções de leitura e gestão
                  de consumo de água e gás para condomínios. Oferecemos duas
                  modalidades de leitura — telemetria de última geração ou
                  medição visual periódica — sempre suportadas por uma equipe
                  técnica qualificada para garantir acompanhamento mensal,
                  preciso e individualizado de cada unidade.
                </p>
                <p className="mt-8">
                  Atuamos desde a instalação dos equipamentos até a análise de
                  dados e validação in loco das leituras, promovendo economia e
                  sustentabilidade para síndicos e condôminos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 