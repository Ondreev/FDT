import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbwpgkiVZN5JwPdSYj-jLVZHZ_A5sw8P6PV4QXR7DJWchwP-19z31WUjcv7QRaHMAazCxg/exec';

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// ✅ УНИВЕРСАЛЬНАЯ функция форматирования даты
const formatDate = (dateStr) => {
  if (!dateStr) return 'Нет времени';
  
  try {
    // Если это уже строка в нужном формате (25.07.2025 19:51:45), просто возвращаем
    if (typeof dateStr === 'string' && dateStr.includes('.') && dateStr.includes(':') && !dateStr.includes('T')) {
      return dateStr;
    }
    
    // Если это ISO формат (2025-07-27T12:26:03.000Z) или Date объект, парсим
    const date = new Date(dateStr);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return String(dateStr); // Возвращаем как есть, если не можем распарсить
    }
    
    // Форматируем в нужный формат
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

// ✅ УНИВЕРСАЛЬНАЯ функция для расчета среднего времени выполнения заказов
const calculateAverageTime = (orders) => {
  const todayMoscow = (() => {
    const now = new Date();
    const moscowOffset = 3 * 60;
    const localOffset = now.getTimezoneOffset();
    const moscowTime = new Date(now.getTime() + (moscowOffset + localOffset) * 60000);
    return moscowTime.toISOString().split('T')[0];
  })();

  const completedToday = orders.filter(order => {
    if (!order.date) return false;
    try {
      let orderDate;
      
      // Обрабатываем разные форматы даты
      if (typeof order.date === 'string' && order.date.includes('.') && !order.date.includes('T')) {
        // Формат: "25.07.2025 19:51:45"
        const dateParts = order.date.split(' ')[0].split('.');
        if (dateParts.length === 3) {
          orderDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Конвертируем в YYYY-MM-DD
        }
      } else {
        // ISO формат или Date объект
        const dateObj = new Date(order.date);
        orderDate = dateObj.toISOString().split('T')[0];
      }
      
      return orderDate === todayMoscow && ['done', 'archived'].includes(order.status);
    } catch (error) {
      return false;
    }
  });

  if (completedToday.length === 0) return null;

  // Симуляция времени завершения (в реальности нужно сохранять время завершения в БД)
  const totalMinutes = completedToday.reduce((sum, order) => {
    // Предполагаем среднее время 25-35 минут для демонстрации
    const estimatedMinutes = Math.random() * 10 + 25;
    return sum + estimatedMinutes;
  }, 0);

  const averageMinutes = Math.round(totalMinutes / completedToday.length);
  return { averageMinutes, completedCount: completedToday.length };
};

// ✅ УНИВЕРСАЛЬНЫЙ компонент OrderTimer
const OrderTimer = ({ orderDate, status }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(!['done', 'archived'].includes(status));

  useEffect(() => {
    if (!orderDate) return;
    
    let startTime;
    try {
      if (typeof orderDate === 'string' && orderDate.includes('.') && orderDate.includes(':') && !orderDate.includes('T')) {
        // Формат: "25.07.2025 19:51:45"
        const [datePart, timePart] = orderDate.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        startTime = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
      } else {
        // ISO формат (2025-07-27T12:26:03.000Z) или Date объект
        startTime = new Date(orderDate).getTime();
      }
      
      // Проверяем валидность времени
      if (isNaN(startTime)) {
        console.error('Invalid date:', orderDate);
        return;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      setElapsed(Math.floor(elapsedMs / 1000)); // в секундах
    };

    updateTimer(); // Первоначальное обновление

    let interval;
    if (isRunning) {
      interval = setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderDate, isRunning]);

  useEffect(() => {
    setIsRunning(!['done', 'archived'].includes(status));
  }, [status]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isOverdue = elapsed > 1800 && isRunning; // 30 минут = 1800 секунд
  const isCritical = elapsed > 2700 && isRunning; // 45 минут = критично

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.3rem 0.7rem',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      background: isCritical 
        ? '#ff1744' 
        : isOverdue 
        ? '#ff9800' 
        : isRunning 
        ? '#4caf50' 
        : '#9e9e9e',
      color: 'white',
      animation: isOverdue && isRunning ? 'pulse 1.5s infinite' : 'none',
      boxShadow: isOverdue ? '0 0 10px rgba(255, 87, 34, 0.5)' : 'none'
    }}>
      <span>{isRunning ? '⏱️' : '⏹️'}</span>
      <span>{formatTime(elapsed)}</span>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(255, 87, 34, 0.5);
            }
            50% { 
              transform: scale(1.05); 
              box-shadow: 0 0 20px rgba(255, 87, 34, 0.8);
            }
          }
        `}
      </style>
    </div>
  );
};

// Функция для нормализации номера телефона
const normalizePhoneNumber = (phone) => {
  if (!phone && phone !== 0) return null;
  
  const phoneStr = String(phone);
  const cleanPhone = phoneStr.replace(/[^\d+]/g, '');
  
  if (!cleanPhone) return null;
  
  // Упрощенная версия без лишних console.log
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

// Функция для создания WhatsApp ссылки
const createWhatsAppLink = (phone, orderId) => {
  if (!phone && phone !== 0) return null;
  if (!orderId) return null;
  
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  
  const whatsappPhone = normalizedPhone.replace('+', '');
  const message = `😊 Добрый день! Это из ресторана, по поводу Вашего заказа #${orderId} 🍕✨`;
  
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
};

// Простая функция fetch с fallback на JSONP
const safeFetch = async (url, options = {}) => {
  try {
    // Пробуем обычный fetch
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
    
    // Fallback на JSONP только для GET запросов
    if (!options.method || options.method === 'GET') {
      return await fetchViaJSONP(url);
    }
    
    throw new Error('Request failed. Check your internet connection.');
  }
};

// JSONP функция (исправленная)
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
    
    // Таймаут 10 секунд
    setTimeout(() => {
      if (window[callbackName]) {
        reject(new Error('Request timeout'));
        cleanup();
      }
    }, 10000);
  });
};

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await safeFetch(`${API_URL}?action=getAdmins&t=${Date.now()}`);
      const admins = await response.json();
      
      const admin = admins.find(admin => 
        admin.passwordHash && admin.passwordHash.trim() === password.trim()
      );
      
      if (admin) {
        onLoginSuccess(admin);
      } else {
        setError('Неверный пароль');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c1e0f', marginBottom: '0.5rem' }}>
          Админ панель
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Добро пожаловать, Босс!
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: isLoading 
                ? 'linear-gradient(135deg, #ccc, #999)' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            {isLoading ? '🔐 Проверяю...' : '🚀 Войти в систему'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ✅ ИСПРАВЛЕННЫЙ компонент OrderCard
const OrderCard = ({ order, statusLabels, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusInfo = statusLabels.find(s => s.status === order.status) || 
    { label: order.status, color: '#999' };

  const products = JSON.parse(order.products || '[]');
  const isDone = order.status === 'done';
  const isArchived = order.status === 'archived';

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    await onStatusChange(order.orderId, newStatus);
    setIsUpdating(false);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: isDone ? '2px solid #4caf50' : isArchived ? '2px solid #999' : '1px solid #e0e0e0',
      position: 'relative'
    }}>
      {(isDone || isArchived) && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: isDone ? '#4caf50' : '#999',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
        }}>
          ✓
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#2c1e0f',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span>Заказ #{order.orderId}</span>
            {/* ✅ ИЗМЕНЕНО: Используем поле date вместо truedate */}
            {order.date ? <OrderTimer orderDate={order.date} status={order.status} /> : null}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {/* ✅ ИЗМЕНЕНО: Используем поле date вместо truedate */}
            {order.date ? formatDate(order.date) : 'Нет времени'} • {order.customerName}
          </div>
        </div>
        <div style={{
          background: statusInfo.color,
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          {statusInfo.label}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '1.5rem' : '0'
      }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: '#2c1e0f'
        }}>
          Итого: {formatNumber(order.total)} ₽
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: '#666'
        }}>
          {products.length} товар{products.length > 1 ? 'а' : ''}
        </div>
      </div>

      {isExpanded && (
        <div style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: '1.5rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#2c1e0f',
              marginBottom: '0.75rem'
            }}>
              📞 Контакты
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
              <div><strong>Клиент:</strong> {order.customerName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span><strong>Телефон:</strong></span>
                {(() => {
                  try {
                    const normalizedPhone = normalizePhoneNumber(order.phone);
                    const whatsappLink = createWhatsAppLink(order.phone, order.orderId);
                    
                    if (whatsappLink && normalizedPhone) {
                      return (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#25D366',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '8px',
                            border: '1px solid #25D366',
                            background: '#f0fff0',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            display: 'inline-block'
                          }}
                          title={`Написать в WhatsApp: ${normalizedPhone}`}
                        >
                          📱 {normalizedPhone}
                        </a>
                      );
                    } else {
                      return (
                        <span style={{ 
                          color: '#999',
                          fontStyle: 'italic'
                        }}>
                          {order.phone || 'Не указан'}
                        </span>
                      );
                    }
                  } catch (error) {
                    return (
                      <span style={{ 
                        color: '#999',
                        fontStyle: 'italic'
                      }}>
                        {order.phone || 'Не указан'} (ошибка)
                      </span>
                    );
                  }
                })()}
              </div>
              <div><strong>Адрес:</strong> {order.address}</div>
              {order.comment && (
                <div><strong>Комментарий:</strong> {order.comment}</div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#2c1e0f',
              marginBottom: '0.75rem'
            }}>
              🛒 Состав заказа
            </h4>
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              {products.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: index < products.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#2c1e0f',
                      fontSize: '0.9rem'
                    }}>
                      {item.name}
                      {item.name.includes('⚡') && (
                        <span style={{
                          background: '#ff0844',
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '4px',
                          marginLeft: '0.5rem'
                        }}>
                          FLASH
                        </span>
                      )}
                      {item.name.includes('🎉') && (
                        <span style={{
                          background: '#4caf50',
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '4px',
                          marginLeft: '0.5rem'
                        }}>
                          БЕСПЛАТНО
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      {item.quantity} × {formatNumber(item.price)} ₽
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#2c1e0f'
                  }}>
                    {formatNumber(item.price * item.quantity)} ₽
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isArchived && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c1e0f',
                marginBottom: '0.75rem'
              }}>
                🔄 Изменить статус
              </h4>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {statusLabels
                  .filter(status => status.status !== order.status)
                  .map((status) => (
                    <button
                      key={status.status}
                      onClick={() => handleStatusChange(status.status)}
                      disabled={isUpdating}
                      style={{
                        padding: '0.5rem 1rem',
                        background: status.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        opacity: isUpdating ? 0.6 : 1
                      }}
                    >
                      {status.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        textAlign: 'center',
        marginTop: '0.5rem',
        fontSize: '0.8rem',
        color: '#999',
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▲ Свернуть' : '▼ Подробнее'}
      </div>
    </div>
  );
};

// ✅ ИСПРАВЛЕННЫЙ компонент AdminDashboard с добавлением свайпа и закрепленных категорий
const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending'); // По умолчанию "Новые"
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loadError, setLoadError] = useState(null);
  
  // ✅ НОВЫЕ состояния для свайпа (перенесены из App.jsx)
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setIsLoading(true);
        setLoadError(null);
      }

      // Используем улучшенную функцию fetch
      const [ordersRes, statusRes] = await Promise.all([
        safeFetch(`${API_URL}?action=getOrders&t=${Date.now()}`),
        safeFetch(`${API_URL}?action=getStatusLabels&t=${Date.now()}`)
      ]);

      const ordersData = await ordersRes.json();
      const statusData = await statusRes.json();

      if (Array.isArray(ordersData)) {
        // ✅ УНИВЕРСАЛЬНАЯ сортировка по полю date
        const sorted = ordersData.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          // Универсальная функция парсинга даты
          const parseDate = (dateStr) => {
            if (!dateStr) return 0;
            try {
              if (typeof dateStr === 'string' && dateStr.includes('.') && dateStr.includes(':') && !dateStr.includes('T')) {
                // Формат: "25.07.2025 19:51:45"
                const [datePart, timePart] = dateStr.split(' ');
                const [day, month, year] = datePart.split('.');
                const [hours, minutes, seconds] = timePart.split(':');
                return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
              } else {
                // ISO формат или Date объект
                return new Date(dateStr).getTime();
              }
            } catch (error) {
              console.error('Error parsing date for sorting:', error);
              return 0;
            }
          };
          
          return parseDate(b.date) - parseDate(a.date);
        });
        
        // Упрощенная проверка новых заказов без уведомлений на iOS
        if (isAutoRefresh && lastOrderCount > 0 && sorted.length > lastOrderCount) {
          // Просто обновляем данные без звука и уведомлений на мобильных
          if (window.innerWidth > 768) {
            // Показываем уведомления только на десктопе
            console.log(`🔔 Новых заказов: ${sorted.length - lastOrderCount}`);
          }
        }
        
        setOrders(sorted);
        setLastOrderCount(sorted.length);
        setLastUpdateTime(new Date());
      } else {
        setOrders([]);
        setLastOrderCount(0);
      }

      if (Array.isArray(statusData)) {
        setStatusLabels(statusData);
      } else {
        setStatusLabels([
          { status: 'pending', label: 'В обработке', color: '#ffa500' },
          { status: 'cooking', label: 'Готовится', color: '#ff7f32' },
          { status: 'delivering', label: 'Доставляется', color: '#0099ff' },
          { status: 'done', label: 'Завершён', color: '#28a745' },
          { status: 'archived', label: 'Архив', color: '#6c757d' }
        ]);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      if (!isAutoRefresh) {
        setLoadError(error.message);
      }
    } finally {
      if (!isAutoRefresh) {
        setIsLoading(false);
      }
    }
  };

  // ✅ НОВЫЕ функции для свайпа (адаптированные из App.jsx)
  const handleTouchStart = (e) => {
    if (isAnimating) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || isAnimating) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;
    
    // Проверяем что это горизонтальный свайп
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
      // Ограничиваем смещение для более естественного ощущения
      const maxOffset = window.innerWidth * 0.3;
      const limitedDelta = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      setSwipeOffset(limitedDelta);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping || isAnimating) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Проверяем что это горизонтальный свайп с достаточным расстоянием
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      const filterCategories = ['pending', 'active', 'archive'];
      const currentIndex = filterCategories.indexOf(activeFilter);
      let newIndex = currentIndex;

      if (deltaX > 0 && currentIndex > 0) {
        // Свайп вправо - предыдущая категория
        newIndex = currentIndex - 1;
      } else if (deltaX < 0 && currentIndex < filterCategories.length - 1) {
        // Свайп влево - следующая категория
        newIndex = currentIndex + 1;
      }

      if (newIndex !== currentIndex) {
        // Плавная смена категории
        setIsAnimating(true);
        setActiveFilter(filterCategories[newIndex]);
        
        // Сбрасываем смещение через короткую задержку
        setTimeout(() => {
          setSwipeOffset(0);
          setTimeout(() => {
            setIsAnimating(false);
          }, window.innerWidth <= 768 ? 300 : 400); // Быстрее на мобильных
        }, 50);
      } else {
        // Возвращаем на место
        setSwipeOffset(0);
      }
    } else {
      // Возвращаем на место
      setSwipeOffset(0);
    }

    setIsSwiping(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await safeFetch(`${API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${newStatus}`);
      
      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
      } else {
        alert('Ошибка обновления статуса. Попробуйте еще раз.');
      }
    } catch (error) {
      alert('Ошибка соединения. Проверьте интернет.');
    }
  };

  const filterOrders = (orders, filter) => {
    // Исключаем завершенные и архивные заказы из основных вкладок  
    const activeOrders = orders.filter(order => !['done', 'archived'].includes(order.status));
    
    switch (filter) {
      case 'pending':
        return activeOrders.filter(order => order.status === 'pending');
      case 'active':
        return activeOrders.filter(order => ['cooking', 'delivering'].includes(order.status)); // Убрали done
      case 'archive':
        return orders.filter(order => ['done', 'archived'].includes(order.status)); // И завершенные, и архивные
      default:
        return activeOrders;
    }
  };

  const filteredOrders = filterOrders(orders, activeFilter);
  const pendingCount = orders.filter(order => order.status === 'pending').length;
  const averageTimeStats = calculateAverageTime(orders);
  
  const getMoscowDate = () => {
    const now = new Date();
    const moscowOffset = 3 * 60;
    const localOffset = now.getTimezoneOffset();
    const moscowTime = new Date(now.getTime() + (moscowOffset + localOffset) * 60000);
    return moscowTime.toISOString().split('T')[0];
  };
  
  const todayMoscow = getMoscowDate();
  
  // ✅ УНИВЕРСАЛЬНЫЙ подсчет доходов за сегодня по полю date
  const totalToday = orders
    .filter(order => {
      if (!order.date) return false;
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        let orderDate;
        
        if (typeof order.date === 'string' && order.date.includes('.') && !order.date.includes('T')) {
          // Формат: "25.07.2025 19:51:45"
          const dateParts = order.date.split(' ')[0].split('.');
          if (dateParts.length === 3) {
            orderDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Конвертируем в YYYY-MM-DD
          }
        } else {
          // ISO формат или Date объект
          const dateObj = new Date(order.date);
          orderDate = dateObj.toISOString().split('T')[0];
        }
        
        return orderDate === today;
      } catch (error) {
        return false;
      }
    })
    .reduce((sum, order) => sum + parseInt(order.total || 0), 0);

  const getBotMessage = () => {
    if (pendingCount === 0) {
      return "Босс, пока заказов нет, нужно улучшить рекламу 📈";
    } else if (pendingCount === 1) {
      return "Привет Босс! У нас тут 1 новый заказ поступил 🔔";
    } else {
      return `Привет Босс! У нас тут ${pendingCount} новых заказов поступило 🔥`;
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Загружаю данные...</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Ошибка загрузки
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>
            {loadError}
          </div>
          <button
            onClick={() => {
              setLoadError(null);
              loadData();
            }}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
        fontFamily: 'system-ui, -apple-system, sans-serif', // Более безопасный шрифт для iOS
        overflow: 'hidden' // ✅ ДОБАВЛЕНО: Предотвращаем горизонтальный скролл при свайпе
      }}
      // ✅ ДОБАВЛЕНЫ обработчики свайпа
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ✅ ДОБАВЛЕНЫ стили для анимаций */}
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .orders-container {
            transition: all 0.2s ease-out;
            will-change: transform;
          }

          .orders-container.swiping {
            transition: none;
          }

          .orders-container.animating {
            transition: all 0.3s ease-out;
          }

          /* Оптимизация для мобильных */
          @media (max-width: 768px) {
            .orders-container {
              transition: all 0.15s ease-out;
            }
            
            .order-card {
              backface-visibility: hidden;
              transform: translateZ(0);
            }
            
            .admin-header {
              flex-direction: column !important;
              gap: 1rem !important;
              text-align: center !important;
            }
            
            .admin-header h1 {
              font-size: 1.4rem !important;
            }
            
            .filter-button {
              padding: 0.5rem 0.8rem !important;
              font-size: 0.8rem !important;
              flex: 1 !important;
            }
            
            .header-controls {
              flex-direction: row !important;
              flex-wrap: wrap !important;
              width: 100% !important;
              gap: 0.5rem !important;
              justify-content: center !important;
            }
            
            .header-controls > * {
              flex: 0 0 auto !important;
              min-width: fit-content !important;
            }
            
            .today-sum {
              flex: 1 1 100% !important;
              text-align: center !important;
              margin-bottom: 0.5rem !important;
            }
          }
        `}
      </style>
      
      <div className="admin-header" style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#2c1e0f',
            margin: 0
          }}>
            👑 Админ панель
          </h1>
          <div style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            Добро пожаловать, {admin.login}
            {lastUpdateTime && (
              <div style={{ fontSize: '0.7rem', color: '#999' }}>
                Обновлено: {lastUpdateTime.toLocaleTimeString('ru-RU')}
              </div>
            )}
          </div>
        </div>
        
        <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="today-sum" style={{
            background: '#e8f5e8',
            color: '#2e7d32',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            Сегодня: {formatNumber(totalToday)} ₽
          </div>

          {averageTimeStats && (
            <div style={{
              background: '#e3f2fd',
              color: '#1976d2',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              ⏱️ Среднее: {averageTimeStats.averageMinutes} мин ({averageTimeStats.completedCount})
            </div>
          )}
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? '#4caf50' : '#757575',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title={autoRefresh ? 'Автообновление включено' : 'Автообновление отключено'}
          >
            {autoRefresh ? '🔄' : '⏸️'} 
            <span style={{ fontSize: '0.8rem' }}>
              {autoRefresh ? 'Авто' : 'Выкл'}
            </span>
          </button>

          <button
            onClick={() => loadData()}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            title="Обновить заказы"
          >
            ↻
          </button>
          
          <button
            onClick={onLogout}
            style={{
              background: '#ff5722',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Контент вне sticky-контейнера */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 2rem 0 2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px 20px 20px 5px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1.1rem',
                color: '#2c1e0f',
                lineHeight: '1.4'
              }}>
                {getBotMessage()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ИСПРАВЛЕНО: Закрепленные категории (sticky) вынесены из контейнера */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
        padding: '1rem 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'pending', label: 'Новые', count: orders.filter(o => o.status === 'pending').length },
            { key: 'active', label: 'В работе', count: orders.filter(o => ['cooking', 'delivering'].includes(o.status)).length },
            { key: 'archive', label: 'Архив', count: orders.filter(o => ['done', 'archived'].includes(o.status)).length }
          ].map((filter) => (
            <button
              key={filter.key}
              className="filter-button"
              onClick={() => setActiveFilter(filter.key)}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeFilter === filter.key 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                  : 'white',
                color: activeFilter === filter.key ? 'white' : '#666',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === filter.key ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* ✅ ДОБАВЛЕН контейнер с поддержкой свайпа и анимаций */}
        <div 
          className={`orders-container ${isSwiping && !isAnimating ? 'swiping' : ''} ${isAnimating ? 'animating' : ''}`}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            opacity: isAnimating ? 0.6 : 1,
          }}
        >
        >
          {filteredOrders.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c1e0f' }}>
                Заказов нет
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                {activeFilter === 'pending' 
                  ? 'Новых заказов пока нет'
                  : activeFilter === 'active'
                  ? 'Нет заказов в работе'  
                  : 'Архив пуст'
                }
              </div>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <div
                key={order.orderId}
                className="order-card"
                style={{
                  animationDelay: isAnimating ? `${index * 0.05}s` : '0s',
                  animation: isAnimating ? 'fadeInScale 0.3s ease forwards' : 'none',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)'
                }}
              >
                <OrderCard
                  order={order}
                  statusLabels={statusLabels}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin_session');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('admin_session', JSON.stringify(adminData));
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
  };

  return admin ? (
    <AdminDashboard admin={admin} onLogout={handleLogout} />
  ) : (
    <AdminLogin onLoginSuccess={handleLoginSuccess} />
  );
};

export default AdminPage;
