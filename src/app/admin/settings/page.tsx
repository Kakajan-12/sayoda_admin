'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

/**
 * Настройки сайта.
 *
 * Эти значения раньше были переменными окружения на Vercel — менять их мог
 * только разработчик через передеплой. Теперь они лежат в базе, и сайт
 * подхватывает их при следующем серверном рендере.
 */

interface Settings {
    ga4_id: string;
    whatsapp: string;
    tawk_id: string;
    company_legal_name: string;
    license_number: string;
    founded_year: string;
}

const EMPTY: Settings = {
    ga4_id: '',
    whatsapp: '',
    tawk_id: '',
    company_legal_name: '',
    license_number: '',
    founded_year: '',
};

/**
 * Предупреждение о значении, которое сохранится, но на сайте работать не будет.
 *
 * Такие поля подставляются в сторонние скрипты, и при неверном формате сайт
 * просто ничего не выводит — молча. Именно так и вышло с чатом: вместо кода
 * виджета был вставлен API-ключ, и найти причину можно было только в коде.
 * Поэтому предупреждаем прямо в форме, но сохранять не мешаем.
 */
/** Тип ключа словаря, чтобы не тянуть импорт ради одной аннотации. */
type DictKeyRef = Parameters<ReturnType<typeof useT>>[0];

const warn = (
    key: keyof Settings,
    value: string,
    t: ReturnType<typeof useT>,
): string | null => {
    const v = (value || '').trim();
    if (!v) return null;

    if (key === 'tawk_id' && !/[A-Za-z0-9]{6,}\/[A-Za-z0-9]{3,}/.test(v)) {
        return t('set.err.tawk');
    }
    if (key === 'ga4_id' && !/^G-[A-Z0-9]+$/i.test(v)) {
        return t('set.err.ga4');
    }
    if (key === 'whatsapp' && v.replace(/\D/g, '').length < 8) {
        return t('set.err.phone');
    }
    return null;
};

/**
 * Список хранит ключи словаря, а не готовые строки: он объявлен на уровне
 * модуля, где переводчика ещё нет, а подписи должны меняться вместе с языком
 * интерфейса. `label` остаётся строкой там, где это имя собственное.
 */
const FIELDS: {
    key: keyof Settings;
    label?: string;
    labelKey?: DictKeyRef;
    placeholder: string;
    hintKey: DictKeyRef;
}[] = [
    {
        key: 'ga4_id',
        label: 'GA4 Measurement ID',
        placeholder: 'G-XXXXXXXXXX',
        hintKey: 'set.ga4.hint',
    },
    {
        key: 'whatsapp',
        label: 'WhatsApp',
        placeholder: '99361169097',
        hintKey: 'set.whatsapp.hint',
    },
    {
        key: 'tawk_id',
        labelKey: 'set.tawk.label',
        placeholder: '68b1c2d3e4f5a6b7c8d9e0f1/1abc2de3f',
        hintKey: 'set.tawk.hint',
    },
    {
        key: 'company_legal_name',
        labelKey: 'set.legal.label',
        placeholder: 'Hojalyk jemgyýeti «...»',
        hintKey: 'set.legal.hint',
    },
    {
        key: 'license_number',
        labelKey: 'set.license.label',
        placeholder: '№ ...',
        hintKey: 'set.license.hint',
    },
    {
        key: 'founded_year',
        labelKey: 'set.founded.label',
        placeholder: '2019',
        hintKey: 'set.founded.hint',
    },
];

const Settings = () => {
    const t = useT();
    const [settings, setSettings] = useState<Settings>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchSettings = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // API отдаёт null для незаполненных ключей, а input нужен пустой
            // строкой — иначе React ругается на переход uncontrolled/controlled.
            const data = response.data || {};
            const next = { ...EMPTY };
            (Object.keys(EMPTY) as (keyof Settings)[]).forEach((key) => {
                next[key] = data[key] ?? '';
            });
            setSettings(next);
            setError(null);
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error(axiosError);
            if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                router.push("/");
                return;
            }
            setError(t('set.err.load'));
        }
    }, [router]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/settings`,
                settings,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setSaved(true);
        } catch (err) {
            console.error(err);
            setError(t('set.err.save'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
        <div className="mt-8 max-w-3xl">
            <h2 className="mb-2 text-xl font-bold text-ink">{t('nav.settings')}</h2>
            <p className="text-sm text-gray-600 mb-6">
                {t('set.intro')}
            </p>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
                {FIELDS.map((field) => (
                    <div key={field.key}>
                        <label className="mb-1 block text-sm font-medium text-inkMuted" htmlFor={field.key}>
                            {field.labelKey ? t(field.labelKey) : field.label}
                        </label>
                        <input
                            id={field.key}
                            type="text"
                            value={settings[field.key]}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                                setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="w-full rounded-md border border-sand px-4 py-2 outline-none transition focus:border-tileLight"
                        />
                        <p className="mt-1 text-xs text-inkMuted">{t(field.hintKey)}</p>
                        {warn(field.key, settings[field.key], t) && (
                            <p className="text-xs text-amber-700 mt-1">
                                {warn(field.key, settings[field.key], t)}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg text-white py-2 px-8 rounded-md cursor-pointer disabled:opacity-60"
                    >
                        {saving ? t('common.saving') : t('common.save')}
                    </button>
                    {saved && <span className="text-green-600 text-sm">{t('common.saved')}</span>}
                    {error && <span className="text-red-600 text-sm">{error}</span>}
                </div>
            </form>
        </div>
        </>
    );
};

export default Settings;
