// googleSheetsIntegration.js - Интеграция с Google таблицами для управления настройками ресторанов

import { BASE_CONFIG } from './restaurantConfig.js';

/**
 * Класс для работы с Google таблицами
 * Управляет настройками ресторанов через Google Sheets API
 */
export class GoogleSheetsIntegration {
  constructor(apiUrl = BASE_CONFIG.API_URL) {
    this.apiUrl = apiUrl;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 минут
  }

  /**
   * Получить настройки ресторана из Google таблицы
   * @param {string} restaurantId - ID ресторана
   * @returns {Promise<Object>} Настройки ресторана
   */
  async getRestaurantSettings(restaurantId) {
    const cacheKey = `settings_${restaurantId}`;
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const url = `${this.apiUrl}?action=getRestaurantSettings&restaurantId=${restaurantId}&t=${Date.now()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Кэшируем результат
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching restaurant settings:', error);
      return {};
    }
  }

  /**
   * Сохранить настройки ресторана в Google таблицу
   * @param {string} restaurantId - ID ресторана
   * @param {Object} settings - Настройки для сохранения
   * @returns {Promise<boolean>} Успешность операции
   */
  async saveRestaurantSettings(restaurantId, settings) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRestaurantSettings',
          restaurantId,
          settings,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Очищаем кэш для этого ресторана
      this.cache.delete(`settings_${restaurantId}`);
      
      return result.success || false;
    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      return false;
    }
  }

  /**
   * Получить список всех ресторанов из Google таблицы
   * @returns {Promise<Array>} Список ресторанов
   */
  async getRestaurantsList() {
    const cacheKey = 'restaurants_list';
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const url = `${this.apiUrl}?action=getRestaurantsList&t=${Date.now()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Кэшируем результат
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching restaurants list:', error);
      return [];
    }
  }

  /**
   * Создать новый ресторан в Google таблице
   * @param {Object} restaurantData - Данные нового ресторана
   * @returns {Promise<boolean>} Успешность операции
   */
  async createRestaurant(restaurantData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createRestaurant',
          restaurantData,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Очищаем кэш списка ресторанов
      this.cache.delete('restaurants_list');
      
      return result.success || false;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      return false;
    }
  }

  /**
   * Удалить ресторан из Google таблицы
   * @param {string} restaurantId - ID ресторана
   * @returns {Promise<boolean>} Успешность операции
   */
  async deleteRestaurant(restaurantId) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteRestaurant',
          restaurantId,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Очищаем кэш
      this.cache.delete(`settings_${restaurantId}`);
      this.cache.delete('restaurants_list');
      
      return result.success || false;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      return false;
    }
  }

  /**
   * Получить продукты для конкретного ресторана
   * @param {string} restaurantId - ID ресторана
   * @returns {Promise<Array>} Список продуктов
   */
  async getRestaurantProducts(restaurantId) {
    try {
      const url = `${this.apiUrl}?action=getProducts&restaurantId=${restaurantId}&t=${Date.now()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurant products:', error);
      return [];
    }
  }

  /**
   * Получить категории для конкретного ресторана
   * @param {string} restaurantId - ID ресторана
   * @returns {Promise<Array>} Список категорий
   */
  async getRestaurantCategories(restaurantId) {
    try {
      const url = `${this.apiUrl}?action=getCategories&restaurantId=${restaurantId}&t=${Date.now()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurant categories:', error);
      return [];
    }
  }

  /**
   * Получить заказы для конкретного ресторана
   * @param {string} restaurantId - ID ресторана
   * @returns {Promise<Array>} Список заказов
   */
  async getRestaurantOrders(restaurantId) {
    try {
      const url = `${this.apiUrl}?action=getOrders&restaurantId=${restaurantId}&t=${Date.now()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      return [];
    }
  }

  /**
   * Очистить кэш
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Получить статус подключения к Google таблице
   * @returns {Promise<boolean>} Статус подключения
   */
  async testConnection() {
    try {
      const url = `${this.apiUrl}?action=ping&t=${Date.now()}`;
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

/**
 * Хук для работы с Google таблицами в React компонентах
 * @param {string} restaurantId - ID ресторана
 * @returns {Object} Объект с методами и состоянием
 */
export function useGoogleSheetsIntegration(restaurantId) {
  const integration = new GoogleSheetsIntegration();
  
  return {
    // Методы
    getSettings: () => integration.getRestaurantSettings(restaurantId),
    saveSettings: (settings) => integration.saveRestaurantSettings(restaurantId, settings),
    getProducts: () => integration.getRestaurantProducts(restaurantId),
    getCategories: () => integration.getRestaurantCategories(restaurantId),
    getOrders: () => integration.getRestaurantOrders(restaurantId),
    
    // Административные методы
    getRestaurantsList: () => integration.getRestaurantsList(),
    createRestaurant: (data) => integration.createRestaurant(data),
    deleteRestaurant: (id) => integration.deleteRestaurant(id),
    
    // Утилиты
    clearCache: () => integration.clearCache(),
    testConnection: () => integration.testConnection()
  };
}

// Создаем глобальный экземпляр для использования в приложении
export const googleSheetsIntegration = new GoogleSheetsIntegration();