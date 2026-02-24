import MoradorSidebar from '@/components/morador/MoradorSidebar';
import MoradorHeader from '@/components/morador/MoradorHeader';
import { stopAdminMoradorPreview } from '@/actions/adminPreviewActions';
import { getAdminMoradorPreviewPayload } from '@/lib/adminPreview';

export const metadata = {
    title: 'Portal do Morador | Leitura Nova',
    robots: { index: false, follow: false },
};
export const preferredRegion = 'gru1';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const previewPayload = await getAdminMoradorPreviewPayload();
    const isAdminPreview = Boolean(previewPayload);

    return (
        <div className="min-h-screen bg-slate-50">
            <MoradorSidebar isPreview={isAdminPreview} />
            <div className="lg:ml-64 flex flex-col min-h-screen">
                {isAdminPreview ? (
                    <>
                        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-amber-900">
                                    Modo visualização do admin ativo para a unidade selecionada.
                                </p>
                                <form action={stopAdminMoradorPreview}>
                                    <input type="hidden" name="return_path" value="/admin/visualizar" />
                                    <button
                                        type="submit"
                                        className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                                    >
                                        Voltar para admin
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3 pl-12 lg:pl-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Portal do Morador</p>
                                    <p className="text-xs text-slate-500">Visualização administrada</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <MoradorHeader />
                )}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
