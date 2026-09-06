'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Mails = () => (
  <ResourceList
    titleKey="nav.mails"
    endpoint="/api/contact-mails"
    addHref="/admin/mails/add-mail"
    editHref={(row) => `/admin/mails/edit-mail/${row.id}`}
    deleteEndpoint={(row) => `/api/contact-mails/${row.id}`}
    rowLabel={(row) => plainText(row.mail) || String(row.id)}
    columns={[
      { headerKey: "list.email", field: "mail" },
      { headerKey: "list.city", field: "location_en", className: "w-56" },
    ]}
    searchFields={["mail"]}
  />
);

export default Mails;
