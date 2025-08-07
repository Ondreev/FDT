// universalConfig.js - Универсальная система конфигурации для любого заказчика

/**
 * СИСТЕМА КОНФИГУРАЦИИ ДЛЯ РАЗРАБОТЧИКОВ
 * 
 * Эта система позволяет настроить приложение под любого заказчика
 * без изменения кода. Все настройки вынесены в конфигурационные объекты.
 */

// ========================================
// БАЗОВЫЕ КОНСТАНТЫ СИСТЕМЫ
// ========================================

export const SYSTEM_DEFAULTS = {
  // Технические настройки
  AUTO_REFRESH_INTERVAL: 30000,
  REQUEST_TIMEOUT: 10000,
  CACHE_EXPIRY: 5 * 60 * 1000, // 5 минут
  MAX_STATUS_CHANGES_HISTORY: 1000,
  
  // Настройки UI
  TYPING_SPEED: 50,
  ANIMATION_DURATION: 300,
  
  // Отладка
  DEBUG: false,
  ENABLE_LOGGING: true
};

// ========================================
// УНИВЕРСАЛЬНАЯ ЦВЕТОВАЯ СХЕМА
// ========================================

export const COLOR_SCHEMES = {
  // Готовые цветовые схемы для быстрого старта
  orange: {
    primary: '#ff7f32',
    secondary: '#ff9a5a',
    background: '#fdf0e2',
    surface: '#fff5e6',
    text: '#2c1e0f',
    textSecondary: '#5c4022',
    success: '#28a745',
    warning: '#ffa500',
    error: '#dc3545',
    info: '#0099ff'
  },
  
  blue: {
    primary: '#2d5aa0',
    secondary: '#4a7bc8',
    background: '#f0f4f8',
    surface: '#ffffff',
    text: '#1a202c',
    textSecondary: '#4a5568',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce'
  },
  
  green: {
    primary: '#48bb78',
    secondary: '#68d391',
    background: '#f0fff4',
    surface: '#ffffff',
    text: '#1a202c',
    textSecondary: '#4a5568',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce'
  },
  
  purple: {
    primary: '#805ad5',
    secondary: '#9f7aea',
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#1a202c',
    textSecondary: '#4a5568',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce'
  },
  
  red: {
    primary: '#e53e3e',
    secondary: '#fc8181',
    background: '#fff5f5',
    surface: '#ffffff',
    text: '#1a202c',
    textSecondary: '#4a5568',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce'
  }
};

// ========================================
// ТИПОГРАФИКА И ШРИФТЫ
// ========================================

export const TYPOGRAPHY = {
  // Готовые наборы шрифтов
  casual: {
    primary: 'Fredoka',
    secondary: 'Nunito',
    googleFonts: 'Fredoka:300,400,500,600,700&family=Nunito:300,400,500,600,700'
  },
  
  professional: {
    primary: 'Roboto',
    secondary: 'Open Sans',
    googleFonts: 'Roboto:300,400,500,600,700&family=Open+Sans:300,400,500,600,700'
  },
  
  elegant: {
    primary: 'Montserrat',
    secondary: 'Lato',
    googleFonts: 'Montserrat:300,400,500,600,700&family=Lato:300,400,500,600,700'
  },
  
  modern: {
    primary: 'Inter',
    secondary: 'Source Sans Pro',
    googleFonts: 'Inter:300,400,500,600,700&family=Source+Sans+Pro:300,400,500,600,700'
  },
  
  // Размеры шрифтов
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem'      // 48px
  },
  
  // Веса шрифтов
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// ========================================
// СИСТЕМА СТАТУСОВ ЗАКАЗОВ
// ========================================

export const ORDER_STATUS_SYSTEM = {
  // Базовые статусы (можно расширять)
  statuses: {
    pending: {
      key: 'pending',
      label: 'В обработке',
      color: '#ffa500',
      icon: '⏳',
      description: 'Заказ принят и обрабатывается'
    },
    confirmed: {
      key: 'confirmed',
      label: 'Подтвержден',
      color: '#17a2b8',
      icon: '✅',
      description: 'Заказ подтвержден и передан в работу'
    },
    cooking: {
      key: 'cooking',
      label: 'Готовится',
      color: '#ff7f32',
      icon: '👨‍🍳',
      description: 'Заказ готовится на кухне'
    },
    ready: {
      key: 'ready',
      label: 'Готов',
      color: '#28a745',
      icon: '🍕',
      description: 'Заказ готов к выдаче/доставке'
    },
    delivering: {
      key: 'delivering',
      label: 'Доставляется',
      color: '#0099ff',
      icon: '🚚',
      description: 'Заказ в пути к клиенту'
    },
    delivered: {
      key: 'delivered',
      label: 'Доставлен',
      color: '#28a745',
      icon: '✅',
      description: 'Заказ успешно доставлен'
    },
    cancelled: {
      key: 'cancelled',
      label: 'Отменен',
      color: '#dc3545',
      icon: '❌',
      description: 'Заказ отменен'
    },
    archived: {
      key: 'archived',
      label: 'Архив',
      color: '#6c757d',
      icon: '📁',
      description: 'Заказ в архиве'
    }
  }
};

// ========================================
// СИСТЕМА ФУНКЦИОНАЛЬНЫХ ФЛАГОВ
// ========================================

export const FEATURE_FLAGS = {
  // Основные функции
  ENABLE_CART: true,
  ENABLE_CHECKOUT: true,
  ENABLE_USER_REGISTRATION: false,
  ENABLE_USER_PROFILES: false,
  
  // Доставка и самовывоз
  ENABLE_DELIVERY: true,
  ENABLE_PICKUP: true,
  ENABLE_DELIVERY_TRACKING: false,
  ENABLE_DELIVERY_TIME_SLOTS: false,
  
  // Платежи
  ENABLE_ONLINE_PAYMENT: false,
  ENABLE_CASH_PAYMENT: true,
  ENABLE_CARD_PAYMENT: false,
  ENABLE_CRYPTO_PAYMENT: false,
  
  // Маркетинг и акции
  ENABLE_DISCOUNTS: true,
  ENABLE_FLASH_OFFERS: true,
  ENABLE_LOYALTY_PROGRAM: false,
  ENABLE_REFERRAL_SYSTEM: false,
  ENABLE_COUPONS: false,
  
  // Социальные функции
  ENABLE_REVIEWS: true,
  ENABLE_RATINGS: true,
  ENABLE_SHARING: false,
  ENABLE_SOCIAL_LOGIN: false,
  
  // Уведомления
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_EMAIL_NOTIFICATIONS: false,
  ENABLE_WHATSAPP_NOTIFICATIONS: true,
  
  // Аналитика
  ENABLE_ANALYTICS: false,
  ENABLE_HEATMAPS: false,
  ENABLE_A_B_TESTING: false,
  
  // Административные функции
  ENABLE_ADMIN_PANEL: true,
  ENABLE_INVENTORY_MANAGEMENT: false,
  ENABLE_STAFF_MANAGEMENT: false,
  ENABLE_REPORTING: false,
  
  // Интеграции
  ENABLE_GOOGLE_MAPS: false,
  ENABLE_SOCIAL_MEDIA_INTEGRATION: false,
  ENABLE_CRM_INTEGRATION: false,
  ENABLE_ACCOUNTING_INTEGRATION: false
};

// ========================================
// НАСТРОЙКИ ДОСТАВКИ И ЗАКАЗОВ
// ========================================

export const DELIVERY_SETTINGS = {
  // Базовые настройки доставки
  defaultThreshold: 2000,
  defaultCost: 200,
  defaultCurrency: '₽',
  defaultFreeDeliveryText: 'Бесплатная доставка',
  
  // Временные настройки
  defaultDeliveryTime: '30-60 минут',
  defaultPickupTime: '15-30 минут',
  
  // Ограничения заказов
  defaultMinOrderAmount: 500,
  defaultMaxOrderAmount: 50000,
  
  // Рабочее время по умолчанию
  defaultWorkingHours: 'Ежедневно с 10:00 до 23:00'
};

// ========================================
// НАСТРОЙКИ ПРОДУКТОВ И МАРКЕРОВ
// ========================================

export const PRODUCT_SETTINGS = {
  // Маркеры товаров
  markers: {
    flash: 'FLASH',
    hot: 'HOT',
    new: 'NEW',
    popular: 'POPULAR',
    recommended: 'RECOMMENDED',
    spicy: 'SPICY',
    vegetarian: 'VEG',
    vegan: 'VEGAN',
    glutenFree: 'GF'
  },
  
  // Настройки таймеров
  timers: {
    flashOfferDuration: 120, // секунды
    deliveryOfferDuration: 180, // секунды
    cartAbandonmentTimer: 900 // 15 минут
  },
  
  // Настройки изображений
  images: {
    defaultPlaceholder: '/placeholder-food.jpg',
    maxSize: 1024 * 1024, // 1MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  }
};

// ========================================
// СИСТЕМА СКИДОК
// ========================================

export const DISCOUNT_SYSTEM = {
  // Типы скидок
  types: {
    percentage: 'percentage',
    fixed: 'fixed',
    freeDelivery: 'freeDelivery',
    buyOneGetOne: 'buyOneGetOne'
  },
  
  // Стандартные уровни скидок
  defaultLevels: [
    { threshold: 1000, percent: 5, label: 'Скидка 5%' },
    { threshold: 2000, percent: 10, label: 'Скидка 10%' },
    { threshold: 3000, percent: 15, label: 'Скидка 15%' },
    { threshold: 5000, percent: 20, label: 'Скидка 20%' }
  ]
};

// ========================================
// НАСТРОЙКИ ИНТЕРФЕЙСА
// ========================================

export const UI_SETTINGS = {
  // Анимации
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out'
  },
  
  // Размеры и отступы
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  // Радиусы скругления
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  // Тени
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// ========================================
// КЛАСС УНИВЕРСАЛЬНОГО КОНФИГУРАТОРА
// ========================================

export class UniversalConfig {
  constructor(clientConfig = {}) {
    this.clientConfig = clientConfig;
    this.compiledConfig = null;
  }

  // Компиляция конфигурации клиента
  compileConfig() {
    if (this.compiledConfig) {
      return this.compiledConfig;
    }

    const config = {
      // Системные настройки
      system: {
        ...SYSTEM_DEFAULTS,
        ...(this.clientConfig.system || {})
      },

      // Информация о бизнесе
      business: {
        name: 'Мой ресторан',
        appName: 'Доставка еды',
        projectTitle: 'Заказ онлайн',
        logoUrl: null,
        description: 'Лучшая еда в городе',
        ...(this.clientConfig.business || {})
      },

      // Контактная информация
      contact: {
        phone: '+7 (999) 000-00-00',
        email: 'info@restaurant.com',
        address: 'ул. Главная, 1',
        workingHours: DELIVERY_SETTINGS.defaultWorkingHours,
        website: null,
        socialMedia: {},
        ...(this.clientConfig.contact || {})
      },

      // Визуальная тема
      theme: this.compileTheme(),

      // Настройки доставки
      delivery: {
        enabled: FEATURE_FLAGS.ENABLE_DELIVERY,
        threshold: DELIVERY_SETTINGS.defaultThreshold,
        cost: DELIVERY_SETTINGS.defaultCost,
        currency: DELIVERY_SETTINGS.defaultCurrency,
        freeDeliveryText: DELIVERY_SETTINGS.defaultFreeDeliveryText,
        estimatedTime: DELIVERY_SETTINGS.defaultDeliveryTime,
        ...(this.clientConfig.delivery || {})
      },

      // Настройки самовывоза
      pickup: {
        enabled: FEATURE_FLAGS.ENABLE_PICKUP,
        estimatedTime: DELIVERY_SETTINGS.defaultPickupTime,
        ...(this.clientConfig.pickup || {})
      },

      // Настройки заказов
      orders: {
        minAmount: DELIVERY_SETTINGS.defaultMinOrderAmount,
        maxAmount: DELIVERY_SETTINGS.defaultMaxOrderAmount,
        ...(this.clientConfig.orders || {})
      },

      // Система статусов
      orderStatuses: this.compileOrderStatuses(),

      // Настройки продуктов
      products: {
        markers: {
          ...PRODUCT_SETTINGS.markers,
          ...(this.clientConfig.products?.markers || {})
        },
        timers: {
          ...PRODUCT_SETTINGS.timers,
          ...(this.clientConfig.products?.timers || {})
        },
        ...(this.clientConfig.products || {})
      },

      // Система скидок
      discounts: {
        enabled: FEATURE_FLAGS.ENABLE_DISCOUNTS,
        levels: DISCOUNT_SYSTEM.defaultLevels,
        ...(this.clientConfig.discounts || {})
      },

      // Функциональные флаги
      features: {
        ...FEATURE_FLAGS,
        ...(this.clientConfig.features || {})
      },

      // API настройки
      api: {
        baseUrl: null,
        timeout: SYSTEM_DEFAULTS.REQUEST_TIMEOUT,
        ...(this.clientConfig.api || {})
      },

      // Настройки интеграций
      integrations: {
        googleSheets: {
          enabled: true,
          spreadsheetId: null,
          ...(this.clientConfig.integrations?.googleSheets || {})
        },
        analytics: {
          enabled: FEATURE_FLAGS.ENABLE_ANALYTICS,
          googleAnalyticsId: null,
          ...(this.clientConfig.integrations?.analytics || {})
        },
        ...(this.clientConfig.integrations || {})
      }
    };

    this.compiledConfig = config;
    return config;
  }

  // Компиляция темы
  compileTheme() {
    const themeKey = this.clientConfig.theme?.scheme || 'orange';
    const baseColors = COLOR_SCHEMES[themeKey] || COLOR_SCHEMES.orange;
    
    const typographyKey = this.clientConfig.theme?.typography || 'casual';
    const baseTypography = TYPOGRAPHY[typographyKey] || TYPOGRAPHY.casual;

    return {
      // Цвета
      colors: {
        ...baseColors,
        ...(this.clientConfig.theme?.colors || {})
      },

      // Типографика
      typography: {
        ...baseTypography,
        sizes: TYPOGRAPHY.sizes,
        weights: TYPOGRAPHY.weights,
        ...(this.clientConfig.theme?.typography || {})
      },

      // UI элементы
      ui: {
        ...UI_SETTINGS,
        ...(this.clientConfig.theme?.ui || {})
      }
    };
  }

  // Компиляция системы статусов
  compileOrderStatuses() {
    const enabledStatuses = this.clientConfig.orderStatuses?.enabled || 
      ['pending', 'cooking', 'delivering', 'delivered', 'cancelled'];

    const customStatuses = this.clientConfig.orderStatuses?.custom || {};

    const statuses = {};
    
    enabledStatuses.forEach(statusKey => {
      if (ORDER_STATUS_SYSTEM.statuses[statusKey]) {
        statuses[statusKey] = {
          ...ORDER_STATUS_SYSTEM.statuses[statusKey],
          ...(customStatuses[statusKey] || {})
        };
      }
    });

    return statuses;
  }

  // Получить скомпилированную конфигурацию
  getConfig() {
    return this.compileConfig();
  }

  // Получить конфигурацию для конкретного компонента
  getComponentConfig(componentName) {
    const config = this.getConfig();
    
    switch (componentName) {
      case 'theme':
        return config.theme;
      case 'delivery':
        return config.delivery;
      case 'business':
        return config.business;
      case 'features':
        return config.features;
      default:
        return config[componentName] || {};
    }
  }

  // Проверить включена ли функция
  isFeatureEnabled(featureName) {
    const config = this.getConfig();
    return config.features[featureName] || false;
  }

  // Получить цвет из темы
  getThemeColor(colorName) {
    const theme = this.getComponentConfig('theme');
    return theme.colors[colorName] || theme.colors.primary;
  }

  // Получить размер шрифта
  getFontSize(sizeName) {
    const theme = this.getComponentConfig('theme');
    return theme.typography.sizes[sizeName] || theme.typography.sizes.base;
  }
}

// ========================================
// ЭКСПОРТ ДЛЯ РАЗРАБОТЧИКОВ
// ========================================

// Функция для создания конфигурации клиента
export function createClientConfig(clientSettings) {
  return new UniversalConfig(clientSettings);
}

// Готовые пресеты для быстрого старта
export const PRESET_CONFIGS = {
  // Пиццерия
  pizzeria: {
    business: {
      name: 'Пиццерия "Мама Мия"',
      appName: 'Мама Мия - Пицца',
      projectTitle: 'Лучшая пицца в городе'
    },
    theme: {
      scheme: 'orange',
      typography: 'casual'
    },
    products: {
      markers: {
        flash: 'ГОРЯЧАЯ',
        hot: 'ОСТРАЯ',
        popular: 'ХИТ'
      }
    }
  },

  // Суши-бар
  sushi: {
    business: {
      name: 'Суши Мастер',
      appName: 'Суши Мастер',
      projectTitle: 'Японская кухня'
    },
    theme: {
      scheme: 'blue',
      typography: 'elegant'
    },
    delivery: {
      threshold: 2500,
      cost: 300
    }
  },

  // Бургерная
  burger: {
    business: {
      name: 'Burger House',
      appName: 'Burger House',
      projectTitle: 'Сочные бургеры'
    },
    theme: {
      scheme: 'red',
      typography: 'modern'
    },
    products: {
      markers: {
        flash: 'ГОРЯЧИЙ',
        hot: 'ОСТРЫЙ',
        new: 'НОВИНКА'
      }
    }
  }
};

export default UniversalConfig;