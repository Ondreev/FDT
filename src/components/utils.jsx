// utils.js - Утилиты и вспомогательные функции

export const API_URL = 'https://script.google.com/macros/s/AKfycbxAQF0sfNYonRjjH3zFBW58gkXZ3u5mKZWUtDyspY3uyHxFc-WnZB13Hz8IH1w-h3bG2Q/exec';

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
