'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditCareerReq = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ career_req_tk: '', career_req_en: '', career_req_ru: '', career_id: '' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [career, setCareer] = useState<{ id: number, tk: string, en: string, ru: string }[]>([]);

    useEffect(() => {
        const fetchCareer = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career`);
                const data = await res.json();
                setCareer(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };
        fetchCareer();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/career-req/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.length > 0) {
                    const rawData = response.data[0];

                    setData({
                        ...rawData
                    });

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этой новости");
                }

            } catch (err) {
                console.error('Ошибка при загрузке проекта:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/career-req/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            router.push(`/admin/career-requirements/view-career-req/${id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p className="p-6">Загрузка...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Career Req</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="w-fit">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Career:
                                </label>
                                <select
                                    id="career_id"
                                    name="career_id"
                                    value={String(data.career_id)}
                                    onChange={(e) => setData((prev) => ({...prev, career_id: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200"
                                >
                                    <option value="">Select career</option>
                                    {career.map((c) => (
                                        <option key={c.id} value={String(c.id)}>
                                            {c.en} / {c.tk} / {c.ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Turkmen:</label>
                                <input
                                    id="career_req_tk"
                                    name="career_req_tk"
                                    value={data.career_req_tk}
                                    onChange={(e) => setData((prev) => ({...prev, career_req_tk: e.target.value}))}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">English:</label>
                                <input
                                    name="career_req_en"
                                    value={data.career_req_en}
                                    onChange={(e) => setData((prev) => ({...prev, career_req_en: e.target.value}))}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">Russian:</label>
                                <input
                                    name="career_req_ru"
                                    value={data.career_req_ru}
                                    onChange={(e) => setData((prev) => ({...prev, career_req_ru: e.target.value}))}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2" />
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCareerReq;
