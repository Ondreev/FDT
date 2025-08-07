// restaurantConfig.js - Централизованное управление конфигурацией ресторанов

// Базовые настройки приложения
export const BASE_CONFIG = {
  // API настройки
  API_URL: 'https://script.google.com/macros/s/AKfycbzzjx5LgoYFNYW3FITXl26O7H3tXUSu71gQgHsyz607DD8Vnw_i_Wg8zdyqeVARAR_E/exec',
  
  // Настройки приложения
  VERSION: '2.0.0',
  
  // Таймауты и интервалы
  AUTO_REFRESH_INTERVAL: 30000, // 30 секунд
  REQUEST_TIMEOUT: 10000, // 10 секунд
  
  // Настройки уведомлений
  TYPING_SPEED: 50, // скорость печати бота
  
  // Другие настройки
  MAX_STATUS_CHANGES_HISTORY: 1000,
  
  // Разработка/продакшн
  DEBUG: false,
  
  // Цвета статусов по умолчанию
  DEFAULT_STATUS_COLORS: {
    pending: '#ffa500',
    cooking: '#ff7f32', 
    delivering: '#0099ff',
    done: '#28a745',
    archived: '#6c757d'
  },

  // Настройки доставки по умолчанию
  DEFAULT_DELIVERY: {
    threshold: 2000,
    cost: 200,
    freeDeliveryText: 'Бесплатная доставка от 2000 ₽'
  },

  // Настройки таймеров по умолчанию
  DEFAULT_TIMERS: {
    flashDuration: 120, // секунды
    deliveryDuration: 180 // секунды
  }
};

// Конфигурации для разных ресторанов
export const RESTAURANT_CONFIGS = {
  // Пример конфигурации ресторана 1
  restaurant1: {
    id: 'restaurant1',
    name: 'Пицца Мастер',
    
    // Основные настройки
    appName: 'Пицца Мастер',
    projectTitle: 'Пицца Мастер - Доставка',
    logoUrl: 'https://example.com/logo1.png',
    
    // Визуальные настройки
    primaryColor: '#ff7f32',
    backgroundColor: '#fdf0e2',
    font: 'Fredoka',
    currency: '₽',
    
    // Настройки доставки
    delivery: {
      threshold: 1500,
      cost: 150,
      freeDeliveryText: 'Бесплатная доставка от 1500 ₽'
    },
    
    // Контактная информация
    contact: {
      phone: '+7 (999) 123-45-67',
      address: 'ул. Примерная, 1',
      workingHours: 'Ежедневно с 10:00 до 23:00'
    },
    
    // Настройки заказа
    order: {
      minOrderAmount: 500,
      maxOrderAmount: 10000,
      estimatedDeliveryTime: '30-60 минут'
    },

    // Специальные маркеры товаров
    productMarkers: {
      flash: 'R1500',
      hot: 'H',
      new: 'N'
    },

    // Настройки скидок
    discounts: {
      enabled: true,
      levels: [
        { threshold: 1000, percent: 5 },
        { threshold: 2000, percent: 10 },
        { threshold: 3000, percent: 15 }
      ]
    }
  },

  // Пример конфигурации ресторана 2  
  restaurant2: {
    id: 'restaurant2',
    name: 'Суши Хаус',
    
    // Основные настройки
    appName: 'Суши Хаус',
    projectTitle: 'Суши Хаус - Доставка',
    logoUrl: 'https://example.com/logo2.png',
    
    // Визуальные настройки
    primaryColor: '#2d5aa0',
    backgroundColor: '#f0f4f8',
    font: 'Roboto',
    currency: '₽',
    
    // Настройки доставки
    delivery: {
      threshold: 2500,
      cost: 300,
      freeDeliveryText: 'Бесплатная доставка от 2500 ₽'
    },
    
    // Контактная информация
    contact: {
      phone: '+7 (999) 987-65-43',
      address: 'пр. Суши, 15',
      workingHours: 'Ежедневно с 11:00 до 22:00'
    },
    
    // Настройки заказа
    order: {
      minOrderAmount: 800,
      maxOrderAmount: 15000,
      estimatedDeliveryTime: '45-75 минут'
    },

    // Специальные маркеры товаров
    productMarkers: {
      flash: 'R2500',
      hot: 'H',
      new: 'N'
    },

    // Настройки скидок
    discounts: {
      enabled: true,
      levels: [
        { threshold: 1500, percent: 7 },
        { threshold: 3000, percent: 12 },
        { threshold: 5000, percent: 18 }
      ]
    }
  }
};

// Класс для управления конфигурацией ресторанов
export class RestaurantConfigManager {
  constructor() {
    this.currentRestaurantId = this.getCurrentRestaurantId();
    this.config = null;
    this.googleSheetsConfig = null;
  }

  // Получить ID текущего ресторана из URL или localStorage
  getCurrentRestaurantId() {
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantFromUrl = urlParams.get('restaurant');
    
    if (restaurantFromUrl) {
      localStorage.setItem('currentRestaurant', restaurantFromUrl);
      return restaurantFromUrl;
    }
    
    // Проверяем localStorage
    const restaurantFromStorage = localStorage.getItem('currentRestaurant');
    if (restaurantFromStorage) {
      return restaurantFromStorage;
    }
    
    // По умолчанию используем первый ресторан
    return 'restaurant1';
  }

  // Установить текущий ресторан
  setCurrentRestaurant(restaurantId) {
    if (RESTAURANT_CONFIGS[restaurantId]) {
      this.currentRestaurantId = restaurantId;
      localStorage.setItem('currentRestaurant', restaurantId);
      // Перезагружаем страницу для применения новой конфигурации
      window.location.reload();
    } else {
      console.error(`Restaurant config not found: ${restaurantId}`);
    }
  }

  // Получить конфигурацию текущего ресторана
  getCurrentConfig() {
    if (!this.config) {
      const baseConfig = RESTAURANT_CONFIGS[this.currentRestaurantId];
      if (!baseConfig) {
        console.error(`Restaurant config not found: ${this.currentRestaurantId}`);
        return RESTAURANT_CONFIGS.restaurant1; // fallback
      }
      
      // Объединяем базовую конфигурацию с настройками из Google таблицы
      this.config = {
        ...BASE_CONFIG,
        ...baseConfig,
        ...(this.googleSheetsConfig || {})
      };
    }
    
    return this.config;
  }

  // Загрузить настройки из Google таблицы
  async loadGoogleSheetsConfig() {
    try {
      const response = await fetch(`${BASE_CONFIG.API_URL}?action=getRestaurantSettings&restaurantId=${this.currentRestaurantId}`);
      if (response.ok) {
        const data = await response.json();
        this.googleSheetsConfig = data;
        this.config = null; // Сбрасываем кэш для пересчета
        return this.getCurrentConfig();
      }
    } catch (error) {
      console.error('Error loading Google Sheets config:', error);
    }
    
    return this.getCurrentConfig();
  }

  // Сохранить настройки в Google таблицу
  async saveGoogleSheetsConfig(configUpdates) {
    try {
      const response = await fetch(`${BASE_CONFIG.API_URL}?action=updateRestaurantSettings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: this.currentRestaurantId,
          settings: configUpdates
        })
      });
      
      if (response.ok) {
        // Обновляем локальную конфигурацию
        this.googleSheetsConfig = { ...this.googleSheetsConfig, ...configUpdates };
        this.config = null; // Сбрасываем кэш
        return true;
      }
    } catch (error) {
      console.error('Error saving Google Sheets config:', error);
    }
    
    return false;
  }

  // Получить список всех доступных ресторанов
  getAvailableRestaurants() {
    return Object.keys(RESTAURANT_CONFIGS).map(id => ({
      id,
      name: RESTAURANT_CONFIGS[id].name,
      appName: RESTAURANT_CONFIGS[id].appName
    }));
  }

  // Получить API URL с параметрами ресторана
  getApiUrl(action, additionalParams = {}) {
    const params = new URLSearchParams({
      action,
      restaurantId: this.currentRestaurantId,
      ...additionalParams
    });
    
    return `${BASE_CONFIG.API_URL}?${params.toString()}`;
  }

  // Получить настройки для конкретного компонента
  getComponentConfig(componentName) {
    const config = this.getCurrentConfig();
    
    switch (componentName) {
      case 'delivery':
        return {
          threshold: config.delivery?.threshold || BASE_CONFIG.DEFAULT_DELIVERY.threshold,
          cost: config.delivery?.cost || BASE_CONFIG.DEFAULT_DELIVERY.cost,
          freeText: config.delivery?.freeDeliveryText || BASE_CONFIG.DEFAULT_DELIVERY.freeDeliveryText
        };
        
      case 'timers':
        return {
          flashDuration: config.productMarkers?.flashDuration || BASE_CONFIG.DEFAULT_TIMERS.flashDuration,
          deliveryDuration: config.delivery?.estimatedTime || BASE_CONFIG.DEFAULT_TIMERS.deliveryDuration
        };
        
      case 'visual':
        return {
          primaryColor: config.primaryColor,
          backgroundColor: config.backgroundColor,
          font: config.font,
          logoUrl: config.logoUrl
        };
        
      default:
        return config;
    }
  }
}

// Создаем глобальный экземпляр менеджера конфигурации
export const restaurantConfig = new RestaurantConfigManager();

// Экспортируем для обратной совместимости
export const API_URL = BASE_CONFIG.API_URL;
export const CONFIG = BASE_CONFIG;