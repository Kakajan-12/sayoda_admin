'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

interface Subscribe {
    id: number;
    mails: string;
}

const Subscribe = () => {
    const [subscribes, setSubscribes] = useState<Subscribe[]>([]);
    const [error, setError] = useState<string | null>(null);
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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Subscribes</h2>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Email</th>
                        </tr>
                        </thead>
                        <tbody>
                        {subscribes.length === 0 ? (
                            <tr>
                                <td colSpan={2}>No subscribes available</td>
                            </tr>
                        ) : (
                            subscribes.map(data => (
                                <tr key={data.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                    <div dangerouslySetInnerHTML={{__html: data.mails}}/>
                                </td>
                            </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Subscribe;