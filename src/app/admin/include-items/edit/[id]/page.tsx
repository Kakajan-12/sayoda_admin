'use client';
import { useParams } from "next/navigation";
import TourItemForm from "@/Components/tour/TourItemForm";

const Page = () => {
    const { id } = useParams();
    return <TourItemForm endpoint="/api/include-items" listHref="/admin/include-items" id={String(id)} />;
};

export default Page;
