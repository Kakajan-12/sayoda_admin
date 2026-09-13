'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/16/solid";

/**
 * Отели.
 *
 * Раньше лежали в коде сайта — 318 строк с двенадцатью объектами, которые
 * правил только разработчик. Теперь обычный раздел.
 *
 * Страны у отеля нет: она известна через город. Отдельное поле означало бы,
 * что отель может числиться в Ашхабаде и в Узбекистане одновременно, и
 * однажды так и случится. Города заводятся в соседнем разделе.
 *
 * Всё на одной странице, как в вопросах и городах: каждая карточка
 * сохраняется своей кнопкой — одна общая отправка означала бы, что опечатка
 * в одном отеле откатывает правки во всех.
 */

interface Hotel {
    id: number;
    city_id: number | null;
    sort_order: number;
    name_tk: string | null; name_en: string | null; name_ru: string | null;
    address_tk: string | null; address_en: string | null; address_ru: string | null;
    image: string | null;
    /** Категория отеля 1–5; null — не указана. Не оценка гостей. */
    stars: number | null;
    breakfast: number;
    kids_play_area: number;
    parking: number;
    wifi: number;
    included_breakfast: number;
    included_travel_tax: number;
    book_url: string | null;
    /** Ещё не сохранён — id в базе нет. */
    isNew?: boolean;
    /** Выбранный в форме файл, до отправки. */
    file?: File | null;
}

interface City {
    id: number;
    destination_id: number;
    name_tk: string | null; name_en: string | null; name_ru: string | null;
}

type Lang = 'tk' | 'en' | 'ru';

const LANGS: { code: Lang; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'tk', label: 'Türkmençe' },
];

type FlagKey =
    | 'breakfast' | 'kids_play_area' | 'parking' | 'wifi'
    | 'included_breakfast' | 'included_travel_tax';

const AMENITIES: { key: FlagKey; labelKey: 'hotels.breakfast' | 'hotels.kidsPlayArea' | 'hotels.parking' | 'hotels.wifi' }[] = [
    { key: 'breakfast', labelKey: 'hotels.breakfast' },
    { key: 'kids_play_area', labelKey: 'hotels.kidsPlayArea' },
    { key: 'parking', labelKey: 'hotels.parking' },
    { key: 'wifi', labelKey: 'hotels.wifi' },
];

const INCLUDED: { key: FlagKey; labelKey: 'hotels.breakfast' | 'hotels.travelTax' }[] = [
    { key: 'included_breakfast', labelKey: 'hotels.breakfast' },
    { key: 'included_travel_tax', labelKey: 'hotels.travelTax' },
];

const API = process.env.NEXT_PUBLIC_API_URL;

const emptyItem = (order: number): Hotel => ({
    id: -Date.now(),
    city_id: null,
    sort_order: order,
    name_tk: '', name_en: '', name_ru: '',
    address_tk: '', address_en: '', address_ru: '',
    image: null,
    stars: null,
    breakfast: 0, kids_play_area: 0, parking: 0, wifi: 0,
    included_breakfast: 0, included_travel_tax: 0,
    book_url: '',
    isNew: true,
    file: null,
});

/**
 * Адрес картинки для предпросмотра.
 *
 * В базе путь хранится по-разному: абсолютный из multer, относительный из
 * старых записей, изредка с обратными слэшами от Windows. Приводим к одному
 * виду и вешаем на адрес API.
 */
const imageUrl = (stored: string | null) => {
    if (!stored) return '';
    if (/^https?:\/\//.test(stored)) return stored;
    const clean = stored.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^app\//, '');
    return `${String(API).replace(/\/+$/, '')}/${clean}`;
};

const Hotels = () => {
    const t = useT();
    const [items, setItems] = useState<Hotel[]>([]);
    const [cities, setCities] = useState<City[]>([]);
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
            const [hotels, cityList] = await Promise.all([
                axios.get(`${API}/api/hotels`),
                axios.get(`${API}/api/cities`),
            ]);
            setItems(Array.isArray(hotels.data) ? hotels.data : []);
            setCities(Array.isArray(cityList.data) ? cityList.data : []);
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) { router.push('/'); return; }
            setError(t('hotels.err.load'));
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const patch = (id: number, p: Partial<Hotel>) =>
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

    const cityName = (id: number | null) => {
        const c = cities.find((item) => item.id === id);
        return c ? c[`name_${lang}`] || c.name_en || c.name_ru : '—';
    };

    const save = async (item: Hotel) => {
        if (!item.city_id) {
            setMessage({ id: item.id, text: t('hotels.needCity'), ok: false });
            return;
        }
        if (!item.name_ru && !item.name_en && !item.name_tk) {
            setMessage({ id: item.id, text: t('hotels.needName'), ok: false });
            return;
        }
        setBusyId(item.id); setMessage(null);
        try {
            // Форма уходит как multipart всегда, не только при новой
            // картинке: смешивать два формата ради одного поля — лишний
            // повод разойтись поведению создания и правки.
            const form = new FormData();
            form.append('city_id', String(item.city_id));
            form.append('sort_order', String(item.sort_order));
            (['name', 'address'] as const).forEach((field) => {
                (['tk', 'en', 'ru'] as const).forEach((l) => {
                    form.append(`${field}_${l}`, item[`${field}_${l}`] ?? '');
                });
            });
            form.append('stars', item.stars ? String(item.stars) : '');
            form.append('book_url', item.book_url ?? '');
            [...AMENITIES, ...INCLUDED].forEach(({ key }) =>
                form.append(key, item[key] ? '1' : '0'));
            if (item.file) form.append('image', item.file);
            // Прежний путь отправляем отдельно: без него сервер не отличит
            // «картинку не меняли» от «картинку убрали».
            else if (item.image) form.append('image', item.image);

            if (item.isNew) {
                const res = await axios.post(`${API}/api/hotels`, form, authHeader());
                patch(item.id, { id: res.data.id, isNew: false, file: null, image: res.data.image });
                setMessage({ id: res.data.id, text: t('hotels.added'), ok: true });
            } else {
                const res = await axios.put(`${API}/api/hotels/${item.id}`, form, authHeader());
                patch(item.id, { file: null, image: res.data.image ?? item.image });
                setMessage({ id: item.id, text: t('common.saved'), ok: true });
            }
        } catch (err) {
            const text = axios.isAxiosError(err) && err.response?.data?.error
                ? String(err.response.data.error)
                : t('hotels.err.save');
            setMessage({ id: item.id, text, ok: false });
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (item: Hotel) => {
        const name = item.name_ru || item.name_en || t('hotels.newItem');
        if (!item.isNew && !window.confirm(t('common.confirmDelete', { name }))) return;
        if (!item.isNew) {
            try {
                await axios.delete(`${API}/api/hotels/${item.id}`, authHeader());
            } catch {
                setMessage({ id: item.id, text: t('hotels.err.delete'), ok: false });
                return;
            }
        }
        setItems((prev) => prev.filter((it) => it.id !== item.id));
    };

    if (loading) return <p className="p-10">{t('common.loading')}</p>;

    const field = "w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight";

    return (
        <div className="mt-8 max-w-5xl">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-ink">{t('nav.hotels')}</h2>
                    <p className="mt-1 text-sm text-inkMuted">{t('hotels.intro')}</p>
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

            {/* Отель без города завести нельзя, поэтому говорим об этом до
                того, как человек заполнит форму и упрётся в пустой select. */}
            {!cities.length && (
                <p className="bg-white rounded-md p-6 text-gray-600 mb-4">{t('hotels.noCities')}</p>
            )}

            <div className="space-y-4">
                {items.length === 0 && cities.length > 0 && (
                    <p className="bg-white rounded-md p-6 text-gray-600">{t('hotels.empty')}</p>
                )}

                {items.map((item) => (
                    <details
                        key={item.id}
                        open={item.isNew}
                        className="bg-white border border-gray-200 rounded-md"
                    >
                        <summary className="cursor-pointer px-4 py-3 font-semibold flex justify-between items-center gap-4">
                            <span>{item[`name_${lang}`] || t('hotels.newItem')}</span>
                            <span className="text-sm font-normal text-gray-500 shrink-0">
                                {cityName(item.city_id)} · № {item.sort_order}
                            </span>
                        </summary>

                        <div className="p-4 border-t border-gray-200 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="min-w-[14rem] flex-1">
                                    <label className="block text-sm font-semibold mb-1">{t('hotels.city')}</label>
                                    <select
                                        value={item.city_id ?? ''}
                                        onChange={(e) =>
                                            patch(item.id, { city_id: e.target.value ? Number(e.target.value) : null })}
                                        className={`${field} bg-white`}
                                    >
                                        <option value="">—</option>
                                        {cities.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c[`name_${lang}`] || c.name_en || c.name_ru}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-32">
                                    <label className="block text-sm font-semibold mb-1">{t('hotels.stars')}</label>
                                    <select
                                        value={item.stars ?? ''}
                                        onChange={(e) =>
                                            patch(item.id, { stars: e.target.value ? Number(e.target.value) : null })}
                                        className={`${field} bg-white`}
                                    >
                                        <option value="">{t('hotels.starsNone')}</option>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-28">
                                    <label className="block text-sm font-semibold mb-1">{t('common.order')}</label>
                                    <input
                                        type="number"
                                        value={item.sort_order}
                                        onChange={(e) =>
                                            patch(item.id, { sort_order: Number(e.target.value) || 0 })}
                                        className={field}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 -mt-2">{t('hotels.starsHint')}</p>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('hotels.name')}</label>
                                <input
                                    type="text"
                                    value={item[`name_${lang}`] ?? ''}
                                    onChange={(e) => patch(item.id, { [`name_${lang}`]: e.target.value })}
                                    className={field}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('hotels.address')}</label>
                                <input
                                    type="text"
                                    value={item[`address_${lang}`] ?? ''}
                                    onChange={(e) => patch(item.id, { [`address_${lang}`]: e.target.value })}
                                    className={field}
                                />
                            </div>

                            <div className="flex flex-wrap gap-8">
                                <div>
                                    <p className="text-sm font-semibold mb-2">{t('hotels.amenities')}</p>
                                    <div className="flex flex-col gap-1">
                                        {AMENITIES.map(({ key, labelKey }) => (
                                            <label key={key} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(item[key])}
                                                    onChange={(e) => patch(item.id, { [key]: e.target.checked ? 1 : 0 })}
                                                />
                                                {t(labelKey)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-2">{t('hotels.included')}</p>
                                    <div className="flex flex-col gap-1">
                                        {INCLUDED.map(({ key, labelKey }) => (
                                            <label key={key} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(item[key])}
                                                    onChange={(e) => patch(item.id, { [key]: e.target.checked ? 1 : 0 })}
                                                />
                                                {t(labelKey)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('hotels.bookUrl')}</label>
                                <input
                                    type="url"
                                    value={item.book_url ?? ''}
                                    onChange={(e) => patch(item.id, { book_url: e.target.value })}
                                    placeholder="https://"
                                    className={field}
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('hotels.bookUrlHint')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('hotels.image')}</label>
                                <div className="flex items-start gap-4">
                                    {item.image && !item.file && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={imageUrl(item.image)}
                                            alt=""
                                            className="h-20 w-28 shrink-0 rounded object-cover border border-sand"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                patch(item.id, { file: e.target.files?.[0] ?? null })}
                                            className={`${field} bg-white`}
                                        />
                                        {item.image && !item.file && (
                                            <p className="text-xs text-gray-500 mt-1">{t('hotels.imageKeep')}</p>
                                        )}
                                    </div>
                                </div>
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
                disabled={!cities.length}
                onClick={() => setItems((prev) => [...prev, emptyItem(prev.length)])}
                className="mt-4 border border-gray-400 px-4 py-2 rounded disabled:opacity-50"
            >
                {t('hotels.addItem')}
            </button>
        </div>
    );
};

export default Hotels;
