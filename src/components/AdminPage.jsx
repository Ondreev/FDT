<div className="order-card" style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: isDone ? '2px solid #4caf50' : '1px solid #e0e0e0',
      position: 'relative',
      transition: 'all 0.2s ease'
    }}>
      {/* Зеленая галочка для завершенных */}
      {isDone && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: '#4caf50',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          animation: 'checkmarkBounce 0.5s ease-out'
        }}>
          ✓
        </div>
      )}

      {/* Заголовок заказа */}
      <div className="order-header"import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbwpgkiVZN5JwPdSYj-jLVZHZ_A5sw8P6PV4QXR7DJWchwP-19z31WUjcv7QRaHMAazCxg/exec';

// Функция для форматирования числа с пробелами
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Функция для форматирования даты
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

// Компонент авторизации (БЕЗ отладочной информации)
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
      const response = await fetch(`${API_URL}?action=getAdmins`);
      const admins = await response.json();
      
      // Проверяем пароль БЕЗ логирования
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
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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

// Компонент карточки заказа
const OrderCard = ({ order, statusLabels, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusInfo = statusLabels.find(s => s.status === order.status) || 
    { label: order.status, color: '#999' };

  const products = JSON.parse(order.products || '[]');
  const isDone = order.status === 'done';

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
      border: isDone ? '2px solid #4caf50' : '1px solid #e0e0e0',
      position: 'relative',
      transition: 'all 0.2s ease'
    }}>
      {/* Зеленая галочка для завершенных */}
      {isDone && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: '#4caf50',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          animation: 'checkmarkBounce 0.5s ease-out'
        }}>
          ✓
        </div>
      )}

      <style>
        {`
          @keyframes checkmarkBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* Заголовок заказа */}
      <div className="order-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <div className="order-title" style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#2c1e0f',
            marginBottom: '0.25rem'
          }}>
            Заказ #{order.orderId}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {formatDate(order.date)} • {order.customerName}
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

      {/* Краткая информация */}
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

      {/* Развернутая информация */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: '1.5rem',
          animation: 'expandContent 0.3s ease-out'
        }}>
          <style>
            {`
              @keyframes expandContent {
                from { opacity: 0; maxHeight: 0; }
                to { opacity: 1; maxHeight: 500px; }
              }
            `}
          </style>

          {/* Контактная информация */}
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
              <div><strong>Телефон:</strong> {order.phone}</div>
              <div><strong>Адрес:</strong> {order.address}</div>
              {order.comment && (
                <div><strong>Комментарий:</strong> {order.comment}</div>
              )}
            </div>
          </div>

          {/* Список товаров */}
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

          {/* Кнопки смены статуса */}
          {!isDone && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c1e0f',
                marginBottom: '0.75rem'
              }}>
                🔄 Изменить статус
              </h4>
              <div className="status-buttons" style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {statusLabels
                  .filter(status => status.status !== order.status)
                  .map((status) => (
                    <button
                      key={status.status}
                      className="status-button"
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
                        opacity: isUpdating ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isUpdating) {
                          e.target.style.opacity = '0.8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUpdating) {
                          e.target.style.opacity = '1';
                        }
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

      {/* Индикатор развертывания */}
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

// Основная админка с заказами
const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Загружаю заказы и статусы...');
      console.log('🌐 Используемый API URL:', API_URL);
      
      // Пробуем разные варианты названий действий для заказов
      let ordersData = null;
      const orderActions = ['getOrders'];
      
      for (const action of orderActions) {
        try {
          const fullUrl = `${API_URL}?action=${action}&cache=${Date.now()}`;
          console.log(`🔍 Запрос к: ${fullUrl}`);
          
          const response = await fetch(fullUrl);
          const data = await response.json();
          
          console.log(`📦 Ответ от ${action}:`, data);
          
          if (!data.error) {
            console.log(`✅ Действие ${action} работает!`);
            ordersData = data;
            break;
          } else {
            console.log(`❌ Действие ${action} вернуло ошибку:`, data.error);
          }
        } catch (err) {
          console.log(`❌ Ошибка при ${action}:`, err.message);
        }
      }
      
      // Загружаем статусы (это работает)
      const statusRes = await fetch(`${API_URL}?action=getStatusLabels&cache=${Date.now()}`);
      const statusData = await statusRes.json();

      console.log('📋 Полученные заказы:', ordersData);
      console.log('🏷️ Полученные статусы:', statusData);

      // Обрабатываем заказы
      if (!ordersData || ordersData.error) {
        console.log('❌ Не удалось загрузить заказы. Устанавливаю пустой массив.');
        setOrders([]);
      } else if (Array.isArray(ordersData)) {
        console.log('✅ Заказы получены как массив, сортирую...');
        // Сортируем по дате (НОВЫЕ СВЕРХУ) - больше дата = выше
        const sorted = ordersData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sorted);
        console.log('✅ Заказов отсортировано:', sorted.length);
      } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
        console.log('✅ Заказы найдены в ordersData.orders');
        setOrders(ordersData.orders.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else if (ordersData.data && Array.isArray(ordersData.data)) {
        console.log('✅ Заказы найдены в ordersData.data');
        setOrders(ordersData.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        console.log('❌ Неизвестный формат заказов:', ordersData);
        setOrders([]);
      }

      // Обрабатываем статусы
      if (!Array.isArray(statusData)) {
        console.error('❌ Статусы не являются массивом:', statusData);
        
        if (statusData && statusData.statuses && Array.isArray(statusData.statuses)) {
          setStatusLabels(statusData.statuses);
        } else if (statusData && statusData.data && Array.isArray(statusData.data)) {
          setStatusLabels(statusData.data);
        } else {
          // Устанавливаем базовые статусы
          setStatusLabels([
            { status: 'pending', label: 'В обработке', color: '#ffa500' },
            { status: 'cooking', label: 'Готовится', color: '#ff7f32' },
            { status: 'delivering', label: 'Доставляется', color: '#0099ff' },
            { status: 'done', label: 'Завершён', color: '#28a745' },
            { status: 'archived', label: 'Архив', color: '#6c757d' }
          ]);
        }
      } else {
        setStatusLabels(statusData);
      }
      
      console.log('✅ Данные обработаны успешно');
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Отправляем запрос на сервер для обновления статуса
      const response = await fetch(`${API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${newStatus}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Обновляем локально только если сервер ответил успешно
        setOrders(prev => prev.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        console.log(`✅ Статус заказа ${orderId} обновлен на ${newStatus}`);
      } else {
        console.error('❌ Ошибка обновления статуса на сервере');
        alert('Ошибка обновления статуса. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
      alert('Ошибка соединения. Проверьте интернет.');
    }
  };

  const filterOrders = (orders, filter) => {
    switch (filter) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'active':
        return orders.filter(order => ['pending', 'cooking', 'delivering'].includes(order.status));
      case 'done':
        return orders.filter(order => order.status === 'done');
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrders(orders, activeFilter);
  const pendingCount = orders.filter(order => order.status === 'pending').length;
  
  // Исправляем расчет суммы за сегодня с учетом московского времени
  const getMoscowDate = () => {
    const now = new Date();
    const moscowOffset = 3 * 60; // Москва UTC+3
    const localOffset = now.getTimezoneOffset();
    const moscowTime = new Date(now.getTime() + (moscowOffset + localOffset) * 60000);
    return moscowTime.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  const todayMoscow = getMoscowDate();
  const totalToday = orders
    .filter(order => {
      // Преобразуем дату заказа в формат YYYY-MM-DD для сравнения
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      return orderDate === todayMoscow;
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
      fontFamily: 'Fredoka, sans-serif'
    }}>
      <style>
        {`
          @keyframes checkmarkBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          @keyframes expandContent {
            from { opacity: 0; maxHeight: 0; }
            to { opacity: 1; maxHeight: 500px; }
          }
          
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-8px);
              opacity: 1;
            }
          }
          
          @media (max-width: 768px) {
            .admin-header {
              flex-direction: column !important;
              gap: 1rem !important;
              text-align: center !important;
            }
            
            .admin-header h1 {
              fontSize: 1.4rem !important;
            }
            
            .admin-header-actions {
              flex-direction: column !important;
              width: 100% !important;
            }
            
            .admin-container {
              padding: 1rem !important;
            }
            
            .filters-container {
              gap: 0.3rem !important;
            }
            
            .filter-button {
              padding: 0.5rem 0.8rem !important;
              fontSize: 0.8rem !important;
              flex: 1 !important;
              min-width: 0 !important;
              white-space: nowrap !important;
            }
            
            .order-card {
              padding: 1rem !important;
            }
            
            .order-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.5rem !important;
            }
            
            .order-title {
              fontSize: 1rem !important;
            }
            
            .status-buttons {
              gap: 0.3rem !important;
            }
            
            .status-button {
              padding: 0.4rem 0.8rem !important;
              fontSize: 0.8rem !important;
              flex: 1 !important;
              min-width: 0 !important;
            }
            
            .bot-message {
              padding: 1rem !important;
              margin-bottom: 1rem !important;
            }
            
            .bot-avatar {
              width: 40px !important;
              height: 40px !important;
              fontSize: 1.2rem !important;
            }
            
            .bot-text {
              fontSize: 1rem !important;
            }
          }
        `}
      </style>
      
      {/* Заголовок */}
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
          </div>
        </div>
        
        <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: '#e8f5e8',
            color: '#2e7d32',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            Сегодня: {formatNumber(totalToday)} ₽
          </div>
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

      <div className="admin-container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Приветствие бота */}
        <div className="bot-message" style={{
          background: 'white',
          borderRadius: '20px 20px 20px 5px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div className="bot-avatar" style={{
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
              {isTyping ? (
                <div style={{
                  display: 'flex',
                  gap: '3px',
                  alignItems: 'center'
                }}>
                  <span>Печатаю</span>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }} />
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'typing 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'typing 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
              ) : (
                <div className="bot-text" style={{
                  fontSize: '1.1rem',
                  color: '#2c1e0f',
                  lineHeight: '1.4'
                }}>
                  {getBotMessage()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="filters-container" style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'Все заказы', count: orders.length },
            { key: 'pending', label: 'Новые', count: orders.filter(o => o.status === 'pending').length },
            { key: 'active', label: 'В работе', count: orders.filter(o => ['cooking', 'delivering'].includes(o.status)).length },
            { key: 'done', label: 'Завершённые', count: orders.filter(o => o.status === 'done').length }
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

        {/* Список заказов */}
        {loadError ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #ff5722'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d32f2f', marginBottom: '1rem' }}>
              Ошибка загрузки данных
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>
              {loadError}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setLoadError(null);
                  setIsLoading(true);
                  loadData();
                }}
                style={{
                  padding: '1rem 2rem',
                  background: '#ff5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Повторить загрузку
              </button>
              
              <button
                onClick={() => {
                  const testUrl = `${API_URL}?action=getOrders`;
                  window.open(testUrl, '_blank');
                }}
                style={{
                  padding: '1rem 2rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Проверить API
              </button>
              
              <button
                onClick={() => {
                  // Создаем тестовый заказ для демонстрации
                  const testOrder = {
                    orderId: `TEST${Date.now()}`,
                    customerName: 'Тестовый клиент',
                    phone: '+7 999 123-45-67',
                    address: 'ул. Тестовая, д. 1',
                    comment: 'Тестовый заказ для проверки админки',
                    products: JSON.stringify([
                      {id: 1, name: 'Пицца Маргарита', price: 450, quantity: 2},
                      {id: 'delivery_service', name: 'Доставка', price: 250, quantity: 1}
                    ]),
                    total: 1150,
                    status: 'pending',
                    date: new Date().toISOString().split('T')[0]
                  };
                  
                  setOrders([testOrder]);
                  setLoadError(null);
                }}
                style={{
                  padding: '1rem 2rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Добавить тестовый заказ
              </button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
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
              {activeFilter === 'all' 
                ? 'Пока что заказов не поступало'
                : `В категории "${['pending', 'active', 'done'].find(f => f === activeFilter) || 'все'}" заказов нет`
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

// Главный компонент админки
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
