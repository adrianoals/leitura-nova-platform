export default function AdminLoading() {
    return (
        <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
            <div className="h-7 w-64 rounded bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-100" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-24 rounded-2xl bg-white border border-slate-200" />
                <div className="h-24 rounded-2xl bg-white border border-slate-200" />
                <div className="h-24 rounded-2xl bg-white border border-slate-200" />
            </div>
            <div className="h-72 rounded-2xl bg-white border border-slate-200" />
        </div>
    );
}
