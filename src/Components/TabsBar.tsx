'use client';

import React from "react";

/**
 * Полоса вкладок внутри страницы записи.
 *
 * Вкладка, а не отдельная страница: переход между «основным» и дочерними
 * списками не должен терять несохранённые правки формы и не должен стоить
 * загрузки страницы. Состояние не держится в адресной строке намеренно —
 * редактор работает с записью как с одним экраном, и делить его историю
 * браузера на семь шагов незачем.
 *
 * Список вкладок приходит пропсом: у тура их семь, у статьи две, и оба
 * набора будут меняться. Разметка при этом одна — вторая её копия
 * разошлась бы с первой при первой же правке отступов.
 */

export interface TabItem<K extends string> {
    key: K;
    label: string;
}

export default function TabsBar<K extends string>({
    tabs,
    active,
    onChange,
}: {
    tabs: TabItem<K>[];
    active: K;
    onChange: (tab: K) => void;
}) {
    return (
        // Горизонтальная прокрутка вместо переноса: семь вкладок в два ряда
        // отодвигали бы саму форму вниз на узком экране.
        <div
            role="tablist"
            className="mb-6 flex gap-1 overflow-x-auto border-b border-sand [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {tabs.map((tab) => {
                const current = tab.key === active;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={current}
                        onClick={() => onChange(tab.key)}
                        className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            current
                                ? 'border-tile text-tile'
                                : 'border-transparent text-inkMuted hover:border-sand hover:text-ink'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
