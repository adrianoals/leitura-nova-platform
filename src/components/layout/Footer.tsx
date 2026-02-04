import Link from 'next/link';
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { SocialLink } from '@/types';

const legalLinks = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
];

const socialLinks: SocialLink[] = [
  { name: "LinkedIn", href: "#", icon: FaLinkedinIn },
  { name: "Instagram", href: "#", icon: FaInstagram },
  { name: "Facebook", href: "#", icon: FaFacebookF },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 relative overflow-hidden">
      {/* Subtle gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-12">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-vscode-blue rounded">
              <img
                src="/images/logoleituranova-hero.jpg"
                alt="Leitura Nova"
                className="h-12 w-auto brightness-0 invert opacity-95 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-sm">
              Gestão inteligente de água e gás para condomínios. Tecnologia, transparência e economia.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Contato
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="tel:+5500000000000"
                  className="inline-flex items-center gap-3 text-sm text-slate-400 hover:text-vscode-blue transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-vscode-blue">
                    <FaPhone className="h-4 w-4" />
                  </span>
                  (XX) XXXX-XXXX
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@leitura-nova.com.br"
                  className="inline-flex items-center gap-3 text-sm text-slate-400 hover:text-vscode-blue transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-vscode-blue">
                    <FaEnvelope className="h-4 w-4" />
                  </span>
                  contato@leitura-nova.com.br
                </a>
              </li>
              <li className="inline-flex items-start gap-3 text-sm text-slate-400">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-vscode-blue">
                  <FaMapMarkerAlt className="h-4 w-4 mt-0.5" />
                </span>
                <span>Endereço comercial</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social + legal + copyright */}
        <div className="mt-14 pt-10 border-t border-slate-800">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  if (!Icon) return null;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-vscode-blue hover:text-white transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
              <nav className="flex gap-6 text-sm text-slate-500" aria-label="Legal">
                {legalLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-vscode-blue transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <p className="text-sm text-slate-500">
              © {year} Leitura Nova. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
