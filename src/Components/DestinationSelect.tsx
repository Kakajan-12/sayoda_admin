'use client'
import React, { useEffect, useState } from "react";

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

const DestinationSelect = ({ value, onChange, label = 'Страна', hint }: Props) => {
    const [items, setItems] = useState<Destination[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/destinations`)
            .then((r) => r.json())
            .then((d) => setItems(Array.isArray(d) ? d : []))
            .catch((err) => console.error('Ошибка при загрузке стран:', err));
    }, []);

    return (
        <div className="w-full">
            <label className="block text-gray-700 font-semibold mb-2">{label}</label>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
            >
                <option value="">Не привязано</option>
                {items.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.name_ru || d.name_en || d.slug}
                    </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
                {hint ?? 'Пусто — страна определится по названию, как раньше.'}
            </p>
        </div>
    );
};

export default DestinationSelect;
