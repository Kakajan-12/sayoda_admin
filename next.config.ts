import type { NextConfig } from "next";

/**
 * Файл с расширением .ts, но раньше использовал CommonJS-синтаксис
 * (module.exports) и не был типизирован — опечатка в названии опции никак
 * не проявлялась. Переведён на ESM с типом NextConfig.
 *
 * images.unoptimized оставлено намеренно: админка показывает загруженные
 * картинки в списках и превью, поисковой выдачи у неё нет, а оптимизатор
 * Next на Vercel тарифицируется по числу обработанных изображений.
 */
/**
 * Заголовки безопасности.
 *
 * Админка отдавала «Access-Control-Allow-Origin: *» и ни одного защитного
 * заголовка: страницу входа можно было поместить в чужой iframe и собрать
 * учётные данные поверх неё.
 *
 * Политика жёстче, чем на сайте: здесь нет ни чата, ни счётчика, ни карт —
 * нужен только собственный домен и API.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Админку нельзя вкладывать в iframe вообще
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Панель не должна попадать в поисковую выдачу
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://api.sayodatravel.com",
      "connect-src 'self' https://api.sayodatravel.com",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  /**
   * Куда складывать сборку. Обычно .next, но переменная позволяет увести её
   * в сторону.
   *
   * Это нужно не в работе, а при проверках. `next build` очищает папку
   * сборки целиком, а `next dev` держит своё хозяйство в .next/dev — в той
   * же папке. Сборка, запущенная рядом с работающим dev-сервером, сносит
   * каталог у него из-под ног, и dev падает на ровном месте, без внятной
   * ошибки. Разойтись по разным папкам дешевле, чем каждый раз гасить dev.
   *
   * На сервере и на Vercel переменная не задана, поэтому там всё
   * по-прежнему в .next.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.sayodatravel.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
