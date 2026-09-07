'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import CountryImageField from "@/Components/CountryImageField";
import DestinationFields, { DestinationForm, EMPTY_DESTINATION } from "@/Components/DestinationFields";
import DestinationSections, { Section } from "@/Components/DestinationSections";
import { DocumentIcon } from "@heroicons/react/16/solid";

const API = process.env.NEXT_PUBLIC_API_URL;

interface DestinationRow extends Record<string, unknown> {
    id: number;
    hero_image: string | null;
    card_image: string | null;
    sections?: Section[];
}

const EditDestination = () => {
    const t = useT();
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [form, setForm] = useState<DestinationForm>(EMPTY_DESTINATION);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [cardImage, setCardImage] = useState<string | null>(null);
    const [cardFile, setCardFile] = useState<File | null>(null);
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
                setCardImage(row.card_image ?? null);
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
            if (cardFile) data.append('card_image', cardFile);

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
        <>
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {form.name_ru || form.name_en || form.slug}
                </h1>
                <Link href="/admin/destinations" className="text-blue-600">
                    ← Ко всем странам
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-sand bg-white p-6">
                {/* Две картинки страны: обложка её страницы и плитка на
                    главной. Раньше плитка жила отдельной сущностью
                    «Карточки на главной» — той же страной, заведённой второй раз. */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <CountryImageField
                        label="Обложка страницы страны"
                        hint="Горизонтальная, от 1600px по ширине. Новый файл заменит текущую; если файл не выбран, картинка остаётся прежней."
                        current={heroImage}
                        shape="wide"
                        onFile={setHeroFile}
                    />
                    <CountryImageField
                        label="Плитка на главной"
                        hint="Вертикальная, пропорции 3:4, от 800px по ширине. Не задана — на главной покажется обложка."
                        current={cardImage}
                        shape="card"
                        onFile={setCardFile}
                    />
                </div>

                <DestinationFields value={form} onChange={patch} slugLocked/>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center rounded-md bg-tile px-5 py-2.5 text-white transition-colors hover:bg-tileDark disabled:opacity-60"
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
        </>
    );
};

export default EditDestination;
