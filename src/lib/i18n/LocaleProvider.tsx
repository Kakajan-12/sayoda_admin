'use client'
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    AdminLocale,
    DictKey,
    LOCALE_STORAGE_KEY,
    dictionary,
} from "./dictionary";

/**
 * Язык интерфейса админки.
 *
 * Хранится в браузере, а не на сервере: это личная настройка редактора, и
 * два человека могут работать с одной учётной записью на разных языках.
 *
 * Начальное значение всегда `ru` — на сервере localStorage нет, и если
 * подставить туда сохранённый язык, разметка сервера и браузера разойдутся.
 * Настоящий язык подставляется после монтирования.
 */

interface LocaleContextValue {
    locale: AdminLocale;
    setLocale: (next: AdminLocale) => void;
    t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<AdminLocale>('ru');

    useEffect(() => {
        const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (saved === 'ru' || saved === 'en') setLocaleState(saved);
    }, []);

    const setLocale = useCallback((next: AdminLocale) => {
        setLocaleState(next);
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }, []);

    const t = useCallback(
        (key: DictKey, vars?: Record<string, string | number>) => {
            const entry = dictionary[key];
            // Ключ без перевода лучше показать как есть, чем уронить страницу:
            // пропущенную подпись видно сразу, а падение — это потерянная работа.
            let text = entry ? entry[locale] : String(key);
            if (vars) {
                for (const [name, value] of Object.entries(vars)) {
                    text = text.replace(`{${name}}`, String(value));
                }
            }
            return text;
        },
        [locale],
    );

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useAdminLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useAdminLocale вызван вне LocaleProvider');
    return ctx;
}

/** Короткая форма для мест, где нужен только перевод. */
export function useT() {
    return useAdminLocale().t;
}
