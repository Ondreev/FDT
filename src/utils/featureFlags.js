// featureFlags.js - Система флагов функций для динамического управления фичами

import { clientConfig } from '../config/clientConfig.js';

/**
 * Система флагов функций позволяет:
 * 1. Включать/отключать функции без изменения кода
 * 2. Делать A/B тестирование
 * 3. Постепенно внедрять новые функции
 * 4. Быстро отключать проблемные функции
 */

class FeatureFlagManager {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.listeners = new Map();
  }

  /**
   * Проверить включена ли функция
   * @param {string} flagName - Название флага
   * @returns {boolean} Состояние флага
   */
  isEnabled(flagName) {
    // Проверяем кэш
    if (this.cache.has(flagName)) {
      return this.cache.get(flagName);
    }

    // Получаем из конфигурации
    const features = this.config.getComponentConfig('features');
    const isEnabled = features[flagName] || false;

    // Кэшируем результат
    this.cache.set(flagName, isEnabled);

    return isEnabled;
  }

  /**
   * Установить состояние флага (для тестирования)
   * @param {string} flagName - Название флага
   * @param {boolean} enabled - Новое состояние
   */
  setFlag(flagName, enabled) {
    this.cache.set(flagName, enabled);
    this.notifyListeners(flagName, enabled);
  }

  /**
   * Подписаться на изменения флага
   * @param {string} flagName - Название флага
   * @param {Function} callback - Колбэк при изменении
   */
  subscribe(flagName, callback) {
    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, []);
    }
    this.listeners.get(flagName).push(callback);
  }

  /**
   * Отписаться от изменений флага
   * @param {string} flagName - Название флага
   * @param {Function} callback - Колбэк для удаления
   */
  unsubscribe(flagName, callback) {
    const callbacks = this.listeners.get(flagName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Уведомить слушателей об изменении флага
   * @param {string} flagName - Название флага
   * @param {boolean} enabled - Новое состояние
   */
  notifyListeners(flagName, enabled) {
    const callbacks = this.listeners.get(flagName);
    if (callbacks) {
      callbacks.forEach(callback => callback(enabled));
    }
  }

  /**
   * Очистить кэш флагов
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Получить все активные флаги
   * @returns {Object} Объект с активными флагами
   */
  getActiveFlags() {
    const features = this.config.getComponentConfig('features');
    const activeFlags = {};
    
    Object.keys(features).forEach(flagName => {
      if (this.isEnabled(flagName)) {
        activeFlags[flagName] = true;
      }
    });

    return activeFlags;
  }

  /**
   * Проверить группу флагов
   * @param {string[]} flagNames - Массив названий флагов
   * @param {string} mode - Режим: 'all' (все включены) или 'any' (любой включен)
   * @returns {boolean} Результат проверки
   */
  checkFlags(flagNames, mode = 'all') {
    if (mode === 'all') {
      return flagNames.every(flagName => this.isEnabled(flagName));
    } else if (mode === 'any') {
      return flagNames.some(flagName => this.isEnabled(flagName));
    }
    return false;
  }
}

// Создаем глобальный экземпляр
export const featureFlags = new FeatureFlagManager(clientConfig);

// ========================================
// ХЕЛПЕРЫ ДЛЯ ЧАСТО ИСПОЛЬЗУЕМЫХ ФЛАГОВ
// ========================================

// Основные функции
export const canUseCart = () => featureFlags.isEnabled('ENABLE_CART');
export const canCheckout = () => featureFlags.isEnabled('ENABLE_CHECKOUT');
export const canRegister = () => featureFlags.isEnabled('ENABLE_USER_REGISTRATION');

// Доставка и самовывоз
export const hasDelivery = () => featureFlags.isEnabled('ENABLE_DELIVERY');
export const hasPickup = () => featureFlags.isEnabled('ENABLE_PICKUP');
export const hasDeliveryTracking = () => featureFlags.isEnabled('ENABLE_DELIVERY_TRACKING');

// Платежи
export const hasOnlinePayment = () => featureFlags.isEnabled('ENABLE_ONLINE_PAYMENT');
export const hasCashPayment = () => featureFlags.isEnabled('ENABLE_CASH_PAYMENT');
export const hasCardPayment = () => featureFlags.isEnabled('ENABLE_CARD_PAYMENT');

// Маркетинг
export const hasDiscounts = () => featureFlags.isEnabled('ENABLE_DISCOUNTS');
export const hasFlashOffers = () => featureFlags.isEnabled('ENABLE_FLASH_OFFERS');
export const hasLoyaltyProgram = () => featureFlags.isEnabled('ENABLE_LOYALTY_PROGRAM');
export const hasCoupons = () => featureFlags.isEnabled('ENABLE_COUPONS');

// Социальные функции
export const hasReviews = () => featureFlags.isEnabled('ENABLE_REVIEWS');
export const hasRatings = () => featureFlags.isEnabled('ENABLE_RATINGS');
export const hasSharing = () => featureFlags.isEnabled('ENABLE_SHARING');

// Уведомления
export const hasWhatsAppNotifications = () => featureFlags.isEnabled('ENABLE_WHATSAPP_NOTIFICATIONS');
export const hasSMSNotifications = () => featureFlags.isEnabled('ENABLE_SMS_NOTIFICATIONS');
export const hasEmailNotifications = () => featureFlags.isEnabled('ENABLE_EMAIL_NOTIFICATIONS');

// Административные функции
export const hasAdminPanel = () => featureFlags.isEnabled('ENABLE_ADMIN_PANEL');
export const hasInventoryManagement = () => featureFlags.isEnabled('ENABLE_INVENTORY_MANAGEMENT');
export const hasReporting = () => featureFlags.isEnabled('ENABLE_REPORTING');

// Аналитика
export const hasAnalytics = () => featureFlags.isEnabled('ENABLE_ANALYTICS');

// ========================================
// REACT ХУКИ ДЛЯ ФЛАГОВ
// ========================================

import { useState, useEffect } from 'react';

/**
 * Хук для использования флага функции в React компонентах
 * @param {string} flagName - Название флага
 * @returns {boolean} Состояние флага
 */
export function useFeatureFlag(flagName) {
  const [enabled, setEnabled] = useState(() => featureFlags.isEnabled(flagName));

  useEffect(() => {
    const handleFlagChange = (newEnabled) => {
      setEnabled(newEnabled);
    };

    featureFlags.subscribe(flagName, handleFlagChange);

    return () => {
      featureFlags.unsubscribe(flagName, handleFlagChange);
    };
  }, [flagName]);

  return enabled;
}

/**
 * Хук для проверки группы флагов
 * @param {string[]} flagNames - Массив названий флагов
 * @param {string} mode - Режим: 'all' или 'any'
 * @returns {boolean} Результат проверки
 */
export function useFeatureFlags(flagNames, mode = 'all') {
  const [result, setResult] = useState(() => featureFlags.checkFlags(flagNames, mode));

  useEffect(() => {
    const checkFlags = () => {
      setResult(featureFlags.checkFlags(flagNames, mode));
    };

    // Подписываемся на изменения всех флагов в группе
    flagNames.forEach(flagName => {
      featureFlags.subscribe(flagName, checkFlags);
    });

    return () => {
      flagNames.forEach(flagName => {
        featureFlags.unsubscribe(flagName, checkFlags);
      });
    };
  }, [flagNames, mode]);

  return result;
}

// ========================================
// КОМПОНЕНТЫ ДЛЯ УСЛОВНОГО РЕНДЕРИНГА
// ========================================

/**
 * Компонент для условного рендеринга на основе флага
 * @param {Object} props - Пропы компонента
 * @param {string} props.flag - Название флага
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @param {React.ReactNode} props.fallback - Элемент для показа если флаг выключен
 */
export function FeatureFlag({ flag, children, fallback = null }) {
  const enabled = useFeatureFlag(flag);
  return enabled ? children : fallback;
}

/**
 * Компонент для условного рендеринга на основе группы флагов
 * @param {Object} props - Пропы компонента
 * @param {string[]} props.flags - Массив названий флагов
 * @param {string} props.mode - Режим: 'all' или 'any'
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @param {React.ReactNode} props.fallback - Элемент для показа если условие не выполнено
 */
export function FeatureFlags({ flags, mode = 'all', children, fallback = null }) {
  const enabled = useFeatureFlags(flags, mode);
  return enabled ? children : fallback;
}

// ========================================
// УТИЛИТЫ ДЛЯ РАЗРАБОТКИ
// ========================================

/**
 * Функция для отладки флагов (только в development)
 */
export function debugFlags() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.group('🚩 Feature Flags Debug');
  console.log('Active flags:', featureFlags.getActiveFlags());
  console.log('All features config:', clientConfig.getComponentConfig('features'));
  console.groupEnd();
}

/**
 * Функция для временного включения флага (только в development)
 * @param {string} flagName - Название флага
 * @param {boolean} enabled - Состояние
 */
export function setTestFlag(flagName, enabled) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('setTestFlag can only be used in development mode');
    return;
  }

  featureFlags.setFlag(flagName, enabled);
  console.log(`🚩 Test flag ${flagName} set to ${enabled}`);
}

// Экспортируем основной класс для расширенного использования
export { FeatureFlagManager };

// ========================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ========================================

/*

// В React компоненте:
import { useFeatureFlag, FeatureFlag, hasDiscounts } from './utils/featureFlags.js';

function MyComponent() {
  const canShowDiscounts = useFeatureFlag('ENABLE_DISCOUNTS');
  
  return (
    <div>
      {canShowDiscounts && <DiscountBanner />}
      
      <FeatureFlag flag="ENABLE_REVIEWS">
        <ReviewsSection />
      </FeatureFlag>
      
      <FeatureFlags flags={['ENABLE_CART', 'ENABLE_CHECKOUT']} mode="all">
        <ShoppingCart />
      </FeatureFlags>
    </div>
  );
}

// В обычном JS:
import { featureFlags, hasDelivery } from './utils/featureFlags.js';

if (hasDelivery()) {
  // Показать опции доставки
}

if (featureFlags.checkFlags(['ENABLE_ONLINE_PAYMENT', 'ENABLE_CARD_PAYMENT'], 'any')) {
  // Показать онлайн-платежи
}

// Для отладки в консоли браузера:
import { debugFlags, setTestFlag } from './utils/featureFlags.js';

debugFlags(); // Показать все флаги
setTestFlag('ENABLE_LOYALTY_PROGRAM', true); // Временно включить функцию

*/