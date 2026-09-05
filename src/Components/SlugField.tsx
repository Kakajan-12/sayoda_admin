'use client'
import React from "react";

/**
 * Адрес страницы записи.
 *
 * Раньше адреса строились по числовому id: /tours/16 не говорил ни человеку,
 * ни поисковику ни о чём, а ссылки на туры чаще всего пересылают в
 * мессенджерах, где виден голый URL.
 *
 * У новой записи поле можно оставить пустым — адрес соберётся из английского
 * названия. У существующей поле закрыто: смена адреса ломает уже разосланные
 * ссылки и сбрасывает то, что накопила страница в поиске.
 */

interface Props {
    value: string;
    onChange: (value: string) => void;
    /** Раздел сайта, к которому относится адрес: tours или blog. */
    section: 'tours' | 'blog';
    /** Существующая запись — адрес менять нельзя. */
    locked?: boolean;
}

const SlugField = ({ value, onChange, section, locked }: Props) => (
    <div className="w-full">
        <label className="block text-gray-700 font-semibold mb-2">Адрес страницы</label>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0">/{section}/</span>
            <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                readOnly={locked}
                placeholder={locked ? '' : 'соберётся из английского названия'}
                className={`border border-gray-300 rounded p-2 w-full ${locked ? 'bg-gray-100 text-gray-600' : ''}`}
            />
        </div>
        <p className="text-xs text-gray-500 mt-1">
            {locked
                ? 'Менять нельзя: по этому адресу уже есть ссылки и он в поиске.'
                : 'Латиницей, слова через дефис. Можно оставить пустым.'}
        </p>
    </div>
);

export default SlugField;
