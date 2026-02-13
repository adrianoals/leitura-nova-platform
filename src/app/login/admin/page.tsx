import { Metadata } from 'next';
import LoginLayout from '@/components/auth/LoginLayout';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Login Admin | Leitura Nova',
    description: 'Acesso administrativo ao sistema Leitura Nova',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLoginPage() {
    return (
        <LoginLayout variant="admin">
            <LoginForm
                title="Acesso Administrativo"
                subtitle="Área restrita - Administradores"
                variant="admin"
            />
        </LoginLayout>
    );
}
