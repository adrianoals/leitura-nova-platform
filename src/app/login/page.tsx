import { Metadata } from 'next';
import LoginLayout from '@/components/auth/LoginLayout';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Login | Leitura Nova',
    description: 'Acesse o sistema Leitura Nova',
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginPage() {
    return (
        <LoginLayout variant="user">
            <LoginForm
                title="Acesso ao Sistema"
                subtitle="Entre com suas credenciais"
                variant="user"
            />
        </LoginLayout>
    );
}
