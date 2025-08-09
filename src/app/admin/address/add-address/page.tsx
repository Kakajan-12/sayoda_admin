'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor  from '@/Components/TipTapEditor';

const AddAddress = () => {
    const [isClient, setIsClient] = useState(false);
    const [iframe, setIframe] = useState('');
    const [address_tk, setAddressTk] = useState('');
    const [address_en, setAddressEn] = useState('');
    const [address_ru, setAddressRu] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No token. User is not authenticated.');
            return;
        }

        const formData = new FormData();
        formData.append('address_tk', address_tk);
        formData.append('address_en', address_en);
        formData.append('address_ru', address_ru);
        formData.append('iframe', iframe);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    address_tk,
                    address_en,
                    address_ru,
                    iframe,
                }),
            });


            if (response.ok) {
                const data = await response.json();
                console.log('data added successfully!', data);
                setAddressTk('');
                setAddressEn('');
                setAddressRu('');
                setIframe('');
                router.push('/admin/address');
            } else {
                const errorText = await response.text();
                console.error('Error adding:', errorText);
            }
        } catch (error) {
            console.error('Request error:', error);
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
                        <h2 className="text-2xl font-bold mb-4 text-left">Add New Address</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label
                                    className="block text-gray-700 font-semibold mb-2">Map:</label>
                                <textarea value={iframe}
                                          onChange={(e) => setIframe(e.target.value)}
                                          rows={10}
                                          required
                                          className="border border-gray-300 rounded p-2 w-full">

                            </textarea>
                            </div>
                        </div>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                    <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={address_tk}
                                                onChange={(content) => setAddressTk(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="English" />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={address_en}
                                                onChange={(content) => setAddressEn(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian" />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={address_ru}
                                                onChange={(content) => setAddressRu(content)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add Address
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAddress;
