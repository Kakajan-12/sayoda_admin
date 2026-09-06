'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const TourTypes = () => (
  <ResourceList
    titleKey="nav.tourTypes"
    endpoint="/api/tour-types"
    addHref="/admin/tour-types/add-tour-type"
    editHref={(row) => `/admin/tour-types/edit-tour-type/${row.id}`}
    deleteEndpoint={(row) => `/api/tour-types/${row.id}`}
    rowLabel={(row) => plainText(row.type_ru || row.type_en) || String(row.id)}
    columns={[
        { headerKey: "list.name", field: "type", localized: true },
    ]}
    searchFields={["type"]}
  />
);

export default TourTypes;
