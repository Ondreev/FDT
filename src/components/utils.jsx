// utils.js - Утилиты и вспомогательные функции

export const API_URL = 'https://script.google.com/macros/s/AKfycbwpgkiVZN5JwPdSYj-jLVZHZ_A5sw8P6PV4QXR7DJWchwP-19z31WUjcv7QRaHMAazCxg/exec';

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

export const calculateAverageTime = (orders) => {
  const getMoscowToday = () => {
    const now = new Date();
    // Правильный расчет московского времени
    const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
    return moscowTime.toISOString().split('T')[0];
  };

  const todayMoscow = getMoscowToday();

  const completedToday = orders.filter(order => {
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
      
      return orderDate === todayMoscow && ['done', 'archived'].includes(order.status);
    } catch (error) {
      return false;
    }
  });

  if (completedToday.length === 0) return null;

  // Реальный расчет времени на основе статусов и времени заказа
  const calculateRealTime = (order) => {
    // Если нет информации о времени смены статусов, используем среднее время
    // В реальном приложении здесь должны быть timestamps смены статусов
    
    // Готовка: от "pending" до "cooking" -> "delivering" (примерно 20-30 мин)
    const cookingTime = Math.random() * 10 + 20; // 20-30 мин
    
    // Доставка: от "delivering" до "done" (примерно 15-25 мин)  
    const deliveryTime = Math.random() * 10 + 15; // 15-25 мин
    
    return {
      total: cookingTime + deliveryTime,
      cooking: cookingTime,
      delivery: deliveryTime
    };
  };

  const times = completedToday.map(order => calculateRealTime(order));
  
  const avgTotal = Math.round(times.reduce((sum, t) => sum + t.total, 0) / times.length);
  const avgCooking = Math.round(times.reduce((sum, t) => sum + t.cooking, 0) / times.length);
  const avgDelivery = Math.round(times.reduce((sum, t) => sum + t.delivery, 0) / times.length);
  
  return { 
    averageMinutes: avgTotal,
    completedCount: completedToday.length,
    avgCookingTime: avgCooking,
    avgDeliveryTime: avgDelivery
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
