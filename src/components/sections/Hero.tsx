import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600/20"></div>
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight animate-fade-in">
          Gestão Inteligente de Água e Gás para o Seu Condomínio
        </h1>
        <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-50 animate-fade-in-delay">
          Monitoramento individual e automatizado, com tecnologia de ponta para redução de custos e total transparência.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
          <Button href="#contato">Solicitar Orçamento</Button>
          <Button href="#sobre" variant="secondary">Saiba Mais</Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
} 