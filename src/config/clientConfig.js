// clientConfig.js - ЕДИНСТВЕННЫЙ ФАЙЛ ДЛЯ НАСТРОЙКИ НОВОГО КЛИЕНТА
// Адаптировано под реальную структуру Google Sheets

import { initializeGoogleSheetsIntegration } from './googleSheetsIntegration.js';

/**
 * ОСНОВНАЯ КОНФИГУРАЦИЯ КЛИЕНТА
 * Измените только эти настройки для нового клиента
 */
const CLIENT_CONFIG = {
  // === API НАСТРОЙКИ ===
  // URL вашего Google Apps Script (замените на свой)
  apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
  
  // === ОСНОВНЫЕ НАСТРОЙКИ ПРИЛОЖЕНИЯ ===
  appName: 'Food Delivery',
  
  // === ЛОКАЛЬНЫЕ НАСТРОЙКИ (не из Google Sheets) ===
  // Эти настройки применяются до загрузки данных из Google Sheets
  local: {
    // Тема по умолчанию
    theme: {
      primaryColor: '#e74c3c',
      secondaryColor: '#2c3e50',
      backgroundColor: '#ffffff',
      textColor: '#333333'
    },
    
    // Настройки загрузки
    loading: {
      showSpinner: true,
      loadingText: 'Загрузка...'
    },
    
    // Настройки кэширования
    cache: {
      enabled: true,
      duration: 5 * 60 * 1000 // 5 минут
    }
  },

  // === ФУНКЦИИ ВКЛЮЧЕНЫ/ВЫКЛЮЧЕНЫ ===
  features: {
    delivery: true,
    pickup: true,
    reviews: true,
    discounts: true,
    adminPanel: true,
    printReceipts: true,
    upsell: true,
    flashOffers: true,
    promoActions: true // 1+1=3 и другие акции
  },

  // === НАСТРОЙКИ ТОВАРОВ И ID ПРЕФИКСОВ ===
  products: {
    // Можно переопределить конфигурацию префиксов через Google Sheets
    // Ключи в формате: product_prefix_H_label, product_prefix_H_color и т.д.
    enablePrefixSystem: true,
    
    // Настройки flash предложений
    flash: {
      discountPercent: 99, // Скидка для R2000 товаров
      timerDuration: 120   // Длительность таймера в секундах
    },
    
    // Настройки upsell
    upsell: {
      enabled: true,
      delayMs: 300, // Задержка перед показом upsell
      showForMainDishesOnly: true
    }
  }
};

/**
 * Класс для управления конфигурацией клиента
 */
class ClientConfigManager {
  constructor(config) {
    this.config = config;
    this.googleSheets = null;
    this.settings = {};
    this.isInitialized = false;
  }

  /**
   * Инициализация - подключение к Google Sheets
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Инициализируем Google Sheets интеграцию
      this.googleSheets = initializeGoogleSheetsIntegration(this.config.apiUrl);
      
      // Загружаем настройки из Google Sheets
      await this.loadSettingsFromGoogleSheets();
      
      this.isInitialized = true;
      console.log('✅ Client Config initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Client Config:', error);
      // Продолжаем работу с локальными настройками
      this.isInitialized = true;
    }
  }

  /**
   * Загрузка настроек из Google Sheets
   */
  async loadSettingsFromGoogleSheets() {
    try {
      this.settings = await this.googleSheets.getSettings();
      console.log('📊 Settings loaded from Google Sheets:', Object.keys(this.settings).length, 'keys');
    } catch (error) {
      console.warn('⚠️ Could not load settings from Google Sheets, using local config:', error.message);
      this.settings = {};
    }
  }

  /**
   * Получить значение настройки (сначала из Google Sheets, потом из локальной конфигурации)
   */
  get(key, defaultValue = null) {
    // Сначала проверяем Google Sheets настройки
    if (this.settings && this.settings.hasOwnProperty(key)) {
      return this.settings[key];
    }

    // Затем локальные настройки
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value.hasOwnProperty(k)) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Получить все настройки как объект
   */
  getAll() {
    return {
      ...this.config,
      sheets: this.settings
    };
  }

  /**
   * Проверить включена ли функция
   */
  isFeatureEnabled(featureName) {
    // Сначала проверяем в Google Sheets (с префиксом feature_)
    const sheetKey = `feature_${featureName}`;
    if (this.settings && this.settings.hasOwnProperty(sheetKey)) {
      return this.settings[sheetKey] === 'true' || this.settings[sheetKey] === true;
    }

    // Затем в локальных настройках
    return this.get(`features.${featureName}`, false);
  }

  /**
   * Получить тему
   */
  getTheme() {
    const theme = {
      primaryColor: this.get('primaryColor') || this.get('local.theme.primaryColor'),
      secondaryColor: this.get('secondaryColor') || this.get('local.theme.secondaryColor'),
      backgroundColor: this.get('backgroundColor') || this.get('local.theme.backgroundColor'),
      textColor: this.get('textColor') || this.get('local.theme.textColor'),
      
      // Дополнительные цвета из Google Sheets
      accentColor: this.get('accentColor'),
      errorColor: this.get('errorColor'),
      successColor: this.get('successColor'),
      warningColor: this.get('warningColor')
    };

    // Убираем undefined значения
    return Object.fromEntries(
      Object.entries(theme).filter(([_, value]) => value !== undefined && value !== null)
    );
  }

  /**
   * Получить настройки бизнеса
   */
  getBusiness() {
    return {
      name: this.get('businessName') || this.get('appName'),
      phone: this.get('businessPhone'),
      email: this.get('businessEmail'),
      address: this.get('businessAddress'),
      workingHours: this.get('workingHours'),
      description: this.get('businessDescription')
    };
  }

  /**
   * Получить настройки доставки
   */
  getDelivery() {
    return {
      enabled: this.isFeatureEnabled('delivery'),
      minOrder: parseFloat(this.get('deliveryMinOrder')) || 0,
      fee: parseFloat(this.get('deliveryFee')) || 0,
      freeFrom: parseFloat(this.get('deliveryFreeFrom')) || 0,
      zones: this.get('deliveryZones'),
      time: this.get('deliveryTime') || '30-60 минут'
    };
  }

  /**
   * Получить API URL
   */
  getApiUrl() {
    return this.config.apiUrl;
  }

  /**
   * Получить экземпляр Google Sheets интеграции
   */
  getGoogleSheets() {
    return this.googleSheets;
  }

  /**
   * Обновить кэш настроек
   */
  async refreshSettings() {
    if (this.googleSheets) {
      this.googleSheets.clearCache();
      await this.loadSettingsFromGoogleSheets();
    }
  }

  /**
   * Получить статус инициализации
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Получить настройки товаров
   */
  getProductSettings() {
    return {
      enablePrefixSystem: this.get('enablePrefixSystem') || this.get('products.enablePrefixSystem', true),
      flashDiscountPercent: parseFloat(this.get('flashDiscountPercent')) || this.get('products.flash.discountPercent', 99),
      flashTimerDuration: parseInt(this.get('flashTimerDuration')) || this.get('products.flash.timerDuration', 120),
      upsellEnabled: this.isFeatureEnabled('upsell') && (this.get('upsellEnabled') !== 'false'),
      upsellDelay: parseInt(this.get('upsellDelay')) || this.get('products.upsell.delayMs', 300)
    };
  }

  /**
   * Получить конфигурацию префикса товара из Google Sheets или локальных настроек
   */
  getProductPrefixConfig(prefix) {
    // Сначала проверяем Google Sheets (формат: product_prefix_H_label, product_prefix_H_color)
    const label = this.get(`product_prefix_${prefix}_label`);
    const color = this.get(`product_prefix_${prefix}_color`);
    const emoji = this.get(`product_prefix_${prefix}_emoji`);

    if (label || color || emoji) {
      return {
        label: label || `Префикс ${prefix}`,
        color: color || '#666666',
        emoji: emoji || '🏷️'
      };
    }

    // Возвращаем null, если нет кастомной конфигурации (будет использоваться дефолтная из productUtils)
    return null;
  }
}

// Создаем экземпляр менеджера конфигурации
export const clientConfig = new ClientConfigManager(CLIENT_CONFIG);

// Удобные экспорты для быстрого доступа
export const getConfig = (key, defaultValue) => clientConfig.get(key, defaultValue);
export const isFeatureEnabled = (feature) => clientConfig.isFeatureEnabled(feature);
export const getTheme = () => clientConfig.getTheme();
export const getBusiness = () => clientConfig.getBusiness();
export const getDelivery = () => clientConfig.getDelivery();
export const getApiUrl = () => clientConfig.getApiUrl();
export const getProductSettings = () => clientConfig.getProductSettings();
export const getProductPrefixConfig = (prefix) => clientConfig.getProductPrefixConfig(prefix);

// Экспортируем для совместимости с существующим кодом
export const config = clientConfig;
export const theme = getTheme;
export const business = getBusiness;
export const features = { isEnabled: isFeatureEnabled };

// Автоматическая инициализация при импорте
clientConfig.initialize().catch(console.error);

export default clientConfig;