import Button from '../ui/Button';

export default function Contact() {
  return (
    <section id="contato" className="py-20 px-4 text-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="max-w-3xl mx-auto relative">
        <h2 className="text-3xl font-bold mb-6">Pronto para Transformar a Gestão de Consumo do Seu Condomínio?</h2>
        <p className="text-xl mb-8 text-blue-50">Solicite uma avaliação gratuita e descubra como economizar e trazer mais transparência para seus moradores.</p>
        <Button href="mailto:contato@leitura-nova.com.br">Falar com um Especialista</Button>
      </div>
    </section>
  );
} 