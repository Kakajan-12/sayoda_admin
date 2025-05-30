'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilIcon } from '@heroicons/react/16/solid';

interface ContactData {
    mail?: string;
    number?: string;
}

const Contacts = () => {
    const [data, setData] = useState<ContactData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/1`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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

        fetchData();
    }, [router]);

    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!data) return <div className="p-6">Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">View Contacts</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none cursor-pointer">
                                Options
                                <ChevronDownIcon className="w-4 h-4 fill-white/60" />
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
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => router.push(`/admin/contacts/edit-contacts/1`)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-6 rounded-md shadow border border-gray-200">
                        {data.mail && (
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">Email</h3>
                                <div dangerouslySetInnerHTML={{ __html: String(data.mail) }} />
                            </div>
                        )}
                        {data.number && (
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">Phone Number</h3>
                                <div dangerouslySetInnerHTML={{ __html: String(data.number) }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;
