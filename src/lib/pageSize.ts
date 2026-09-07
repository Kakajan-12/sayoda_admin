'use client';

import { useEffect, useState } from 'react';

/**
 * Сколько строк показывать в списках админки.
 *
 * Выбор общий для всех разделов и запоминается в браузере: настраивать
 * отдельно каждый список — лишняя работа, редактор решает это один раз.
 *
 * Записи при этом грузятся все. Поиск в списках ищет по всему разделу, и
 * если отдавать с сервера только текущую страницу, он начнёт искать лишь
 * по видимым строкам: наберёшь название тура и не найдёшь его, потому что
 * он лежит на третьей странице. Это заметно хуже, чем чуть более тяжёлый
 * запрос раз в день.
 *
 * Если в каком-то разделе станет несколько тысяч записей, отбор придётся
 * переносить на сервер вместе с поиском — но до этого далеко.
 */

export const PAGE_SIZES = [50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

const STORAGE_KEY = 'admin_page_size';
const DEFAULT_SIZE: PageSize = 50;

/** Событие, чтобы открытые вкладки и соседние списки не разъезжались. */
const CHANGE_EVENT = 'admin-page-size-change';

function read(): PageSize {
    try {
        const value = Number(window.localStorage.getItem(STORAGE_KEY));
        return (PAGE_SIZES as readonly number[]).includes(value)
            ? (value as PageSize)
            : DEFAULT_SIZE;
    } catch {
        return DEFAULT_SIZE;
    }
}

export function usePageSize(): [PageSize, (size: PageSize) => void] {
    // Начинаем со значения по умолчанию, а сохранённое читаем после
    // отрисовки: localStorage на сервере нет, и обращение к нему в
    // инициализаторе состояния уронило бы страницу.
    const [size, setSize] = useState<PageSize>(DEFAULT_SIZE);

    useEffect(() => {
        setSize(read());
        const onChange = () => setSize(read());
        window.addEventListener(CHANGE_EVENT, onChange);
        return () => window.removeEventListener(CHANGE_EVENT, onChange);
    }, []);

    const change = (next: PageSize) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
            /* приватный режим — выбор просто не запомнится */
        }
        setSize(next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    };

    return [size, change];
}
