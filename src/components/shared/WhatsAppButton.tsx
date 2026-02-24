'use client';

import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
    const pathname = usePathname();

    // Não exibir nos painéis do morador, admin, síndico e páginas de login
    if (pathname.startsWith('/app') || pathname.startsWith('/admin') || pathname.startsWith('/sindico') || pathname.startsWith('/login')) {
        return null;
    }

    const phoneNumber = '5511933620044';
    const message = 'Olá! Gostaria de saber mais sobre os serviços da Leitura Nova.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/50 sm:h-16 sm:w-16"
            aria-label="Fale conosco pelo WhatsApp"
        >
            <FaWhatsapp className="h-7 w-7 sm:h-8 sm:w-8" />

            {/* Pulse animation */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-20"></span>
        </a>
    );
}
