'use client';

import React from "react";
import { useT } from "@/lib/i18n/LocaleProvider";
import TabsBar from "@/Components/TabsBar";
import type { TourTab } from "@/Components/tour/TourPanels";

/**
 * Вкладки страницы тура.
 *
 * Здесь только состав вкладок и их подписи; сама полоса живёт в TabsBar —
 * её делят страница тура и страница статьи.
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
        <TabsBar
            active={active}
            onChange={onChange}
            tabs={TABS.map((tab) => ({
                key: tab.key,
                label: t(tab.labelKey as Parameters<typeof t>[0]),
            }))}
        />
    );
}
