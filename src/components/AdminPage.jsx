// AdminPage.jsx - Основной компонент админки
import { useState, useEffect } from 'react';
import { AdminLogin, OrderCard } from './components';
import { 
  API_URL, 
  formatNumber, 
  calculateAverageTime, 
  safeFetch,
  saveStatusChange,
  updateOrderStatusRequest
} from './utils';
import ShopManagementPanel from './ShopManagementPanel';

const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loadError, setLoadError] = useState(null);
  
  // Состояния для анимации бота
  const [isTyping, setIsTyping] = useState(false);
  const [botMessage, setBotMessage] = useState('');
  const [hasNewOrders, setHasNewOrders] = useState(false);
  
  // Состояния для свайпа
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    document.title = 'Дашборд - Админ панель';
  }, []);

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
          const newOrdersCount = sorted.length - lastOrderCount;
          setHasNewOrders(true);
          simulateTyping(newOrdersCount);
          
          if (window.innerWidth > 768) {
            console.log(`🔔 Новых заказов: ${newOrdersCount}`);
          }
        } else if (!isAutoRefresh) {
          // При первой загрузке или ручном обновлении
          const pendingCount = sorted.filter(order => order.status === 'pending').length;
          simulateTyping(pendingCount, true);
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
      console.log('=== handleStatusChange START ===');
      console.log('orderId:', orderId, 'newStatus:', newStatus);
      
      const currentOrder = orders.find(order => order.orderId === orderId);
      const oldStatus = currentOrder ? currentOrder.status : null;
      
      const response = await updateOrderStatusRequest(orderId, newStatus);
      console.log('Response received:', response);
      
      if (response.ok) {
        if (oldStatus !== newStatus) {
          await saveStatusChange(orderId, newStatus, oldStatus);
        }
        
        setOrders(prev => prev.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
      } else {
        alert('Ошибка обновления статуса. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      alert('Ошибка соединения. Проверьте интернет.');
    }
  };

  const filterOrders = (orders, filter) => {
    const activeOrders = orders.filter(order => !['done', 'archived'].includes(order.status));
    
    let filteredOrders;
    switch (filter) {
      case 'pending':
        filteredOrders = activeOrders.filter(order => order.status === 'pending');
        break;
      case 'active':
        filteredOrders = activeOrders.filter(order => ['cooking', 'delivering'].includes(order.status));
        break;
      case 'archive':
        filteredOrders = orders.filter(order => ['done', 'archived'].includes(order.status));
        break;
      default:
        filteredOrders = activeOrders;
    }
    
    return filteredOrders.sort((a, b) => {
      const aIsPickup = a.address && a.address.toLowerCase().includes('самовывоз');
      const bIsPickup = b.address && b.address.toLowerCase().includes('самовывоз');
      
      if (aIsPickup && !bIsPickup) return -1;
      if (!aIsPickup && bIsPickup) return 1;
      
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
          return 0;
        }
      };
      
      return parseDate(b.date) - parseDate(a.date);
    });
  };

  const filteredOrders = filterOrders(orders, activeFilter);
  const pendingCount = orders.filter(order => order.status === 'pending').length;
  const averageTimeStatsRaw = calculateAverageTime(orders);
  const averageTimeStats = averageTimeStatsRaw || {
    averageMinutes: null,
    avgCookingTime: null,
    avgDeliveryTime: null,
    completedCount: 0,
    activeCount: orders.filter(o => ['pending', 'cooking', 'delivering'].includes(o.status)).length,
    note: 'Нет завершённых заказов сегодня'
  };
  
  const todayOrders = orders.filter(order => {
    if (!order.date) return false;
    try {
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

  const simulateTyping = (orderCount, isInitial = false) => {
    setIsTyping(true);
    setBotMessage('');
    
    const message = isInitial 
      ? (orderCount === 0 
          ? "Босс, пока заказов нет, нужно улучшить рекламу 📈"
          : orderCount === 1
          ? "Привет Босс! У нас тут 1 новый заказ поступил 🔔"
          : `Привет Босс! У нас тут ${orderCount} новых заказов поступило 🔥`)
      : `🎉 Поступило еще ${orderCount} ${orderCount === 1 ? 'заказ' : 'заказов'}! Всего новых: ${pendingCount} 🔥`;
    
    let currentIndex = 0;
    const typingSpeed = 50;
    
    const typeChar = () => {
      if (currentIndex < message.length) {
        setBotMessage(message.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeChar, typingSpeed);
      } else {
        setIsTyping(false);
        setTimeout(() => setHasNewOrders(false), 3000);
      }
    };
    
    setTimeout(typeChar, 500);
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
      
      {/* ✅ КОМПАКТНАЯ ПАНЕЛЬ УПРАВЛЕНИЯ МАГАЗИНОМ */}
      <ShopManagementPanel admin={admin} />
      
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
          {/* ✅ ИКОНКА УПРАВЛЕНИЯ рядом с именем админа */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#999',
            background: '#f8f9fa',
            padding: '0.3rem 0.8rem',
            borderRadius: '12px'
          }}>
            <span>{admin.login}</span>
            <ShopManagementPanel admin={admin} />
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
                СКОРОСТЬ ОБСЛУЖИВАНИЯ (СЕГОДНЯ)
              </div>
              <div className="speed-service-value" style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {averageTimeStats 
                  ? averageTimeStats.averageMinutes 
                    ? `${averageTimeStats.averageMinutes} мин`
                    : averageTimeStats.note || 'Нет завершенных заказов'
                  : 'Нет данных за сегодня'
                }
              </div>
              {averageTimeStats && averageTimeStats.averageMinutes && (
                <div className="speed-details" style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.7rem',
                  opacity: 0.9,
                  flexWrap: 'wrap'
                }}>
                  <span>🍳 Готовка: {averageTimeStats.avgCookingTime} мин</span>
                  <span>🚗 Доставка: {averageTimeStats.avgDeliveryTime} мин</span>
                  <span>✅ Завершено: {averageTimeStats.completedCount}</span>
                  {averageTimeStats.activeCount > 0 && (
                    <span>⏳ В работе: {averageTimeStats.activeCount}</span>
                  )}
                </div>
              )}
              {averageTimeStats && !averageTimeStats.averageMinutes && averageTimeStats.activeCount > 0 && (
                <div className="speed-details" style={{
                  fontSize: '0.7rem',
                  opacity: 0.9
                }}>
                  ⏳ В работе сейчас: {averageTimeStats.activeCount} заказов
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
          alignItems: 'flex-start',
          background: hasNewOrders ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))' : 'transparent',
          borderRadius: hasNewOrders ? '20px' : '0',
          padding: hasNewOrders ? '1rem' : '0',
          transition: 'all 0.5s ease',
          animation: hasNewOrders ? 'pulse-bg 2s infinite' : 'none'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00D4AA, #00A693)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 212, 170, 0.4)',
            flexShrink: 0,
            position: 'relative',
            animation: isTyping ? 'bot-pulse 1s infinite' : 'none'
          }}>
            🤖
            {isTyping && (
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                width: '15px',
                height: '15px',
                background: '#4CAF50',
                borderRadius: '50%',
                animation: 'typing-indicator 1.5s infinite'
              }}></div>
            )}
          </div>
          <div style={{
            background: 'white',
            borderRadius: '18px 18px 18px 4px',
            padding: '1rem 1.25rem',
            maxWidth: '85%',
            boxShadow: hasNewOrders ? '0 8px 32px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
            border: hasNewOrders ? '2px solid #4CAF50' : '1px solid #e0e0e0',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: '1rem',
              color: '#2c1e0f',
              lineHeight: '1.4',
              minHeight: '1.4em'
            }}>
              {botMessage || getBotMessage()}
              {isTyping && (
                <span style={{
                  animation: 'cursor-blink 1s infinite',
                  fontSize: '1.2em',
                  color: '#4CAF50'
                }}>|</span>
              )}
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

        <style>
          {`
            @keyframes bot-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes typing-indicator {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.8); }
            }
            
            @keyframes cursor-blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
            
            @keyframes pulse-bg {
              0%, 100% { background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1)); }
              50% { background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(33, 150, 243, 0.2)); }
            }
          `}
        </style>

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
                {filter.label} (<span style={{
                fontWeight: '900',
                fontSize: '1.1em',
                textShadow: activeFilter === filter.key ? '0 0 8px rgba(255,255,255,0.5)' : 'none'
              }}>{filter.count}</span>)
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
