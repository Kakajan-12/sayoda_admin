'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import {Editor} from '@tinymce/tinymce-react';

const AddEvent = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [tk, setTitleTk] = useState('');
    const [en, setTitleEn] = useState('');
    const [ru, setTitleRu] = useState('');
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [date, setDate] = useState(getTodayDate());
    const [location_tk, setLocationTk] = useState('');
    const [location_en, setLocationEn] = useState('');
    const [location_ru, setLocationRu] = useState('');
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [link, setLink] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('tk', tk ?? '');
        formData.append('en', en ?? '');
        formData.append('ru', ru ?? '');
        formData.append('date', date ?? '');
        formData.append('location_tk', location_tk ?? '');
        formData.append('location_en', location_en ?? '');
        formData.append('location_ru', location_ru ?? '');
        formData.append('text_tk', text_tk ?? '');
        formData.append('text_en', text_en ?? '');
        formData.append('text_ru', text_ru ?? '');
        formData.append('link', link ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upcoming-create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setDate('');
                setLocationTk('');
                setLocationEn('');
                setLocationRu('');
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setLink('');

                router.push('/admin/events');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении слайда:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    const editorConfig = {
        height: 200,
        menubar: false,
        plugins: ['lists link image editimage table code'],
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image code',
        content_css: '//www.tiny.cloud/css/codepen.min.css',
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form onSubmit={handleSubmit}
                          className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new event</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                    Image:
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div>
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
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Link:
                                </label>
                                <input
                                    type="text"
                                    id="link"
                                    name="link"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                        </div>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={tk}
                                                onEditorChange={(content) => setTitleTk(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Location</label>
                                            <input
                                                type="text"
                                                value={location_tk}
                                                onChange={(e) => setLocationTk(e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={text_tk}
                                                onEditorChange={(content) => setTextTk(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="English"
                                           />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={en}
                                                onEditorChange={(content) => setTitleEn(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Location</label>
                                            <input
                                                type="text"
                                                value={location_en}
                                                onChange={(e) => setLocationEn(e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={text_en}
                                                onEditorChange={(content) => setTextEn(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={ru}
                                                onEditorChange={(content) => setTitleRu(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Location</label>
                                            <input
                                                type="text"
                                                value={location_ru}
                                                onChange={(e) => setLocationRu(e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={text_ru}
                                                onEditorChange={(content) => setTextRu(content)}
                                            />
                                        </div>
                                    </div>
                                </div>


                            </>
                        )}

                        <button type="submit"
                                className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150">
                            Add event
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEvent;
