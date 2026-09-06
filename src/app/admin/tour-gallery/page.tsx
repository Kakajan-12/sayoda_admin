'use client'
import React from "react";
import GroupedList from "@/Components/GroupedList";

const TourGallery = () => (
  <GroupedList
    titleKey="nav.tourGallery"
    endpoint="/api/tour-gallery"
    groupField="tour_title_en"
    itemImageField="image"
    itemTitleField="title"
    addHref="/admin/tour-gallery/add-gallery"
    editHref={(row) => `/admin/tour-gallery/edit-gallery/${row.id}`}
    deleteEndpoint={(row) => `/api/tour-gallery/${row.id}`}
  />
);

export default TourGallery;
