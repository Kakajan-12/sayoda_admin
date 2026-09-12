'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Blogs = () => (
  <ResourceList
    titleKey="nav.blogs"
    endpoint="/api/blogs"
    addHref="/admin/blogs/add-blog"
    editHref={(row) => `/admin/blogs/edit-blog/${row.id}`}
    deleteEndpoint={(row) => `/api/blogs/${row.id}`}
    rowLabel={(row) => plainText(row.title_ru || row.title_en) || String(row.id)}
    columns={[
        { headerKey: "common.image", field: "image", image: true, className: "w-24" },
        { headerKey: "list.name", field: "title", localized: true },
    ]}
    searchFields={["title"]}
    serverSide
  />
);

export default Blogs;
