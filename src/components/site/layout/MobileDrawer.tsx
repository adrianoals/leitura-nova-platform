'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaTimes } from 'react-icons/fa';

interface NavLink {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileDrawer({ open, onClose, navLinks }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusables = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const insideDrawer =
        active instanceof Node && drawerRef.current.contains(active);

      if (e.shiftKey) {
        if (active === first || !insideDrawer) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !insideDrawer) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[45] transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-4 border-b border-slate-200">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-2 text-slate-700 hover:text-vscode-blue rounded-md focus:outline-none focus:ring-2 focus:ring-vscode-blue"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Links de navegação" className="flex flex-col p-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="py-3 text-base font-medium text-slate-700 hover:text-vscode-blue"
            >
              {link.label}
            </a>
          ))}
          <hr className="my-4 border-slate-200" />
          <Link
            href="/login"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-vscode-blue text-white text-sm font-semibold hover:bg-vscode-blue-dark transition-colors"
          >
            Acesso do Morador
          </Link>
          <Link
            href="/login/sindico"
            onClick={onClose}
            className="mt-2 w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-vscode-blue text-vscode-blue text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Acesso do Síndico
          </Link>
        </nav>
      </div>
    </>
  );
}
