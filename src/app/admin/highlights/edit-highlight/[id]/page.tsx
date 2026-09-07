'use client';
import { useParams } from "next/navigation";
import HighlightForm from "@/Components/HighlightForm";

const EditHighlight = () => {
    const { id } = useParams();
    return <HighlightForm id={String(id)} />;
};

export default EditHighlight;
