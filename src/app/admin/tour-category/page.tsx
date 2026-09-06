'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const TourCategory = () => (
  <ResourceList
    titleKey="nav.tourCategory"
    endpoint="/api/tour-category"
    addHref="/admin/tour-category/add-tour-category"
    editHref={(row) => `/admin/tour-category/edit-tour-category/${row.id}`}
    deleteEndpoint={(row) => `/api/tour-category/${row.id}`}
    rowLabel={(row) => plainText(row.cat_ru || row.cat_en) || String(row.id)}
    columns={[
        { headerKey: "list.name", field: "cat", localized: true },
    ]}
    searchFields={["cat"]}
  />
);

export default TourCategory;
