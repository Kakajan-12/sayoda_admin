'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const SocialLinks = () => (
  <ResourceList
    titleKey="nav.socialLinks"
    endpoint="/api/links"
    addHref="/admin/social-links/add-link"
    editHref={(row) => `/admin/social-links/edit-link/${row.id}`}
    deleteEndpoint={(row) => `/api/links/${row.id}`}
    rowLabel={(row) => plainText(row.icon) || String(row.id)}
    columns={[
      { headerKey: "list.icon", field: "icon", className: "w-40" },
      {
        headerKey: "list.link",
        field: "url",
        // Ссылку показываем кликабельной: проверить, что адрес рабочий,
        // иначе можно только скопировав его руками.
        render: (row) => (
          <a
            href={String(row.url ?? "")}
            target="_blank"
            rel="noreferrer"
            className="text-tile underline-offset-2 hover:underline"
          >
            {String(row.url ?? "—")}
          </a>
        ),
      },
    ]}
    searchFields={["icon", "url"]}
  />
);

export default SocialLinks;
