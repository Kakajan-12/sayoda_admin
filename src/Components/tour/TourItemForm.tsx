'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Field, FormSection, LANGS, inputClass } from "@/Components/form/Field";
import { plainText } from "@/Components/ResourceList";
import { useT } from "@/lib/i18n/LocaleProvider";
import { readToken } from "@/lib/auth";

/**
 * Запись справочника «включено» / «не включено» — одна форма на оба.
 *
 * Поле обычное, без редактора форматирования: пункт выводится строкой
 * в списке на странице тура, и разметка в нём была следом от прежней
 * формы, а не осознанным выбором.
 *
 * Три языка стоят рядом, а не вкладками: строка короткая, и так сразу
 * видно, какой перевод забыли.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TourItemForm({
    endpoint,
    listHref,
    id,
}: {
    endpoint: string;
    listHref: string;
    id?: string;
}) {
    const t = useT();
    const router = useRouter();
    const isEdit = Boolean(id);

    const [data, setData] = useState({
        sort_order: '0',
        text_tk: '',
        text_en: '',
        text_ru: '',
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        axios
            .get(`${API}${endpoint}/${id}`)
            .then((res) => {
                const row = res.data;
                setData({
                    sort_order: String(row.sort_order ?? 0),
                    // Перенесённые записи уже без разметки, но чистим и здесь:
                    // строка могла попасть в базу из старой формы с редактором.
                    text_tk: plainText(row.text_tk ?? ''),
                    text_en: plainText(row.text_en ?? ''),
                    text_ru: plainText(row.text_ru ?? ''),
                });
            })
            .catch(() => setError(t('common.error')))
            .finally(() => setLoading(false));
    }, [id, endpoint, t]);

    const set = (key: string, value: string) =>
        setData((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const headers = { Authorization: `Bearer ${readToken()}` };
            if (isEdit) await axios.put(`${API}${endpoint}/${id}`, data, { headers });
            else await axios.post(`${API}${endpoint}`, data, { headers });
            router.push(listHref);
        } catch {
            setError(t('common.error'));
            setSaving(false);
        }
    };

    if (loading) return <p className="mt-8 text-inkMuted">{t('common.loading')}</p>;

    return (
        <div className="mt-8">
            <h1 className="mb-4 text-2xl font-bold text-ink">
                {t(isEdit ? 'form.editTitle' : 'form.addTitle')}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-lg border border-sand bg-white p-6"
            >
                {error && (
                    <p className="rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
                )}

                <FormSection title={t('form.sectionTexts')}>
                    {LANGS.map((code) => (
                        <Field
                            key={code}
                            label={`${t('form.text')} — ${t(`lang.${code}` as Parameters<typeof t>[0])}`}
                        >
                            <input
                                type="text"
                                maxLength={500}
                                value={data[`text_${code}` as keyof typeof data]}
                                onChange={(e) => set(`text_${code}`, e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                    ))}

                    <Field label={t('form.sortOrder')} hint={t('form.sortOrderHint')}>
                        <input
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => set('sort_order', e.target.value)}
                            className={`${inputClass} max-w-32`}
                        />
                    </Field>
                </FormSection>

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-tile px-5 py-2.5 font-semibold text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                >
                    {t(isEdit ? 'common.save' : 'common.add')}
                </button>
            </form>
        </div>
    );
}
