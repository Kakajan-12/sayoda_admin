'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Visa = () => (
  <ResourceList
    titleKey="nav.visa"
    endpoint="/api/visa"
    addHref="/admin/visa/add-visa"
    editHref={(row) => `/admin/visa/edit-visa/${row.id}`}
    deleteEndpoint={(row) => `/api/visa/${row.id}`}
    rowLabel={(row) => plainText(row.title_ru || row.title_en) || String(row.id)}
    columns={[
        { headerKey: "list.name", field: "title", localized: true },
    ]}
    searchFields={["title"]}
  />
);

export default Visa;
