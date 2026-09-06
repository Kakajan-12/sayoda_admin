'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/16/solid";

/**
 * Частые вопросы.
 *
 * Раньше лежали в файлах локализации сайта — поправить формулировку мог
 * только разработчик через передеплой. FAQ пополняется по мере вопросов
 * от туристов, поэтому правит его заказчик.
 *
 * Всё на одной странице, без отдельных форм добавления и редактирования:
 * вопрос с ответом — это несколько строк текста, ради них уходить на другую
 * страницу и возвращаться незачем. Каждый сохраняется своей кнопкой — одна
 * общая отправка означала бы, что опечатка в одном откатывает правки во всех.
 */

interface FaqItem {
    id: number;
    sort_order: number;
    question_tk: string | null; question_en: string | null; question_ru: string | null;
    answer_tk: string | null; answer_en: string | null; answer_ru: string | null;
    /** Ещё не сохранён — id в базе нет. */
    isNew?: boolean;
}

type Lang = 'tk' | 'en' | 'ru';

const LANGS: { code: Lang; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'tk', label: 'Türkmençe' },
];

const API = process.env.NEXT_PUBLIC_API_URL;

const emptyItem = (order: number): FaqItem => ({
    id: -Date.now(), // временный ключ для React до первого сохранения
    sort_order: order,
    question_tk: '', question_en: '', question_ru: '',
    answer_tk: '', answer_en: '', answer_ru: '',
    isNew: true,
});

const Faq = () => {
    const t = useT();
    const [items, setItems] = useState<FaqItem[]>([]);
    const [lang, setLang] = useState<Lang>('ru');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ id: number; text: string; ok: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const token = () => localStorage.getItem('auth_token');
    const authHeader = () => ({ headers: { Authorization: `Bearer ${token()}` } });

    const load = useCallback(async () => {
        try {
            if (!token()) { router.push('/'); return; }
            const res = await axios.get(`${API}/api/faq`, authHeader());
            setItems(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) { router.push('/'); return; }
            setError(t('faq.err.load'));
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const patch = (id: number, p: Partial<FaqItem>) =>
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

    const save = async (item: FaqItem) => {
        if (!item.question_ru && !item.question_en && !item.question_tk) {
            setMessage({ id: item.id, text: t('faq.needQuestion'), ok: false });
            return;
        }
        setBusyId(item.id); setMessage(null);
        try {
            const payload = {
                sort_order: item.sort_order,
                question_tk: item.question_tk ?? '', question_en: item.question_en ?? '', question_ru: item.question_ru ?? '',
                answer_tk: item.answer_tk ?? '', answer_en: item.answer_en ?? '', answer_ru: item.answer_ru ?? '',
            };
            if (item.isNew) {
                const res = await axios.post(`${API}/api/faq`, payload, authHeader());
                // Подменяем временный id на настоящий, иначе повторное
                // сохранение создало бы второй такой же вопрос.
                patch(item.id, { id: res.data.id, isNew: false });
                setMessage({ id: res.data.id, text: t('faq.added'), ok: true });
            } else {
                await axios.put(`${API}/api/faq/${item.id}`, payload, authHeader());
                setMessage({ id: item.id, text: t('common.saved'), ok: true });
            }
        } catch {
            setMessage({ id: item.id, text: t('faq.err.save'), ok: false });
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (item: FaqItem) => {
        const name = item.question_ru || item.question_en || t('faq.question');
        if (!item.isNew && !window.confirm(t('common.confirmDelete', { name }))) return;
        if (!item.isNew) {
            try {
                await axios.delete(`${API}/api/faq/${item.id}`, authHeader());
            } catch {
                setMessage({ id: item.id, text: t('faq.err.delete'), ok: false });
                return;
            }
        }
        setItems((prev) => prev.filter((it) => it.id !== item.id));
    };

    if (loading) return <p className="p-10">{t('common.loading')}</p>;

    return (
        <>
        <div className="mt-8 max-w-5xl">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-ink">{t('nav.faq')}</h2>
                    <p className="mt-1 text-sm text-inkMuted">{t('faq.intro')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-inkMuted">{t('faq.langLabel')}</span>
                    {LANGS.map((l) => (
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

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="space-y-4">
                {items.length === 0 && (
                    <p className="bg-white rounded-md p-6 text-gray-600">
                        {t('faq.empty')}
                    </p>
                )}

                {items.map((item) => (
                    <details
                        key={item.id}
                        open={item.isNew}
                        className="bg-white border border-gray-200 rounded-md"
                    >
                        <summary className="cursor-pointer px-4 py-3 font-semibold flex justify-between items-center gap-4">
                            <span>
                                {item[`question_${lang}`] || t('faq.newItem')}
                            </span>
                            <span className="text-sm font-normal text-gray-500 shrink-0">
                                № {item.sort_order}
                            </span>
                        </summary>

                        <div className="p-4 border-t border-gray-200 space-y-4">
                            <div className="w-40">
                                <label className="block text-sm font-semibold mb-1">{t('common.order')}</label>
                                <input
                                    type="number"
                                    value={item.sort_order}
                                    onChange={(e) =>
                                        patch(item.id, { sort_order: Number(e.target.value) || 0 })}
                                    className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('faq.orderHint')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('faq.question')}</label>
                                <input
                                    type="text"
                                    value={item[`question_${lang}`] ?? ''}
                                    onChange={(e) =>
                                        patch(item.id, { [`question_${lang}`]: e.target.value })}
                                    className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('faq.answer')}</label>
                                <textarea
                                    rows={4}
                                    value={item[`answer_${lang}`] ?? ''}
                                    onChange={(e) =>
                                        patch(item.id, { [`answer_${lang}`]: e.target.value })}
                                    className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight resize-y"
                                />
                            </div>

                            <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => save(item)}
                                    disabled={busyId === item.id}
                                    className="bg text-white px-4 py-2 rounded disabled:opacity-60"
                                >
                                    {busyId === item.id ? t('common.saving') : t('common.save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(item)}
                                    className="text-red-600 flex items-center gap-1"
                                >
                                    <TrashIcon className="size-4"/> Удалить
                                </button>
                                {message?.id === item.id && (
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
                onClick={() =>
                    setItems((prev) => [...prev, emptyItem(prev.length)])}
                className="mt-4 border border-gray-400 px-4 py-2 rounded"
            >
                {t('faq.addItem')}
            </button>
        </div>
        </>
    );
};

export default Faq;
