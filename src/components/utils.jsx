// utils.js - Утилиты и всп// utils.jsx - Утилиты и вспомогательные функции
import { API_URL } from '../config';

export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'Нет времени';
  
  try {
    if (typeof dateStr === 'string' && dateStr.includes('.') && dateStr.includes(':') && !dateStr.includes('T')) {
      return dateStr;
    }
    
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return String(dateStr);
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateStr);
  }
};

export const saveStatusChange = async (orderId, newStatus, oldStatus) => {
  // Простая функция - больше ничего не делаем, так как время записывается в Google Apps Script
  try {
    return true;
  } catch (error) {
    console.error('Error saving status change:', error);
    return false;
  }
};

// ✅ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ СТАТУСА ЗАКАЗА
export const updateOrderStatusRequest = async (orderId, newStatus) => {
  try {
    const url = `${API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${newStatus}&t=${Date.now()}`;
    const response = await safeFetch(url);
    
    if (response.ok) {
      const result = await response.json();
      return { ok: true, data: result };
    }
    
    throw new Error('Failed to update status');
  } catch (error) {
    console.error('Error updating order status:', error);
    return { ok: false, error: error.message };
  }
};

// ✅ ИСПРАВЛЕННАЯ функция для расчета времени обслуживания
export const calculateAverageTime = (orders) => {
  try {
    // Фильтруем заказы за сегодня
    const todayOrders = orders.filter(order => {
      if (!order.date) return false;
      
      try {
        // Получаем сегодняшнюю дату в московском времени
        const now = new Date();
        const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
        const today = moscowTime.toISOString().split('T')[0]; // YYYY-MM-DD
        
        let orderDate;
        if (typeof order.date === 'string' && order.date.includes('.') && !order.date.includes('T')) {
          // Формат: "30.07.2025 18:15:42"
          const dateParts = order.date.split(' ')[0].split('.');
          if (dateParts.length === 3) {
            orderDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Конвертируем в YYYY-MM-DD
          }
        } else {
          const dateObj = new Date(order.date);
          orderDate = dateObj.toISOString().split('T')[0];
        }
        
        return orderDate === today;
      } catch (error) {
        return false;
      }
    });

    if (todayOrders.length === 0) {
      return {
        averageMinutes: null,
        note: 'Нет заказов за сегодня',
        completedCount: 0,
        activeCount: 0,
        avgCookingTime: 0,
        avgDeliveryTime: 0
      };
    }

    // Функция для парсинга времени из формата "30.07.2025 18:15:42"
    const parseTime = (timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') return null;
      
      try {
        const [datePart, timePart] = timeStr.split(' ');
        if (!datePart || !timePart) return null;
        
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        
        return new Date(year, month - 1, day, hours, minutes, seconds || 0);
      } catch (error) {
        return null;
      }
    };

    // Функция для расчета разности времени в минутах
    const getTimeDifference = (startTime, endTime) => {
      const start = parseTime(startTime);
      const end = parseTime(endTime);
      
      if (!start || !end) return null;
      
      const diffMs = end.getTime() - start.getTime();
      return Math.round(diffMs / (1000 * 60)); // в минутах
    };

    // Разделяем заказы на завершенные и активные
    const completedOrders = todayOrders.filter(order => order.status === 'done');
    const activeOrders = todayOrders.filter(order => 
      ['pending', 'cooking', 'delivering'].includes(order.status)
    );

    // Если нет завершенных заказов
    if (completedOrders.length === 0) {
      return {
        averageMinutes: null,
        note: 'Нет завершенных заказов за сегодня',
        completedCount: 0,
        activeCount: activeOrders.length,
        avgCookingTime: 0,
        avgDeliveryTime: 0
      };
    }

    // Рассчитываем время для завершенных заказов
    const timeStats = completedOrders.map(order => {
      // ✅ ОБЩЕЕ ВРЕМЯ ОБСЛУЖИВАНИЯ: от pendingTime (создание) до doneTime (завершение)
      const totalTime = getTimeDifference(
        order.pendingTime || order.date, // Время создания заказа
        order.doneTime // Время завершения
      );

      // ✅ ВРЕМЯ ГОТОВКИ: от pendingTime до deliveringTime (когда заказ стал доставляться)
      const cookingTime = getTimeDifference(
        order.pendingTime || order.date, // Время создания
        order.deliveringTime // Время начала доставки
      );

      // ✅ ВРЕМЯ ДОСТАВКИ: от deliveringTime до doneTime
      const deliveryTime = getTimeDifference(
        order.deliveringTime, // Время начала доставки
        order.doneTime // Время завершения
      );

      return {
        orderId: order.orderId,
        totalTime,
        cookingTime,
        deliveryTime
      };
    }).filter(stat => stat.totalTime !== null && stat.totalTime > 0); // Фильтруем невалидные данные

    if (timeStats.length === 0) {
      return {
        averageMinutes: null,
        note: 'Недостаточно данных для расчета',
        completedCount: completedOrders.length,
        activeCount: activeOrders.length,
        avgCookingTime: 0,
        avgDeliveryTime: 0
      };
    }

    // ✅ РАСЧЕТ СРЕДНИХ ЗНАЧЕНИЙ
    const avgTotalTime = Math.round(
      timeStats.reduce((sum, stat) => sum + stat.totalTime, 0) / timeStats.length
    );

    const validCookingTimes = timeStats.filter(stat => stat.cookingTime !== null && stat.cookingTime > 0);
    const avgCookingTime = validCookingTimes.length > 0
      ? Math.round(validCookingTimes.reduce((sum, stat) => sum + stat.cookingTime, 0) / validCookingTimes.length)
      : 0;

    const validDeliveryTimes = timeStats.filter(stat => stat.deliveryTime !== null && stat.deliveryTime > 0);
    const avgDeliveryTime = validDeliveryTimes.length > 0
      ? Math.round(validDeliveryTimes.reduce((sum, stat) => sum + stat.deliveryTime, 0) / validDeliveryTimes.length)
      : 0;

    return {
      averageMinutes: avgTotalTime,
      completedCount: timeStats.length,
      activeCount: activeOrders.length,
      avgCookingTime,
      avgDeliveryTime,
      note: null
    };

  } catch (error) {
    return {
      averageMinutes: null,
      note: 'Ошибка расчета времени',
      completedCount: 0,
      activeCount: 0,
      avgCookingTime: 0,
      avgDeliveryTime: 0
    };
  }
};

export const normalizePhoneNumber = (phone) => {
  if (!phone && phone !== 0) return null;
  
  const phoneStr = String(phone);
  const cleanPhone = phoneStr.replace(/[^\d+]/g, '');
  
  if (!cleanPhone) return null;
  
  const countryCodes = {
    '7': '+7', '375': '+375', '380': '+380', '994': '+994', '374': '+374',
    '995': '+995', '996': '+996', '373': '+373', '992': '+992', '993': '+993',
    '998': '+998', '371': '+371', '372': '+372', '370': '+370'
  };
  
  if (cleanPhone.startsWith('+')) {
    for (const [code, fullCode] of Object.entries(countryCodes)) {
      if (cleanPhone.startsWith(`+${code}`) && cleanPhone.length >= code.length + 10) {
        return cleanPhone;
      }
    }
    return cleanPhone;
  }
  
  if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
    return '+7' + cleanPhone.substring(1);
  }
  
  if (cleanPhone.startsWith('7') && cleanPhone.length === 11) {
    return '+' + cleanPhone;
  }
  
  for (const [code, fullCode] of Object.entries(countryCodes)) {
    if (cleanPhone.startsWith(code) && cleanPhone.length >= code.length + 9) {
      return '+' + cleanPhone;
    }
  }
  
  if (cleanPhone.length === 10) {
    return '+7' + cleanPhone;
  }
  
  return '+7' + cleanPhone;
};

export const createWhatsAppLink = (phone, orderId) => {
  if (!phone && phone !== 0) return null;
  if (!orderId) return null;
  
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  
  const whatsappPhone = normalizedPhone.replace('+', '');
  const message = `😊 Добрый день! Это из ресторана, по поводу Вашего заказа #${orderId} 🍕✨`;
  
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
};

export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors'
    });
    
    if (response.ok) {
      return response;
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('Fetch failed, trying JSONP:', error.message);
    
    if (!options.method || options.method === 'GET') {
      return await fetchViaJSONP(url);
    }
    
    throw new Error('Request failed. Check your internet connection.');
  }
};

const fetchViaJSONP = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const script = document.createElement('script');
    
    window[callbackName] = (data) => {
      resolve({ 
        ok: true, 
        json: () => Promise.resolve(data) 
      });
      cleanup();
    };
    
    const cleanup = () => {
      if (script && script.parentNode) {
        document.head.removeChild(script);
      }
      if (window[callbackName]) {
        delete window[callbackName];
      }
    };
    
    script.onerror = () => {
      reject(new Error('JSONP request failed'));
      cleanup();
    };
    
    const separator = url.includes('?') ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (window[callbackName]) {
        reject(new Error('Request timeout'));
        cleanup();
      }
    }, 10000);
  });
};

export const saveStatusChange = async (orderId, newStatus, oldStatus) => {
  // Простая функция - больше ничего не делаем, так как время записывается в Google Apps Script
  try {
    return true;
  } catch (error) {
    console.error('Error saving status change:', error);
    return false;
  }
};

export const calculateAverageTime = (orders) => {
  const getMoscowToday = () => {
    const now = new Date();
    // Правильный расчет московского времени
    const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
    return moscowTime.toISOString().split('T')[0];
  };

  const todayMoscow = getMoscowToday();

  // Фильтруем заказы только за сегодня
  const todayOrders = orders.filter(order => {
    if (!order.date) return false;
    try {
      let orderDate;
      
      if (typeof order.date === 'string' && order.date.includes('.') && !order.date.includes('T')) {
        const dateParts = order.date.split(' ')[0].split('.');
        if (dateParts.length === 3) {
          orderDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      } else {
        const dateObj = new Date(order.date);
        orderDate = dateObj.toISOString().split('T')[0];
      }
      
      return orderDate === todayMoscow;
    } catch (error) {
      return false;
    }
  });

  if (todayOrders.length === 0) return null;

  // Рассчитываем времена для завершенных заказов используя НОВЫЕ СТОЛБЦЫ
  const completedOrders = todayOrders.filter(order => 
    ['done', 'archived'].includes(order.status)
  );

  if (completedOrders.length === 0) {
    // Если нет завершенных заказов, возвращаем данные по текущим заказам
    const activeOrders = todayOrders.filter(order => 
      ['pending', 'cooking', 'delivering'].includes(order.status)
    );
    
    if (activeOrders.length === 0) return null;
    
    return {
      averageMinutes: null,
      completedCount: 0,
      avgCookingTime: null,
      avgDeliveryTime: null,
      activeCount: activeOrders.length,
      note: 'Пока нет завершенных заказов за сегодня'
    };
  }

  // Парсим время из столбцов времени
  const parseTimeString = (timeStr) => {
    if (!timeStr) return null;
    try {
      if (typeof timeStr === 'string' && timeStr.includes('.') && timeStr.includes(':')) {
        const [datePart, timePart] = timeStr.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(year, month - 1, day, hours, minutes, seconds || 0).getTime();
      }
      return new Date(timeStr).getTime();
    } catch (error) {
      return null;
    }
  };

  // Рассчитываем времена используя реальные данные из столбцов времени
  const calculateTimesForOrder = (order) => {
    const pendingTime = parseTimeString(order.pendingTime);
    const cookingTime = parseTimeString(order.cookingTime);
    const deliveringTime = parseTimeString(order.deliveringTime);
    const doneTime = parseTimeString(order.doneTime) || parseTimeString(order.archivedTime);

    if (!pendingTime || !doneTime) return null;

    let cookingDuration = 0;
    let deliveryDuration = 0;
    let totalTime = 0;

    // Время готовки: от pending до cooking (или если cooking нет, то до delivering)
    if (cookingTime) {
      cookingDuration = Math.round((cookingTime - pendingTime) / 60000); // в минутах
      
      // Время доставки: от cooking до done
      if (deliveringTime) {
        deliveryDuration = Math.round((doneTime - deliveringTime) / 60000);
      } else {
        deliveryDuration = Math.round((doneTime - cookingTime) / 60000);
      }
    } else if (deliveringTime) {
      // Если нет cooking, но есть delivering
      cookingDuration = Math.round((deliveringTime - pendingTime) / 60000);
      deliveryDuration = Math.round((doneTime - deliveringTime) / 60000);
    } else {
      // Если нет промежуточных статусов
      totalTime = Math.round((doneTime - pendingTime) / 60000);
      cookingDuration = Math.round(totalTime * 0.6); // примерно 60% на готовку
      deliveryDuration = Math.round(totalTime * 0.4); // 40% на доставку
    }

    if (!totalTime) {
      totalTime = cookingDuration + deliveryDuration;
    }

    return {
      cooking: Math.max(0, cookingDuration),
      delivery: Math.max(0, deliveryDuration),
      total: Math.max(0, totalTime)
    };
  };

  const orderTimes = completedOrders
    .map(order => calculateTimesForOrder(order))
    .filter(times => times !== null && times.total > 0);

  if (orderTimes.length === 0) return null;

  // Вычисляем средние значения
  const avgCooking = orderTimes.reduce((sum, times) => sum + times.cooking, 0) / orderTimes.length;
  const avgDelivery = orderTimes.reduce((sum, times) => sum + times.delivery, 0) / orderTimes.length;
  const avgTotal = orderTimes.reduce((sum, times) => sum + times.total, 0) / orderTimes.length;

  return {
    averageMinutes: Math.round(avgTotal),
    completedCount: completedOrders.length,
    avgCookingTime: Math.round(avgCooking),
    avgDeliveryTime: Math.round(avgDelivery),
    activeCount: todayOrders.filter(order => 
      ['pending', 'cooking', 'delivering'].includes(order.status)
    ).length
  };
};

export const normalizePhoneNumber = (phone) => {
  if (!phone && phone !== 0) return null;
  
  const phoneStr = String(phone);
  const cleanPhone = phoneStr.replace(/[^\d+]/g, '');
  
  if (!cleanPhone) return null;
  
  const countryCodes = {
    '7': '+7', '375': '+375', '380': '+380', '994': '+994', '374': '+374',
    '995': '+995', '996': '+996', '373': '+373', '992': '+992', '993': '+993',
    '998': '+998', '371': '+371', '372': '+372', '370': '+370'
  };
  
  if (cleanPhone.startsWith('+')) {
    for (const [code, fullCode] of Object.entries(countryCodes)) {
      if (cleanPhone.startsWith(`+${code}`) && cleanPhone.length >= code.length + 10) {
        return cleanPhone;
      }
    }
    return cleanPhone;
  }
  
  if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
    return '+7' + cleanPhone.substring(1);
  }
  
  if (cleanPhone.startsWith('7') && cleanPhone.length === 11) {
    return '+' + cleanPhone;
  }
  
  for (const [code, fullCode] of Object.entries(countryCodes)) {
    if (cleanPhone.startsWith(code) && cleanPhone.length >= code.length + 9) {
      return '+' + cleanPhone;
    }
  }
  
  if (cleanPhone.length === 10) {
    return '+7' + cleanPhone;
  }
  
  return '+7' + cleanPhone;
};

export const createWhatsAppLink = (phone, orderId) => {
  if (!phone && phone !== 0) return null;
  if (!orderId) return null;
  
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  
  const whatsappPhone = normalizedPhone.replace('+', '');
  const message = `😊 Добрый день! Это из ресторана, по поводу Вашего заказа #${orderId} 🍕✨`;
  
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
};

export const updateOrderStatusRequest = async (orderId, status) => {
  const url = `${API_URL}?action=updateOrderStatus&orderId=${encodeURIComponent(orderId)}&status=${encodeURIComponent(status)}`;
  console.log('🚀 updateOrderStatus запрос:', url);
  
  // Для updateOrderStatus ВСЕГДА используем JSONP
  return await fetchViaJSONP(url);
};

export const safeFetch = async (url, options = {}) => {
  console.log('🚀 Отправляю запрос:', url);
  
  try {
    // Пробуем обычный fetch с CORS
    const response = await fetch(url, {
      ...options,
      mode: 'cors'
    });
    
    if (response.ok) {
      console.log('✅ CORS Fetch успешен:', response.status);
      return response;
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('❌ CORS failed, using JSONP:', error.message);
    
    // Если CORS не работает, используем только JSONP для GET-запросов
    if (!options.method || options.method === 'GET') {
      return await fetchViaJSONP(url);
    }
    
    throw new Error('Request failed. Check your internet connection.');
  }
};

const fetchViaJSONP = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const script = document.createElement('script');
    
    window[callbackName] = (data) => {
      console.log('✅ JSONP response received:', data);
      resolve({ 
        ok: true, 
        json: () => Promise.resolve(data) 
      });
      cleanup();
    };
    
    const cleanup = () => {
      if (script && script.parentNode) {
        document.head.removeChild(script);
      }
      if (window[callbackName]) {
        delete window[callbackName];
      }
    };
    
    script.onerror = () => {
      console.error('❌ JSONP request failed');
      reject(new Error('JSONP request failed'));
      cleanup();
    };
    
    const separator = url.includes('?') ? '&' : '?';
    const jsonpUrl = url + separator + 'callback=' + callbackName;
    console.log('🔄 JSONP URL:', jsonpUrl);
    script.src = jsonpUrl;
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (window[callbackName]) {
        console.error('❌ JSONP timeout');
        reject(new Error('Request timeout'));
        cleanup();
      }
    }, 10000);
  });
};

// И в конце файла:
export { API_URL };
