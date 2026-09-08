'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

/**
 * Справочник пунктов «Что включено».
 *
 * Пункты повторяются от тура к туру, поэтому заводятся один раз здесь,
 * а в самом туре отмечаются галочками — как типы и категории.
 */
const IncludeItems = () => (
    <ResourceList
        titleKey="nav.includes"
        endpoint="/api/include-items"
        addHref="/admin/include-items/add"
        editHref={(row) => `/admin/include-items/edit/${row.id}`}
        deleteEndpoint={(row) => `/api/include-items/${row.id}`}
        rowLabel={(row) => plainText(row.text_ru || row.text_en) || String(row.id)}
        columns={[{ headerKey: "list.text", field: "text", localized: true }]}
        searchFields={["text"]}
    />
);

export default IncludeItems;
