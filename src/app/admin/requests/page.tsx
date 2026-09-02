'use client'
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";

/**
 * Заявки с сайта.
 *
 * Раньше заявка существовала только в виде письма на info@sayodatravel.com —
 * если письмо не дошло, лид пропадал. Здесь видно все заявки из базы,
 * включая те, по которым письмо отправить не удалось (значок предупреждения).
 */

interface RequestItem {
    id: number;
    type: string;
    gender: string | null;
    first_name: string | null;
    last_name: string | null;
    citizenship: string | null;
    email: string | null;
    phone: string | null;
    tour: string | null;
    travelers: string | null;
    subject: string | null;
    message: string | null;
    mail_sent: number;
    mail_error: string | null;
    status: string;
    locale: string | null;
    page_url: string | null;
    created_at: string;
}

const STATUSES = ['new', 'in_progress', 'done', 'spam'] as const;

const STATUS_STYLES: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
    spam: 'bg-gray-200 text-gray-600',
};

const Requests = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: statusFilter ? { status: statusFilter } : {},
                },
            );
            setRequests(response.data);
            setError(null);
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error(axiosError);
            if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                router.push("/");
                return;
            }
            setError("Ошибка при получении данных");
        }
    }, [router, statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const changeStatus = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status } : r)),
            );
        } catch (err) {
            console.error(err);
            setError("Не удалось изменить статус");
        }
    };

    const fullName = (r: RequestItem) =>
        [r.gender, r.first_name, r.last_name].filter(Boolean).join(' ') || '—';

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Requests</h2>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded-md px-4 py-2 bg-white"
                        >
                            <option value="">All statuses</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Date</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Type</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Name</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Contacts</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Tour / Subject</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">No requests yet</td>
                            </tr>
                        ) : (
                            requests.map((r) => (
                                <React.Fragment key={r.id}>
                                    <tr
                                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        <td className="py-3 px-4 border-b border-gray-200 whitespace-nowrap">
                                            {new Date(r.created_at).toLocaleString()}
                                            {/* Письмо не ушло — заявку легко пропустить, помечаем явно */}
                                            {!r.mail_sent && (
                                                <span title={r.mail_error || 'Notification email was not sent'}>
                                                    <ExclamationTriangleIcon className="size-4 inline ml-2 text-amber-500"/>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-200">{r.type}</td>
                                        <td className="py-3 px-4 border-b border-gray-200">{fullName(r)}</td>
                                        <td className="py-3 px-4 border-b border-gray-200">
                                            {r.email && <div><a href={`mailto:${r.email}`} className="text-blue-600">{r.email}</a></div>}
                                            {r.phone && <div><a href={`tel:${r.phone}`} className="text-blue-600">{r.phone}</a></div>}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-200">{r.tour || r.subject || '—'}</td>
                                        <td className="py-3 px-4 border-b border-gray-200">
                                            <select
                                                value={r.status}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => changeStatus(r.id, e.target.value)}
                                                className={`rounded-md px-2 py-1 text-sm ${STATUS_STYLES[r.status] || ''}`}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    {expandedId === r.id && (
                                        <tr>
                                            <td colSpan={6} className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                                                <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                    {r.citizenship && (<><dt className="font-semibold">Citizenship</dt><dd>{r.citizenship}</dd></>)}
                                                    {r.travelers && (<><dt className="font-semibold">Travelers</dt><dd>{r.travelers}</dd></>)}
                                                    {r.locale && (<><dt className="font-semibold">Language</dt><dd>{r.locale}</dd></>)}
                                                    {r.page_url && (<><dt className="font-semibold">Page</dt><dd className="break-all">{r.page_url}</dd></>)}
                                                    {r.mail_error && (<><dt className="font-semibold text-amber-700">Mail error</dt><dd className="text-amber-700">{r.mail_error}</dd></>)}
                                                </dl>
                                                {r.message && (
                                                    <div className="mt-4">
                                                        <div className="font-semibold text-sm mb-1">Message</div>
                                                        <p className="whitespace-pre-wrap text-sm">{r.message}</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Requests;
