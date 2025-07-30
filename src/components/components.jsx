// components.jsx - React компоненты
import { useState, useEffect } from 'react';
import { formatDate, formatNumber, normalizePhoneNumber, createWhatsAppLink, API_URL, safeFetch } from './utils';

export const OrderTimer = ({ orderDate, status }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(!['done', 'archived'].includes(status));

  useEffect(() => {
    if (!orderDate) return;
    
    let startTime;
    try {
      if (typeof orderDate === 'string' && orderDate.includes('.') && orderDate.includes(':') && !orderDate.includes('T')) {
        const [datePart, timePart] = orderDate.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        startTime = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
      } else {
        startTime = new Date(orderDate).getTime();
      }
      
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
      setElapsed(Math.floor(elapsedMs / 1000));
    };

    updateTimer();

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

  const isOverdue = elapsed > 1800 && isRunning;
  const isCritical = elapsed > 2700 && isRunning;

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
      background: isCritical ? '#ff1744' : isOverdue ? '#ff9800' : isRunning ? '#4caf50' : '#9e9e9e',
      color: 'white',
      animation: isOverdue && isRunning ? 'pulse 1.5s infinite' : 'none',
      boxShadow: isOverdue ? '0 0 10px rgba(255, 87, 34, 0.5)' : 'none'
    }}>
      <span>{isRunning ? '⏱️' : '⏹️'}</span>
      <span>{formatTime(elapsed)}</span>
    </div>
  );
};

export const AdminLogin = ({ onLoginSuccess }) => {
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

export const OrderCard = ({ order, statusLabels, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusInfo = statusLabels.find(s => s.status === order.status) || 
    { label: order.status, color: '#999' };

  const products = JSON.parse(order.products || '[]');
  const isDone = order.status === 'done';
  const isArchived = order.status === 'archived';
  
  // ✅ ПРОВЕРЯЕМ САМОВЫВОЗ
  const isPickup = order.address && order.address.toLowerCase().includes('самовывоз');

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
      // ✅ КРАСНАЯ ОБВОДКА ДЛЯ САМОВЫВОЗА
      border: isPickup ? '3px solid #ff4444' : isDone ? '2px solid #4caf50' : isArchived ? '2px solid #999' : '1px solid #e0e0e0',
      position: 'relative',
      // ✅ ПУЛЬСИРУЮЩАЯ АНИМАЦИЯ ДЛЯ САМОВЫВОЗА
      animation: isPickup && !isDone && !isArchived ? 'urgentPulse 2s infinite' : 'none'
    }}>
      
      {/* ✅ СТИЛИ ДЛЯ АНИМАЦИЙ */}
      <style>
        {`
          @keyframes urgentPulse {
            0%, 100% { 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 0 0 0 rgba(255, 68, 68, 0.7);
            }
            50% { 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 0 0 6px rgba(255, 68, 68, 0);
            }
          }
          
          @keyframes urgentBadgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes checkmarkBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* ✅ ПЛАШКА "СРОЧНЫЙ!" ДЛЯ САМОВЫВОЗА */}
      {isPickup && !isDone && !isArchived && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '16px',
          background: '#ff4444',
          color: 'white',
          padding: '0.3rem 0.8rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(255, 68, 68, 0.4)',
          animation: 'urgentBadgePulse 1.5s infinite',
          zIndex: 10
        }}>
          🔥 СРОЧНЫЙ!
        </div>
      )}

      {/* Зеленая галочка для завершенных */}
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
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          animation: 'checkmarkBounce 0.5s ease-out'
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
            // ✅ КРАСНЫЙ ЦВЕТ ЗАГОЛОВКА ДЛЯ САМОВЫВОЗА
            color: isPickup ? '#ff4444' : '#2c1e0f',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span>Заказ #{order.orderId}</span>
            {/* ✅ ДОПОЛНИТЕЛЬНАЯ ИКОНКА ДЛЯ САМОВЫВОЗА */}
            {isPickup && !isDone && !isArchived && (
              <span style={{ 
                fontSize: '1rem', 
                animation: 'urgentBadgePulse 1.5s infinite' 
              }}>
                🏃‍♂️💨
              </span>
            )}
            {order.date && <OrderTimer orderDate={order.date} status={order.status} />}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {order.date ? formatDate(order.date) : 'Нет времени'} • {order.customerName}
            {/* ✅ ИНДИКАТОР САМОВЫВОЗА В ПОДЗАГОЛОВКЕ */}
            {isPickup && (
              <span style={{
                marginLeft: '0.5rem',
                background: '#ff4444',
                color: 'white',
                padding: '0.1rem 0.4rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                САМОВЫВОЗ
              </span>
            )}
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
              <div>
                <strong>Адрес:</strong> 
                <span style={{
                  // ✅ ВЫДЕЛЯЕМ АДРЕС САМОВЫВОЗА
                  color: isPickup ? '#ff4444' : 'inherit',
                  fontWeight: isPickup ? 'bold' : 'normal'
                }}>
                  {order.address}
                  {isPickup && (
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      🏃‍♂️💨
                    </span>
                  )}
                </span>
              </div>
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
