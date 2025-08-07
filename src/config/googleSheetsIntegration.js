// googleSheetsIntegration.js - Интеграция с Google таблицами
// Адаптировано под реальную структуру Google Apps Script API

import { useState, useEffect } from 'react';

/**
 * Класс для работы с Google таблицами через Apps Script API
 */
export class GoogleSheetsIntegration {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 минут
  }

  /**
   * Базовый метод для выполнения запросов к API
   */
  async makeRequest(action, params = {}) {
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const urlParams = new URLSearchParams({
        action,
        ...params,
        t: Date.now() // Предотвращение кэширования
      });
      
      const url = `${this.apiUrl}?${urlParams}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Кэшируем результат
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error(`Error in ${action}:`, error);
      throw error;
    }
  }

  /**
   * POST запрос к API
   */
  async makePostRequest(action, data) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`Error in POST ${action}:`, error);
      throw error;
    }
  }

  // === НАСТРОЙКИ (settings лист - ключ-значение) ===
  
  /**
   * Получить все настройки из листа settings
   */
  async getSettings() {
    return this.makeRequest('getSettings');
  }

  // === ПРОДУКТЫ ===
  
  /**
   * Получить все продукты
   */
  async getProducts() {
    return this.makeRequest('getProducts');
  }

  // === КАТЕГОРИИ ===
  
  /**
   * Получить все категории
   */
  async getCategories() {
    return this.makeRequest('getCategories');
  }

  // === СКИДКИ ===
  
  /**
   * Получить все скидки
   */
  async getDiscounts() {
    return this.makeRequest('getDiscounts');
  }

  // === СТАТУСЫ ЗАКАЗОВ ===
  
  /**
   * Получить метки статусов
   */
  async getStatusLabels() {
    return this.makeRequest('getStatusLabels');
  }

  // === АДМИНИСТРАТОРЫ ===
  
  /**
   * Получить список администраторов
   */
  async getAdmins() {
    return this.makeRequest('getAdmins');
  }

  // === ЗАКАЗЫ ===
  
  /**
   * Получить все заказы
   */
  async getOrders() {
    return this.makeRequest('getOrders');
  }

  /**
   * Создать новый заказ
   */
  async createOrder(orderData) {
    // Очищаем кэш заказов после создания
    this.clearCacheByPattern('getOrders');
    
    return this.makePostRequest('createOrder', orderData);
  }

  /**
   * Обновить статус заказа
   */
  async updateOrderStatus(orderId, status) {
    // Очищаем кэш заказов после обновления
    this.clearCacheByPattern('getOrders');
    
    return this.makeRequest('updateOrderStatus', { orderId, status });
  }

  // === ШАБЛОНЫ ПЕЧАТИ ===
  
  /**
   * Получить шаблоны печати
   */
  async getPrintTemplate() {
    return this.makeRequest('getPrintTemplate');
  }

  // === ОТЗЫВЫ ===
  
  /**
   * Получить отзывы
   */
  async getReviews() {
    return this.makeRequest('getReviews');
  }

  // === УТИЛИТЫ ===
  
  /**
   * Очистить весь кэш
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Очистить кэш по паттерну
   */
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Тест соединения с API
   */
  async testConnection() {
    try {
      const settings = await this.getSettings();
      return { 
        success: true, 
        message: 'Соединение успешно установлено',
        settingsCount: Object.keys(settings).length
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Ошибка соединения: ${error.message}` 
      };
    }
  }
}

// Создаем экземпляр интеграции (будет переопределен в clientConfig)
let googleSheetsIntegration = null;

/**
 * Инициализация интеграции с Google Sheets
 */
export function initializeGoogleSheetsIntegration(apiUrl) {
  googleSheetsIntegration = new GoogleSheetsIntegration(apiUrl);
  return googleSheetsIntegration;
}

/**
 * Получить экземпляр интеграции
 */
export function getGoogleSheetsIntegration() {
  if (!googleSheetsIntegration) {
    throw new Error('Google Sheets Integration not initialized. Call initializeGoogleSheetsIntegration first.');
  }
  return googleSheetsIntegration;
}

/**
 * React хук для работы с Google Sheets
 */
export function useGoogleSheetsIntegration() {
  return getGoogleSheetsIntegration();
}

/**
 * React хук для загрузки данных из Google Sheets
 */
export function useGoogleSheetsData(dataType, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const integration = useGoogleSheetsIntegration();

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        let result;
        switch (dataType) {
          case 'settings':
            result = await integration.getSettings();
            break;
          case 'products':
            result = await integration.getProducts();
            break;
          case 'categories':
            result = await integration.getCategories();
            break;
          case 'discounts':
            result = await integration.getDiscounts();
            break;
          case 'statusLabels':
            result = await integration.getStatusLabels();
            break;
          case 'admins':
            result = await integration.getAdmins();
            break;
          case 'orders':
            result = await integration.getOrders();
            break;
          case 'printTemplate':
            result = await integration.getPrintTemplate();
            break;
          case 'reviews':
            result = await integration.getReviews();
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, [dataType, integration, ...dependencies]);

  return { data, loading, error, refetch: () => {
    integration.clearCacheByPattern(dataType);
    // Перезагрузка произойдет автоматически через useEffect
  }};
}

// Экспортируем экземпляр для обратной совместимости
export { googleSheetsIntegration };