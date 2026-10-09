import Link from 'next/link';
import LogoutButton from '@/app/logout-button';
import type { User } from '@/lib/constants';

export default function AppHeader({ user, children }: { user: User; children?: React.ReactNode }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">CRM</Link>
          {children}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="hidden items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-slate-50 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
