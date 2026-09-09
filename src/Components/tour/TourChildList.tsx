'use client';

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LuChevronDown, LuChevronUp, LuPencil, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import TipTapEditor from "@/Components/TipTapEditor";
import { useT } from "@/lib/i18n/LocaleProvider";
import { readToken } from "@/lib/auth";
import { plainText, type Row } from "@/Components/ResourceList";

/**
 * Список, привязанный к туру, с правкой прямо на странице тура.
 *
 * Программа по дням, состав цены, «главное», заезды — каждый из этих
 * списков был отдельным разделом меню. Чтобы собрать один тур, редактор
 * обходил семь страниц и в каждой заново выбирал тур из выпадающего
 * списка; чтобы поправить один день — уходил со страницы тура и искал его
 * там снова. Теперь всё редактируется, не покидая тура.
 *
 * Компонент один на все эти списки: они отличаются только набором полей.
 * Держать пять почти одинаковых панелей по полтораста строк — верный
 * способ починить что-то в одной и забыть про остальные.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

export type FieldKind = 'text' | 'rich' | 'number' | 'date' | 'select';

export interface FieldSpec {
    /** Имя поля. Для localized — основа: text → text_tk / text_en / text_ru. */
    name: string;
    label: string;
    kind: FieldKind;
    /** Поле переводится на три языка. */
    localized?: boolean;
    options?: { value: string; label: string }[];
    hint?: string;
    maxLength?: number;
}

interface Props {
    tourId: number;
    title: string;
    /** Базовый адрес: '/api/itinerary'. По нему идут POST, PUT и DELETE. */
    endpoint: string;
    /** Как запросить записи одного тура — адреса у разделов исторически разные. */
    listUrl: (tourId: number) => string;
    fields: FieldSpec[];
    /** Строка списка: что показать про запись, не открывая правку. */
    rowLabel: (row: Row, locale: string) => string;
    /** Список упорядочен через sort_order — показываем стрелки перестановки. */
    ordered?: boolean;
    /** Подсказка под заголовком: чем этот список является на сайте. */
    hint?: string;
}

const LANGS = ['tk', 'en', 'ru'] as const;

export default function TourChildList({
    tourId, title, endpoint, listUrl, fields, rowLabel, ordered, hint,
}: Props) {
    const t = useT();
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Row | null>(null);
    const [busy, setBusy] = useState(false);

    const auth = () => ({ Authorization: `Bearer ${readToken()}` });

    const load = useCallback(async () => {
        try {
            const res = await axios.get(`${API}${listUrl(tourId)}`, { headers: auth() });
            setRows(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch {
            setError(t('common.error'));
            setRows([]);
        }
    }, [tourId, listUrl, t]);

    useEffect(() => { load(); }, [load]);

    /** Пустая запись: все поля пустые, тур проставлен, порядок в конец списка. */
    const blank = (): Row => {
        const item: Row = { id: 0, tour_id: tourId };
        for (const field of fields) {
            if (field.localized) LANGS.forEach((l) => { item[`${field.name}_${l}`] = ''; });
            else item[field.name] = field.kind === 'select' ? (field.options?.[0]?.value ?? '') : '';
        }
        if (ordered) item.sort_order = rows?.length ?? 0;
        return item;
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editing) return;
        setBusy(true);
        setError(null);
        try {
            const body = { ...editing, tour_id: tourId };
            if (editing.id) {
                await axios.put(`${API}${endpoint}/${editing.id}`, body, { headers: auth() });
            } else {
                await axios.post(`${API}${endpoint}`, body, { headers: auth() });
            }
            setEditing(null);
            await load();
        } catch (err) {
            // 409 приходит от заездов на занятую дату — причина конкретная,
            // и общее «не удалось сохранить» тут бесполезно.
            const duplicate = axios.isAxiosError(err) && err.response?.status === 409;
            setError(t(duplicate ? 'dep.duplicate' : 'common.error'));
        } finally {
            setBusy(false);
        }
    };

    const remove = async (row: Row) => {
        if (!window.confirm(t('common.confirmDelete', { name: rowLabel(row, 'ru') || String(row.id) }))) return;
        setBusy(true);
        try {
            await axios.delete(`${API}${endpoint}/${row.id}`, { headers: auth() });
            await load();
        } catch {
            setError(t('list.deleteFailed'));
        } finally {
            setBusy(false);
        }
    };

    /**
     * Перестановка соседей.
     *
     * Меняем местами sort_order двух записей и сохраняем обе целиком:
     * эндпоинты этих разделов перезаписывают запись всеми полями сразу,
     * частичного обновления у них нет. Значения берём из уже загруженного
     * списка, поэтому лишнего запроса на чтение не нужно.
     */
    const move = async (index: number, delta: number) => {
        if (!rows) return;
        const target = index + delta;
        if (target < 0 || target >= rows.length) return;

        const a = rows[index];
        const b = rows[target];
        setBusy(true);
        try {
            await Promise.all([
                axios.put(`${API}${endpoint}/${a.id}`, { ...a, sort_order: b.sort_order }, { headers: auth() }),
                axios.put(`${API}${endpoint}/${b.id}`, { ...b, sort_order: a.sort_order }, { headers: auth() }),
            ]);
            await load();
        } catch {
            setError(t('common.error'));
        } finally {
            setBusy(false);
        }
    };

    const set = (name: string, value: string) =>
        setEditing((prev) => (prev ? { ...prev, [name]: value } : prev));

    const inputClass =
        'w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight';

    const renderField = (field: FieldSpec, name: string, label: string) => {
        const value = String(editing?.[name] ?? '');

        if (field.kind === 'rich') {
            return (
                <div key={name}>
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{label}</label>
                    <TipTapEditor content={value} onChange={(html) => set(name, html)} />
                </div>
            );
        }

        if (field.kind === 'select') {
            return (
                <div key={name}>
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{label}</label>
                    <select value={value} onChange={(e) => set(name, e.target.value)} className={inputClass}>
                        {field.options?.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div key={name}>
                <label className="mb-1 block text-sm font-medium text-inkMuted">{label}</label>
                <input
                    type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
                    value={value}
                    maxLength={field.maxLength}
                    onChange={(e) => set(name, e.target.value)}
                    /* Пустое поле даты браузер всё равно заполняет своим
                       «mm/dd/yyyy», и из CSS не отличить его от введённой
                       даты. Отметку читает правило в globals.css, которое
                       приглушает подсказку до цвета остальных placeholder. */
                    data-empty={field.kind === 'date' ? !value : undefined}
                    className={inputClass}
                />
                {field.hint && <p className="mt-1 text-xs text-inkMuted">{field.hint}</p>}
            </div>
        );
    };

    return (
        <section className="rounded-lg border border-sand bg-white p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-ink">{title}</h2>
                    {hint && <p className="mt-0.5 text-sm text-inkMuted">{hint}</p>}
                </div>
                {!editing && (
                    <button
                        type="button"
                        onClick={() => setEditing(blank())}
                        className="flex items-center gap-2 rounded-md bg-tile px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tileDark"
                    >
                        <LuPlus className="size-4" />
                        {t('common.add')}
                    </button>
                )}
            </div>

            {error && (
                <p className="mb-4 rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
            )}

            {editing && (
                <form onSubmit={save} className="mb-6 space-y-4 rounded-md border border-tileTint bg-sandLight p-4">
                    {fields.map((field) =>
                        field.localized
                            ? LANGS.map((lang) =>
                                  renderField(
                                      field,
                                      `${field.name}_${lang}`,
                                      `${field.label} — ${t(`lang.${lang}` as Parameters<typeof t>[0])}`,
                                  ),
                              )
                            : renderField(field, field.name, field.label),
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={busy}
                            className="rounded-md bg-tile px-5 py-2 font-medium text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                        >
                            {t(editing.id ? 'common.save' : 'common.add')}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setEditing(null); setError(null); }}
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-inkMuted transition-colors hover:bg-sand"
                        >
                            <LuX className="size-4" />
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            )}

            {rows === null ? (
                <p className="py-6 text-center text-inkMuted">{t('common.loading')}</p>
            ) : rows.length === 0 ? (
                <p className="py-6 text-center text-inkMuted">{t('common.empty')}</p>
            ) : (
                <ul className="divide-y divide-sand rounded-md border border-sand">
                    {rows.map((row, index) => (
                        <li key={String(row.id)} className="flex items-center gap-3 px-4 py-3">
                            {ordered && (
                                <div className="flex shrink-0 flex-col">
                                    <button
                                        type="button"
                                        onClick={() => move(index, -1)}
                                        disabled={busy || index === 0}
                                        aria-label={t('list.moveUp')}
                                        className="text-inkMuted transition-colors hover:text-tile disabled:opacity-30"
                                    >
                                        <LuChevronUp className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, 1)}
                                        disabled={busy || index === rows.length - 1}
                                        aria-label={t('list.moveDown')}
                                        className="text-inkMuted transition-colors hover:text-tile disabled:opacity-30"
                                    >
                                        <LuChevronDown className="size-4" />
                                    </button>
                                </div>
                            )}

                            {ordered && (
                                <span className="w-6 shrink-0 text-center text-sm font-semibold text-inkMuted">
                                    {index + 1}
                                </span>
                            )}

                            <span className="min-w-0 flex-1 truncate text-ink">
                                {plainText(rowLabel(row, 'ru')) || '—'}
                            </span>

                            <button
                                type="button"
                                onClick={() => setEditing(row)}
                                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-tile transition-colors hover:bg-tileTint"
                            >
                                <LuPencil className="size-4" />
                                <span className="hidden lg:inline">{t('common.edit')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => remove(row)}
                                disabled={busy}
                                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-brick transition-colors hover:bg-brick/10 disabled:opacity-50"
                            >
                                <LuTrash2 className="size-4" />
                                <span className="hidden lg:inline">{t('common.delete')}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
