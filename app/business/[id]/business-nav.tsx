'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { BusinessRole } from '@/lib/constants';

export default function BusinessNav({ businessId, role }: { businessId: string; role: BusinessRole }) {
  const pathname = usePathname();
  const base = `/business/${businessId}`;
  const tabs = [
    { href: base, label: "Vue d'ensemble", exact: true },
    { href: `${base}/prospects`, label: 'Prospects' },

    ...(role !== 'MEMBER' ? [{ href: `${base}/settings`, label: 'Paramètres' }] : []),
  ];

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 lg:px-8">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${active ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
