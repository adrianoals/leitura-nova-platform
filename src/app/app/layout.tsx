import MoradorSidebar from '@/components/morador/MoradorSidebar';
import MoradorHeader from '@/components/morador/MoradorHeader';

export const metadata = {
    title: 'Portal do Morador | Leitura Nova',
    robots: { index: false, follow: false },
};
export const preferredRegion = 'gru1';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <MoradorSidebar />
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <MoradorHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
