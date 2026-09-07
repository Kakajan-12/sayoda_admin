'use client';
import React from "react";
import GroupedList from "@/Components/GroupedList";

/**
 * Главное о туре — короткие пункты «ради чего ехать», которые выводятся
 * блоком сразу под первым экраном страницы тура.
 */
const Highlights = () => (
    <GroupedList
        titleKey="nav.highlights"
        endpoint="/api/highlights"
        groupField="tour_title_en"
        itemField="text"
        addHref="/admin/highlights/add-highlight"
        editHref={(row) => `/admin/highlights/edit-highlight/${row.id}`}
        deleteEndpoint={(row) => `/api/highlights/${row.id}`}
    />
);

export default Highlights;
