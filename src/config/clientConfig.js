// clientConfig.js - ЕДИНСТВЕННЫЙ ФАЙЛ ДЛЯ НАСТРОЙКИ НОВОГО ЗАКАЗЧИКА
// =====================================================================
// ИНСТРУКЦИЯ ДЛЯ РАЗРАБОТЧИКА:
// 1. Скопируйте этот файл для нового проекта
// 2. Измените настройки ниже под требования заказчика
// 3. Никаких других файлов менять НЕ НУЖНО!
// =====================================================================

import { createClientConfig, PRESET_CONFIGS } from './universalConfig.js';

// =====================================================================
// БЫСТРЫЙ СТАРТ: Выберите готовый пресет или создайте свой
// =====================================================================

// Доступные пресеты: 'pizzeria', 'sushi', 'burger' или создайте свой
const USE_PRESET = null; // Установите 'pizzeria' для быстрого старта

// Если используете пресет, раскомментируйте эту строку:
// export const clientConfig = createClientConfig(PRESET_CONFIGS.pizzeria);

// =====================================================================
// КАСТОМНАЯ КОНФИГУРАЦИЯ ЗАКАЗЧИКА
// =====================================================================

const CLIENT_SETTINGS = {
  // 🏢 ИНФОРМАЦИЯ О БИЗНЕСЕ
  business: {
    name: 'Food Delivery',                    // Название ресторана
    appName: 'Food Delivery',                 // Название приложения
    projectTitle: 'Заказать еду онлайн',      // Заголовок на странице
    logoUrl: null,                            // URL логотипа или null
    description: 'Лучшая еда в городе',       // Описание бизнеса
  },

  // 📞 КОНТАКТНАЯ ИНФОРМАЦИЯ
  contact: {
    phone: '+7 (999) 123-45-67',             // Телефон для заказов
    email: 'info@restaurant.com',            // Email
    address: 'ул. Главная, 1',               // Адрес ресторана
    workingHours: 'Ежедневно с 10:00 до 23:00', // Время работы
    website: null,                            // Сайт или null
    socialMedia: {                            // Социальные сети
      instagram: null,
      facebook: null,
      vk: null,
      telegram: null
    }
  },

  // 🎨 ВИЗУАЛЬНАЯ ТЕМА
  theme: {
    scheme: 'orange',                         // Цветовая схема: 'orange', 'blue', 'green', 'purple', 'red'
    typography: 'casual',                     // Шрифты: 'casual', 'professional', 'elegant', 'modern'
    
    // Кастомные цвета (необязательно)
    colors: {
      // primary: '#ff7f32',                  // Основной цвет
      // background: '#fdf0e2',               // Цвет фона
      // text: '#2c1e0f'                      // Цвет текста
    }
  },

  // 🚚 НАСТРОЙКИ ДОСТАВКИ
  delivery: {
    enabled: true,                            // Включить доставку
    threshold: 2000,                          // Минимальная сумма для бесплатной доставки
    cost: 200,                                // Стоимость доставки
    currency: '₽',                            // Валюта
    freeDeliveryText: 'Бесплатная доставка от 2000 ₽', // Текст о бесплатной доставке
    estimatedTime: '30-60 минут',             // Время доставки
  },

  // 🏪 НАСТРОЙКИ САМОВЫВОЗА
  pickup: {
    enabled: true,                            // Включить самовывоз
    estimatedTime: '15-30 минут',             // Время готовности заказа
  },

  // 📦 НАСТРОЙКИ ЗАКАЗОВ
  orders: {
    minAmount: 500,                           // Минимальная сумма заказа
    maxAmount: 50000,                         // Максимальная сумма заказа
  },

  // 🏷️ МАРКЕРЫ ТОВАРОВ
  products: {
    markers: {
      flash: 'FLASH',                         // Маркер flash-товаров
      hot: 'HOT',                             // Маркер горячих товаров
      new: 'NEW',                             // Маркер новых товаров
      popular: 'POPULAR',                     // Маркер популярных товаров
      spicy: 'ОСТРОЕ',                        // Маркер острых блюд
      vegetarian: 'ВЕГ',                      // Маркер вегетарианских блюд
    },
    timers: {
      flashOfferDuration: 120,                // Длительность flash-предложения (секунды)
      deliveryOfferDuration: 180,             // Длительность предложения доставки (секунды)
    }
  },

  // 💰 СИСТЕМА СКИДОК
  discounts: {
    enabled: true,                            // Включить скидки
    levels: [                                 // Уровни скидок
      { threshold: 1000, percent: 5, label: 'Скидка 5%' },
      { threshold: 2000, percent: 10, label: 'Скидка 10%' },
      { threshold: 3000, percent: 15, label: 'Скидка 15%' },
    ]
  },

  // 📊 СТАТУСЫ ЗАКАЗОВ
  orderStatuses: {
    // Включенные статусы (можно убрать ненужные)
    enabled: ['pending', 'cooking', 'delivering', 'delivered', 'cancelled'],
    
    // Кастомные названия статусов (необязательно)
    custom: {
      // pending: { label: 'Принят' },
      // cooking: { label: 'На кухне' },
      // delivering: { label: 'В пути' }
    }
  },

  // ⚙️ ФУНКЦИОНАЛЬНЫЕ ВОЗМОЖНОСТИ
  features: {
    // Основные функции
    ENABLE_CART: true,                        // Корзина
    ENABLE_CHECKOUT: true,                    // Оформление заказа
    ENABLE_USER_REGISTRATION: false,          // Регистрация пользователей
    
    // Доставка
    ENABLE_DELIVERY: true,                    // Доставка
    ENABLE_PICKUP: true,                      // Самовывоз
    ENABLE_DELIVERY_TRACKING: false,          // Отслеживание доставки
    
    // Платежи
    ENABLE_ONLINE_PAYMENT: false,             // Онлайн-оплата
    ENABLE_CASH_PAYMENT: true,                // Оплата наличными
    ENABLE_CARD_PAYMENT: false,               // Оплата картой
    
    // Маркетинг
    ENABLE_DISCOUNTS: true,                   // Скидки
    ENABLE_FLASH_OFFERS: true,                // Flash-предложения
    ENABLE_LOYALTY_PROGRAM: false,            // Программа лояльности
    ENABLE_COUPONS: false,                    // Купоны
    
    // Социальные функции
    ENABLE_REVIEWS: true,                     // Отзывы
    ENABLE_RATINGS: true,                     // Рейтинги
    ENABLE_SHARING: false,                    // Поделиться
    
    // Уведомления
    ENABLE_WHATSAPP_NOTIFICATIONS: true,      // WhatsApp уведомления
    ENABLE_SMS_NOTIFICATIONS: false,          // SMS уведомления
    ENABLE_EMAIL_NOTIFICATIONS: false,        // Email уведомления
    
    // Административные функции
    ENABLE_ADMIN_PANEL: true,                 // Админ-панель
    ENABLE_INVENTORY_MANAGEMENT: false,       // Управление товарами
    ENABLE_REPORTING: false,                  // Отчеты
    
    // Аналитика
    ENABLE_ANALYTICS: false,                  // Аналитика
    
    // Интеграции
    ENABLE_GOOGLE_MAPS: false,                // Google Maps
  },

  // 🔗 API И ИНТЕГРАЦИИ
  api: {
    baseUrl: 'https://script.google.com/macros/s/AKfycbzzjx5LgoYFNYW3FITXl26O7H3tXUSu71gQgHsyz607DD8Vnw_i_Wg8zdyqeVARAR_E/exec',
    timeout: 10000,                           // Таймаут запросов (мс)
  },

  integrations: {
    googleSheets: {
      enabled: true,                          // Интеграция с Google Sheets
      spreadsheetId: null,                    // ID таблицы (необязательно)
    },
    analytics: {
      enabled: false,                         // Google Analytics
      googleAnalyticsId: null,                // ID аналитики
    }
  },

  // 🔧 СИСТЕМНЫЕ НАСТРОЙКИ (редко нужно менять)
  system: {
    AUTO_REFRESH_INTERVAL: 30000,             // Интервал обновления данных (мс)
    REQUEST_TIMEOUT: 10000,                   // Таймаут запросов (мс)
    CACHE_EXPIRY: 300000,                     // Время жизни кэша (мс)
    DEBUG: false,                             // Режим отладки
    ENABLE_LOGGING: true,                     // Логирование
  }
};

// =====================================================================
// ЭКСПОРТ КОНФИГУРАЦИИ
// =====================================================================

// Если используете пресет:
if (USE_PRESET && PRESET_CONFIGS[USE_PRESET]) {
  // Объединяем пресет с кастомными настройками
  const presetConfig = PRESET_CONFIGS[USE_PRESET];
  const mergedConfig = {
    ...presetConfig,
    ...CLIENT_SETTINGS,
    // Глубокое слияние для вложенных объектов
    business: { ...presetConfig.business, ...CLIENT_SETTINGS.business },
    contact: { ...presetConfig.contact, ...CLIENT_SETTINGS.contact },
    theme: { ...presetConfig.theme, ...CLIENT_SETTINGS.theme },
    delivery: { ...presetConfig.delivery, ...CLIENT_SETTINGS.delivery },
    features: { ...presetConfig.features, ...CLIENT_SETTINGS.features },
  };
  export const clientConfig = createClientConfig(mergedConfig);
} else {
  // Используем только кастомные настройки
  export const clientConfig = createClientConfig(CLIENT_SETTINGS);
}

// Экспорт для удобства разработки
export const config = clientConfig.getConfig();
export const theme = clientConfig.getComponentConfig('theme');
export const business = clientConfig.getComponentConfig('business');
export const features = clientConfig.getComponentConfig('features');

// =====================================================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ В КОДЕ:
// =====================================================================
/*

// Получить конфигурацию
import { clientConfig, config, theme, features } from './config/clientConfig.js';

// Проверить включена ли функция
if (clientConfig.isFeatureEnabled('ENABLE_DISCOUNTS')) {
  // Показать скидки
}

// Получить цвет из темы
const primaryColor = clientConfig.getThemeColor('primary');

// Получить размер шрифта
const fontSize = clientConfig.getFontSize('lg');

// Получить полную конфигурацию
const fullConfig = clientConfig.getConfig();

// Получить конфигурацию компонента
const deliveryConfig = clientConfig.getComponentConfig('delivery');

*/

// =====================================================================
// ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ:
// =====================================================================
/*

1. НАСТРОЙКА GOOGLE SHEETS:
   - Создайте Google таблицу
   - Настройте Google Apps Script
   - Укажите URL в api.baseUrl

2. НАСТРОЙКА ДОМЕНА:
   - Загрузите файлы на хостинг
   - Настройте домен
   - Проверьте HTTPS

3. ТЕСТИРОВАНИЕ:
   - Проверьте все функции
   - Протестируйте на мобильных устройствах
   - Убедитесь в работе интеграций

4. ЗАПУСК:
   - Включите нужные функции в features
   - Настройте аналитику (если нужно)
   - Обучите персонал работе с админ-панелью

*/