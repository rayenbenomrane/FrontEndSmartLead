'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3 text-sm">
        <Link href="/leads" className="text-base font-semibold text-slate-900">Smart Lead</Link>
        <Link href="/leads" className="text-slate-600 hover:text-slate-900">Prospects</Link>
        <Link href="/profile" className="text-slate-600 hover:text-slate-900">Mon profil</Link>
        <button onClick={logout} className="ml-auto text-slate-500 hover:text-slate-900">Se déconnecter</button>
      </nav>
    </header>
  );
}
