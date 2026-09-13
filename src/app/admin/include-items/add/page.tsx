'use client';
import { useParams } from "next/navigation";
import TourItemForm from "@/components/tours/TourItemForm";

const Page = () => {
    return <TourItemForm endpoint="/api/include-items" listHref="/admin/include-items" />;
};

export default Page;
