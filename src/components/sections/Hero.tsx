import Image from 'next/image';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/hero-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay azul translúcido */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/80 via-[#5dade2]/70 to-[#85c1e9]/60 z-0"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-10"></div>
      {/* Gradiente inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-30"></div>
      {/* Conteúdo */}
      <div className="relative z-40 max-w-5xl mx-auto">
        <Image
          src="/images/logoleituranova-hero.jpg"
          alt="Leitura Nova Logo"
          width={160}
          height={80}
          className="mx-auto mb-6 w-40 h-auto"
          draggable={false}
          priority
        />
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight animate-fade-in text-white drop-shadow-lg">
          Gestão Inteligente de Água e Gás para o Seu Condomínio
        </h1>
        <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-50 animate-fade-in-delay drop-shadow">
          Monitoramento individual e automatizado, com tecnologia de ponta para redução de custos e total transparência.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
          <Button href="#contato">Solicitar Orçamento</Button>
          <Button href="#sobre" variant="secondary">Saiba Mais</Button>
        </div>
      </div>
    </section>
  );
} 