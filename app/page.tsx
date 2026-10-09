import AppHeader from '@/components/app-header';
import type { Business } from '@/lib/constants';
import { requireUser, serverFetch } from '@/lib/server';
import BusinessDashboard from './business-dashboard';

export default async function HomePage() {
  const user = await requireUser();
  const res = await serverFetch('businesses');
  const businesses: Business[] = res.ok ? await res.json() : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader user={user}>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">Bonjour, {user.name}</h1>
          <p className="truncate text-xs text-slate-500">Gérez vos entreprises et développez votre activité.</p>
        </div>
      </AppHeader>
      <BusinessDashboard businesses={businesses} />
    </main>
  );
}
