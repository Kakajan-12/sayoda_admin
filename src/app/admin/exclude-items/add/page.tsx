'use client';
import { useParams } from "next/navigation";
import TourItemForm from "@/Components/tour/TourItemForm";

const Page = () => {
    return <TourItemForm endpoint="/api/exclude-items" listHref="/admin/exclude-items" />;
};

export default Page;
