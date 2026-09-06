/**
 * Подписи интерфейса админки на двух языках.
 *
 * Интерфейс был наполовину английским (Add, View, Tours), наполовину русским —
 * это само по себе сбивало с толку. Держим все подписи в одном месте: так
 * видно, что переведено, а что забыли, и добавить третий язык позже —
 * это дописать одну колонку, а не искать строки по 77 страницам.
 *
 * Полноценный next-intl здесь не нужен: адрес страницы от языка не зависит,
 * админку не индексируют, а выбор языка — личная настройка редактора.
 */

export const LOCALES = ['ru', 'en'] as const;
export type AdminLocale = (typeof LOCALES)[number];

export const LOCALE_LABEL: Record<AdminLocale, string> = {
    ru: 'Русский',
    en: 'English',
};

/** Ключ хранится в браузере: язык — настройка человека, а не сервера. */
export const LOCALE_STORAGE_KEY = 'admin_locale';

type Dict = Record<string, { ru: string; en: string }>;

export const dictionary = {
    // ─── общее ───
    'common.add': { ru: 'Добавить', en: 'Add' },
    'common.edit': { ru: 'Изменить', en: 'Edit' },
    'common.delete': { ru: 'Удалить', en: 'Delete' },
    'common.save': { ru: 'Сохранить', en: 'Save' },
    'common.saving': { ru: 'Сохраняем…', en: 'Saving…' },
    'common.saved': { ru: 'Сохранено', en: 'Saved' },
    'common.cancel': { ru: 'Отмена', en: 'Cancel' },
    'common.back': { ru: 'Назад', en: 'Back' },
    'common.view': { ru: 'Открыть', en: 'View' },
    'common.search': { ru: 'Поиск', en: 'Search' },
    'common.loading': { ru: 'Загрузка…', en: 'Loading…' },
    'common.empty': { ru: 'Пока пусто', en: 'Nothing here yet' },
    'common.error': { ru: 'Не удалось загрузить данные', en: 'Failed to load data' },
    'common.retry': { ru: 'Повторить', en: 'Try again' },
    'common.confirmDelete': { ru: 'Удалить «{name}»?', en: 'Delete “{name}”?' },
    'common.image': { ru: 'Картинка', en: 'Image' },
    'common.order': { ru: 'Порядок', en: 'Order' },
    'common.actions': { ru: 'Действия', en: 'Actions' },
    'common.yes': { ru: 'Да', en: 'Yes' },
    'common.no': { ru: 'Нет', en: 'No' },

    // ─── языки контента ───
    'lang.tk': { ru: 'Туркменский', en: 'Turkmen' },
    'lang.en': { ru: 'Английский', en: 'English' },
    'lang.ru': { ru: 'Русский', en: 'Russian' },

    // ─── шапка ───
    'top.session': { ru: 'Сеанс до', en: 'Session until' },
    'top.logout': { ru: 'Выйти', en: 'Sign out' },
    'top.language': { ru: 'Язык интерфейса', en: 'Interface language' },
    'top.openSite': { ru: 'Открыть сайт', en: 'Open site' },

    // ─── разделы меню ───
    'nav.dashboard': { ru: 'Главная', en: 'Dashboard' },
    'nav.group.daily': { ru: 'Каждый день', en: 'Daily' },
    'nav.group.content': { ru: 'Контент сайта', en: 'Site content' },
    'nav.group.tours': { ru: 'Туры', en: 'Tours' },
    'nav.group.blog': { ru: 'Блог', en: 'Blog' },
    'nav.group.contacts': { ru: 'Контакты', en: 'Contacts' },

    'nav.requests': { ru: 'Заявки', en: 'Requests' },
    'nav.settings': { ru: 'Настройки', en: 'Settings' },
    'nav.banner': { ru: 'Главный баннер', en: 'Main banner' },
    'nav.sliders': { ru: 'Карточки на главной', en: 'Home cards' },
    'nav.destinations': { ru: 'Направления', en: 'Destinations' },
    'nav.faq': { ru: 'Частые вопросы', en: 'FAQ' },
    'nav.testimonials': { ru: 'Отзывы', en: 'Testimonials' },
    'nav.blogs': { ru: 'Статьи', en: 'Articles' },
    'nav.blogsGallery': { ru: 'Галерея статей', en: 'Article gallery' },
    'nav.tours': { ru: 'Туры', en: 'Tours' },
    'nav.tourTypes': { ru: 'Типы туров', en: 'Tour types' },
    'nav.tourCategory': { ru: 'Категории', en: 'Categories' },
    'nav.itinerary': { ru: 'Программа по дням', en: 'Itinerary' },
    'nav.includes': { ru: 'Что включено', en: 'Included' },
    'nav.excludes': { ru: 'Что не включено', en: 'Not included' },
    'nav.tourGallery': { ru: 'Галерея туров', en: 'Tour gallery' },
    'nav.tourLocation': { ru: 'Локации туров', en: 'Tour locations' },
    'nav.visa': { ru: 'Визовые требования', en: 'Visa requirements' },
    'nav.address': { ru: 'Адрес', en: 'Address' },
    'nav.mails': { ru: 'Почта', en: 'E-mail' },
    'nav.numbers': { ru: 'Телефоны', en: 'Phone numbers' },
    'nav.socialLinks': { ru: 'Соцсети', en: 'Social links' },
    'nav.locations': { ru: 'Точки на карте', en: 'Map locations' },

    // ─── дашборд ───
    'dash.title': { ru: 'Обзор', en: 'Overview' },
    'dash.hint': {
        ru: 'Что чаще всего нужно — вынесено сюда. Остальные разделы в меню слева.',
        en: 'The things you need most often are here. Everything else is in the menu.',
    },
    'dash.newRequests': { ru: 'Новые заявки', en: 'New requests' },
    'dash.requestsTotal': { ru: 'Всего заявок', en: 'Requests in total' },
    'dash.tours': { ru: 'Туров на сайте', en: 'Tours on the site' },
    'dash.blogs': { ru: 'Статей в блоге', en: 'Articles in the blog' },
    'dash.quick': { ru: 'Быстрый переход', en: 'Quick links' },
    'dash.checkRequests': { ru: 'Посмотреть заявки', en: 'Open requests' },

    // ─── вход ───
    'login.title': { ru: 'Панель управления Sayoda', en: 'Sayoda admin panel' },
    'login.username': { ru: 'Логин', en: 'Username' },
    'login.password': { ru: 'Пароль', en: 'Password' },
    'login.submit': { ru: 'Войти', en: 'Sign in' },
    'login.error': { ru: 'Неверный логин или пароль', en: 'Wrong username or password' },
} satisfies Dict;

export type DictKey = keyof typeof dictionary;
