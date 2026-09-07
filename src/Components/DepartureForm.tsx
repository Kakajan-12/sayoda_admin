'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useT } from "@/lib/i18n/LocaleProvider";
import { readToken } from "@/lib/auth";
import { plainText } from "@/Components/ResourceList";

/**
 * Форма заезда — одна на добавление и на правку.
 *
 * Три поля из шести необязательны, и у каждого пустое значение означает
 * не «ноль», а «не задано»: цена берётся у тура, дата конца считается из
 * длительности, места не считаются вовсе. Подписи под полями говорят это
 * прямо — иначе редактор заполнял бы их «на всякий случай» нулями и
 * получал бы на сайте распроданный заезд по нулевой цене.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

interface Tour {
    id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
}

const STATUSES = [
    { value: 'open', key: 'dep.open' },
    { value: 'sold_out', key: 'dep.sold_out' },
    { value: 'closed', key: 'dep.closed' },
] as const;

export default function DepartureForm({ id }: { id?: string }) {
    const t = useT();
    const router = useRouter();
    const isEdit = Boolean(id);

    const [tours, setTours] = useState<Tour[]>([]);
    const [data, setData] = useState({
        tour_id: '',
        start_date: '',
        end_date: '',
        price: '',
        seats_left: '',
        status: 'open',
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
            .get(`${API}/api/departures/${id}`, {
                headers: { Authorization: `Bearer ${readToken()}` },
            })
            .then((res) => {
                const row = res.data;
                setData({
                    tour_id: String(row.tour_id ?? ''),
                    start_date: row.start_date ?? '',
                    end_date: row.end_date ?? '',
                    // null → пустая строка, иначе input показал бы «null»
                    price: row.price === null ? '' : String(row.price ?? ''),
                    seats_left:
                        row.seats_left === null ? '' : String(row.seats_left ?? ''),
                    status: row.status ?? 'open',
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
            const headers = { Authorization: `Bearer ${readToken()}` };
            if (isEdit) {
                await axios.put(`${API}/api/departures/${id}`, data, { headers });
            } else {
                await axios.post(`${API}/api/departures`, data, { headers });
            }
            router.push('/admin/departures');
        } catch (err) {
            // 409 приходит, когда у тура уже есть заезд на эту дату. Общее
            // «не удалось сохранить» тут бесполезно: причина конкретная и
            // исправляется одним движением.
            const duplicate =
                axios.isAxiosError(err) && err.response?.status === 409;
            setError(t(duplicate ? 'dep.duplicate' : 'common.error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="mt-8 text-inkMuted">{t('common.loading')}</p>;
    }

    const field =
        'w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight';

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

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">
                        {t('form.selectTour')}
                    </label>
                    <select
                        value={data.tour_id}
                        onChange={(e) => set('tour_id', e.target.value)}
                        required
                        className={field}
                    >
                        <option value="">—</option>
                        {tours.map((tour) => (
                            <option key={tour.id} value={tour.id}>
                                {plainText(tour.title_ru) || plainText(tour.title_en)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.startDate')}
                        </label>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={(e) => set('start_date', e.target.value)}
                            required
                            className={field}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.endDate')}
                        </label>
                        <input
                            type="date"
                            value={data.end_date}
                            onChange={(e) => set('end_date', e.target.value)}
                            className={field}
                        />
                        <p className="mt-1 text-xs text-inkMuted">
                            {t('form.endDateHint')}
                        </p>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.price')}
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={data.price}
                            onChange={(e) => set('price', e.target.value)}
                            className={field}
                        />
                        <p className="mt-1 text-xs text-inkMuted">
                            {t('form.priceHint')}
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.seatsLeft')}
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={data.seats_left}
                            onChange={(e) => set('seats_left', e.target.value)}
                            className={field}
                        />
                        <p className="mt-1 text-xs text-inkMuted">
                            {t('form.seatsHint')}
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.status')}
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => set('status', e.target.value)}
                            className={field}
                        >
                            {STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {t(status.key)}
                                </option>
                            ))}
                        </select>
                    </div>
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
