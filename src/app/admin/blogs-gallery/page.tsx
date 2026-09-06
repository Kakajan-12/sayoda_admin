'use client'
import React from "react";
import GroupedList from "@/Components/GroupedList";

const BlogsGallery = () => (
  <GroupedList
    titleKey="nav.blogsGallery"
    endpoint="/api/blog-gallery"
    groupField="blog_title_en"
    itemImageField="image"
    itemTitleField="title"
    addHref="/admin/blogs-gallery/add-gallery"
    editHref={(row) => `/admin/blogs-gallery/edit-gallery/${row.id}`}
    deleteEndpoint={(row) => `/api/blog-gallery/${row.id}`}
  />
);

export default BlogsGallery;
