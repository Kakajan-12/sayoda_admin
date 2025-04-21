'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddCareer = () => {
    const [tk, setTitleTk] = useState('');
    const [en, setTitleEn] = useState('');
    const [ru, setTitleRu] = useState('');
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [date, setDate] = useState(getTodayDate());

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const careerData = {
            tk: tk ?? '',
            en: en ?? '',
            ru: ru ?? '',
            date: date ?? '',
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(careerData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setDate('');
                router.push('/admin/career');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add career data</h2>

                        <div className="mb-4 space-y-4">
                            <div className="w-fit">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Date:
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Turkmen:</label>
                                <input
                                    value={tk}
                                    onChange={(e) => setTitleTk(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>


                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">English:</label>
                                <input
                                    value={en}
                                    onChange={(e) => setTitleEn(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>


                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Russian:</label>
                                <input
                                    value={ru}
                                    onChange={(e) => setTitleRu(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add career
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCareer;
