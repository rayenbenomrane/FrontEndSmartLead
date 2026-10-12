
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  type Prospect,
  type ProspectStatus,
  STATUSES,
  STATUS_CONFIG,
} from '@/lib/constants';
import {
  btnPrimary,
  btnSecondary,
  ErrorBox,
  Field,
  inputClass,
  Modal,
} from '@/components/ui';

type ProspectFormModalProps = {
  businessId: string;
  prospect?: Prospect;
  onClose: () => void;
  onSaved: (prospect: Prospect) => void;
};

type ProspectFormData = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  industry: string;
  region: string;
  website: string;
  source: string;
  status: ProspectStatus;
  estimatedValue: string;
  notes: string;
};

const initialForm: ProspectFormData = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  jobTitle: '',
  industry: '',
  region: '',
  website: '',
  source: 'OTHER',
  status: 'NEW',
  estimatedValue: '',
  notes: '',
};

export default function ProspectFormModal({
  businessId,
  prospect,
  onClose,
  onSaved,
}: ProspectFormModalProps) {
  const isEditing = Boolean(prospect);

  const [form, setForm] = useState<ProspectFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prospect) {
      setForm(initialForm);
      return;
    }

    setForm({
      firstName: prospect.firstName ?? '',
      lastName: prospect.lastName ?? '',
      company: prospect.company ?? '',
      email: prospect.email ?? '',
      phone: prospect.phone ?? '',
      jobTitle: prospect.jobTitle ?? '',
      industry: prospect.industry ?? '',
      region: prospect.region ?? '',
      website: prospect.website ?? '',
      source: prospect.source || 'OTHER',
      status: prospect.status ?? 'NEW',
      estimatedValue:
        prospect.estimatedValue != null
          ? String(prospect.estimatedValue)
          : '',
      notes: prospect.notes ?? '',
    });
  }, [prospect]);

  function updateField<K extends keyof ProspectFormData>(
    field: K,
    value: ProspectFormData[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const estimatedValue =
      form.estimatedValue.trim() === ''
        ? null
        : Number(form.estimatedValue);

    if (
      estimatedValue !== null &&
      (!Number.isFinite(estimatedValue) || estimatedValue < 0)
    ) {
      setError('Le budget estimé doit être un nombre positif.');
      setLoading(false);
      return;
    }

    const body = {
      contactName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      companyName: form.company.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      jobTitle: form.jobTitle.trim() || undefined,
      industry: form.industry.trim() || undefined,
      region: form.region.trim() || undefined,
      website: form.website.trim() || undefined,
      source: form.source,
      status: form.status,
      estimatedValue:
        form.estimatedValue.trim() === ''
          ? undefined
          : Number(form.estimatedValue),
      notes: form.notes.trim() || undefined,
    };
    try {
      const url = prospect
        ? `businesses/${businessId}/prospects/${prospect.id}`
        : `businesses/${businessId}/prospects`;

      const saved = await api<Prospect>(url, {
        method: prospect ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });

      onSaved(saved);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’enregistrer le prospect.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={isEditing ? 'Modifier le prospect' : 'Nouveau prospect'}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-7 py-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Prénom *">
              <input
                required
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className={inputClass}
                placeholder="Prénom"
              />
            </Field>

            <Field label="Nom *">
              <input
                required
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={inputClass}
                placeholder="Nom"
              />
            </Field>
          </div>

          <Field label="Entreprise *">
            <input
              required
              value={form.company}
              onChange={(e) => updateField('company', e.target.value)}
              className={inputClass}
              placeholder="Nom de l'entreprise"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={inputClass}
                placeholder="contact@entreprise.tn"
              />
            </Field>

            <Field label="Téléphone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={inputClass}
                placeholder="+216 ..."
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Poste">
              <input
                value={form.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                className={inputClass}
                placeholder="Directeur commercial..."
              />
            </Field>

            <Field label="Secteur d'activité">
              <input
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className={inputClass}
                placeholder="Informatique, industrie..."
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Région">
              <input
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
                className={inputClass}
                placeholder="Tunis, Sfax..."
              />
            </Field>

            <Field label="Site web">
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Source">
              <select
                value={form.source}
                onChange={(e) => updateField('source', e.target.value)}
                className={inputClass}
              >
                <option value="WEBSITE">Site web</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="REFERRAL">Recommandation</option>
                <option value="OTHER">Autre</option>
              </select>
            </Field>

            <Field label="Statut">
              <select
                value={form.status}
                onChange={(e) =>
                  updateField('status', e.target.value as ProspectStatus)
                }
                className={inputClass}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Budget estimé">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.estimatedValue}
              onChange={(e) =>
                updateField('estimatedValue', e.target.value)
              }
              className={inputClass}
              placeholder="0.00"
            />
          </Field>

          <Field label="Notes">
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Informations complémentaires..."
            />
          </Field>

          <ErrorBox message={error} />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={btnSecondary}
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className={btnPrimary}
          >
            {loading
              ? 'Enregistrement...'
              : isEditing
                ? 'Enregistrer les modifications'
                : 'Créer le prospect'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
