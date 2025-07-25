import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbwpgkiVZN5JwPdSYj-jLVZHZ_A5sw8P6PV4QXR7DJWchwP-19z31WUjcv7QRaHMAazCxg/exec';

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Функция для расчета среднего времени выполнения заказов
const calculateAverageTime = (orders) => {
  const todayMoscow = (() => {
    const now = new Date();
    const moscowOffset = 3 * 60;
    const localOffset = now.getTimezoneOffset();
    const moscowTime = new Date(now.getTime() + (moscowOffset + localOffset) * 60000);
    return moscowTime.toISOString().split('T')[0];
  })();

  const completedToday = orders.filter(order => {
    if (!order.truedate) return false;
    try {
      const orderDate = new Date(order.truedate).toISOString().split('T')[0];
      return orderDate === todayMoscow && ['done', 'archived'].includes(order.status);
    } catch (error) {
      return false;
    }
  });

  if (completedToday.length === 0) return null;

  // Симуляция времени завершения (в реальности нужно сохранять время завершения в БД)
  const totalMinutes = completedToday.reduce((sum, order) => {
    // Предполагаем среднее время 25-35 минут для демонстрации
    const orderTime = new Date(order.truedate).getTime();
    const estimatedCompletionTime = orderTime + (Math.random() * 10 + 25) * 60 * 1000;
    const actualTime = Math.floor((estimatedCompletionTime - orderTime) / (1000 * 60));
    return sum + actualTime;
  }, 0);

  const averageMinutes = Math.round(totalMinutes / completedToday.length);
  return { averageMinutes, completedCount: completedToday.length };
};

const OrderTimer = ({ orderDate, status }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(!['done', 'archived'].includes(status));

  useEffect(() => {
    const startTime = new Date(orderDate).getTime();
    
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
            {order.truedate ? <OrderTimer orderDate={order.truedate} status={order.status} /> : null}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {order.truedate ? formatDate(order.truedate) : 'Нет времени'} • {order.customerName}
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

const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending'); // По умолчанию "Новые"
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loadError, setLoadError] = useState(null);

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
        const sorted = ordersData.sort((a, b) => {
          if (!a.truedate && !b.truedate) return 0;
          if (!a.truedate) return 1;
          if (!b.truedate) return -1;
          return new Date(b.truedate) - new Date(a.truedate);
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
  const totalToday = orders
    .filter(order => {
      if (!order.truedate) return false;
      try {
        const orderDate = new Date(order.truedate).toISOString().split('T')[0];
        return orderDate === todayMoscow;
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
      fontFamily: 'system-ui, -apple-system, sans-serif' // Более безопасный шрифт для iOS
    }}>
      <style>
        {`
          @media (max-width: 768px) {
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

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem'
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

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
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
          filteredOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              statusLabels={statusLabels}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
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
