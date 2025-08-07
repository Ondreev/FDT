// config.js - Главный файл конфигурации приложения
// Адаптирован под реальную структуру Google Sheets API

// === ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ОСНОВНОЙ И ТЕСТОВОЙ КОНФИГУРАЦИЕЙ ===
// Для тестирования раскомментируйте строку ниже и закомментируйте основную:
// import { clientConfig, config, theme, business, features } from './config/testConfig.js';

// Основная конфигурация:
import { clientConfig, config, theme, business, features, getConfig, isFeatureEnabled, getTheme, getBusiness, getDelivery, getApiUrl } from './config/clientConfig.js';

// Экспортируем для обратной совместимости с существующим кодом
export const CONFIG = config;
export const API_URL = getApiUrl();
export const APP_NAME = () => getConfig('appName', 'Food Delivery');

// Новые экспорты
export { 
  clientConfig,
  config,
  theme, 
  business, 
  features,
  getConfig,
  isFeatureEnabled,
  getTheme,
  getBusiness,
  getDelivery,
  getApiUrl
};

// Экспортируем менеджер конфигурации как основной экспорт
export default clientConfig;
