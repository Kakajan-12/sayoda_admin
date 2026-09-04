import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DecodedToken {
    exp: number; // время истечения в секундах
    [key: string]: unknown;
}

/**
 * Читает полезную нагрузку JWT без проверки подписи.
 *
 * Раньше здесь подключался jsonwebtoken — серверная библиотека ради одного
 * вызова decode. В браузерный бандл она тянула цепочку зависимостей
 * с уязвимостями, хотя ничего, кроме разбора base64, не делала:
 * decode подпись не проверяет.
 *
 * Проверять её на клиенте и незачем — токен всё равно проверяет бэкенд
 * при каждом запросе. Здесь он нужен только чтобы показать срок действия
 * и вовремя увести на страницу входа.
 */
function decodeJwtPayload(token: string): DecodedToken | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        // base64url отличается от base64 двумя символами и отсутствием дополнения
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(''),
        );
        const parsed = JSON.parse(json);
        return typeof parsed?.exp === 'number' ? (parsed as DecodedToken) : null;
    } catch {
        return null;
    }
}

const TokenTimer = () => {
    const router = useRouter();
    const [expirationDate, setExpirationDate] = useState<string>('');
    const [isTokenValid, setIsTokenValid] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/');
            return;
        }

        const decoded = decodeJwtPayload(token);
        const currentTime = Date.now() / 1000;

        if (!decoded || decoded.exp < currentTime) {
            localStorage.removeItem('auth_token');
            router.push('/');
            setIsTokenValid(false);
            return;
        }

        setExpirationDate(new Date(decoded.exp * 1000).toLocaleString());
        setIsTokenValid(true);
    }, [router]);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
            <p className="text-lg mb-4">
                {isTokenValid
                    ? `Expiration Date: ${expirationDate}`
                    : 'Token is invalid or expired. Please log in again.'}
            </p>
        </div>
    );
};

export default TokenTimer;
