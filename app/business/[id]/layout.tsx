import AppHeader from '@/components/app-header';
import { requireBusiness, requireUser } from '@/lib/server';
import BusinessNav from './business-nav';
import Link from 'next/link';

export default async function BusinessLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const [user, business] = await Promise.all([requireUser(), requireBusiness(params.id)]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader user={user}>
        <div className="min-w-0">
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-indigo-600">← Mes entreprises</Link>
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{business.name}</h1>
        </div>
      </AppHeader>
      <BusinessNav businessId={business.id} role={business.role} />
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</div>
    </main>
  );
}
