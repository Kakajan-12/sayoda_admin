'use client';

import React from "react";
import TourChildList, { type FieldSpec } from "@/Components/tour/TourChildList";
import TourGalleryPanel from "@/Components/tour/TourGalleryPanel";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { Row } from "@/Components/ResourceList";

/**
 * Списки, привязанные к туру: программа, состав цены, «главное», заезды,
 * галерея. Каждый был отдельным разделом меню — чтобы собрать один тур,
 * редактор обходил семь страниц и в каждой заново выбирал тур.
 *
 * Здесь они собраны в набор вкладок на самой странице тура. Типы и
 * категории остаются справочниками: их заводят один раз и потом выбирают
 * из списка, дублировать в каждом туре нечего.
 */

/** Локализованная строка — так устроены «включено», «не включено» и «главное». */
const localizedText = (label: string, maxLength?: number): FieldSpec[] => [
    { name: 'text', label, kind: 'text', localized: true, maxLength },
];

/** Показываем русский, а если его нет — английский или туркменский. */
const anyLocale = (row: Row, base: string) =>
    String(row[`${base}_ru`] || row[`${base}_en`] || row[`${base}_tk`] || '');

export type TourTab = 'itinerary' | 'includes' | 'excludes' | 'highlights' | 'departures' | 'gallery';

export default function TourPanels({ tourId, tab }: { tourId: number; tab: TourTab }) {
    const t = useT();

    if (tab === 'gallery') {
        return (
            <TourGalleryPanel
                tourId={tourId}
                title={t('nav.tourGallery')}
                hint={t('tour.hintGallery')}
            />
        );
    }

    if (tab === 'itinerary') {
        return (
            <TourChildList
                tourId={tourId}
                title={t('nav.itinerary')}
                hint={t('tour.hintItinerary')}
                endpoint="/api/itinerary"
                // У программы адрес исторически другой: не /tour/:id, а ?tourId=
                listUrl={(id) => `/api/itinerary?tourId=${id}`}
                ordered
                fields={[
                    { name: 'title', label: t('tour.dayTitle'), kind: 'text', localized: true },
                    { name: 'text', label: t('tour.dayText'), kind: 'rich', localized: true },
                ]}
                rowLabel={(row) => anyLocale(row, 'title')}
            />
        );
    }

    if (tab === 'departures') {
        return (
            <TourChildList
                tourId={tourId}
                title={t('nav.departures')}
                hint={t('tour.hintDepartures')}
                endpoint="/api/departures"
                listUrl={(id) => `/api/departures/tour/${id}`}
                fields={[
                    { name: 'start_date', label: t('form.startDate'), kind: 'date' },
                    { name: 'end_date', label: t('form.endDate'), kind: 'date', hint: t('form.endDateHint') },
                    { name: 'price', label: t('form.price'), kind: 'number', hint: t('form.priceHint') },
                    { name: 'seats_left', label: t('form.seatsLeft'), kind: 'number', hint: t('form.seatsHint') },
                    {
                        name: 'status',
                        label: t('form.status'),
                        kind: 'select',
                        options: [
                            { value: 'open', label: t('dep.open') },
                            { value: 'sold_out', label: t('dep.sold_out') },
                            { value: 'closed', label: t('dep.closed') },
                        ],
                    },
                ]}
                rowLabel={(row) => {
                    const date = String(row.start_date ?? '');
                    const status = String(row.status ?? 'open');
                    const label = status === 'sold_out'
                        ? t('dep.sold_out')
                        : status === 'closed'
                          ? t('dep.closed')
                          : t('dep.open');
                    return [date, label, row.price ? `${row.price}$` : null]
                        .filter(Boolean)
                        .join(' · ');
                }}
            />
        );
    }

    const shared = {
        includes: {
            title: t('nav.includes'),
            hint: t('tour.hintIncludes'),
            endpoint: '/api/includes',
            ordered: false,
        },
        excludes: {
            title: t('nav.excludes'),
            hint: t('tour.hintExcludes'),
            endpoint: '/api/excludes',
            ordered: false,
        },
        highlights: {
            title: t('nav.highlights'),
            hint: t('tour.hintHighlights'),
            endpoint: '/api/highlights',
            ordered: true,
        },
    }[tab];

    return (
        <TourChildList
            tourId={tourId}
            title={shared.title}
            hint={shared.hint}
            endpoint={shared.endpoint}
            listUrl={(id) => `${shared.endpoint}/tour/${id}`}
            ordered={shared.ordered}
            fields={localizedText(t('form.text'), tab === 'highlights' ? 500 : undefined)}
            rowLabel={(row) => anyLocale(row, 'text')}
        />
    );
}
