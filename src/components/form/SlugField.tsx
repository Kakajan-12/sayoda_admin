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
 * названия.
 *
 * У существующей записи поле раньше было закрыто наглухо: переименовав тур,
 * поменять адрес было нельзя вовсе. Запрет решал одну задачу — не ломать
 * разосланные ссылки, — но заодно запрещал и осмысленную правку, когда
 * название изменилось так, что старый адрес перестал ему отвечать.
 *
 * Теперь поле открыто, а последствия названы прямо над ним. Решение за
 * редактором: он один знает, расходились ли ссылки на эту страницу.
 *
 * Что вводить — не важно: сервер приводит значение к латинице, переводит
 * пробелы в дефисы и, если адрес занят, дописывает -2. Поэтому здесь нет
 * ни своей проверки, ни маски ввода: вторая реализация тех же правил
 * рано или поздно разойдётся с серверной.
 */

interface Props {
    value: string;
    onChange: (value: string) => void;
    /** Раздел сайта, к которому относится адрес: tours или blog. */
    section: 'tours' | 'blog';
    /** Запись уже существует — предупреждаем о судьбе старых ссылок. */
    existing?: boolean;
}

const SlugField = ({ value, onChange, section, existing }: Props) => (
    <div className="w-full">
        <label className="block text-gray-700 font-semibold mb-2">Адрес страницы</label>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0">/{section}/</span>
            <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={existing ? '' : 'соберётся из английского названия'}
                className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
            />
        </div>
        {existing ? (
            <p className="mt-1 text-xs text-brick">
                Меняйте только осознанно: по старому адресу перестанут открываться
                уже разосланные ссылки, и страница потеряет накопленное в поиске.
            </p>
        ) : (
            <p className="mt-1 text-xs text-gray-500">
                Латиницей, слова через дефис. Можно оставить пустым.
            </p>
        )}
    </div>
);

export default SlugField;
