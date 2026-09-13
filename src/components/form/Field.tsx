'use client';

import React from "react";
import { useT } from "@/lib/i18n/LocaleProvider";

/**
 * Примитивы формы админки.
 *
 * Оболочку админки — меню, шапку, списки — я привёл к палитре и сетке, а
 * формы правки остались в исходном виде: подписи вперемешку по-русски и
 * по-английски, поля вплотную друг к другу в одну строку, классы отступов
 * заданы в каждом файле заново. Дальше в эти формы только дописывались
 * поля, и расхождение росло.
 *
 * Здесь собраны общие части, чтобы правка вида не требовала обходить
 * сорок страниц: у формы одна колонка подписей, один класс поля и одна
 * раскладка на всех.
 */

/** Единый вид поля ввода: одинаковая рамка, отступы и фокус во всей админке. */
export const inputClass =
    'w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight';

/** Подпись, само поле и пояснение под ним. */
export function Field({
    label,
    hint,
    htmlFor,
    children,
    className,
}: {
    label: string;
    hint?: string;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-inkMuted">
                {label}
            </label>
            {children}
            {hint && <p className="mt-1 text-xs text-inkMuted">{hint}</p>}
        </div>
    );
}

/**
 * Ряд полей.
 *
 * На странице тура пять полей — картинка, тип, категория, цена и признак
 * «популярный» — стояли в одной строке через flex, и каждое было объявлено
 * во всю ширину. На обычном экране они сжимались в нечитаемые полоски.
 * Сетка вместо flex: на узком экране поля становятся друг под друга сами.
 */
export function FieldRow({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
    const grid = cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
    return <div className={`grid gap-4 sm:grid-cols-2 ${grid}`}>{children}</div>;
}

/**
 * Флажок «да/нет».
 *
 * Такие поля были выпадающим списком с двумя вариантами: чтобы включить
 * тур в «Популярные», редактор открывал список и выбирал «Да» из двух.
 * Флажок отвечает на тот же вопрос одним щелчком.
 *
 * Подпись внутри label целиком — щелчок по тексту должен переключать
 * флажок, а не промахиваться мимо квадратика в четырнадцать пикселей.
 *
 * Обёртка выравнивает флажок по нижнему краю ячейки: рядом в строке стоят
 * обычные поля с подписью сверху, и без этого он висел бы выше их.
 */
export function Checkbox({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex flex-col justify-end">
            <label className="flex cursor-pointer items-center gap-2.5 py-2">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="size-4 shrink-0 accent-tile"
                />
                <span className="text-sm font-medium text-ink">{label}</span>
            </label>
            {hint && <p className="text-xs text-inkMuted">{hint}</p>}
        </div>
    );
}

/** Раздел формы с заголовком — длинную форму нужно делить на смысловые куски. */
export function FormSection({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 border-t border-sand pt-6 first:border-0 first:pt-0">
            <div>
                <h2 className="font-semibold text-ink">{title}</h2>
                {hint && <p className="mt-0.5 text-sm text-inkMuted">{hint}</p>}
            </div>
            {children}
        </section>
    );
}

export const LANGS = ['tk', 'en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

/**
 * Переключатель языка контента.
 *
 * Раньше это были вкладки daisyUI на радиокнопках с общим именем
 * «my_tabs_3». Имя одно на все формы, поэтому два таких блока на одной
 * странице переключались бы вместе; вид у них свой, мимо палитры.
 *
 * Здесь обычные кнопки в стиле остальной админки. Содержимое всех языков
 * остаётся смонтированным и просто прячется — так текст, набранный на
 * одном языке, не теряется при переключении на другой.
 */
export function LangTabs({
    active,
    onChange,
}: {
    active: Lang;
    onChange: (lang: Lang) => void;
}) {
    const t = useT();

    return (
        <div role="tablist" className="flex gap-1 border-b border-sand">
            {LANGS.map((lang) => {
                const current = lang === active;
                return (
                    <button
                        key={lang}
                        type="button"
                        role="tab"
                        aria-selected={current}
                        onClick={() => onChange(lang)}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            current
                                ? 'border-tile text-tile'
                                : 'border-transparent text-inkMuted hover:border-sand hover:text-ink'
                        }`}
                    >
                        {t(`lang.${lang}` as Parameters<typeof t>[0])}
                    </button>
                );
            })}
        </div>
    );
}
