'use client';
import React from "react";
import GroupedList from "@/Components/GroupedList";
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import type { Row } from "@/Components/ResourceList";

/**
 * Даты заездов, сгруппированные по туру.
 *
 * У заезда нет текста, поэтому строку списка собираем сами: дата, состояние
 * и цена — то, что нужно проверить взглядом, не открывая правку.
 */
const Departures = () => {
    const { locale, t } = useAdminLocale();

    const dayFormat = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

    const label = (row: Row) => {
        const raw = String(row.start_date ?? '');
        // Бэкенд отдаёт дату строкой «ГГГГ-ММ-ДД». Разбираем её вручную,
        // чтобы не поймать сдвиг на сутки из-за часового пояса браузера.
        const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const date = match
            ? dayFormat.format(
                  new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])),
              )
            : raw || '—';

        const status = String(row.status ?? 'open');
        const statusText =
            status === 'sold_out'
                ? t('dep.sold_out')
                : status === 'closed'
                  ? t('dep.closed')
                  : t('dep.open');

        const parts = [date, statusText];
        if (row.price) parts.push(`${row.price}$`);
        if (row.seats_left !== null && row.seats_left !== undefined) {
            parts.push(`${t('form.seatsLeft')}: ${row.seats_left}`);
        }
        return parts.join(' · ');
    };

    return (
        <GroupedList
            titleKey="nav.departures"
            endpoint="/api/departures"
            groupField="tour_title_en"
            itemLabel={label}
            addHref="/admin/departures/add-departure"
            editHref={(row) => `/admin/departures/edit-departure/${row.id}`}
            deleteEndpoint={(row) => `/api/departures/${row.id}`}
        />
    );
};

export default Departures;
