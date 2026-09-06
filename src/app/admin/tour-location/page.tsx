'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const TourLocations = () => (
  <ResourceList
    titleKey="nav.tourLocation"
    endpoint="/api/tour-location"
    addHref="/admin/tour-location/add-tour-location"
    editHref={(row) => `/admin/tour-location/edit-tour-location/${row.id}`}
    deleteEndpoint={(row) => `/api/tour-location/${row.id}`}
    rowLabel={(row) => plainText(row.location_ru || row.location_en) || String(row.id)}
    columns={[
        { headerKey: "list.name", field: "location", localized: true },
    ]}
    searchFields={["location"]}
  />
);

export default TourLocations;
