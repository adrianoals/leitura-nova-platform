import Button from '@/components/shared/ui/Button';

// Número WhatsApp da empresa: 55 + DDD + 9 dígitos (somente números)
const WHATSAPP_NUMBER = '5511933620044';
const WHATSAPP_MESSAGE = 'Olá! Gostaria de solicitar uma avaliação para gestão de consumo de água e gás do meu condomínio.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function Contact() {
  return (
    <section id="contato" className="py-20 px-4 text-center bg-gradient-to-br from-vscode-blue-dark via-vscode-blue to-vscode-blue-light text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="max-w-3xl mx-auto relative">
        <h2 className="text-3xl font-bold mb-6">Pronto para Transformar a Gestão de Consumo do Seu Condomínio?</h2>
        <p className="text-xl mb-8 text-blue-100/90">Solicite uma avaliação gratuita e descubra como economizar e trazer mais transparência para seus moradores.</p>
        <Button href={WHATSAPP_URL} variant="primaryVscode">Falar com um Especialista</Button>
      </div>
    </section>
  );
} 