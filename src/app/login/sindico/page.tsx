import { Metadata } from 'next';
import LoginLayout from '@/components/auth/LoginLayout';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Área do Síndico | Leitura Nova',
    description: 'Acesso restrito para síndicos',
    robots: {
        index: false,
        follow: false,
    },
};

export default function SindicoLoginPage() {
    return (
        <LoginLayout variant="sindico">
            <LoginForm
                title="Área do Síndico"
                subtitle="Gestão do Condomínio"
                variant="sindico"
            />
        </LoginLayout>
    );
}
