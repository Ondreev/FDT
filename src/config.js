// config.js - Централизованные настройки проекта

export const CONFIG = {
  // API настройки
  API_URL: 'https://script.google.com/macros/s/AKfycbxZq6NgsTcKNjmf1VsTsg2S7HYVVqYNCU1oe283xpjrL8RoXpjdhCJJI-f-hD7sAJk21w/exec',
  
  // Настройки приложения
  APP_NAME: 'Food Delivery',
  VERSION: '1.0.0',
  
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
  }
};

// Для удобства экспортируем отдельно самые часто используемые
export const API_URL = CONFIG.API_URL;
export const APP_NAME = CONFIG.APP_NAME;
