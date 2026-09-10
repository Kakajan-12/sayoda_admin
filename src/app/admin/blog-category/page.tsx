'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

/**
 * Категории статей.
 *
 * Список отдаёт и число статей в каждой категории: по нему видно, какая
 * категория живая, а какая заведена и забыта. Без этого перед удалением
 * пришлось бы уходить в список статей и считать вручную.
 */
const BlogCategory = () => (
    <ResourceList
        titleKey="nav.blogCategory"
        endpoint="/api/blog-category"
        addHref="/admin/blog-category/add-blog-category"
        editHref={(row) => `/admin/blog-category/edit-blog-category/${row.id}`}
        deleteEndpoint={(row) => `/api/blog-category/${row.id}`}
        rowLabel={(row) => plainText(row.cat_ru || row.cat_en) || String(row.id)}
        columns={[
            { headerKey: "list.name", field: "cat", localized: true },
            { headerKey: "list.blogsCount", field: "blogs_count" },
        ]}
        searchFields={["cat"]}
    />
);

export default BlogCategory;
