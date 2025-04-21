'use client';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios, {AxiosError} from 'axios';
import { useRouter } from 'next/navigation';
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

interface Slider {
    id: number;
    image: string;
    tk: string;
    en: string;
    ru: string;
}

const Sliders = () => {
    const [sliders, setSliders] = useState<Slider[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSliders(response.data);
                setLoading(false);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchSliders();
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Sliders</h2>
                        <Link href="/admin/sliders/add-slider" className="bg-blue-600 text-white py-2 px-8 rounded-md cursor-pointer flex items-center">
                            <PlusCircleIcon className="w-6 h-6" color="#ffffff" />
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Image</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Turkmen</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">English</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Russian</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sliders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No sliders available</td>
                            </tr>
                        ) : (
                            sliders.map((slider) => (
                                <tr key={slider.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Image
                                            src={`http://162.0.211.12:3001/${slider.image}`}
                                            alt={`Slider ${slider.id}`}
                                            width={100}
                                            height={100}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: slider.tk }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: slider.en }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: slider.ru }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link href={`/admin/sliders/view-slider/${slider.id}`} className="bg-blue-600 text-white py-2 px-8 rounded-md cursor-pointer flex w-32 justify-center items-center">
                                            <EyeIcon className="w-5 h-5" color="#ffffff" />
                                            <div className="ml-2">View</div>
                                        </Link>
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

export default Sliders;
