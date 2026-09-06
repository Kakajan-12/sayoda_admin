'use client'
import React from "react";
import ResourceList, { plainText } from "@/Components/ResourceList";

const Addresses = () => (
  <ResourceList
    titleKey="nav.address"
    endpoint="/api/contact-address"
    idField="address_id"
    addHref="/admin/address/add-address"
    editHref={(row) => `/admin/address/edit-address/${row.address_id}`}
    deleteEndpoint={(row) => `/api/contact-address/${row.address_id}`}
    rowLabel={(row) => plainText(row.address_ru || row.address_en) || String(row.address_id)}
    columns={[
      { headerKey: "nav.address", field: "address", localized: true },
      {
        headerKey: "list.map",
        field: "iframe",
        className: "w-28",
        // Сам код карты в таблице читать невозможно — важно лишь, задана она или нет.
        render: (row) =>
          row.iframe ? (
            <span className="rounded-full bg-tileTint px-2.5 py-0.5 text-xs font-semibold text-tile">
              ✓
            </span>
          ) : (
            <span className="text-inkMuted">—</span>
          ),
      },
    ]}
    searchFields={["address"]}
  />
);

export default Addresses;
