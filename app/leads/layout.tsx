import NavBar from '../../components/NavBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
