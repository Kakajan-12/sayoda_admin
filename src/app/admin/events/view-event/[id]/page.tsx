'use client';
import React, {useEffect, useState, Fragment} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {Menu, Transition} from '@headlessui/react';
import {ChevronDownIcon, PencilIcon, TrashIcon} from '@heroicons/react/16/solid';

interface EventData {
    id: number;
    image: string;
    date?: string;
    link?: string;
    tk?: string;
    en?: string;
    ru?: string;
    location_tk?: string;
    location_en?: string;
    location_ru?: string;
    text_tk?: string;
    text_en?: string;
    text_ru?: string;
}

const ViewEvent = () => {
    const {id} = useParams();
    const [data, setData] = useState<EventData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/upcoming/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(response.data[0]);
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

        if (id) fetchData();
    }, [id, router]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/upcoming/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsDeleting(false);
            setShowModal(false);
            router.push('/admin/events');
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) return <div>{error}</div>;
    if (!data) return <div>Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">View Event</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none">
                                Options
                                <ChevronDownIcon className="w-4 h-4" />
                            </Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => router.push(`/admin/events/edit-event/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-100" />
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2 text-red-400" />
                                                    Delete
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-6 rounded-md shadow-md flex flex-wrap gap-10">
                        <div>
                            {data.image && (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                                    alt="Event"
                                    width={500}
                                    height={400}
                                    className="rounded mb-6"
                                />
                            )}
                            {data.date && (
                                <div className="mb-4">
                                    <strong>Date:</strong>
                                    <div dangerouslySetInnerHTML={{ __html: data.date }} />
                                </div>
                            )}
                            {data.link && (
                                <div className="mb-4">
                                    <strong>Link:</strong>
                                    <div dangerouslySetInnerHTML={{ __html: data.link }} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-10 divide-y-1">
                            <div>
                                <div className="font-bold text-lg mb-2">Turkmen</div>
                                {data.tk && (
                                    <div><strong>Title:</strong><div dangerouslySetInnerHTML={{ __html: data.tk }} /></div>
                                )}
                                {data.location_tk && (
                                    <div><strong>Location:</strong><div dangerouslySetInnerHTML={{ __html: data.location_tk }} /></div>
                                )}
                                {data.text_tk && (
                                    <div><strong>Text:</strong><div dangerouslySetInnerHTML={{ __html: data.text_tk }} /></div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-lg mb-2">English</div>
                                {data.en && (
                                    <div><strong>Title:</strong><div dangerouslySetInnerHTML={{ __html: data.en }} /></div>
                                )}
                                {data.location_en && (
                                    <div><strong>Location:</strong><div dangerouslySetInnerHTML={{ __html: data.location_en }} /></div>
                                )}
                                {data.text_en && (
                                    <div><strong>Text:</strong><div dangerouslySetInnerHTML={{ __html: data.text_en }} /></div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-lg mb-2">Russian</div>
                                {data.ru && (
                                    <div><strong>Title:</strong><div dangerouslySetInnerHTML={{ __html: data.ru }} /></div>
                                )}
                                {data.location_ru && (
                                    <div><strong>Location:</strong><div dangerouslySetInnerHTML={{ __html: data.location_ru }} /></div>
                                )}
                                {data.text_ru && (
                                    <div><strong>Text:</strong><div dangerouslySetInnerHTML={{ __html: data.text_ru }} /></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">Remove event</h2>
                                <p className="mb-6">Are you sure you want to delete this event?</p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                        onClick={() => setShowModal(false)}
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
        </div>
    );
};

export default ViewEvent;
