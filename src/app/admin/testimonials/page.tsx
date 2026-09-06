'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Testimonials = () => (
  <ResourceList
    titleKey="nav.testimonials"
    endpoint="/api/testimonials"
    addHref="/admin/testimonials/add-testimonials"
    editHref={(row) => `/admin/testimonials/edit-testimonials/${row.id}`}
    deleteEndpoint={(row) => `/api/testimonials/${row.id}`}
    rowLabel={(row) => plainText(row.name) || String(row.id)}
    columns={[
      { headerKey: "common.image", field: "image", image: true, className: "w-24" },
      { headerKey: "list.author", field: "name", className: "w-56" },
      { headerKey: "list.review", field: "text" },
    ]}
    searchFields={["name", "text"]}
  />
);

export default Testimonials;
