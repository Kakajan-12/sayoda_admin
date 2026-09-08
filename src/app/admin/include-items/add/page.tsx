'use client';
import { useParams } from "next/navigation";
import TourItemForm from "@/Components/tour/TourItemForm";

const Page = () => {
    return <TourItemForm endpoint="/api/include-items" listHref="/admin/include-items" />;
};

export default Page;
