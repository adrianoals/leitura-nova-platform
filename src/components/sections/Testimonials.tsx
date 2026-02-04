import Card from '../ui/Card';
import { Testimonial } from '@/types';

const testimonials: Testimonial[] = [
  { quote: "Desde que implantamos os equipamentos de medição à distância nos hidrômetros do condomínio, ficou muito mais simples para os moradores entenderem suas contas de água.", author: "Síndico do Condomínio Jardim das Flores" },
  { quote: "O suporte técnico resolve tudo muito rápido. Recomendo para qualquer síndico que queira praticidade.", author: "Síndica do Residencial Vista Bela" }
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 px-4 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <h2 className="text-3xl font-bold text-center mb-12 text-vscode-blue relative">O que Nossos Clientes Dizem</h2>
      <div className="max-w-3xl mx-auto space-y-8 relative">
        {testimonials.map((testimonial, index) => (
          <Card key={index}>
            <p className="text-slate-700 text-lg italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
            <footer className="text-vscode-blue font-semibold">— {testimonial.author}</footer>
          </Card>
        ))}
      </div>
    </section>
  );
} 