'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import DestinationFields, { DestinationForm, EMPTY_DESTINATION } from "@/Components/DestinationFields";
import { DocumentIcon } from "@heroicons/react/16/solid";

const API = process.env.NEXT_PUBLIC_API_URL;

const AddDestination = () => {
    const router = useRouter();
    const [form, setForm] = useState<DestinationForm>(EMPTY_DESTINATION);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const patch = (p: Partial<DestinationForm>) => setForm((prev) => ({ ...prev, ...p }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('Токен не найден');

            const data = new FormData();
            (Object.keys(EMPTY_DESTINATION) as (keyof DestinationForm)[])
                .forEach((k) => data.append(k, String(form[k] ?? '')));
            if (heroFile) data.append('hero_image', heroFile);

            const res = await axios.post(`${API}/api/destinations`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Разделы добавляются на странице редактирования: у них должна быть
            // уже существующая страна, к которой их привязать.
            router.push(`/admin/destinations/edit/${res.data.id}`);
        } catch (err) {
            console.error(err);
            setError('Не удалось создать страну. Проверьте, что адрес страницы не занят.');
            setSaving(false);
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Новая страна</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div>
                            <label className="block font-semibold mb-2">Картинка обложки</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Горизонтальная, от 1600px по ширине.
                            </p>
                        </div>

                        <DestinationFields value={form} onChange={patch}/>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg text-white px-4 py-2 rounded flex items-center disabled:opacity-60"
                            >
                                <DocumentIcon className="w-5 h-5 mr-2"/>
                                {saving ? 'Сохраняем…' : 'Создать и перейти к разделам'}
                            </button>
                            {error && <span className="text-red-600 text-sm">{error}</span>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddDestination;
