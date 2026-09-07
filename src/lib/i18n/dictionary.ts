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

    'list.searchPlaceholder': { ru: 'Поиск по списку', en: 'Search the list' },
    'list.nothingFound': { ru: 'Ничего не найдено', en: 'Nothing found' },
    'list.count': { ru: 'Всего: {n}', en: 'Total: {n}' },
    'list.translations': { ru: 'Переводы', en: 'Translations' },
    'list.name': { ru: 'Название', en: 'Name' },
    'list.text': { ru: 'Текст', en: 'Text' },
    'list.deleting': { ru: 'Удаляем…', en: 'Deleting…' },
    'list.deleteFailed': { ru: 'Не удалось удалить', en: 'Could not delete' },
    'list.email': { ru: 'Почта', en: 'E-mail' },
    'list.phone': { ru: 'Телефон', en: 'Phone' },
    'list.link': { ru: 'Ссылка', en: 'Link' },
    'list.icon': { ru: 'Значок', en: 'Icon' },
    'list.city': { ru: 'Город', en: 'City' },
    'list.popular': { ru: 'Популярный', en: 'Popular' },
    'list.price': { ru: 'Цена', en: 'Price' },
    'list.map': { ru: 'Карта', en: 'Map' },
    'list.review': { ru: 'Отзыв', en: 'Review' },
    'list.author': { ru: 'Автор', en: 'Author' },
    'list.perPage': { ru: 'Показывать по', en: 'Rows per page' },
    'list.pageOf': { ru: 'Страница {page} из {pages}', en: 'Page {page} of {pages}' },
    'list.prevPage': { ru: 'Предыдущая страница', en: 'Previous page' },
    'list.nextPage': { ru: 'Следующая страница', en: 'Next page' },
    'list.shown': { ru: 'Показано {from}–{to} из {n}', en: 'Showing {from}–{to} of {n}' },


    // ─── формы ───
    'form.title': { ru: 'Заголовок', en: 'Title' },
    'form.text': { ru: 'Текст', en: 'Text' },
    'form.image': { ru: 'Картинка', en: 'Image' },
    'form.newImage': { ru: 'Новая картинка', en: 'New image' },
    'form.currentImage': { ru: 'Текущая картинка', en: 'Current image' },
    'form.map': { ru: 'Карта', en: 'Map' },
    'form.selectTour': { ru: 'Тур', en: 'Tour' },
    'form.selectType': { ru: 'Тип тура', en: 'Tour type' },
    'form.selectCategory': { ru: 'Категория', en: 'Category' },
    'form.selectLocation': { ru: 'Локация', en: 'Location' },
    // Отдельный ключ от form.selectLocation: тот выбирает точку на карте
    // в контактах, а здесь — страну из раздела «Направления».
    'form.selectDestination': { ru: 'Направление', en: 'Destination' },
    'form.selectBlog': { ru: 'Статья', en: 'Article' },
    'form.location': { ru: 'Локация', en: 'Location' },
    'form.price': { ru: 'Цена', en: 'Price' },
    'form.popular': { ru: 'Показывать в «Популярных»', en: 'Show in “Popular”' },
    'form.date': { ru: 'Дата', en: 'Date' },
    'form.icon': { ru: 'Значок', en: 'Icon' },
    'form.url': { ru: 'Ссылка', en: 'Link' },
    'form.email': { ru: 'Почта', en: 'E-mail' },
    'form.phone': { ru: 'Телефон', en: 'Phone' },
    'form.backToList': { ru: '← К списку', en: '← Back to list' },
    'form.addTitle': { ru: 'Новая запись', en: 'New entry' },
    'form.editTitle': { ru: 'Редактирование', en: 'Editing' },

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
    'nav.visa': { ru: 'Визовые требования', en: 'Visa requirements' },
    'nav.address': { ru: 'Адрес', en: 'Address' },
    'nav.mails': { ru: 'Почта', en: 'E-mail' },
    'nav.numbers': { ru: 'Телефоны', en: 'Phone numbers' },
    'nav.socialLinks': { ru: 'Соцсети', en: 'Social links' },
    'nav.locations': { ru: 'Точки на карте', en: 'Map locations' },

    // ─── заявки ───
    'req.date': { ru: 'Дата', en: 'Date' },
    'req.type': { ru: 'Откуда', en: 'Source' },
    'req.name': { ru: 'Имя', en: 'Name' },
    'req.contacts': { ru: 'Контакты', en: 'Contacts' },
    'req.subject': { ru: 'Тур или тема', en: 'Tour or subject' },
    'req.status': { ru: 'Статус', en: 'Status' },
    'req.allStatuses': { ru: 'Все статусы', en: 'All statuses' },
    'req.empty': { ru: 'Заявок пока нет', en: 'No requests yet' },
    'req.status.new': { ru: 'Новая', en: 'New' },
    'req.status.in_progress': { ru: 'В работе', en: 'In progress' },
    'req.status.done': { ru: 'Обработана', en: 'Done' },
    'req.status.spam': { ru: 'Спам', en: 'Spam' },

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

    // ─── посещаемость ───
    'traffic.title': { ru: 'Посещаемость', en: 'Traffic' },
    'traffic.viewsToday': { ru: 'Просмотров сегодня', en: 'Views today' },
    'traffic.visitorsToday': { ru: 'Посетителей сегодня', en: 'Visitors today' },
    'traffic.viewsPeriod': { ru: 'Просмотров за период', en: 'Views in the period' },
    'traffic.viewsTotal': { ru: 'Просмотров всего', en: 'Views in total' },
    'traffic.views': { ru: 'Просмотры', en: 'Views' },
    'traffic.visitors': { ru: 'Посетители', en: 'Visitors' },
    'traffic.days7': { ru: '7 дней', en: '7 days' },
    'traffic.days30': { ru: '30 дней', en: '30 days' },
    'traffic.days90': { ru: '90 дней', en: '90 days' },
    'traffic.topPages': { ru: 'Популярные страницы', en: 'Top pages' },
    'traffic.sources': { ru: 'Откуда приходят', en: 'Where visitors come from' },
    'traffic.languages': { ru: 'Языки страниц', en: 'Page languages' },
    'traffic.empty': {
        ru: 'Пока нет данных. Счётчик считает с момента установки — цифры появятся, когда на сайт зайдут.',
        en: 'No data yet. The counter starts from the moment it was installed — numbers will appear once people visit.',
    },
    'traffic.error': {
        ru: 'Не удалось загрузить статистику.',
        en: 'Could not load the statistics.',
    },
    'traffic.hint': {
        ru: 'Просмотр — открытие страницы. Посетитель — уникальный за день: один человек за день считается один раз, сколько бы страниц ни открыл.',
        en: 'A view is a page opening. A visitor is unique per day: one person counts once a day no matter how many pages they open.',
    },
    'traffic.noSources': {
        ru: 'Переходов с других сайтов пока не было — заходят по прямой ссылке.',
        en: 'No referrals from other sites yet — visitors arrive directly.',
    },

    "set.intro": { ru: "Значения подхватываются сайтом автоматически. Пустые поля нигде не выводятся.", en: "The site picks these up automatically. Empty fields are not shown anywhere." },
    "set.ga4.hint": { ru: "Пока не задан, счётчик на сайте не подключается и заявки нельзя посчитать.", en: "Until this is set the counter is not loaded and enquiries cannot be measured." },
    "set.whatsapp.hint": { ru: "Номер в международном формате. Если пусто, кнопка использует основной телефон компании.", en: "International format. If empty, the button falls back to the main company phone." },
    "set.tawk.label": { ru: "Чат Tawk.to", en: "Tawk.to chat" },
    "set.tawk.hint": { ru: "Tawk.to → Administration → Channels → Chat Widget. Можно вставить ссылку целиком или пару propertyId/widgetId. Не подходит API-ключ из Property Settings — в нём нет косой черты. Пусто — чат не показывается.", en: "Tawk.to → Administration → Channels → Chat Widget. Paste the whole link or the propertyId/widgetId pair. The API key from Property Settings will not work — it has no slash. Empty means no chat." },
    "set.legal.label": { ru: "Юридическое название", en: "Legal company name" },
    "set.legal.hint": { ru: "Выводится в футере и в разметке TravelAgency. Пустое значение не выводится.", en: "Shown in the footer and in the TravelAgency markup. Left out when empty." },
    "set.license.label": { ru: "Номер лицензии туроператора", en: "Tour operator licence number" },
    "set.license.hint": { ru: "Сигнал доверия: турист переводит крупную сумму незнакомой компании.", en: "A trust signal: the traveller is sending a large sum to a company they do not know." },
    "set.founded.label": { ru: "Год основания", en: "Year founded" },
    "set.founded.hint": { ru: "Идёт в foundingDate в schema.org.", en: "Goes into foundingDate in schema.org." },
    "set.err.tawk": { ru: "Не похоже на код виджета: в нём должна быть косая черта между двумя идентификаторами. Похоже, вставлен API-ключ — возьмите код из Administration → Channels → Chat Widget.", en: "This does not look like a widget code: it must contain a slash between two identifiers. Looks like an API key — take the code from Administration → Channels → Chat Widget." },
    "set.err.ga4": { ru: "Идентификатор GA4 начинается с «G-». Счётчик с другим значением не подключится.", en: "A GA4 ID starts with G-. Anything else will not load the counter." },
    "set.err.phone": { ru: "Слишком короткий номер — кнопка WhatsApp его не примет.", en: "The number is too short — the WhatsApp button will not accept it." },
    "set.err.load": { ru: "Ошибка при получении настроек", en: "Could not load the settings" },
    "set.err.save": { ru: "Не удалось сохранить настройки", en: "Could not save the settings" },
    "ban.intro": { ru: "Первый экран главной страницы. Изменения появятся на сайте в течение минуты. Пустое поле — сайт покажет текст по умолчанию.", en: "The first screen of the home page. Changes appear on the site within a minute. An empty field falls back to the default text." },
    "ban.background": { ru: "Фоновая картинка", en: "Background image" },
    "ban.noImage": { ru: "Своя картинка не загружена — используется картинка из вёрстки", en: "No image uploaded — the built-in one is used" },
    "ban.imageHint": { ru: "JPG, PNG или WebP, до 10 МБ. Лучше горизонтальная, от 1920px по ширине: она растягивается на весь экран.", en: "JPG, PNG or WebP, up to 10 MB. Landscape, at least 1920px wide — it covers the whole screen." },
    "ban.reset": { ru: "Вернуть картинку по умолчанию", en: "Restore the default image" },
    "ban.heading": { ru: "Заголовок", en: "Heading" },
    "ban.subtitle": { ru: "Подзаголовок", en: "Subheading" },
    "ban.buttonText": { ru: "Надпись на кнопке", en: "Button label" },
    "ban.buttonLink": { ru: "Куда ведёт кнопка", en: "Where the button leads" },
    "ban.buttonHint": { ru: "Путь внутри сайта без языка: /tours, /contacts. Язык подставится сам.", en: "A path inside the site without the locale: /tours, /contacts. The locale is added automatically." },
    "ban.err.load": { ru: "Ошибка при загрузке баннера", en: "Could not load the banner" },
    "ban.err.save": { ru: "Не удалось сохранить баннер", en: "Could not save the banner" },
    "ban.err.reset": { ru: "Не удалось вернуть картинку по умолчанию", en: "Could not restore the default image" },
    "dest.intro": { ru: "Страницы стран: описание, разделы и информация о визе.", en: "Country pages: description, sections and visa information." },
    "dest.sections": { ru: "Разделов", en: "Sections" },
    "dest.url": { ru: "Адрес", en: "URL" },
    "dest.empty": { ru: "Пока нет стран", en: "No countries yet" },
    "dest.confirmDelete": { ru: "Удалить «{name}» вместе со всеми разделами?", en: "Delete “{name}” with all of its sections?" },
    "faq.intro": { ru: "Блок в конце главной страницы. Эти же вопросы поисковик может показать прямо в выдаче, поэтому пишите ответы обычным текстом, без ссылок и списков.", en: "The block at the end of the home page. Search engines can show these questions directly in the results, so write plain-text answers without links or lists." },
    "faq.empty": { ru: "Пока ни одного вопроса. Блок на сайте не выводится, пока он пуст.", en: "No questions yet. The block stays hidden on the site while it is empty." },
    "faq.question": { ru: "Вопрос", en: "Question" },
    "faq.answer": { ru: "Ответ", en: "Answer" },
    "faq.newItem": { ru: "Новый вопрос", en: "New question" },
    "faq.addItem": { ru: "Добавить вопрос", en: "Add a question" },
    "faq.orderHint": { ru: "Меньше — выше в списке.", en: "Lower number, higher in the list." },
    "faq.needQuestion": { ru: "Заполните вопрос хотя бы на одном языке", en: "Fill in the question in at least one language" },
    "faq.added": { ru: "Вопрос добавлен", en: "Question added" },
    "faq.langLabel": { ru: "Язык:", en: "Language:" },
    "faq.err.load": { ru: "Ошибка при загрузке вопросов", en: "Could not load the questions" },
    "faq.err.save": { ru: "Не удалось сохранить", en: "Could not save" },
    "faq.err.delete": { ru: "Не удалось удалить", en: "Could not delete" },

    // ─── вход ───
    'login.title': { ru: 'Панель управления Sayoda', en: 'Sayoda admin panel' },
    'login.username': { ru: 'Логин', en: 'Username' },
    'login.password': { ru: 'Пароль', en: 'Password' },
    'login.submit': { ru: 'Войти', en: 'Sign in' },
    'login.error': { ru: 'Неверный логин или пароль', en: 'Wrong username or password' },
} satisfies Dict;

export type DictKey = keyof typeof dictionary;
