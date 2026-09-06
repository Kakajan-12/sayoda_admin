'use client'
import React from "react";
import GroupedList from "@/Components/GroupedList";

const Excludes = () => (
  <GroupedList
    titleKey="nav.excludes"
    endpoint="/api/excludes"
    groupField="tour_title_en"
    itemField="text"
    addHref="/admin/excludes/add-excludes"
    editHref={(row) => `/admin/excludes/edit-excludes/${row.id}`}
    deleteEndpoint={(row) => `/api/excludes/${row.id}`}
  />
);

export default Excludes;
