import Link from 'next/link';
import { SocialLink } from '@/types';

const socialLinks: SocialLink[] = [
  { name: "LinkedIn", color: "blue-400", href: "#" },
  { name: "Instagram", color: "pink-400", href: "#" },
  { name: "Facebook", color: "blue-400", href: "#" }
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="max-w-6xl mx-auto px-4 relative">
        <nav className="flex flex-wrap justify-center gap-8 mb-8">
          {["Sobre", "Serviços", "Blog", "Contato"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-vscode-blue transition-colors">
              {item}
            </a>
          ))}
        </nav>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 hover:text-vscode-blue transition-colors cursor-pointer">
              <span className="text-2xl">📞</span>
              <span>(XX) XXXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2 hover:text-vscode-blue transition-colors cursor-pointer">
              <span className="text-2xl">✉️</span>
              <span>contato@leitura-nova.com.br</span>
            </div>
          </div>
          <div className="flex justify-center md:justify-end gap-6">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className="hover:text-vscode-blue transition-colors"
              >
                {social.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-center text-slate-400">
          <p>Endereço comercial</p>
          <p className="mt-2">© {year} Leitura Nova. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
} 