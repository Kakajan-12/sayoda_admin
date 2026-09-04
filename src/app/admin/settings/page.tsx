'use client'
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

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
const warn = (key: keyof Settings, value: string): string | null => {
    const v = (value || '').trim();
    if (!v) return null;

    if (key === 'tawk_id' && !/[A-Za-z0-9]{6,}\/[A-Za-z0-9]{3,}/.test(v)) {
        return 'Не похоже на код виджета: в нём должна быть косая черта между двумя идентификаторами. Похоже, вставлен API-ключ — возьмите код из Administration → Channels → Chat Widget.';
    }
    if (key === 'ga4_id' && !/^G-[A-Z0-9]+$/i.test(v)) {
        return 'Идентификатор GA4 начинается с «G-». Счётчик с другим значением не подключится.';
    }
    if (key === 'whatsapp' && v.replace(/\D/g, '').length < 8) {
        return 'Слишком короткий номер — кнопка WhatsApp его не примет.';
    }
    return null;
};

const FIELDS: { key: keyof Settings; label: string; placeholder: string; hint: string }[] = [
    {
        key: 'ga4_id',
        label: 'GA4 Measurement ID',
        placeholder: 'G-XXXXXXXXXX',
        hint: 'Пока не задан, счётчик на сайте не подключается и заявки нельзя посчитать.',
    },
    {
        key: 'whatsapp',
        label: 'WhatsApp',
        placeholder: '99361169097',
        hint: 'Номер в международном формате. Если пусто, кнопка использует основной телефон компании.',
    },
    {
        key: 'tawk_id',
        label: 'Чат Tawk.to',
        placeholder: '68b1c2d3e4f5a6b7c8d9e0f1/1abc2de3f',
        hint: 'Tawk.to → Administration → Channels → Chat Widget. Можно вставить ссылку целиком или пару propertyId/widgetId. Не подходит API-ключ из Property Settings — в нём нет косой черты. Пусто — чат не показывается.',
    },
    {
        key: 'company_legal_name',
        label: 'Юридическое название',
        placeholder: 'Hojalyk jemgyýeti «...»',
        hint: 'Выводится в футере и в разметке TravelAgency. Пустое значение не выводится.',
    },
    {
        key: 'license_number',
        label: 'Номер лицензии туроператора',
        placeholder: '№ ...',
        hint: 'Сигнал доверия: турист переводит крупную сумму незнакомой компании.',
    },
    {
        key: 'founded_year',
        label: 'Год основания',
        placeholder: '2019',
        hint: 'Идёт в foundingDate в schema.org.',
    },
];

const Settings = () => {
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
            setError("Ошибка при получении настроек");
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
            setError("Не удалось сохранить настройки");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8 max-w-3xl">
                    <h2 className="text-2xl font-bold mb-2">Settings</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Значения подхватываются сайтом автоматически. Пустые поля нигде не выводятся.
                    </p>

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
                        {FIELDS.map((field) => (
                            <div key={field.key}>
                                <label className="block font-semibold mb-1" htmlFor={field.key}>
                                    {field.label}
                                </label>
                                <input
                                    id={field.key}
                                    type="text"
                                    value={settings[field.key]}
                                    placeholder={field.placeholder}
                                    onChange={(e) =>
                                        setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                                {warn(field.key, settings[field.key]) && (
                                    <p className="text-xs text-amber-700 mt-1">
                                        {warn(field.key, settings[field.key])}
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
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            {saved && <span className="text-green-600 text-sm">Сохранено</span>}
                            {error && <span className="text-red-600 text-sm">{error}</span>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
