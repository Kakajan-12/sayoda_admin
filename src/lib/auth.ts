export interface DecodedToken {
    /** Время истечения в секундах. */
    exp: number;
    [key: string]: unknown;
}

/**
 * Читает полезную нагрузку JWT без проверки подписи.
 *
 * Раньше ради одного вызова здесь подключался jsonwebtoken — серверная
 * библиотека, тянувшая в браузерный бандл цепочку зависимостей
 * с уязвимостями, хотя ничего, кроме разбора base64, не делала.
 *
 * Проверять подпись на клиенте и незачем: токен всё равно проверяет бэкенд
 * при каждом запросе. Здесь он нужен только чтобы показать срок действия
 * и вовремя увести на страницу входа.
 */
export function decodeJwtPayload(token: string): DecodedToken | null {
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

export const TOKEN_KEY = 'auth_token';

export const readToken = () =>
    typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
