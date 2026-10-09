'use client';

import { useState } from 'react';
import CreateBusinessModal from './create-business-modal';
import Link from 'next/link';

type Business = {
    id: string;
    name: string;
    matriculeFiscale: string;
    description?: string;
    region: string;
    serviceDomain: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    createdAt: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
};

interface BusinessDashboardProps {
    businesses: Business[];
}

export default function BusinessDashboard({
    businesses,
}: BusinessDashboardProps) {
    const [showModal, setShowModal] = useState(false);

    const roleConfig = {
        OWNER: {
            label: 'Propriétaire',
            className:
                'bg-violet-50 text-violet-700 ring-violet-600/10',
        },
        ADMIN: {
            label: 'Administrateur',
            className:
                'bg-blue-50 text-blue-700 ring-blue-600/10',
        },
        MEMBER: {
            label: 'Membre',
            className:
                'bg-slate-100 text-slate-600 ring-slate-500/10',
        },
    };

    return (
        <>
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

                {/* Section Header */}
                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            Espaces de travail
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            Mes entreprises
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Sélectionnez une entreprise pour accéder à son espace CRM.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                    >
                        <span className="text-lg leading-none">+</span>
                        Nouvelle entreprise
                    </button>
                </div>

                {/* No businesses */}
                {businesses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
                            +
                        </div>

                        <h3 className="mt-5 text-lg font-semibold text-slate-900">
                            Aucune entreprise
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Vous n'avez encore aucune entreprise associée à votre compte.
                            Créez votre première entreprise pour commencer à utiliser votre CRM.
                        </p>

                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Créer mon entreprise
                        </button>

                    </div>
                ) : (

                    /* Businesses */
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        {businesses.map((business) => {
                            const role = roleConfig[business.role];

                            return (
                                <div
                                    key={business.id}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                >

                                    {/* Card top */}
                                    <div className="p-6">

                                        <div className="flex items-start justify-between">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                                                {business.name.charAt(0).toUpperCase()}
                                            </div>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${role.className}`}
                                            >
                                                {role.label}
                                            </span>

                                        </div>

                                        <div className="mt-5">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {business.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {business.serviceDomain}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 21l-4.243-4.343a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>

                                            {business.region}
                                        </div>
                                    </div>

                                    {/* Card footer */}
                                    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">

                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                                    Matricule fiscale
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                                    {business.matriculeFiscale}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/business/${business.id}`}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition group-hover:text-indigo-700"
                                            >
                                                Ouvrir
                                                <span className="transition-transform group-hover:translate-x-1">
                                                    →
                                                </span>
                                            </Link>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </section>

            {/* Modal */}
            {showModal && (
                <CreateBusinessModal
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}