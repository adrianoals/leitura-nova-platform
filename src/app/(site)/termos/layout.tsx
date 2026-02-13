export default function TermosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {children}
    </div>
  );
}
