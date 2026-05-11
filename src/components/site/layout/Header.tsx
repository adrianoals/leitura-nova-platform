'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa';
import MobileDrawer from './MobileDrawer';

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Contato', href: '#contato' },
];

const SCROLL_THRESHOLD = 20;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur shadow-sm'
            : 'bg-white/70 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Leitura Nova - Página inicial"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-vscode-blue rounded"
          >
            <Image
              src="/images/logoleituranova-hero.jpg"
              alt="Leitura Nova"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav aria-label="Principal" className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium text-slate-700 hover:text-vscode-blue transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login/sindico"
              className="text-base font-medium text-slate-700 hover:text-vscode-blue transition-colors"
            >
              Sou Síndico
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-base font-semibold bg-vscode-blue text-white hover:bg-vscode-blue-dark transition-colors"
            >
              Acesso do Morador
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-semibold bg-vscode-blue text-white hover:bg-vscode-blue-dark transition-colors"
            >
              Morador
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="p-2 rounded-md text-slate-700 transition-colors"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
