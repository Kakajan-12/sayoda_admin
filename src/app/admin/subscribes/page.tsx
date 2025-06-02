'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

interface Subscribe {
    id: number;
    mails: string;
}

const Subscribe = () => {
    const [subscribes, setSubscribes] = useState<Subscribe[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSubscribe = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribes`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSubscribes(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchSubscribe();
    }, [router]);

    const handleDelete = async (id: number) => {
        const confirmDelete = confirm("Вы уверены, что хотите удалить подписку?");
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSubscribes(prev => prev.filter(sub => sub.id !== id));
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setError('Ошибка при удалении подписки');
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Subscribes</h2>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Email</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {subscribes.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="text-center py-4 text-gray-500">No subscribes available</td>
                            </tr>
                        ) : (
                            subscribes.map(data => (
                                <tr key={data.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: data.mails }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <button
                                            onClick={() => handleDelete(data.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded disabled:opacity-50"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Subscribe;
