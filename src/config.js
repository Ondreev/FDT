// config.js - Централизованные настройки проекта (УСТАРЕЛ - используйте restaurantConfig.js)

// Импортируем новую систему конфигурации
import { restaurantConfig, BASE_CONFIG, API_URL as NEW_API_URL, CONFIG as NEW_CONFIG } from './config/restaurantConfig.js';

// Экспортируем для обратной совместимости
export const CONFIG = NEW_CONFIG;
export const API_URL = NEW_API_URL;
export const APP_NAME = () => restaurantConfig.getCurrentConfig().appName || 'Food Delivery';

// Экспортируем новый менеджер конфигурации
export { restaurantConfig };
