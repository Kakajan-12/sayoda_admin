'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddCareerReq = () => {
    const [career_req_tk, setTk] = useState('');
    const [career_req_en, setEn] = useState('');
    const [career_req_ru, setRu] = useState('');
    const [career_id, setCareerId] = useState('');
    const router = useRouter();
    const [careers, setCareers] = useState<
        { id: number; tk: string; en: string; ru: string }[]
    >([]);

    useEffect(() => {

        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setCareers(data);
                } else {
                    console.error('Неверный формат данных категорий:', data);
                }
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };


        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            career_req_tk,
            career_req_en,
            career_req_ru,
            career_id
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career-req`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Категория добавлена!', data);
                setTk('');
                setEn('');
                setRu('');
                setCareerId('');
                router.push('/admin/career-requirements');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении категории:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4">Add Career Requirements</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Turkmen:</label>
                            <input
                                value={career_req_tk}
                                onChange={(e) => setTk(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">English:</label>
                            <input
                                value={career_req_en}
                                onChange={(e) => setEn(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Russian:</label>
                            <input
                                value={career_req_ru}
                                onChange={(e) => setRu(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                News career:
                            </label>
                            <select
                                id="career_id"
                                name="career_id"
                                value={career_id}
                                onChange={(e) => setCareerId(e.target.value)}
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            >
                                <option value="">Select career</option>
                                {careers.map((career) => (
                                    <option key={career.id} value={career.id}>
                                        {career.tk} / {career.en} / {career.ru}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Career Requirements
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCareerReq;
