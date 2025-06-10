import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar a Gestão de Consumo do Seu Condomínio?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Solicite uma avaliação gratuita e descubra como economizar e trazer mais transparência para seus moradores.
          </p>
          <Link 
            href="/contato" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-300"
          >
            Falar com um Especialista
          </Link>
        </div>
      </div>
    </section>
  );
} 