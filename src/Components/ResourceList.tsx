'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import type { DictKey } from "@/lib/i18n/dictionary";
import { readToken } from "@/lib/auth";

/**
 * Список записей раздела.
 *
 * Все 24 списка были устроены одинаково и одинаково неудобно: три колонки
 * с одним и тем же названием на трёх языках, единственное действие «View»,
 * которое вело на отдельную страницу просмотра, и уже оттуда — на правку.
 * Два лишних перехода ради изменения одной строки.
 *
 * Здесь одна колонка с названием на языке интерфейса, отдельный столбец
 * с отметками, какие переводы заполнены (пробел в переводах виден сразу,
 * а не при открытии карточки), поиск и правка с удалением прямо из строки.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const CONTENT_LANGS = ['tk', 'en', 'ru'] as const;

/** Поля приходят из редактора как HTML, а в таблице нужен голый текст. */
export const plainText = (html: unknown) =>
    String(html ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&[a-z]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export interface Row {
    id: number | string;
    [key: string]: unknown;
}

export interface Column {
    /** Заголовок столбца. */
    headerKey: DictKey;
    /**
     * Имя поля. Для `localized` — основа без языка: `title` даст
     * `title_ru` / `title_en` / `title_tk`.
     */
    field: string;
    /** Показывать значение на языке интерфейса и отметки о переводах. */
    localized?: boolean;
    /** Картинка: значение — путь к файлу на бэкенде. */
    image?: boolean;
    /** Своя отрисовка, когда стандартной не хватает. */
    render?: (row: Row) => React.ReactNode;
    className?: string;
}

interface Props {
    /** Заголовок раздела — ключ из словаря. */
    titleKey: DictKey;
    /** Эндпоинт списка, например `/api/tour-types`. */
    endpoint: string;
    addHref?: string;
    editHref?: (row: Row) => string;
    /** Пусто — удаление из списка недоступно. */
    deleteEndpoint?: (row: Row) => string;
    /** Чем подписывать запись в вопросе об удалении. */
    rowLabel?: (row: Row) => string;
    columns: Column[];
    /** Поля, по которым ищет строка поиска. Пусто — поиска нет. */
    searchFields?: string[];
    /**
     * Имя поля с идентификатором. У адресов это `address_id`, а не `id`,
     * и без этого все строки получали одинаковый ключ.
     */
    idField?: string;
}

const ResourceList: React.FC<Props> = ({
    titleKey, endpoint, addHref, editHref, deleteEndpoint, rowLabel, columns, searchFields,
    idField = 'id',
}) => {
    const { locale, t } = useAdminLocale();
    const router = useRouter();
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [busyId, setBusyId] = useState<Row['id'] | null>(null);

    const load = useCallback(async () => {
        try {
            const token = readToken();
            if (!token) { router.push('/'); return; }
            const res = await axios.get(`${API}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRows(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                router.push('/');
                return;
            }
            setError(t('common.error'));
            setRows([]);
        }
    }, [endpoint, router, t]);

    useEffect(() => { load(); }, [load]);

    /** Значение поля на языке интерфейса с откатом на английский и туркменский. */
    const localized = (row: Row, field: string) =>
        plainText(row[`${field}_${locale}`]) ||
        plainText(row[`${field}_en`]) ||
        plainText(row[`${field}_tk`]);

    const filtered = useMemo(() => {
        if (!rows) return null;
        const q = query.trim().toLowerCase();
        if (!q || !searchFields?.length) return rows;
        return rows.filter((row) =>
            searchFields.some((f) => {
                // Ищем по всем языкам сразу: человек может помнить название
                // на любом из них.
                const values = [row[f], ...CONTENT_LANGS.map((l) => row[`${f}_${l}`])];
                return values.some((v) => plainText(v).toLowerCase().includes(q));
            }),
        );
    }, [rows, query, searchFields]);

    const remove = async (row: Row) => {
        if (!deleteEndpoint) return;
        const name = rowLabel ? rowLabel(row) : String(row[idField]);
        if (!window.confirm(t('common.confirmDelete', { name }))) return;
        setBusyId(row[idField] as Row['id']);
        try {
            const token = readToken();
            await axios.delete(`${API}${deleteEndpoint(row)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await load();
        } catch {
            setError(t('list.deleteFailed'));
        } finally {
            setBusyId(null);
        }
    };

    const imageUrl = (value: unknown) =>
        `${API}/${String(value ?? '').replace(/\\/g, '/').replace(/^\/+/, '')}`;

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-ink">{t(titleKey)}</h2>
                    {filtered && (
                        <p className="mt-0.5 text-sm text-inkMuted">
                            {t('list.count', { n: filtered.length })}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {!!searchFields?.length && (
                        <div className="relative">
                            <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inkMuted" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('list.searchPlaceholder')}
                                className="w-56 rounded-md border border-sand bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-tileLight"
                            />
                        </div>
                    )}
                    {addHref && (
                        <Link
                            href={addHref}
                            className="flex items-center gap-2 rounded-md bg-tile px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tileDark"
                        >
                            <LuPlus className="size-4" />
                            {t('common.add')}
                        </Link>
                    )}
                </div>
            </div>

            {error && (
                <p className="mb-4 rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
            )}

            <div className="overflow-x-auto rounded-lg border border-sand bg-white">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-sand bg-sandLight/60">
                            {columns.map((c) => (
                                <th
                                    key={c.field + String(c.headerKey)}
                                    className={`px-4 py-3 text-left font-semibold text-inkMuted ${c.className ?? ''}`}
                                >
                                    {t(c.headerKey)}
                                </th>
                            ))}
                            {columns.some((c) => c.localized) && (
                                <th className="px-4 py-3 text-left font-semibold text-inkMuted">
                                    {t('list.translations')}
                                </th>
                            )}
                            {(editHref || deleteEndpoint) && (
                                <th className="px-4 py-3 text-right font-semibold text-inkMuted">
                                    {t('common.actions')}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered === null ? (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-inkMuted">
                                    {t('common.loading')}
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-inkMuted">
                                    {query ? t('list.nothingFound') : t('common.empty')}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row) => (
                                <tr key={String(row[idField])} className="border-b border-sand last:border-0 hover:bg-sandLight/50">
                                    {columns.map((c) => (
                                        <td key={c.field} className={`px-4 py-3 align-middle ${c.className ?? ''}`}>
                                            {c.render ? (
                                                c.render(row)
                                            ) : c.image ? (
                                                row[c.field] ? (
                                                    <Image
                                                        src={imageUrl(row[c.field])}
                                                        alt=""
                                                        width={64}
                                                        height={44}
                                                        unoptimized
                                                        className="h-11 w-16 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-inkMuted">—</span>
                                                )
                                            ) : c.localized ? (
                                                <span className="line-clamp-2 text-ink">
                                                    {localized(row, c.field) || '—'}
                                                </span>
                                            ) : (
                                                <span className="text-ink">{plainText(row[c.field]) || '—'}</span>
                                            )}
                                        </td>
                                    ))}

                                    {columns.some((c) => c.localized) && (
                                        <td className="px-4 py-3">
                                            {/* Отметки показывают, где перевода нет: раньше это
                                                выяснялось только открытием карточки. */}
                                            <span className="flex gap-1">
                                                {CONTENT_LANGS.map((code) => {
                                                    const field = columns.find((c) => c.localized)!.field;
                                                    const filled = !!plainText(row[`${field}_${code}`]);
                                                    return (
                                                        <span
                                                            key={code}
                                                            title={t(`lang.${code}` as DictKey)}
                                                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                                                filled
                                                                    ? 'bg-tileTint text-tile'
                                                                    : 'bg-sand text-inkMuted line-through'
                                                            }`}
                                                        >
                                                            {code}
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        </td>
                                    )}

                                    {(editHref || deleteEndpoint) && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {editHref && (
                                                    <Link
                                                        href={editHref(row)}
                                                        title={t('common.edit')}
                                                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-tile transition-colors hover:bg-tileTint"
                                                    >
                                                        <LuPencil className="size-4" />
                                                        <span className="hidden lg:inline">{t('common.edit')}</span>
                                                    </Link>
                                                )}
                                                {deleteEndpoint && (
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(row)}
                                                        disabled={busyId === row[idField]}
                                                        title={t('common.delete')}
                                                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-brick transition-colors hover:bg-brick/10 disabled:opacity-50"
                                                    >
                                                        <LuTrash2 className="size-4" />
                                                        <span className="hidden lg:inline">
                                                            {busyId === row[idField] ? t('list.deleting') : t('common.delete')}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResourceList;
