'use client'
import React from "react";
import GroupedList from "@/Components/GroupedList";

const Includes = () => (
  <GroupedList
    titleKey="nav.includes"
    endpoint="/api/includes"
    groupField="tour_title_en"
    itemField="text"
    addHref="/admin/includes/add-includes"
    editHref={(row) => `/admin/includes/edit-includes/${row.id}`}
    deleteEndpoint={(row) => `/api/includes/${row.id}`}
  />
);

export default Includes;
