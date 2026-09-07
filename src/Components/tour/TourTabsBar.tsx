'use client';

import React from "react";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { TourTab } from "@/Components/tour/TourPanels";

/**
 * Вкладки страницы тура.
 *
 * Вкладка, а не отдельная страница: переход между «основным» и программой
 * не должен терять несохранённые правки формы и не должен стоить загрузки
 * страницы. Состояние держится в адресной строке не намеренно — редактор
 * работает с туром как с одним экраном, и делить его историю браузера
 * на семь шагов незачем.
 */

export type TourPageTab = 'main' | TourTab;

const TABS: { key: TourPageTab; labelKey: string }[] = [
    { key: 'main', labelKey: 'tour.tabMain' },
    { key: 'itinerary', labelKey: 'nav.itinerary' },
    { key: 'includes', labelKey: 'nav.includes' },
    { key: 'excludes', labelKey: 'nav.excludes' },
    { key: 'highlights', labelKey: 'nav.highlights' },
    { key: 'departures', labelKey: 'nav.departures' },
    { key: 'gallery', labelKey: 'nav.tourGallery' },
];

export default function TourTabsBar({
    active,
    onChange,
}: {
    active: TourPageTab;
    onChange: (tab: TourPageTab) => void;
}) {
    const t = useT();

    return (
        // Горизонтальная прокрутка вместо переноса: семь вкладок в два ряда
        // отодвигали бы саму форму вниз на узком экране.
        <div
            role="tablist"
            className="mb-6 flex gap-1 overflow-x-auto border-b border-sand [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {TABS.map((tab) => {
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
                        {t(tab.labelKey as Parameters<typeof t>[0])}
                    </button>
                );
            })}
        </div>
    );
}
