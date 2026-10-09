'use client';

import { FormEvent, useState } from 'react';

interface CreateBusinessModalProps {
    onClose: () => void;
}

export default function CreateBusinessModal({
    onClose,
}: CreateBusinessModalProps) {
    const [form, setForm] = useState({
        name: '',
        matriculeFiscale: '',
        description: '',
        region: '',
        serviceDomain: '',
        phone: '',
        email: '',
        address: '',
        website: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >,
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                '/api/proxy/businesses',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(form),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Impossible de créer l'entreprise",
                );
            }

            window.location.href = `/business/${data.id}`;

        } catch (err: any) {
            setError(
                err.message ||
                'Une erreur est survenue.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={onClose}
        >

            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 px-7 py-6">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                            Nouvel espace
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                            Créer une entreprise
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Ajoutez les informations de votre entreprise.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        ×
                    </button>

                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    <div className="px-7 py-6">

                        <h3 className="mb-5 text-sm font-semibold text-slate-900">
                            Informations générales
                        </h3>

                        <div className="grid gap-5 sm:grid-cols-2">

                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Nom de l'entreprise *
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Ex : ABC Solutions"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Matricule */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Matricule fiscale *
                                </label>

                                <input
                                    name="matriculeFiscale"
                                    value={form.matriculeFiscale}
                                    onChange={handleChange}
                                    placeholder="Ex : 1234567A"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Domain */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Domaine de service *
                                </label>

                                <input
                                    name="serviceDomain"
                                    value={form.serviceDomain}
                                    onChange={handleChange}
                                    placeholder="Ex : Informatique"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Region */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Région *
                                </label>

                                <input
                                    name="region"
                                    value={form.region}
                                    onChange={handleChange}
                                    placeholder="Ex : Tunis"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Téléphone
                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+216 XX XXX XXX"
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="contact@entreprise.tn"
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Adresse
                                </label>

                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Adresse de l'entreprise"
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Website */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Site web
                                </label>

                                <input
                                    type="url"
                                    name="website"
                                    value={form.website}
                                    onChange={handleChange}
                                    placeholder="https://www.example.com"
                                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Décrivez brièvement votre entreprise..."
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-7 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Création...'
                                : "Créer l'entreprise"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}