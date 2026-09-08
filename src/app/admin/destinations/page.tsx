'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

/**
 * Страны раздела «Направления».
 *
 * Контент жил в файле src/data/destinations.ts на 496 строк — поправить
 * описание страны можно было только правкой кода с передеплоем.
 */

interface Destination {
    id: number;
    slug: string;
    sort_order: number;
    name_en: string | null;
    name_ru: string | null;
    sections?: { id: number }[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

const Destinations = () => {
    const t = useT();
    const [items, setItems] = useState<Destination[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const load = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) { router.push('/'); return; }
            const res = await axios.get(`${API}/api/destinations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch (err) {
            const e = err as AxiosError;
            if (axios.isAxiosError(e) && e.response?.status === 401) { router.push('/'); return; }
            setError(t('common.error'));
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const remove = async (id: number, name: string) => {
        // Разделы и картинки уйдут каскадом, поэтому предупреждаем явно
        if (!window.confirm(t('dest.confirmDelete', { name }))) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API}/api/destinations/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await load();
        } catch {
            setError(t('faq.err.delete'));
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <>
        <div className="mt-8">
            <div className="w-full flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-ink">{t('nav.destinations')}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {t('dest.intro')}
                    </p>
                </div>
                <Link
                    href="/admin/destinations/add"
                    className="flex h-fit items-center rounded-md bg-tile px-5 py-2.5 text-white transition-colors hover:bg-tileDark"
                >
                    <PlusCircleIcon className="size-6" color="#ffffff"/>
                    <span className="ml-2">{t('common.add')}</span>
                </Link>
            </div>

            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">{t('common.order')}</th>
                    <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">{t('list.name')}</th>
                    <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">{t('dest.url')}</th>
                    <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">{t('dest.sections')}</th>
                    <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600"></th>
                </tr>
                </thead>
                <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">{t('dest.empty')}</td></tr>
                ) : items.map((d) => (
                    <tr key={d.id}>
                        <td className="py-3 px-4 border-b border-gray-200">{d.sort_order}</td>
                        <td className="py-3 px-4 border-b border-gray-200">
                            {d.name_ru || d.name_en || '—'}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                            <code className="text-sm">/destinations/{d.slug}</code>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                            {d.sections?.length ?? 0}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/admin/destinations/edit/${d.id}`}
                                    className="flex items-center gap-1 text-tile hover:underline"
                                >
                                    <PencilSquareIcon className="size-5"/> Изменить
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => remove(d.id, d.name_ru || d.slug)}
                                    className="text-brick"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default Destinations;
