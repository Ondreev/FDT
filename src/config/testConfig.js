// testConfig.js - ТЕСТОВАЯ КОНФИГУРАЦИЯ (для безопасного тестирования)
// =====================================================================
// ИНСТРУКЦИЯ:
// 1. Этот файл для тестирования новой системы конфигурации
// 2. Основной проект остается нетронутым
// 3. Чтобы активировать тест, измените импорт в config.js
// =====================================================================

import { createClientConfig, PRESET_CONFIGS } from './universalConfig.js';

// =====================================================================
// ТЕСТОВЫЕ НАСТРОЙКИ - ЭКСПЕРИМЕНТИРУЙТЕ ЗДЕСЬ!
// =====================================================================

const TEST_SETTINGS = {
  // 🧪 ТЕСТ: Информация о бизнесе
  business: {
    name: '🧪 ТЕСТ: Пиццерия "Мама Мия"',
    appName: 'ТЕСТ: Мама Мия Пицца',
    projectTitle: 'ТЕСТ: Лучшая пицца в городе!',
    logoUrl: null,
    description: 'Тестовая конфигурация ресторана',
  },

  // 🧪 ТЕСТ: Контакты
  contact: {
    phone: '+7 (999) 999-99-99',
    email: 'test@restaurant.com',
    address: 'ул. Тестовая, 1',
    workingHours: 'ТЕСТ: Ежедневно с 9:00 до 24:00',
    website: null,
    socialMedia: {
      instagram: '@test_restaurant',
      telegram: '@test_bot'
    }
  },

  // 🧪 ТЕСТ: Визуальная тема
  theme: {
    scheme: 'purple',           // ТЕСТ: Меняйте на 'orange', 'blue', 'green', 'purple', 'red'
    typography: 'elegant',      // ТЕСТ: Меняйте на 'casual', 'professional', 'elegant', 'modern'
    
    // ТЕСТ: Кастомные цвета (раскомментируйте для теста)
    colors: {
      primary: '#9c27b0',      // ТЕСТ: Фиолетовый основной цвет
      // secondary: '#ba68c8',
      // background: '#f3e5f5'
    }
  },

  // 🧪 ТЕСТ: Доставка
  delivery: {
    enabled: true,
    threshold: 1500,            // ТЕСТ: Бесплатная доставка от 1500₽
    cost: 150,                  // ТЕСТ: Стоимость доставки 150₽
    currency: '₽',
    freeDeliveryText: 'ТЕСТ: Бесплатная доставка от 1500 ₽',
    estimatedTime: 'ТЕСТ: 25-45 минут',
  },

  // 🧪 ТЕСТ: Самовывоз
  pickup: {
    enabled: true,
    estimatedTime: 'ТЕСТ: 10-20 минут',
  },

  // 🧪 ТЕСТ: Заказы
  orders: {
    minAmount: 300,             // ТЕСТ: Минимальный заказ 300₽
    maxAmount: 25000,           // ТЕСТ: Максимальный заказ 25000₽
  },

  // 🧪 ТЕСТ: Маркеры товаров
  products: {
    markers: {
      flash: '🔥 АКЦИЯ',        // ТЕСТ: Эмодзи в маркерах
      hot: '🌶️ ОСТРОЕ',
      new: '✨ НОВИНКА',
      popular: '⭐ ХИТ',
      spicy: '🔥 ОГОНЬ',
      vegetarian: '🥬 ВЕГАН',
    },
    timers: {
      flashOfferDuration: 90,   // ТЕСТ: Флеш-предложение 90 сек
      deliveryOfferDuration: 150, // ТЕСТ: Предложение доставки 150 сек
    }
  },

  // 🧪 ТЕСТ: Скидки
  discounts: {
    enabled: true,
    levels: [                   // ТЕСТ: Измененные уровни скидок
      { threshold: 800, percent: 3, label: 'ТЕСТ: Скидка 3%' },
      { threshold: 1500, percent: 7, label: 'ТЕСТ: Скидка 7%' },
      { threshold: 2500, percent: 12, label: 'ТЕСТ: Скидка 12%' },
      { threshold: 4000, percent: 18, label: 'ТЕСТ: Скидка 18%' },
    ]
  },

  // 🧪 ТЕСТ: Статусы заказов
  orderStatuses: {
    enabled: ['pending', 'cooking', 'ready', 'delivering', 'delivered', 'cancelled'],
    custom: {
      pending: { label: 'ТЕСТ: Принят' },
      cooking: { label: 'ТЕСТ: Готовится' },
      ready: { label: 'ТЕСТ: Готов!' },
      delivering: { label: 'ТЕСТ: В пути' },
      delivered: { label: 'ТЕСТ: Доставлен' }
    }
  },

  // 🧪 ТЕСТ: Функции (попробуйте включить/выключить разные)
  features: {
    // Основные
    ENABLE_CART: true,
    ENABLE_CHECKOUT: true,
    ENABLE_USER_REGISTRATION: false,
    
    // Доставка
    ENABLE_DELIVERY: true,
    ENABLE_PICKUP: true,
    ENABLE_DELIVERY_TRACKING: true,    // ТЕСТ: Включаем отслеживание
    
    // Платежи
    ENABLE_CASH_PAYMENT: true,
    ENABLE_ONLINE_PAYMENT: true,       // ТЕСТ: Включаем онлайн-оплату
    ENABLE_CARD_PAYMENT: true,         // ТЕСТ: Включаем оплату картой
    
    // Маркетинг
    ENABLE_DISCOUNTS: true,
    ENABLE_FLASH_OFFERS: true,
    ENABLE_LOYALTY_PROGRAM: true,      // ТЕСТ: Включаем программу лояльности
    ENABLE_COUPONS: true,              // ТЕСТ: Включаем купоны
    
    // Социальные
    ENABLE_REVIEWS: true,
    ENABLE_RATINGS: true,
    ENABLE_SHARING: true,              // ТЕСТ: Включаем шаринг
    
    // Уведомления
    ENABLE_WHATSAPP_NOTIFICATIONS: true,
    ENABLE_SMS_NOTIFICATIONS: true,    // ТЕСТ: Включаем SMS
    ENABLE_EMAIL_NOTIFICATIONS: true,  // ТЕСТ: Включаем Email
    
    // Админ
    ENABLE_ADMIN_PANEL: true,
    ENABLE_INVENTORY_MANAGEMENT: true, // ТЕСТ: Включаем управление товарами
    ENABLE_REPORTING: true,            // ТЕСТ: Включаем отчеты
    
    // Аналитика
    ENABLE_ANALYTICS: true,            // ТЕСТ: Включаем аналитику
    
    // Интеграции
    ENABLE_GOOGLE_MAPS: true,          // ТЕСТ: Включаем карты
  },

  // 🧪 ТЕСТ: API (используем тестовый URL)
  api: {
    baseUrl: 'https://script.google.com/macros/s/AKfycbzzjx5LgoYFNYW3FITXl26O7H3tXUSu71gQgHsyz607DD8Vnw_i_Wg8zdyqeVARAR_E/exec',
    timeout: 15000,  // ТЕСТ: Увеличенный таймаут
  },

  integrations: {
    googleSheets: {
      enabled: true,
      spreadsheetId: 'test-spreadsheet-id',
    },
    analytics: {
      enabled: true,
      googleAnalyticsId: 'GA-TEST-123456',
    }
  },

  // 🧪 ТЕСТ: Системные настройки
  system: {
    AUTO_REFRESH_INTERVAL: 15000,      // ТЕСТ: Чаще обновляем (15 сек)
    REQUEST_TIMEOUT: 8000,
    CACHE_EXPIRY: 120000,              // ТЕСТ: Кэш 2 минуты
    DEBUG: true,                       // ТЕСТ: Включаем отладку
    ENABLE_LOGGING: true,
  }
};

// =====================================================================
// ТЕСТИРОВАНИЕ ПРЕСЕТОВ
// =====================================================================

// Раскомментируйте один из пресетов для тестирования:

// ТЕСТ: Пиццерия
// const TEST_PRESET = 'pizzeria';

// ТЕСТ: Суши-бар  
// const TEST_PRESET = 'sushi';

// ТЕСТ: Бургерная
// const TEST_PRESET = 'burger';

const TEST_PRESET = null; // Используем кастомные настройки

// =====================================================================
// ЭКСПОРТ ТЕСТОВОЙ КОНФИГУРАЦИИ
// =====================================================================

let finalConfig;

if (TEST_PRESET && PRESET_CONFIGS[TEST_PRESET]) {
  // Тестируем пресет с дополнениями
  const presetConfig = PRESET_CONFIGS[TEST_PRESET];
  const mergedConfig = {
    ...presetConfig,
    ...TEST_SETTINGS,
    business: { 
      ...presetConfig.business, 
      ...TEST_SETTINGS.business,
      name: `🧪 ТЕСТ: ${presetConfig.business.name}`  // Добавляем префикс ТЕСТ
    },
    features: { ...presetConfig.features, ...TEST_SETTINGS.features },
  };
  finalConfig = createClientConfig(mergedConfig);
} else {
  // Тестируем кастомные настройки
  finalConfig = createClientConfig(TEST_SETTINGS);
}

export const testConfig = finalConfig;
export const config = finalConfig.getConfig();
export const theme = finalConfig.getComponentConfig('theme');
export const business = finalConfig.getComponentConfig('business');
export const features = finalConfig.getComponentConfig('features');

// =====================================================================
// ТЕСТОВЫЕ УТИЛИТЫ
// =====================================================================

// Функция для вывода тестовой информации в консоль
export function logTestInfo() {
  console.group('🧪 ТЕСТОВАЯ КОНФИГУРАЦИЯ');
  console.log('📊 Полная конфигурация:', config);
  console.log('🎨 Тема:', theme);
  console.log('🏢 Бизнес:', business);
  console.log('⚙️ Функции:', features);
  console.log('🚩 Активные флаги:', Object.keys(features).filter(key => features[key]));
  console.groupEnd();
}

// Функция для сравнения с оригинальной конфигурацией
export function compareConfigs(originalConfig) {
  console.group('🔍 СРАВНЕНИЕ КОНФИГУРАЦИЙ');
  console.log('🧪 Тестовая:', config.business.name);
  console.log('📦 Оригинальная:', originalConfig.business?.name || 'Не задано');
  console.log('🎨 Тестовая тема:', config.theme.colors.primary);
  console.log('📦 Оригинальная тема:', originalConfig.theme?.colors?.primary || 'Не задано');
  console.groupEnd();
}

// =====================================================================
// ИНСТРУКЦИИ ПО ТЕСТИРОВАНИЮ
// =====================================================================

console.log(`
🧪 ТЕСТОВАЯ КОНФИГУРАЦИЯ ЗАГРУЖЕНА!

📋 Что тестируется:
✅ Фиолетовая цветовая схема (purple)
✅ Элегантные шрифты (elegant) 
✅ Измененные настройки доставки
✅ Дополнительные функции включены
✅ Кастомные маркеры с эмодзи
✅ Режим отладки включен

🔧 Как тестировать:
1. Измените настройки в TEST_SETTINGS
2. Перезагрузите страницу
3. Проверьте изменения в интерфейсе
4. Используйте logTestInfo() в консоли

⚠️ ВАЖНО: Это тестовая конфигурация!
Основной проект остается нетронутым.
`);

// Автоматически выводим информацию при загрузке
if (typeof window !== 'undefined') {
  setTimeout(() => {
    logTestInfo();
  }, 1000);
}