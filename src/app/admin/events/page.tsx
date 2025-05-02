'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface EventItem {
    id: number;
    image: string;
    tk: string;
    en: string;
    ru: string;
}

const Events = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/upcoming`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setEvents(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError('Ошибка при получении данных');
                    if (err.response?.status === 401) {
                        router.push('/');
                    }
                } else {
                    setError('Неизвестная ошибка');
                }
            }
        };

        fetchEvents();
    }, [router]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Events</h2>
                        <Link
                            href="/admin/events/add-event"
                            className="bg text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition"
                        >
                            <PlusCircleIcon className="size-5 mr-2" />
                            Add
                        </Link>
                    </div>

                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 text-left text-gray-600">Image</th>
                            <th className="py-2 px-4 border-b-2 text-left text-gray-600">Turkmen</th>
                            <th className="py-2 px-4 border-b-2 text-left text-gray-600">English</th>
                            <th className="py-2 px-4 border-b-2 text-left text-gray-600">Russian</th>
                            <th className="py-2 px-4 border-b-2 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No events available</td>
                            </tr>
                        ) : (
                            events.map(event => (
                                <tr key={event.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${event.image.replace(/\\/g, '/')}`}
                                            alt={`Event ${event.id}`}
                                            width={100}
                                            height={100}
                                        />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: event.tk }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: event.en }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{ __html: event.ru }} />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/events/view-event/${event.id}`}
                                            className="bg text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition w-fit"
                                        >
                                            <EyeIcon className="size-5 mr-2" />
                                            View
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

export default Events;
