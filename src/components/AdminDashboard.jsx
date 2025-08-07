import { useState, useEffect } from 'react';

import { API_URL } from '../config'; // или './config' в зависимости от расположения

// И использовать API_URL вместо прямой ссылки
// Функция для форматирования числа с пробелами
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// ✅ ИСПРАВЛЕННАЯ функция для форматирования даты
const formatDate = (dateStr) => {
  // Если это уже строка в нужном формате (25.07.2025 19:51:45), просто возвращаем
  if (!dateStr) return 'Нет времени';
  
  if (typeof dateStr === 'string' && dateStr.includes('.') && dateStr.includes(':')) {
    return dateStr;
  }
  
  // Иначе пытаемся парсить как дату
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Компонент панели управления магазином
const ShopManagementPanel = ({ admin }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: '#2c1e0f',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🏪 Панель управления магазином
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <button style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          padding: '1rem',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          📦 Управление товарами
        </button>
        
        <button style={{
          background: 'linear-gradient(135deg, #4caf50, #45a049)',
          color: 'white',
          border: 'none',
          padding: '1rem',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
        }}>
          📊 Статистика продаж
        </button>
        
        <button style={{
          background: 'linear-gradient(135deg, #ff9800, #f57c00)',
          color: 'white',
          border: 'none',
          padding: '1rem',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
        }}>
          ⚙️ Настройки
        </button>
        
        <button style={{
          background: 'linear-gradient(135deg, #e91e63, #c2185b)',
          color: 'white',
          border: 'none',
          padding: '1rem',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
        }}>
          📈 Промо-акции
        </button>
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
            marginBottom: '0.25rem'
          }}>
            Заказ #{order.orderId}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {/* ✅ ИЗМЕНЕНО: Используем поле date вместо truedate */}
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

const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Загружаем заказы и статусы
      const [ordersRes, statusRes] = await Promise.all([
        fetch(`${API_URL}?action=getOrders`),
        fetch(`${API_URL}?action=getStatusLabels`)
      ]);

      const ordersData = await ordersRes.json();
      const statusData = await statusRes.json();

      // ✅ ИСПРАВЛЕНО: Сортируем заказы по полю date (новые сверху)
      const sortedOrders = ordersData.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        
        // Парсим даты из формата "25.07.2025 19:51:45"
        const parseCustomDate = (dateStr) => {
          if (!dateStr) return 0;
          try {
            const [datePart, timePart] = dateStr.split(' ');
            const [day, month, year] = datePart.split('.');
            const [hours, minutes, seconds] = timePart.split(':');
            return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
          } catch (error) {
            return 0;
          }
        };
        
        return parseCustomDate(b.date) - parseCustomDate(a.date);
      });

      setOrders(sortedOrders);
      setStatusLabels(statusData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      // Имитация печатания
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Обновляем статус заказа
      const response = await fetch(`${API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${newStatus}`);
      
      if (response.ok) {
        // Обновляем локально
        setOrders(prev => prev.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
      } else {
        alert('Ошибка обновления статуса. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
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
  
  // ✅ ИСПРАВЛЕНО: Считаем доходы за сегодня по полю date
  const totalToday = orders
    .filter(order => {
      if (!order.date) return false;
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dateParts = order.date.split(' ')[0].split('.'); // "25.07.2025"
        if (dateParts.length === 3) {
          const orderDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Конвертируем в YYYY-MM-DD
          return orderDate === today;
        }
        return false;
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
      fontFamily: 'Fredoka, sans-serif'
    }}>
      {/* Заголовок */}
      <div style={{
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

      {/* Основной контейнер */}
      <div className="container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '1rem 2rem 2rem 2rem'
      }}>
        {/* Приветствие бота */}
        <div style={{
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
                <div style={{
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

        <style>
          {`
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
          `}
        </style>

        {/* 🏪 ПАНЕЛЬ УПРАВЛЕНИЯ МАГАЗИНОМ */}
        <ShopManagementPanel admin={admin} />

        {/* Фильтры */}
        <div style={{
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

export default AdminDashboard;
