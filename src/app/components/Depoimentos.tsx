import { FaQuoteLeft } from 'react-icons/fa';

const depoimentos = [
  {
    texto: "Desde que implantamos a Leitura Nova, tivemos uma queda de 25% na conta de água. A plataforma é super intuitiva!",
    autor: "Síndico do Condomínio Jardim das Flores"
  },
  {
    texto: "O suporte técnico resolve tudo muito rápido. Recomendo para qualquer síndico que queira praticidade.",
    autor: "Síndica do Residencial Vista Bela"
  }
];

export default function Depoimentos() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          O que Nossos Clientes Dizem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {depoimentos.map((depoimento, index) => (
            <div 
              key={index}
              className="bg-blue-50 rounded-2xl p-8 relative"
            >
              <div className="absolute top-6 left-6 text-blue-200">
                <FaQuoteLeft className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-700 text-lg mb-6 italic">
                  "{depoimento.texto}"
                </p>
                <p className="text-blue-600 font-semibold">
                  — {depoimento.autor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 