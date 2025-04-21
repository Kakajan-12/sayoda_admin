import React from "react";
import {
    BriefcaseIcon,
    CalendarIcon, ClipboardDocumentCheckIcon, EnvelopeIcon, ListBulletIcon, MapIcon,
    MapPinIcon,
    NewspaperIcon, PhotoIcon, PresentationChartLineIcon, QuestionMarkCircleIcon,
    UserPlusIcon,
    WindowIcon
} from "@heroicons/react/16/solid";
import { usePathname } from 'next/navigation';


const Sidebar = () => {
    const pathname = usePathname();
    const isActive = (basePath: string) => {
        return pathname === basePath || pathname.startsWith(`${basePath}/`);
    };


    return (
        <aside className="w-64 bg-white shadow-md h-screen fixed" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto">
                <ul className="space-y-2 font-medium">
                    <li>
                        <a href="/admin" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                            <span className="ml-3">Dashboard</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/sliders') ? 'bg text-white' : 'color'} `}>
                        <WindowIcon className={`size-6 ${isActive('/admin/sliders') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/sliders" className="w-full">
                            <span className="ml-3">Sliders</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/events') ? 'bg text-white' : 'color'} `}>
                        <CalendarIcon className={`size-6 ${isActive('/admin/events') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/events"
                           className="w-full">
                            <span className="ml-3">Upcoming Events</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/news') ? 'bg text-white' : 'color'} `}>
                        <NewspaperIcon className={`size-6 ${isActive('/admin/news') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/news"
                           className="w-full">
                            <span className="ml-3">News</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/news-category') ? 'bg text-white' : 'color'} `}>
                        <NewspaperIcon className={`size-6 ${isActive('/admin/news-category') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/news-category"
                           className="w-full">
                            <span className="ml-3">News Category</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/projects') ? 'bg text-white' : 'color'} `}>
                        <BriefcaseIcon className={`size-6 ${isActive('/admin/projects') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/projects"
                           className="w-full">
                            <span className="ml-3">Projects</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/locations') ? 'bg text-white' : 'color'} `}>
                        <MapPinIcon className={`size-6 ${isActive('/admin/locations') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/locations"
                           className="w-full">
                            <span className="ml-3">Locations</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/partners') ? 'bg text-white' : 'color'} `}>
                        <UserPlusIcon className={`size-6 ${isActive('/admin/partners') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/partners"
                           className="w-full">
                            <span className="ml-3">Partners</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/contacts') ? 'bg text-white' : 'color'} `}>
                        <MapIcon className={`size-6 ${isActive('/admin/contacts') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/contacts"
                           className="w-full">
                            <span className="ml-3">Contacts</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/gallery') ? 'bg text-white' : 'color'} `}>
                        <PhotoIcon className={`size-6 ${isActive('/admin/gallery') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/gallery"
                           className="w-full">
                            <span className="ml-3">Gallery</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/applied') ? 'bg text-white' : 'color'} `}>
                        <BriefcaseIcon className={`size-6 ${isActive('/admin/applied') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/applied"
                           className="w-full">
                            <span className="ml-3">Applied</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/career') ? 'bg text-white' : 'color'} `}>
                        <PresentationChartLineIcon className={`size-6 ${isActive('/admin/career') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/career"
                           className="w-full">
                            <span className="ml-3">Career</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/career-requirements') ? 'bg text-white' : 'color'} `}>
                        <ListBulletIcon className={`size-6 ${isActive('/admin/career-requirements') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/career-requirements"
                           className="w-full">
                            <span className="ml-3">Career Requirements</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/faq') ? 'bg text-white' : 'color'} `}>
                        <QuestionMarkCircleIcon className={`size-6 ${isActive('/admin/faq') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/faq"
                           className="w-full">
                            <span className="ml-3">FAQ</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/services') ? 'bg text-white' : 'color'} `}>
                        <ClipboardDocumentCheckIcon className={`size-6 ${isActive('/admin/services') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/services"
                           className="w-full">
                            <span className="ml-3">Services</span>
                        </a>
                    </li>
                    <li className={`flex items-center p-2 rounded-md font-semibold ${isActive('/admin/subscribes') ? 'bg text-white' : 'color'} `}>
                        <EnvelopeIcon className={`size-6 ${isActive('/admin/subscribes') ? 'text-white' : 'color'}`}/>
                        <a href="/admin/subscribes"
                           className="w-full">
                            <span className="ml-3">Subscribes</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    )
}

export default Sidebar;