'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

/**
 * Справочник пунктов «Что не включено».
 *
 * Пункты повторяются от тура к туру, поэтому заводятся один раз здесь,
 * а в самом туре отмечаются галочками — как типы и категории.
 */
const ExcludeItems = () => (
    <ResourceList
        titleKey="nav.excludes"
        endpoint="/api/exclude-items"
        addHref="/admin/exclude-items/add"
        editHref={(row) => `/admin/exclude-items/edit/${row.id}`}
        deleteEndpoint={(row) => `/api/exclude-items/${row.id}`}
        rowLabel={(row) => plainText(row.text_ru || row.text_en) || String(row.id)}
        columns={[{ headerKey: "list.text", field: "text", localized: true }]}
        searchFields={["text"]}
    />
);

export default ExcludeItems;
