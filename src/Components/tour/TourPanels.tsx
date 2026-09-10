'use client';

import React from "react";
import TourChildList, { type FieldSpec } from "@/Components/tour/TourChildList";
import GalleryPanel from "@/Components/GalleryPanel";
import TourItemPicker from "@/Components/tour/TourItemPicker";
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
            <GalleryPanel
                endpoint="tour-gallery"
                ownerKey="tour_id"
                ownerPath="tour"
                ownerId={tourId}
                idKey="gallery_id"
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

    /*
     * «Включено» и «не включено» — не списки у тура, а отметки в справочнике.
     *
     * Пункты повторяются от тура к туру: 93 записи «включено» оказались 29
     * разными текстами, один и тот же пункт лежал по восемь раз. Набирать
     * их заново в каждом туре было и долго, и поправить формулировку
     * значило открыть восемь туров.
     */
    if (tab === 'includes' || tab === 'excludes') {
        const includes = tab === 'includes';
        return (
            <TourItemPicker
                tourId={tourId}
                title={t(includes ? 'nav.includes' : 'nav.excludes')}
                hint={t(includes ? 'tour.hintIncludes' : 'tour.hintExcludes')}
                endpoint={includes ? '/api/include-items' : '/api/exclude-items'}
                manageHref={includes ? '/admin/include-items' : '/admin/exclude-items'}
            />
        );
    }

    // «Главное о туре» остаётся списком у тура: доводы «ради чего ехать»
    // у каждого свои, повторять их между турами нечего.
    return (
        <TourChildList
            tourId={tourId}
            title={t('nav.highlights')}
            hint={t('tour.hintHighlights')}
            endpoint="/api/highlights"
            listUrl={(id) => `/api/highlights/tour/${id}`}
            ordered
            fields={localizedText(t('form.text'), 500)}
            rowLabel={(row) => anyLocale(row, 'text')}
        />
    );
}
