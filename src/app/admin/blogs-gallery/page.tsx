'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

type GalleryItem = {
    id: number;
    image: string;
    blog_id: number;
    blog_title_tk?: string;
    blog_title_en?: string;
    blog_title_ru?: string;
};

const BlogsGallery = () => {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-gallery`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setGallery(response.data);
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

        fetchGallery();
    }, [router]);

    const renderError = () => (
        <div className="text-red-500 py-4">
            <strong>Error: </strong>{error}
        </div>
    );

    if (error) return renderError();

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Blogs Gallery</h2>
                        <Link href="/admin/blogs-gallery/add-gallery"
                              className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center hover:bg-blue-700">
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
                        {gallery.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No sliders available</td>
                            </tr>
                        ) : (
                            gallery.map((data) => (
                                <tr key={data.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image}`}
                                            alt={`Gallery ${data.id}`}
                                            width={100}
                                            height={100}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: data.blog_title_tk || ''}}/>

                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: data.blog_title_en || ''}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: data.blog_title_ru || ''}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link href={`/admin/blogs-gallery/view-gallery/${data.id}`}
                                              className="bg text-white py-2 px-8 rounded-md cursor-pointer flex items-center hover:bg-green-700 w-fit">
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

export default BlogsGallery;
