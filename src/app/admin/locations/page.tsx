'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const ContactLocations = () => (
  <ResourceList
    titleKey="nav.locations"
    endpoint="/api/contact-location"
    addHref="/admin/locations/add-location"
    editHref={(row) => `/admin/locations/edit-location/${row.id}`}
    deleteEndpoint={(row) => `/api/contact-location/${row.id}`}
    rowLabel={(row) => plainText(row.location_ru || row.location_en) || String(row.id)}
    columns={[
        { headerKey: "list.city", field: "location", localized: true },
    ]}
    searchFields={["location"]}
  />
);

export default ContactLocations;
