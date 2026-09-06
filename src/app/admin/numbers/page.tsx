'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Numbers = () => (
  <ResourceList
    titleKey="nav.numbers"
    endpoint="/api/contact-numbers"
    addHref="/admin/numbers/add-number"
    editHref={(row) => `/admin/numbers/edit-number/${row.id}`}
    deleteEndpoint={(row) => `/api/contact-numbers/${row.id}`}
    rowLabel={(row) => plainText(row.number) || String(row.id)}
    columns={[
      { headerKey: "list.phone", field: "number" },
      { headerKey: "list.city", field: "location_en", className: "w-56" },
    ]}
    searchFields={["number"]}
  />
);

export default Numbers;
