'use client'
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
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
            setError('Ошибка при получении данных');
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const remove = async (id: number, name: string) => {
        // Разделы и картинки уйдут каскадом, поэтому предупреждаем явно
        if (!window.confirm(`Удалить «${name}» вместе со всеми разделами?`)) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API}/api/destinations/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await load();
        } catch {
            setError('Не удалось удалить');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Направления</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Страницы стран: описание, разделы и информация о визе.
                            </p>
                        </div>
                        <Link
                            href="/admin/destinations/add"
                            className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"
                        >
                            <PlusCircleIcon className="size-6" color="#ffffff"/>
                            <span className="ml-2">Добавить</span>
                        </Link>
                    </div>

                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Порядок</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Название</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Адрес</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Разделов</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4">Пока нет стран</td></tr>
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
                                            className="text-blue-600 flex items-center gap-1"
                                        >
                                            <PencilSquareIcon className="size-5"/> Изменить
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => remove(d.id, d.name_ru || d.slug)}
                                            className="text-red-600"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Destinations;
