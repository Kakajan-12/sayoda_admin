'use client'
import React from "react";
import GroupedList from "@/Components/GroupedList";

const Itinerary = () => (
  <GroupedList
    titleKey="nav.itinerary"
    endpoint="/api/itinerary"
    groupField="tour_title_en"
    itemTitleField="title"
    itemField="text"
    addHref="/admin/itinerary/add-itinerary"
    editHref={(row) => `/admin/itinerary/edit-itinerary/${row.id}`}
    deleteEndpoint={(row) => `/api/itinerary/${row.id}`}
  />
);

export default Itinerary;
