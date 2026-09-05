'use client'
import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import TipTapEditor from "@/Components/TipTapEditor";
import { DESTINATION_LANGS } from "@/Components/DestinationFields";
import { TrashIcon } from "@heroicons/react/16/solid";

/**
 * Разделы страницы страны: «Общая информация», «Сезон», «Кухня» и так далее.
 *
 * Каждый раздел сохраняется отдельной кнопкой, а не общей формой страницы:
 * разделов у страны до восьми, и одна большая отправка означала бы, что опечатка
 * в одном из них откатывает правки во всех.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

/** Значки берутся из готового набора фронтенда — произвольное имя там не найдётся. */
const ICONS = [
    { value: 'overview', label: 'Бинокль — обзор' },
    { value: 'season', label: 'Солнце — сезон' },
    { value: 'flights', label: 'Самолёт — перелёты' },
    { value: 'safety', label: 'Щит — безопасность' },
    { value: 'holidays', label: 'Календарь — праздники' },
    { value: 'traditions', label: 'Звезда — традиции' },
    { value: 'cuisine', label: 'Тарелка — кухня' },
    { value: 'flora', label: 'Лист — природа' },
];

export interface SectionImage {
    id: number;
    src: string;
    sort_order: number;
    caption_tk: string | null;
    caption_en: string | null;
    caption_ru: string | null;
}

export interface Section {
    id: number;
    section_key: string;
    icon: string | null;
    sort_order: number;
    title_tk: string | null; title_en: string | null; title_ru: string | null;
    body_tk: string | null; body_en: string | null; body_ru: string | null;
    images?: SectionImage[];
    /** Раздел ещё не сохранён — у него нет id в базе. */
    isNew?: boolean;
}

type Lang = 'tk' | 'en' | 'ru';

const token = () => localStorage.getItem('auth_token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${token()}` } });

/** Картинки бывают двух видов: из public фронтенда и загруженные в админке. */
const imageUrl = (src: string) =>
    src.startsWith('/') ? src : `${API}/${src.replace(/\\/g, '/')}`;

const newSection = (order: number): Section => ({
    id: -Date.now(), // временный ключ для React до первого сохранения
    section_key: '',
    icon: 'overview',
    sort_order: order,
    title_tk: '', title_en: '', title_ru: '',
    body_tk: '', body_en: '', body_ru: '',
    images: [],
    isNew: true,
});

interface Props {
    destinationId: string;
    initial: Section[];
}

const DestinationSections = ({ destinationId, initial }: Props) => {
    const [sections, setSections] = useState<Section[]>(initial);
    const [lang, setLang] = useState<Lang>('ru');
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ id: number; text: string; ok: boolean } | null>(null);

    const patch = (id: number, p: Partial<Section>) =>
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));

    const save = async (section: Section) => {
        if (!section.section_key.trim()) {
            setMessage({ id: section.id, text: 'Заполните ключ раздела', ok: false });
            return;
        }
        setBusyId(section.id); setMessage(null);
        try {
            const payload = {
                section_key: section.section_key.trim(),
                icon: section.icon || 'overview',
                sort_order: section.sort_order,
                title_tk: section.title_tk ?? '', title_en: section.title_en ?? '', title_ru: section.title_ru ?? '',
                body_tk: section.body_tk ?? '', body_en: section.body_en ?? '', body_ru: section.body_ru ?? '',
            };

            if (section.isNew) {
                const res = await axios.post(
                    `${API}/api/destinations/${destinationId}/sections`, payload, authHeader());
                // Подменяем временный id на настоящий, иначе картинки уйдут
                // не туда, а повторное сохранение создаст дубль раздела.
                patch(section.id, { id: res.data.id, isNew: false });
                setMessage({ id: res.data.id, text: 'Раздел создан', ok: true });
            } else {
                await axios.put(
                    `${API}/api/destinations/${destinationId}/sections/${section.id}`, payload, authHeader());
                setMessage({ id: section.id, text: 'Сохранено', ok: true });
            }
        } catch (err) {
            console.error(err);
            setMessage({
                id: section.id,
                text: 'Не удалось сохранить. Возможно, такой ключ у страны уже есть.',
                ok: false,
            });
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (section: Section) => {
        const name = section.title_ru || section.section_key || 'раздел';
        if (!section.isNew && !window.confirm(`Удалить «${name}» вместе с картинками?`)) return;
        if (!section.isNew) {
            try {
                await axios.delete(
                    `${API}/api/destinations/${destinationId}/sections/${section.id}`, authHeader());
            } catch {
                setMessage({ id: section.id, text: 'Не удалось удалить', ok: false });
                return;
            }
        }
        setSections((prev) => prev.filter((s) => s.id !== section.id));
    };

    const addImage = async (section: Section, file: File) => {
        setBusyId(section.id);
        try {
            const data = new FormData();
            data.append('image', file);
            data.append('sort_order', String(section.images?.length ?? 0));
            const res = await axios.post(
                `${API}/api/destinations/${destinationId}/sections/${section.id}/images`,
                data, authHeader());
            patch(section.id, {
                images: [...(section.images ?? []), {
                    id: res.data.id, src: res.data.src, sort_order: section.images?.length ?? 0,
                    caption_tk: '', caption_en: '', caption_ru: '',
                }],
            });
        } catch {
            setMessage({ id: section.id, text: 'Не удалось загрузить картинку', ok: false });
        } finally {
            setBusyId(null);
        }
    };

    const saveCaption = async (section: Section, image: SectionImage) => {
        setBusyId(section.id);
        try {
            const data = new FormData();
            data.append('src', image.src);
            data.append('sort_order', String(image.sort_order));
            data.append('caption_tk', image.caption_tk ?? '');
            data.append('caption_en', image.caption_en ?? '');
            data.append('caption_ru', image.caption_ru ?? '');
            await axios.put(
                `${API}/api/destinations/${destinationId}/sections/${section.id}/images/${image.id}`,
                data, authHeader());
            setMessage({ id: section.id, text: 'Подпись сохранена', ok: true });
        } catch {
            setMessage({ id: section.id, text: 'Не удалось сохранить подпись', ok: false });
        } finally {
            setBusyId(null);
        }
    };

    const removeImage = async (section: Section, image: SectionImage) => {
        if (!window.confirm('Удалить картинку?')) return;
        try {
            await axios.delete(
                `${API}/api/destinations/${destinationId}/sections/${section.id}/images/${image.id}`,
                authHeader());
            patch(section.id, { images: (section.images ?? []).filter((i) => i.id !== image.id) });
        } catch {
            setMessage({ id: section.id, text: 'Не удалось удалить картинку', ok: false });
        }
    };

    const patchImage = (section: Section, imageId: number, p: Partial<SectionImage>) =>
        patch(section.id, {
            images: (section.images ?? []).map((i) => (i.id === imageId ? { ...i, ...p } : i)),
        });

    return (
        <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold">Разделы страницы</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Выводятся друг под другом, и из них собирается боковое меню.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Язык:</span>
                    {DESTINATION_LANGS.map((l) => (
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

            <div className="space-y-4">
                {sections.map((section) => (
                    <details
                        key={section.id}
                        open={section.isNew}
                        className="border border-gray-200 rounded-md"
                    >
                        <summary className="cursor-pointer px-4 py-3 font-semibold flex justify-between items-center">
                            <span>
                                {section[`title_${lang}`] || section.section_key || 'Новый раздел'}
                            </span>
                            <span className="text-sm font-normal text-gray-500">
                                {section.images?.length ? `${section.images.length} карт.` : ''}
                            </span>
                        </summary>

                        <div className="p-4 border-t border-gray-200 space-y-4">
                            <div className="flex gap-4">
                                <div className="w-full">
                                    <label className="block text-sm font-semibold mb-1">Ключ раздела</label>
                                    <input
                                        type="text"
                                        value={section.section_key}
                                        onChange={(e) => patch(section.id, { section_key: e.target.value })}
                                        placeholder="overview"
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Латиницей. Используется как якорь ссылки в боковом меню.
                                    </p>
                                </div>
                                <div className="w-64 shrink-0">
                                    <label className="block text-sm font-semibold mb-1">Значок</label>
                                    <select
                                        value={section.icon || 'overview'}
                                        onChange={(e) => patch(section.id, { icon: e.target.value })}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    >
                                        {ICONS.map((i) => (
                                            <option key={i.value} value={i.value}>{i.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-32 shrink-0">
                                    <label className="block text-sm font-semibold mb-1">Порядок</label>
                                    <input
                                        type="number"
                                        value={section.sort_order}
                                        onChange={(e) =>
                                            patch(section.id, { sort_order: Number(e.target.value) || 0 })}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Заголовок</label>
                                <input
                                    type="text"
                                    value={section[`title_${lang}`] ?? ''}
                                    onChange={(e) => patch(section.id, { [`title_${lang}`]: e.target.value })}
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Текст</label>
                                <TipTapEditor
                                    content={section[`body_${lang}`] ?? ''}
                                    onChange={(content) => patch(section.id, { [`body_${lang}`]: content })}
                                />
                            </div>

                            {section.isNew ? (
                                <p className="text-sm text-gray-500">
                                    Картинки можно будет добавить после сохранения раздела.
                                </p>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Картинки</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        {(section.images ?? []).map((img) => (
                                            <div key={img.id} className="border border-gray-200 rounded p-3">
                                                <Image
                                                    src={imageUrl(img.src)}
                                                    alt=""
                                                    width={320}
                                                    height={180}
                                                    className="w-full h-36 object-cover rounded mb-2"
                                                    unoptimized
                                                />
                                                <input
                                                    type="text"
                                                    value={img[`caption_${lang}`] ?? ''}
                                                    onChange={(e) =>
                                                        patchImage(section, img.id, { [`caption_${lang}`]: e.target.value })}
                                                    placeholder="Подпись"
                                                    className="border border-gray-300 rounded p-2 w-full text-sm"
                                                />
                                                <div className="flex gap-3 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveCaption(section, img)}
                                                        className="text-sm text-blue-600"
                                                    >
                                                        Сохранить подпись
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(section, img)}
                                                        className="text-sm text-red-600"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) addImage(section, f);
                                            e.target.value = '';
                                        }}
                                        className="text-sm"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => save(section)}
                                    disabled={busyId === section.id}
                                    className="bg text-white px-4 py-2 rounded disabled:opacity-60"
                                >
                                    {busyId === section.id ? 'Сохраняем…' : 'Сохранить раздел'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(section)}
                                    className="text-red-600 flex items-center gap-1"
                                >
                                    <TrashIcon className="size-4"/> Удалить раздел
                                </button>
                                {message?.id === section.id && (
                                    <span className={`text-sm ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
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
                onClick={() => setSections((prev) => [...prev, newSection(prev.length)])}
                className="mt-4 border border-gray-400 px-4 py-2 rounded"
            >
                Добавить раздел
            </button>
        </div>
    );
};

export default DestinationSections;
