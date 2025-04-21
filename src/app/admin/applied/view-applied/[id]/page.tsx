'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

interface AppliedData {
    id: number;
    photo?: string;
    name?: string;
    surname?: string;
    email?: string;
    number?: string;
    address?: string;
    education?: string;
    experience?: string;
    comment?: string;
    career_id?: string;
}

const ViewApplied = () => {
    const { id } = useParams();
    const [data, setData] = useState<AppliedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/apply-job/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setData(response.data[0]);
            } catch (err: unknown) {
                console.error("Ошибка при загрузке:", err);
                setError('Ошибка при загрузке');

                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        if (id) fetchData();
    }, [id, router]);

    if (error) return <div>{error}</div>;
    if (!data) return <div>Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">View Applied</h2>
                    </div>

                    <div className="bg-white p-4 rounded-md border-gray-200 flex">
                        <div>
                            {data.photo ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.photo.replace(/\\/g, '/')}`}
                                    alt="Photo"
                                    width={500}
                                    height={400}
                                    className="rounded mb-6"
                                />
                            ) : (
                                <p className="italic text-gray-500">No photo uploaded</p>
                            )}
                        </div>

                        <div className="space-y-4 ml-4">
                            {data.name && (
                                <div>
                                    <strong>Name:</strong>
                                    <p>{data.name}</p>
                                </div>
                            )}
                            {data.surname && (
                                <div>
                                    <strong>Surname:</strong>
                                    <p>{data.surname}</p>
                                </div>
                            )}
                            {data.email && (
                                <div>
                                    <strong>Email:</strong>
                                    <p>{data.email}</p>
                                </div>
                            )}
                            {data.number && (
                                <div>
                                    <strong>Number:</strong>
                                    <p>{data.number}</p>
                                </div>
                            )}
                            {data.address && (
                                <div>
                                    <strong>Address:</strong>
                                    <p>{data.address}</p>
                                </div>
                            )}
                            {data.education && (
                                <div>
                                    <strong>Education:</strong>
                                    <p>{data.education}</p>
                                </div>
                            )}
                            {data.experience && (
                                <div>
                                    <strong>Experience:</strong>
                                    <p>{data.experience}</p>
                                </div>
                            )}
                            {data.comment && (
                                <div>
                                    <strong>Comment:</strong>
                                    <p>{data.comment}</p>
                                </div>
                            )}
                            {data.career_id && (
                                <div>
                                    <strong>Career:</strong>
                                    <p>{data.career_id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewApplied;
