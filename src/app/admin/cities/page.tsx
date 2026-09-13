'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/16/solid";

/**
 * Города.
 *
 * Справочник, а не поле внутри отеля. Свободный текст к третьему десятку
 * отелей расходится в написании — «Ashgabat» и «Ashgabat » дадут в фильтре
 * на сайте два разных города, и склеивать их будет некому.
 *
 * Страна у отеля отсюда и берётся: у самого отеля такого поля нет, иначе он
 * мог бы числиться в Ашхабаде и в Узбекистане одновременно.
 *
 * Всё на одной странице, как в разделе вопросов: город — это четыре поля,
 * ради них уходить на отдельную форму и возвращаться незачем.
 */

interface City {
    id: number;
    destination_id: number | null;
    name_tk: string | null; name_en: string | null; name_ru: string | null;
    sort_order: number;
    /** Ещё не сохранён — id в базе нет. */
    isNew?: boolean;
}

interface Destination {
    id: number;
    name_tk: string | null; name_en: string | null; name_ru: string | null;
}

interface Hotel {
    city_id: number;
}

type Lang = 'tk' | 'en' | 'ru';

const LANGS: { code: Lang; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'tk', label: 'Türkmençe' },
];

const API = process.env.NEXT_PUBLIC_API_URL;

const emptyItem = (order: number): City => ({
    id: -Date.now(), // временный ключ для React до первого сохранения
    destination_id: null,
    name_tk: '', name_en: '', name_ru: '',
    sort_order: order,
    isNew: true,
});

const Cities = () => {
    const t = useT();
    const [items, setItems] = useState<City[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [lang, setLang] = useState<Lang>('ru');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ id: number; text: string; ok: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const token = () => localStorage.getItem('auth_token');
    const authHeader = () => ({ headers: { Authorization: `Bearer ${token()}` } });

    const load = useCallback(async () => {
        try {
            if (!token()) { router.push('/'); return; }
            // Отели нужны только ради счётчика: он объясняет, почему город
            // не удаляется, ещё до того, как сервер ответит отказом.
            const [cities, dests, hotelList] = await Promise.all([
                axios.get(`${API}/api/cities`),
                axios.get(`${API}/api/destinations`),
                axios.get(`${API}/api/hotels`),
            ]);
            setItems(Array.isArray(cities.data) ? cities.data : []);
            setDestinations(Array.isArray(dests.data) ? dests.data : []);
            setHotels(Array.isArray(hotelList.data) ? hotelList.data : []);
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) { router.push('/'); return; }
            setError(t('cities.err.load'));
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const patch = (id: number, p: Partial<City>) =>
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

    const hotelsIn = (cityId: number) => hotels.filter((h) => h.city_id === cityId).length;

    const save = async (item: City) => {
        if (!item.destination_id) {
            setMessage({ id: item.id, text: t('cities.needCountry'), ok: false });
            return;
        }
        if (!item.name_ru && !item.name_en && !item.name_tk) {
            setMessage({ id: item.id, text: t('cities.needName'), ok: false });
            return;
        }
        setBusyId(item.id); setMessage(null);
        try {
            const payload = {
                destination_id: item.destination_id,
                sort_order: item.sort_order,
                name_tk: item.name_tk ?? '', name_en: item.name_en ?? '', name_ru: item.name_ru ?? '',
            };
            if (item.isNew) {
                const res = await axios.post(`${API}/api/cities`, payload, authHeader());
                // Подменяем временный id на настоящий, иначе повторное
                // сохранение завело бы второй такой же город.
                patch(item.id, { id: res.data.id, isNew: false });
                setMessage({ id: res.data.id, text: t('cities.added'), ok: true });
            } else {
                await axios.put(`${API}/api/cities/${item.id}`, payload, authHeader());
                setMessage({ id: item.id, text: t('common.saved'), ok: true });
            }
        } catch (err) {
            const text = axios.isAxiosError(err) && err.response?.data?.error
                ? String(err.response.data.error)
                : t('cities.err.save');
            setMessage({ id: item.id, text, ok: false });
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (item: City) => {
        const name = item.name_ru || item.name_en || t('cities.newItem');
        if (!item.isNew && !window.confirm(t('common.confirmDelete', { name }))) return;
        if (!item.isNew) {
            try {
                await axios.delete(`${API}/api/cities/${item.id}`, authHeader());
            } catch (err) {
                // Сервер отказывает по-человечески, когда в городе есть
                // отели, — показываем именно его текст, а не «не удалось».
                const text = axios.isAxiosError(err) && err.response?.data?.error
                    ? String(err.response.data.error)
                    : t('cities.err.delete');
                setMessage({ id: item.id, text, ok: false });
                return;
            }
        }
        setItems((prev) => prev.filter((it) => it.id !== item.id));
    };

    const countryName = (id: number | null) => {
        const d = destinations.find((item) => item.id === id);
        return d ? d[`name_${lang}`] || d.name_en || d.name_ru : '—';
    };

    if (loading) return <p className="p-10">{t('common.loading')}</p>;

    return (
        <div className="mt-8 max-w-5xl">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-ink">{t('nav.cities')}</h2>
                    <p className="mt-1 text-sm text-inkMuted">{t('cities.intro')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-inkMuted">{t('faq.langLabel')}</span>
                    {LANGS.map((l) => (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => setLang(l.code)}
                            className={`px-3 py-1 rounded text-sm ${
                                lang === l.code ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="text-brick mb-4">{error}</p>}

            <div className="space-y-4">
                {items.length === 0 && (
                    <p className="bg-white rounded-md p-6 text-gray-600">{t('cities.empty')}</p>
                )}

                {items.map((item) => (
                    <details
                        key={item.id}
                        open={item.isNew}
                        className="bg-white border border-gray-200 rounded-md"
                    >
                        <summary className="cursor-pointer px-4 py-3 font-semibold flex justify-between items-center gap-4">
                            <span>{item[`name_${lang}`] || t('cities.newItem')}</span>
                            <span className="text-sm font-normal text-gray-500 shrink-0">
                                {countryName(item.destination_id)}
                                {!item.isNew && ` · ${hotelsIn(item.id)} ${t('cities.hotelsCount')}`}
                                {` · № ${item.sort_order}`}
                            </span>
                        </summary>

                        <div className="p-4 border-t border-gray-200 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="min-w-[16rem] flex-1">
                                    <label className="block text-sm font-semibold mb-1">{t('cities.country')}</label>
                                    <select
                                        value={item.destination_id ?? ''}
                                        onChange={(e) =>
                                            patch(item.id, {
                                                destination_id: e.target.value ? Number(e.target.value) : null,
                                            })}
                                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight bg-white"
                                    >
                                        <option value="">—</option>
                                        {destinations.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d[`name_${lang}`] || d.name_en || d.name_ru}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-40">
                                    <label className="block text-sm font-semibold mb-1">{t('common.order')}</label>
                                    <input
                                        type="number"
                                        value={item.sort_order}
                                        onChange={(e) =>
                                            patch(item.id, { sort_order: Number(e.target.value) || 0 })}
                                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{t('faq.orderHint')}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('cities.name')}</label>
                                <input
                                    type="text"
                                    value={item[`name_${lang}`] ?? ''}
                                    onChange={(e) => patch(item.id, { [`name_${lang}`]: e.target.value })}
                                    className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                />
                            </div>

                            <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => save(item)}
                                    disabled={busyId === item.id}
                                    className="bg text-white px-4 py-2 rounded disabled:opacity-60"
                                >
                                    {busyId === item.id ? t('common.saving') : t('common.save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(item)}
                                    className="text-brick flex items-center gap-1"
                                >
                                    <TrashIcon className="size-4"/> {t('common.delete')}
                                </button>
                                {message?.id === item.id && (
                                    <span className={`text-sm ${message.ok ? 'text-tileMid' : 'text-brick'}`}>
                                        {message.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </details>
                ))}
            </div>

            <button
                type="button"
                onClick={() => setItems((prev) => [...prev, emptyItem(prev.length)])}
                className="mt-4 border border-gray-400 px-4 py-2 rounded"
            >
                {t('cities.addItem')}
            </button>
        </div>
    );
};

export default Cities;
