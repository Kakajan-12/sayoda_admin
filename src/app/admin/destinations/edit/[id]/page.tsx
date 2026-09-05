'use client'
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import DestinationFields, { DestinationForm, EMPTY_DESTINATION } from "@/Components/DestinationFields";
import DestinationSections, { Section } from "@/Components/DestinationSections";
import { DocumentIcon } from "@heroicons/react/16/solid";

const API = process.env.NEXT_PUBLIC_API_URL;

interface DestinationRow extends Record<string, unknown> {
    id: number;
    hero_image: string | null;
    sections?: Section[];
}

const EditDestination = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [form, setForm] = useState<DestinationForm>(EMPTY_DESTINATION);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) { router.push('/'); return; }
                // Отдельной выдачи по id нет — берём список, он уже приходит
                // вместе с разделами и картинками.
                const res = await axios.get(`${API}/api/destinations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const row = (res.data as DestinationRow[]).find((d) => String(d.id) === String(id));
                if (!row) { setError('Страна не найдена'); setLoading(false); return; }

                const next = { ...EMPTY_DESTINATION };
                (Object.keys(EMPTY_DESTINATION) as (keyof DestinationForm)[]).forEach((k) => {
                    // null из базы приводим к пустой строке: иначе input
                    // переходит из uncontrolled в controlled и React ругается.
                    next[k] = String(row[k] ?? '');
                });
                setForm(next);
                setHeroImage(row.hero_image ?? null);
                setSections(row.sections ?? []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Ошибка при загрузке страны');
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, router]);

    const patch = (p: Partial<DestinationForm>) => setForm((prev) => ({ ...prev, ...p }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setSaved(false); setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const data = new FormData();
            (Object.keys(EMPTY_DESTINATION) as (keyof DestinationForm)[])
                .forEach((k) => data.append(k, String(form[k] ?? '')));
            if (heroFile) data.append('hero_image', heroFile);

            await axios.put(`${API}/api/destinations/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setHeroFile(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось сохранить');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-10">Загрузка…</p>;
    if (error && !form.slug) return <p className="p-10 text-red-600">{error}</p>;

    const currentHero = heroImage
        ? (heroImage.startsWith('/') ? heroImage : `${API}/${heroImage.replace(/\\/g, '/')}`)
        : null;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">
                            {form.name_ru || form.name_en || form.slug}
                        </h1>
                        <Link href="/admin/destinations" className="text-blue-600">
                            ← Ко всем странам
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div>
                            <label className="block font-semibold mb-2">Картинка обложки</label>
                            <div className="flex items-start gap-6">
                                <div className="w-64 h-36 bg-gray-100 rounded overflow-hidden flex items-center justify-center shrink-0">
                                    {currentHero ? (
                                        <Image
                                            src={currentHero}
                                            alt=""
                                            width={256}
                                            height={144}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500 px-4 text-center">
                                            Картинка не задана
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                        Новый файл заменит текущую картинку. Если файл не выбран,
                                        картинка остаётся прежней.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DestinationFields value={form} onChange={patch} slugLocked/>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg text-white px-4 py-2 rounded flex items-center disabled:opacity-60"
                            >
                                <DocumentIcon className="w-5 h-5 mr-2"/>
                                {saving ? 'Сохраняем…' : 'Сохранить страну'}
                            </button>
                            {saved && <span className="text-green-600 text-sm">Сохранено</span>}
                            {error && <span className="text-red-600 text-sm">{error}</span>}
                        </div>
                    </form>

                    <DestinationSections destinationId={String(id)} initial={sections}/>
                </div>
            </div>
        </div>
    );
};

export default EditDestination;
