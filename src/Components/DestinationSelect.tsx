'use client'
import React, { useEffect, useState } from "react";
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { optionLabel } from "@/Components/form/optionLabel";

/**
 * Выбор страны для слайдера и локации тура.
 *
 * Раньше связь угадывалась по тексту: сайт сравнивал заголовок карточки с
 * названиями стран. Переименовали слайдер — и переход тихо уезжал со страницы
 * страны на страницу тура. Здесь связь задаётся явно.
 *
 * Список публичный, токен не нужен: те же данные отдаются сайту.
 */

interface Destination {
    id: number;
    slug: string;
    name_en: string | null;
    name_ru: string | null;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    hint?: string;
}

const DestinationSelect = ({ value, onChange, label, hint }: Props) => {
    const { locale, t } = useAdminLocale();
    const [items, setItems] = useState<Destination[]>([]);
    // Подпись по умолчанию — из словаря, а не строкой по-русски: интерфейс
    // админки переключается на английский.
    const caption = label ?? t('form.selectDestination');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/destinations`)
            .then((r) => r.json())
            .then((d) => setItems(Array.isArray(d) ? d : []))
            .catch((err) => console.error('Ошибка при загрузке стран:', err));
    }, []);

    return (
        <div className="w-full">
            {/* Подпись — как у остальных полей админки: тот же размер,
                вес и цвет палитры. Был серый text-gray-700 полужирным. */}
            <label className="mb-1 block text-sm font-medium text-inkMuted">{caption}</label>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
            >
                <option value="">{t('form.notSet')}</option>
                {items.map((d) => {
                    // Название страны хранится обычным текстом, но берём его
                    // через ту же функцию, что и остальные списки: если поле
                    // однажды заполнят через редактор, теги не вылезут.
                    const name = optionLabel(d, 'name', locale) || d.slug;
                    return (
                        <option key={d.id} value={d.id} title={name}>
                            {name}
                        </option>
                    );
                })}
            </select>
            <p className="text-xs text-gray-500 mt-1">
                {hint ?? 'Пусто — страна определится по названию, как раньше.'}
            </p>
        </div>
    );
};

export default DestinationSelect;
