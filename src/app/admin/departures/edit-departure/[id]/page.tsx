'use client';
import { useParams } from "next/navigation";
import DepartureForm from "@/Components/DepartureForm";

const EditDeparture = () => {
    const { id } = useParams();
    return <DepartureForm id={String(id)} />;
};

export default EditDeparture;
