'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Tours = () => (
  <ResourceList
    titleKey="nav.tours"
    endpoint="/api/tours"
    addHref="/admin/tours/add-tour"
    editHref={(row) => `/admin/tours/edit-tour/${row.id}`}
    deleteEndpoint={(row) => `/api/tours/${row.id}`}
    rowLabel={(row) => plainText(row.title_ru || row.title_en) || String(row.id)}
    columns={[
      { headerKey: "common.image", field: "image", image: true, className: "w-24" },
      { headerKey: "list.name", field: "title", localized: true },
      {
        headerKey: "list.price",
        field: "price",
        className: "w-28",
        render: (row) => (
          <span className="font-semibold tabular-nums text-ink">{String(row.price ?? "—")}$</span>
        ),
      },
      {
        headerKey: "list.popular",
        field: "popular",
        className: "w-32",
        // Плашка вместо «Yes/No»: состояние читается цветом, не чтением.
        render: (row) =>
          Number(row.popular) === 1 ? (
            <span className="rounded-full bg-tileTint px-2.5 py-0.5 text-xs font-semibold text-tile">
              ★
            </span>
          ) : (
            <span className="text-inkMuted">—</span>
          ),
      },
    ]}
    searchFields={["title", "destination"]}
  />
);

export default Tours;
