'use client'
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

/**
 * Главный баннер на первом экране сайта.
 *
 * Заголовок, подзаголовок и подпись кнопки раньше лежали в файлах локализации
 * фронтенда, а фон был вшит в вёрстку — поменять их мог только разработчик
 * через передеплой.
 *
 * Поля намеренно простые, без редактора форматирования: заголовок выводится
 * в h1, подпись — внутри кнопки, разметка там не нужна и сломала бы вёрстку.
 */

interface Banner {
    image: string | null;
    title_tk: string; title_en: string; title_ru: string;
    subtitle_tk: string; subtitle_en: string; subtitle_ru: string;
    button_text_tk: string; button_text_en: string; button_text_ru: string;
    button_link: string;
}

const EMPTY: Banner = {
    image: null,
    title_tk: '', title_en: '', title_ru: '',
    subtitle_tk: '', subtitle_en: '', subtitle_ru: '',
    button_text_tk: '', button_text_en: '', button_text_ru: '',
    button_link: '/tours',
};

const LANGS: { code: 'en' | 'ru' | 'tk'; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'tk', label: 'Türkmençe' },
];

const API = process.env.NEXT_PUBLIC_API_URL;

const Banner = () => {
    const [banner, setBanner] = useState<Banner>(EMPTY);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const token = () => localStorage.getItem('auth_token');

    const load = useCallback(async () => {
        try {
            if (!token()) { router.push('/'); return; }
            const res = await axios.get(`${API}/api/banner`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const data = res.data || {};
            const next = { ...EMPTY };
            (Object.keys(EMPTY) as (keyof Banner)[]).forEach((k) => {
                // null из базы приводим к пустой строке, иначе React ругается
                // на переход input из uncontrolled в controlled
                if (k === 'image') next.image = data.image ?? null;
                else next[k] = (data[k] ?? '') as never;
            });
            setBanner(next);
            setError(null);
        } catch (err) {
            const e = err as AxiosError;
            if (axios.isAxiosError(e) && e.response?.status === 401) { router.push('/'); return; }
            setError('Ошибка при загрузке баннера');
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const set = (k: keyof Banner, v: string) => setBanner((p) => ({ ...p, [k]: v }));

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setSaved(false); setError(null);
        try {
            // multipart, потому что вместе с текстом может идти файл
            const form = new FormData();
            (Object.keys(EMPTY) as (keyof Banner)[]).forEach((k) => {
                if (k !== 'image') form.append(k, String(banner[k] ?? ''));
            });
            if (file) form.append('image', file);

            await axios.put(`${API}/api/banner`, form, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setSaved(true);
            setFile(null); setPreview(null);
            await load();
        } catch (err) {
            console.error(err);
            setError('Не удалось сохранить баннер');
        } finally {
            setSaving(false);
        }
    };

    const resetImage = async () => {
        setError(null);
        try {
            await axios.delete(`${API}/api/banner/image`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setFile(null); setPreview(null);
            await load();
        } catch {
            setError('Не удалось вернуть картинку по умолчанию');
        }
    };

    const currentImage = preview
        || (banner.image ? `${API}/${banner.image.replace(/\\/g, '/')}` : null);

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-2">Главный баннер</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Первый экран главной страницы. Изменения появятся на сайте в течение минуты.
                        Пустое поле — сайт покажет текст по умолчанию.
                    </p>

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-8">
                        <div>
                            <label className="block font-semibold mb-2">Фоновая картинка</label>
                            <div className="flex items-start gap-6">
                                <div className="w-72 h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                                    {currentImage ? (
                                        <Image
                                            src={currentImage}
                                            alt="Баннер"
                                            width={288}
                                            height={160}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500 text-center px-4">
                                            Своя картинка не загружена — используется картинка из вёрстки
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={onFile}
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-gray-500 max-w-sm">
                                        JPG, PNG или WebP, до 10 МБ. Лучше горизонтальная,
                                        от 1920px по ширине: она растягивается на весь экран.
                                    </p>
                                    {banner.image && (
                                        <button
                                            type="button"
                                            onClick={resetImage}
                                            className="text-sm text-red-600 underline w-fit"
                                        >
                                            Вернуть картинку по умолчанию
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {LANGS.map((lang) => (
                            <div key={lang.code} className="border-t border-gray-200 pt-6">
                                <h3 className="font-semibold mb-3">{lang.label}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm mb-1">Заголовок</label>
                                        <input
                                            type="text"
                                            value={banner[`title_${lang.code}`]}
                                            onChange={(e) => set(`title_${lang.code}`, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Подзаголовок</label>
                                        <textarea
                                            rows={2}
                                            value={banner[`subtitle_${lang.code}`]}
                                            onChange={(e) => set(`subtitle_${lang.code}`, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Надпись на кнопке</label>
                                        <input
                                            type="text"
                                            value={banner[`button_text_${lang.code}`]}
                                            onChange={(e) => set(`button_text_${lang.code}`, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-gray-200 pt-6">
                            <label className="block font-semibold mb-1">Куда ведёт кнопка</label>
                            <input
                                type="text"
                                value={banner.button_link}
                                onChange={(e) => set('button_link', e.target.value)}
                                placeholder="/tours"
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Путь внутри сайта без языка: /tours, /contacts. Язык подставится сам.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg text-white py-2 px-8 rounded-md cursor-pointer disabled:opacity-60"
                            >
                                {saving ? 'Сохраняем…' : 'Сохранить'}
                            </button>
                            {saved && <span className="text-green-600 text-sm">Сохранено</span>}
                            {error && <span className="text-red-600 text-sm">{error}</span>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Banner;
