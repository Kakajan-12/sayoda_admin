'use client';

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { LuExternalLink } from "react-icons/lu";
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { readToken } from "@/lib/auth";
import { optionLabel } from "@/Components/form/optionLabel";

/**
 * Выбор пунктов «включено» / «не включено» галочками.
 *
 * Раньше пункты набирались текстом у каждого тура заново: 93 записи
 * «включено» оказались 29 разными текстами, один и тот же пункт лежал
 * по восемь раз. Поправить формулировку значило открыть восемь туров.
 *
 * Теперь справочник заводится один раз, а здесь нужные пункты просто
 * отмечаются — как выбираются тип и категория.
 *
 * Сохранение отправляет полный набор отмеченного, а не отдельные
 * изменения: снятая галочка должна убирать пункт, и «добавить» такое
 * не выражает.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

interface Item {
    id: number;
    sort_order: number;
    text_tk: string | null;
    text_en: string | null;
    text_ru: string | null;
}

export default function TourItemPicker({
    tourId,
    title,
    hint,
    endpoint,
    manageHref,
}: {
    tourId: number;
    title: string;
    hint?: string;
    /** Справочник: /api/include-items или /api/exclude-items. */
    endpoint: string;
    /** Куда идти, чтобы завести новый пункт. */
    manageHref: string;
}) {
    const { locale, t } = useAdminLocale();
    const [items, setItems] = useState<Item[] | null>(null);
    const [checked, setChecked] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const [all, mine] = await Promise.all([
                axios.get(`${API}${endpoint}`),
                axios.get(`${API}${endpoint}/tour/${tourId}`),
            ]);
            setItems(Array.isArray(all.data) ? all.data : []);
            setChecked(new Set(Array.isArray(mine.data) ? mine.data.map(Number) : []));
            setError(null);
        } catch {
            setError(t('common.error'));
            setItems([]);
        }
    }, [endpoint, tourId, t]);

    useEffect(() => { load(); }, [load]);

    const toggle = (id: number) => {
        setSaved(false);
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            await axios.put(
                `${API}${endpoint}/tour/${tourId}`,
                { items: [...checked] },
                { headers: { Authorization: `Bearer ${readToken()}` } },
            );
            setSaved(true);
        } catch {
            setError(t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rounded-lg border border-sand bg-white p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-ink">{title}</h2>
                    {hint && <p className="mt-0.5 text-sm text-inkMuted">{hint}</p>}
                </div>

                {/* Ссылка на справочник, а не форма прямо здесь: новый пункт
                    заводится один раз для всех туров, и делать это между делом
                    в конкретном туре — как раз способ снова наплодить копий. */}
                <Link
                    href={manageHref}
                    className="flex items-center gap-1.5 text-sm text-tile hover:underline"
                >
                    <LuExternalLink className="size-4" />
                    {t('tour.manageItems')}
                </Link>
            </div>

            {error && (
                <p className="mb-4 rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
            )}

            {items === null ? (
                <p className="py-6 text-center text-inkMuted">{t('common.loading')}</p>
            ) : items.length === 0 ? (
                <p className="py-6 text-center text-inkMuted">{t('tour.emptyDictionary')}</p>
            ) : (
                <>
                    {/* Две колонки: пунктов около тридцати, в один столбец
                        список уходил бы далеко за экран. */}
                    <ul className="grid gap-x-8 gap-y-1 lg:grid-cols-2">
                        {items.map((item) => {
                            const label = optionLabel(item, 'text', locale);
                            const on = checked.has(item.id);
                            return (
                                <li key={item.id}>
                                    <label className="flex cursor-pointer items-start gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-sandLight">
                                        <input
                                            type="checkbox"
                                            checked={on}
                                            onChange={() => toggle(item.id)}
                                            className="mt-0.5 size-4 shrink-0 accent-tile"
                                        />
                                        <span className={`text-sm ${on ? 'text-ink' : 'text-inkMuted'}`}>
                                            {label}
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-5 flex items-center gap-4 border-t border-sand pt-4">
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving}
                            className="rounded-md bg-tile px-5 py-2 font-medium text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                        >
                            {t(saving ? 'common.saving' : 'common.save')}
                        </button>
                        <span className="text-sm text-inkMuted">
                            {t('tour.chosenCount', { n: checked.size })}
                        </span>
                        {saved && !saving && (
                            <span className="text-sm text-tileMid">{t('common.saved')}</span>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
