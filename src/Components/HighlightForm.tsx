'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useT } from "@/lib/i18n/LocaleProvider";
import { readToken } from "@/lib/auth";
import { plainText } from "@/Components/ResourceList";

/**
 * Форма пункта «главного о туре» — одна на добавление и на правку.
 *
 * Текст здесь обычный, без редактора: бэкенд всё равно снимает разметку,
 * а пункт выводится строкой в списке. Богатый редактор дал бы редактору
 * жирный шрифт и ссылки, которые молча пропали бы при сохранении.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

interface Tour {
    id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
}

const LANGS = [
    { field: 'text_tk', key: 'lang.tk' },
    { field: 'text_en', key: 'lang.en' },
    { field: 'text_ru', key: 'lang.ru' },
] as const;

export default function HighlightForm({ id }: { id?: string }) {
    const t = useT();
    const router = useRouter();
    const isEdit = Boolean(id);

    const [tours, setTours] = useState<Tour[]>([]);
    const [data, setData] = useState({
        tour_id: '',
        sort_order: '0',
        text_tk: '',
        text_en: '',
        text_ru: '',
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axios
            .get(`${API}/api/tours`)
            .then((res) => setTours(Array.isArray(res.data) ? res.data : []))
            .catch(() => setTours([]));
    }, []);

    useEffect(() => {
        if (!id) return;
        axios
            .get(`${API}/api/highlights/${id}`, {
                headers: { Authorization: `Bearer ${readToken()}` },
            })
            .then((res) => {
                const row = res.data;
                setData({
                    tour_id: String(row.tour_id ?? ''),
                    sort_order: String(row.sort_order ?? 0),
                    text_tk: row.text_tk ?? '',
                    text_en: row.text_en ?? '',
                    text_ru: row.text_ru ?? '',
                });
            })
            .catch(() => setError(t('common.error')))
            .finally(() => setLoading(false));
    }, [id, t]);

    const set = (field: keyof typeof data, value: string) =>
        setData((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const token = readToken();
            const headers = { Authorization: `Bearer ${token}` };
            if (isEdit) {
                await axios.put(`${API}/api/highlights/${id}`, data, { headers });
            } else {
                await axios.post(`${API}/api/highlights`, data, { headers });
            }
            router.push('/admin/highlights');
        } catch {
            setError(t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="mt-8 text-inkMuted">{t('common.loading')}</p>;
    }

    return (
        <div className="mt-8">
            <form
                onSubmit={handleSubmit}
                className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
            >
                <h2 className="text-2xl font-bold mb-4 text-left">
                    {t(isEdit ? 'form.editTitle' : 'form.addTitle')}
                </h2>

                {error && (
                    <p className="mb-4 rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">
                        {error}
                    </p>
                )}

                <div className="mb-4 grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectTour')}
                        </label>
                        <select
                            value={data.tour_id}
                            onChange={(e) => set('tour_id', e.target.value)}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">—</option>
                            {tours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {plainText(tour.title_ru) || plainText(tour.title_en)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.sortOrder')}
                        </label>
                        <input
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => set('sort_order', e.target.value)}
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        />
                        <p className="mt-1 text-xs text-inkMuted">
                            {t('form.sortOrderHint')}
                        </p>
                    </div>
                </div>

                {/* Три языка рядом, а не вкладками: строка короткая, и так
                    сразу видно, какой перевод забыли заполнить. */}
                <div className="mb-6 grid gap-4">
                    {LANGS.map((lang) => (
                        <div key={lang.field}>
                            <label className="mb-1 block text-sm font-medium text-inkMuted">
                                {t('form.text')} — {t(lang.key)}
                            </label>
                            <input
                                type="text"
                                maxLength={500}
                                value={data[lang.field]}
                                onChange={(e) => set(lang.field, e.target.value)}
                                className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-md bg-tile py-2.5 px-4 font-semibold text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                >
                    {t(isEdit ? 'common.save' : 'common.add')}
                </button>
            </form>
        </div>
    );
}
