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
const nextConfig: NextConfig = {
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
