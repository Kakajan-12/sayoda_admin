'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface Partner {
    id: number;
    logo: string;
}

const Partners = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setPartners(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchPartners();
    }, [router]);

    const handleDelete = async () => {
        if (!selectedPartnerId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${selectedPartnerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPartners(prev => prev.filter(p => p.id !== selectedPartnerId));
            setIsDeleting(false);
            setShowModal(false);
            setSelectedPartnerId(null);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Partners</h2>
                        <Link
                            href="/admin/partners/add-partner"
                            className="bg text-white py-2 px-6 rounded-md flex items-center hover:bg-blue-700"
                        >
                            <PlusCircleIcon className="size-6 mr-2" />
                            Add
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {partners.length === 0 ? (
                            <div className="col-span-full text-center text-gray-600">No data</div>
                        ) : (
                            partners.map((partner) => (
                                <div key={partner.id} className="border rounded-md bg-white overflow-hidden shadow">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${partner.logo.replace(/\\/g, "/")}`}
                                        alt={`Partner ${partner.id}`}
                                        width={300}
                                        height={200}
                                        className="w-full h-auto object-contain"
                                    />
                                    <div className="flex justify-between items-center p-4 border-t">
                                        <Link
                                            href={`/admin/partners/edit-partner/${partner.id}`}
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            <PencilIcon className="w-5 h-5 mr-2" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setSelectedPartnerId(partner.id);
                                                setShowModal(true);
                                            }}
                                            className="flex items-center text-red-600 hover:underline"
                                        >
                                            <TrashIcon className="w-5 h-5 mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Удалить партнёра</h2>
                            <p className="mb-6">Вы уверены, что хотите удалить этого партнёра?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedPartnerId(null);
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Partners;
