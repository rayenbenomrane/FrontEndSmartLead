import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from './logout-button';
import BusinessDashboard from './business-dashboard';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const res = await fetch(
    `${process.env.API_URL || 'http://localhost:3001'}/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) return null;

  return res.json();
}

async function getBusinesses() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return [];

  const res = await fetch(
    `${process.env.API_URL || 'http://localhost:3001'}/businesses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) return [];

  return res.json();
}

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const businesses = await getBusinesses();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              CRM
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bonjour, {user.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gérez vos entreprises et développez votre activité.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>

                <p className="text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <BusinessDashboard businesses={businesses} />
    </main>
  );
}