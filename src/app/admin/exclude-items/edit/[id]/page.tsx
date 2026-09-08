'use client';
import { useParams } from "next/navigation";
import TourItemForm from "@/Components/tour/TourItemForm";

const Page = () => {
    const { id } = useParams();
    return <TourItemForm endpoint="/api/exclude-items" listHref="/admin/exclude-items" id={String(id)} />;
};

export default Page;
