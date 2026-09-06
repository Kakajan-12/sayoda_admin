'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LuChevronDown, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import type { DictKey } from "@/lib/i18n/dictionary";
import { readToken } from "@/lib/auth";
import { plainText, type Row } from "@/Components/ResourceList";

/**
 * Список, сгруппированный по туру или статье: что включено в тур, программа
 * по дням, галереи.
 *
 * Группы раскрывались по одной — открыв вторую, первая закрывалась, хотя
 * сравнивать содержимое двух туров нужно постоянно. Внутри группы каждый
 * пункт показывал свой текст сразу на трёх языках столбиком, а
 * единственным действием была кнопка «View», которая вела на страницу
 * просмотра — и уже оттуда на правку.
 *
 * Теперь раскрывается сколько угодно групп, текст показан на языке
 * интерфейса, а правка и удаление доступны прямо в пункте.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

interface Props {
    titleKey: DictKey;
    endpoint: string;
    /** Поле, по которому пункты собираются в группы. */
    groupField: string;
    /** Основа локализованного поля с текстом пункта: `text` → `text_ru`. */
    itemField?: string;
    /** Основа локализованного заголовка пункта, если он есть. */
    itemTitleField?: string;
    /** Поле с путём к картинке, если пункт — изображение. */
    itemImageField?: string;
    addHref?: string;
    editHref?: (row: Row) => string;
    deleteEndpoint?: (row: Row) => string;
}

const GroupedList: React.FC<Props> = ({
    titleKey, endpoint, groupField, itemField, itemTitleField, itemImageField,
    addHref, editHref, deleteEndpoint,
}) => {
    const { locale, t } = useAdminLocale();
    const router = useRouter();
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState<Set<string>>(new Set());
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

    const groups = useMemo(() => {
        if (!rows) return null;
        const map = new Map<string, Row[]>();
        for (const row of rows) {
            const key = plainText(row[groupField]) || '—';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(row);
        }
        return [...map.entries()];
    }, [rows, groupField]);

    const localized = (row: Row, field?: string) =>
        field
            ? plainText(row[`${field}_${locale}`]) ||
              plainText(row[`${field}_en`]) ||
              plainText(row[`${field}_tk`])
            : '';

    const toggle = (key: string) =>
        setOpen((prev) => {
            const next = new Set(prev);
            // Несколько групп можно держать открытыми одновременно: раньше
            // открытие второй закрывало первую.
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const remove = async (row: Row) => {
        if (!deleteEndpoint) return;
        const name = localized(row, itemTitleField || itemField) || String(row.id);
        if (!window.confirm(t('common.confirmDelete', { name }))) return;
        setBusyId(row.id);
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

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-ink">{t(titleKey)}</h2>
                    {groups && (
                        <p className="mt-0.5 text-sm text-inkMuted">
                            {t('list.count', { n: rows?.length ?? 0 })}
                        </p>
                    )}
                </div>
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

            {error && (
                <p className="mb-4 rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
            )}

            {groups === null ? (
                <p className="rounded-lg border border-sand bg-white px-4 py-10 text-center text-inkMuted">
                    {t('common.loading')}
                </p>
            ) : groups.length === 0 ? (
                <p className="rounded-lg border border-sand bg-white px-4 py-10 text-center text-inkMuted">
                    {t('common.empty')}
                </p>
            ) : (
                <div className="space-y-3">
                    {groups.map(([groupName, items]) => {
                        const isOpen = open.has(groupName);
                        return (
                            <div key={groupName} className="overflow-hidden rounded-lg border border-sand bg-white">
                                <button
                                    type="button"
                                    onClick={() => toggle(groupName)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-sandLight"
                                >
                                    <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                                        {groupName}
                                    </span>
                                    <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-xs text-inkMuted">
                                        {items.length}
                                    </span>
                                    <LuChevronDown
                                        className={`size-5 shrink-0 text-inkMuted transition-transform duration-300 ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <ul className="divide-y divide-sand border-t border-sand">
                                        {items.map((row) => (
                                            <li
                                                key={String(row.id)}
                                                className="flex items-center gap-4 px-5 py-3 hover:bg-sandLight/60"
                                            >
                                                {itemImageField && (
                                                    row[itemImageField] ? (
                                                        <Image
                                                            src={`${API}/${String(row[itemImageField]).replace(/\\/g, '/').replace(/^\/+/, '')}`}
                                                            alt=""
                                                            width={64}
                                                            height={44}
                                                            unoptimized
                                                            className="h-11 w-16 shrink-0 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <span className="w-16 shrink-0 text-inkMuted">—</span>
                                                    )
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    {itemTitleField && (
                                                        <p className="truncate font-medium text-ink">
                                                            {localized(row, itemTitleField) || '—'}
                                                        </p>
                                                    )}
                                                    {itemField && (
                                                        <p className="line-clamp-2 text-sm text-inkMuted">
                                                            {localized(row, itemField) || '—'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1">
                                                    {editHref && (
                                                        <Link
                                                            href={editHref(row)}
                                                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-tile transition-colors hover:bg-tileTint"
                                                        >
                                                            <LuPencil className="size-4" />
                                                            <span className="hidden lg:inline">{t('common.edit')}</span>
                                                        </Link>
                                                    )}
                                                    {deleteEndpoint && (
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(row)}
                                                            disabled={busyId === row.id}
                                                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-brick transition-colors hover:bg-brick/10 disabled:opacity-50"
                                                        >
                                                            <LuTrash2 className="size-4" />
                                                            <span className="hidden lg:inline">{t('common.delete')}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GroupedList;
