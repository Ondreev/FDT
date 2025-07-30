// utils.jsx - Утилиты и вспомогательные функции
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
    if (isNaN(date.getTime())) return String(dateStr);

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
  try {
    return true;
  } catch (error) {
    console.error('Error saving status change:', error);
    return false;
  }
};

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

export const calculateAverageTime = (orders) => {
  try {
    // Получаем сегодняшнюю дату в московском времени
    const getMoscowToday = () => {
      const now = new Date();
      const moscowTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
      return moscowTime.toISOString().split('T')[0];
    };

    const todayMoscow = getMoscowToday();

    // Фильтруем заказы за сегодня
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

    if (todayOrders.length === 0) {
      console.log('DEBUG: Нет заказов за сегодня');
      return {
        averageMinutes: null,
        note: 'Нет заказов за сегодня',
        completedCount: 0,
        activeCount: 0,
        avgCookingTime: 0,
        avgDeliveryTime: 0
      };
    }

    console.log('DEBUG: Заказов за сегодня:', todayOrders.length);
    console.log('DEBUG: Первый заказ:', todayOrders[0]);

    // Функция для парсинга времени из формата "30.07.2025 19:03:49"
    const parseTimeString = (timeStr) => {
      if (!timeStr) return null;
      try {
        // Проверяем формат "DD.MM.YYYY HH:MM:SS"
        if (typeof timeStr === 'string' && timeStr.includes('.') && timeStr.includes(':')) {
          const [datePart, timePart] = timeStr.split(' ');
          if (!datePart || !timePart) return null;
          
          const [day, month, year] = datePart.split('.');
          const [hours, minutes, seconds] = timePart.split(':');
          
          // Добавляем валидацию
          if (!day || !month || !year || !hours || !minutes) return null;
          
          const date = new Date(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day), 
            parseInt(hours), 
            parseInt(minutes), 
            parseInt(seconds || 0)
          );
          
          console.log(`DEBUG: Парсинг "${timeStr}" -> ${date}`);
          return isNaN(date.getTime()) ? null : date;
        }
        
        // Если не наш формат, пробуем стандартный парсинг
        const date = new Date(timeStr);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        console.log(`DEBUG: Ошибка парсинга времени "${timeStr}":`, error);
        return null;
      }
    };

    // Функция для расчета разности времени в минутах
    const getTimeDifferenceMinutes = (startTime, endTime) => {
      const start = parseTimeString(startTime);
      const end = parseTimeString(endTime);
      
      console.log(`DEBUG: Расчет разности "${startTime}" -> "${endTime}"`);
      console.log(`DEBUG: start = ${start}, end = ${end}`);
      
      if (!start || !end) {
        console.log(`DEBUG: Одно из времен null: start=${start}, end=${end}`);
        return null;
      }
      
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      console.log(`DEBUG: Разность = ${diffMinutes} минут`);
      return diffMinutes;
    };

    // Разделяем заказы на завершенные и активные
    // ✅ ИСПРАВЛЕНО: учитываем и 'done' и 'archived' как завершенные
    const completedOrders = todayOrders.filter(order => 
      ['done', 'archived'].includes(order.status)
    );
    const activeOrders = todayOrders.filter(order => 
      ['pending', 'cooking', 'delivering'].includes(order.status)
    );

    if (completedOrders.length === 0) {
      console.log('DEBUG: Нет завершенных заказов за сегодня');
      console.log('DEBUG: Активных заказов:', activeOrders.length);
      return {
        averageMinutes: null,
        note: 'Нет завершенных заказов за сегодня',
        completedCount: 0,
        activeCount: activeOrders.length,
        avgCookingTime: 0,
        avgDeliveryTime: 0
      };
    }

    console.log('DEBUG: Завершенных заказов:', completedOrders.length);
    console.log('DEBUG: Первый завершенный заказ:', completedOrders[0]);

    // Рассчитываем времена для каждого завершенного заказа
    const orderTimes = [];

    completedOrders.forEach(order => {
      // ✅ ОБЩЕЕ ВРЕМЯ: от pendingTime до doneTime (или archivedTime)
      const totalTime = getTimeDifferenceMinutes(
        order.pendingTime || order.date, 
        order.doneTime || order.archivedTime
      );

      // ✅ ВРЕМЯ ГОТОВКИ: от pendingTime до deliveringTime
      const cookingTime = getTimeDifferenceMinutes(
        order.pendingTime || order.date,
        order.deliveringTime
      );

      // ✅ ВРЕМЯ ДОСТАВКИ: от deliveringTime до doneTime (или archivedTime)
      const deliveryTime = getTimeDifferenceMinutes(
        order.deliveringTime,
        order.doneTime || order.archivedTime
      );

      console.log(`DEBUG: Заказ ${order.orderId}:`);
      console.log(`  pendingTime: ${order.pendingTime}`);
      console.log(`  deliveringTime: ${order.deliveringTime}`);
      console.log(`  doneTime: ${order.doneTime}`);
      console.log(`  archivedTime: ${order.archivedTime}`);
      console.log(`  totalTime: ${totalTime} мин`);
      console.log(`  cookingTime: ${cookingTime} мин`);
      console.log(`  deliveryTime: ${deliveryTime} мин`);

      // Добавляем только если есть валидные данные
      if (totalTime !== null && totalTime > 0) {
        orderTimes.push({
          orderId: order.orderId,
          total: totalTime,
          cooking: cookingTime && cookingTime > 0 ? cookingTime : 0,
          delivery: deliveryTime && deliveryTime > 0 ? deliveryTime : 0
        });
      }
    });

    if (orderTimes.length === 0) {
      console.log('DEBUG: Нет валидных данных для расчета времени');
      return {
        averageMinutes: null,
        note: 'Недостаточно данных для расчета',
        completedCount: completedOrders.length,
        activeCount: activeOrders.length,
        avgCookingTime: 0,
        avgDeliveryTime: 0
      };
    }

    console.log('DEBUG: Валидных заказов для расчета:', orderTimes.length);
    console.log('DEBUG: Данные для расчета:', orderTimes);

    // ✅ РАСЧЕТ СРЕДНИХ ЗНАЧЕНИЙ
    const avgTotal = Math.round(
      orderTimes.reduce((sum, order) => sum + order.total, 0) / orderTimes.length
    );

    const cookingTimes = orderTimes.filter(order => order.cooking > 0);
    const avgCooking = cookingTimes.length > 0 
      ? Math.round(cookingTimes.reduce((sum, order) => sum + order.cooking, 0) / cookingTimes.length)
      : 0;

    const deliveryTimes = orderTimes.filter(order => order.delivery > 0);
    const avgDelivery = deliveryTimes.length > 0
      ? Math.round(deliveryTimes.reduce((sum, order) => sum + order.delivery, 0) / deliveryTimes.length)
      : 0;

    console.log('DEBUG: Результат расчета:', {
      avgTotal,
      avgCooking,
      avgDelivery,
      completedCount: orderTimes.length,
      activeCount: activeOrders.length
    });

    return {
      averageMinutes: avgTotal,
      completedCount: orderTimes.length,
      activeCount: activeOrders.length,
      avgCookingTime: avgCooking,
      avgDeliveryTime: avgDelivery,
      note: null
    };

  } catch (error) {
    console.error('Error in calculateAverageTime:', error);
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

// И в конце файла:
export { API_URL };
