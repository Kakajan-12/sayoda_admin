'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Sliders = () => (
  <ResourceList
    titleKey="nav.sliders"
    endpoint="/api/sliders"
    addHref="/admin/sliders/add-slider"
    editHref={(row) => `/admin/sliders/edit-slider/${row.id}`}
    deleteEndpoint={(row) => `/api/sliders/${row.id}`}
    rowLabel={(row) => plainText(row.title_ru || row.title_en) || String(row.id)}
    columns={[
        { headerKey: "common.image", field: "image", image: true, className: "w-24" },
        { headerKey: "list.name", field: "title", localized: true },
    ]}
    searchFields={["title"]}
  />
);

export default Sliders;
