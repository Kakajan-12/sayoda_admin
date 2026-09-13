'use client';
import { useParams } from "next/navigation";
import TourItemForm from "@/components/tours/TourItemForm";

const Page = () => {
    return <TourItemForm endpoint="/api/exclude-items" listHref="/admin/exclude-items" />;
};

export default Page;
