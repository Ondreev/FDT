// AdminPage.jsx - Основной компонент админки
import { useState, useEffect } from 'react';
import { AdminLogin, OrderCard } from './components';
import { 
  API_URL, 
  formatNumber, 
  calculateAverageTime, 
  safeFetch 
} from './utils';

const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loadError, setLoadError] = useState(null);
  
  // Состояния для свайпа
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

      const [ordersRes, statusRes] = await Promise.all([
        safeFetch(`${API_URL}?action=getOrders&t=${Date.now()}`),
        safeFetch(`${API_URL}?action=getStatusLabels&t=${Date.now()}`)
      ]);

      const ordersData = await ordersRes.json();
      const statusData = await statusRes.json();

      if (Array.isArray(ordersData)) {
        const sorted = ordersData.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          const parseDate = (dateStr) => {
            if (!dateStr) return 0;
            try {
              if (typeof dateStr === 'string' && dateStr.includes('.') && dateStr.includes(':') && !dateStr.includes('T')) {
                const [datePart, timePart] = dateStr.split(' ');
                const [day, month, year] = datePart.split('.');
                const [hours, minutes, seconds] = timePart.split(':');
                return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
              } else {
                return new Date(dateStr).getTime();
              }
            } catch (error) {
              console.error('Error parsing date for sorting:', error);
              return 0;
            }
          };
          
          return parseDate(b.date) - parseDate(a.date);
        });
        
        if (isAutoRefresh && lastOrderCount > 0 && sorted.length > lastOrderCount) {
          if (window.innerWidth > 768) {
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
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      const filterCategories = ['pending', 'active', 'archive'];
      const currentIndex = filterCategories.indexOf(activeFilter);
      let newIndex = currentIndex;

      if (deltaX > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (deltaX < 0 && currentIndex < filterCategories.length - 1) {
        newIndex = currentIndex + 1;
      }

      if (newIndex !== currentIndex) {
        setIsAnimating(true);
        setActiveFilter(filterCategories[newIndex]);
        
        setTimeout(() => {
          setSwipeOffset(0);
          setTimeout(() => {
            setIsAnimating(false);
          }, window.innerWidth <= 768 ? 300 : 400);
        }, 50);
      } else {
        setSwipeOffset(0);
      }
    } else {
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
    const activeOrders = orders.filter(order => !['done', 'archived'].includes(order.status));
    
    switch (filter) {
      case 'pending':
        return activeOrders.filter(order => order.status === 'pending');
      case 'active':
        return activeOrders.filter(order => ['cooking', 'delivering'].includes(order.status));
      case 'archive':
        return orders.filter(order => ['done', 'archived'].includes(order.status));
      default:
        return activeOrders;
    }
  };

  const filteredOrders = filterOrders(orders, activeFilter);
  const pendingCount = orders.filter(order => order.status === 'pending').length;
  const averageTimeStats = calculateAverageTime(orders);
  
  // Правильный расчет трафика и среднего чека с московским временем
  const todayOrders = orders.filter(order => {
    if (!order.date) return false;
    try {
      // Правильный расчет московского времени
      const now = new Date();
      const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
      const today = moscowTime.toISOString().split('T')[0];
      
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
      
      return orderDate === today;
    } catch (error) {
      return false;
    }
  });
  
  const todayTraffic = todayOrders.length;
  const totalToday = todayOrders.reduce((sum, order) => sum + parseInt(order.total || 0), 0);
  const averageCheck = todayTraffic > 0 ? Math.round(totalToday / todayTraffic) : 0;

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
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      <style>
        {`
          @media (max-width: 768px) {
            .admin-header h1 {
              font-size: 1.4rem !important;
            }
            
            .admin-metrics-item {
              padding: 0.8rem !important;
            }
            
            .admin-metrics-item div:first-child {
              font-size: 0.7rem !important;
            }
            
            .admin-metrics-item div:last-child {
              font-size: 1rem !important;
            }
            
            .speed-service {
              padding: 0.8rem !important;
            }
            
            .speed-service-title {
              font-size: 0.7rem !important;
            }
            
            .speed-service-value {
              font-size: 1rem !important;
            }
            
            .speed-details {
              font-size: 0.6rem !important;
            }
            
            .admin-buttons button {
              padding: 0.6rem 0.8rem !important;
              font-size: 0.7rem !important;
            }
            
            .filter-button {
              padding: 0.6rem 0.8rem !important;
              font-size: 0.8rem !important;
            }
          }
          
          @media (min-width: 769px) {
            .container {
              max-width: 800px !important;
              margin: 0 auto !important;
            }
          }
        `}
      </style>
      
      <div className="container" style={{
        background: 'white',
        padding: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #f0f0f0'
      }}>
        {/* Заголовок */}
        <div className="admin-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2c1e0f',
            margin: 0
          }}>
            👑 Админ панель
          </h1>
          <div style={{
            fontSize: '0.8rem',
            color: '#999',
            background: '#f8f9fa',
            padding: '0.3rem 0.8rem',
            borderRadius: '12px'
          }}>
            {admin.login}
          </div>
        </div>

        {/* Первая строка: Метрики */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className="admin-metrics-item" style={{
            background: 'linear-gradient(135deg, #4caf50, #45a049)',
            borderRadius: '12px',
            padding: '1rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '0.3rem',
              opacity: 0.9
            }}>
              ВЫРУЧКА
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              {formatNumber(totalToday)} ₽
            </div>
          </div>

          <div className="admin-metrics-item" style={{
            background: 'linear-gradient(135deg, #2196f3, #1976d2)',
            borderRadius: '12px',
            padding: '1rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '0.3rem',
              opacity: 0.9
            }}>
              ТРАФИК
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              {todayTraffic}
            </div>
          </div>

          <div className="admin-metrics-item" style={{
            background: 'linear-gradient(135deg, #ff9800, #f57c00)',
            borderRadius: '12px',
            padding: '1rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '0.3rem',
              opacity: 0.9
            }}>
              СР. ЧЕК
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              {formatNumber(averageCheck)} ₽
            </div>
          </div>
        </div>

        {/* Вторая строка: Скорость обслуживания */}
        <div className="speed-service" style={{
          background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
          borderRadius: '12px',
          padding: '1rem',
          color: 'white',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <div className="speed-service-title" style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                marginBottom: '0.3rem',
                opacity: 0.9
              }}>
                СКОРОСТЬ ОБСЛУЖИВАНИЯ
              </div>
              <div className="speed-service-value" style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {averageTimeStats ? `${averageTimeStats.averageMinutes} мин` : 'Нет данных'}
              </div>
              {averageTimeStats && (
                <div className="speed-details" style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.7rem',
                  opacity: 0.9,
                  flexWrap: 'wrap'
                }}>
                  <span>🍳 Готовка: {averageTimeStats.avgCookingTime} мин</span>
                  <span>🚗 Доставка: {averageTimeStats.avgDeliveryTime} мин</span>
                  <span>📊 По {averageTimeStats.completedCount} заказам</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.8 }}>⚡</div>
          </div>
        </div>

        {/* Третья строка: Кнопки управления */}
        <div className="admin-buttons" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.8rem'
        }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh 
                ? 'linear-gradient(135deg, #4caf50, #45a049)' 
                : 'linear-gradient(135deg, #757575, #616161)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{autoRefresh ? '🔄' : '⏸️'}</span>
            <span>{autoRefresh ? 'АВТО' : 'ПАУЗА'}</span>
          </button>

          <button
            onClick={() => loadData()}
            style={{
              background: 'linear-gradient(135deg, #2196f3, #1976d2)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>↻</span>
            <span>ОБНОВИТЬ</span>
          </button>
          
          <button
            onClick={onLogout}
            style={{
              background: 'linear-gradient(135deg, #f44336, #d32f2f)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🚪</span>
            <span>ВЫХОД</span>
          </button>
        </div>
      </div>

      <div className="container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '1rem 2rem 2rem 2rem'
      }}>
        {/* Сообщение бота */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            flexShrink: 0
          }}>
            🤖
          </div>
          <div style={{
            background: 'white',
            borderRadius: '18px 18px 18px 4px',
            padding: '1rem 1.25rem',
            maxWidth: '85%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              fontSize: '1rem',
              color: '#2c1e0f',
              lineHeight: '1.4'
            }}>
              {getBotMessage()}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: '#999',
              marginTop: '0.5rem',
              textAlign: 'right'
            }}>
              {lastUpdateTime ? `${lastUpdateTime.getHours().toString().padStart(2, '0')}:${lastUpdateTime.getMinutes().toString().padStart(2, '0')}` : 'сейчас'}
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          background: 'transparent',
          margin: '0 -2rem 1rem -2rem',
          padding: '0.5rem 2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="filter-buttons" style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'nowrap'
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
                  padding: '0.75rem 1rem',
                  background: activeFilter === filter.key 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  color: activeFilter === filter.key ? 'white' : '#666',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  boxShadow: activeFilter === filter.key ? '0 4px 12px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  whiteSpace: 'nowrap'
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Заказы */}
        <div 
          style={{
            transform: `translateX(${swipeOffset}px)`,
            opacity: isAnimating ? 0.6 : 1,
            transition: isSwiping ? 'none' : 'all 0.3s ease-out'
          }}
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
