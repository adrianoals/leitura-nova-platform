import { FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_NUMBER = '5511933620044';
const WHATSAPP_DISPLAY = '(11) 93362-0044';
const SUPPORT_EMAIL = 'contato@leituranova.com.br';
const WHATSAPP_MESSAGE = 'Olá! Preciso de suporte com o sistema da Leitura Nova.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function SindicoSuportePage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Suporte</h1>
                <p className="mt-2 text-slate-600">
                    Caso precise de suporte com o sistema, entre em contato.
                </p>
                <p className="text-slate-600">
                    Entre em contato pelo WhatsApp ou pelo e-mail.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                        <FaWhatsapp className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-sm text-slate-500">WhatsApp</p>
                        <p className="font-semibold">{WHATSAPP_DISPLAY}</p>
                    </div>
                </a>

                <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <FaEnvelope className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-sm text-slate-500">E-mail</p>
                        <p className="font-semibold">{SUPPORT_EMAIL}</p>
                    </div>
                </a>
            </div>
        </div>
    );
}

