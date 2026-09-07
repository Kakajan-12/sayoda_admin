'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CountryImageField from "@/Components/CountryImageField";
import DestinationFields, { DestinationForm, EMPTY_DESTINATION } from "@/Components/DestinationFields";
import { DocumentIcon } from "@heroicons/react/16/solid";

const API = process.env.NEXT_PUBLIC_API_URL;

const AddDestination = () => {
    const t = useT();
    const router = useRouter();
    const [form, setForm] = useState<DestinationForm>(EMPTY_DESTINATION);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [cardFile, setCardFile] = useState<File | null>(null);
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
            if (cardFile) data.append('card_image', cardFile);

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
        <>
        <div className="mt-8">
            <h1 className="text-2xl font-bold mb-4">Новая страна</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-sand bg-white p-6">
                {/* Две картинки страны: обложка её страницы и плитка на
                    главной. Плитку можно загрузить и позже — без неё на
                    главной покажется обложка. */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <CountryImageField
                        label="Обложка страницы страны"
                        hint="Горизонтальная, от 1600px по ширине."
                        current={null}
                        shape="wide"
                        onFile={setHeroFile}
                    />
                    <CountryImageField
                        label="Плитка на главной"
                        hint="Вертикальная, пропорции 3:4, от 800px по ширине. Не задана — на главной покажется обложка."
                        current={null}
                        shape="card"
                        onFile={setCardFile}
                    />
                </div>

                <DestinationFields value={form} onChange={patch}/>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center rounded-md bg-tile px-5 py-2.5 text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                    >
                        <DocumentIcon className="w-5 h-5 mr-2"/>
                        {saving ? 'Сохраняем…' : 'Создать и перейти к разделам'}
                    </button>
                    {error && <span className="text-red-600 text-sm">{error}</span>}
                </div>
            </form>
        </div>
        </>
    );
};

export default AddDestination;
