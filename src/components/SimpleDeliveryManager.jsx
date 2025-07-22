import { useEffect, useState } from 'react';

// Функция для форматирования числа с пробелами
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Простой менеджер доставки
const SimpleDeliveryManager = ({ cart, setCart }) => {
  const DELIVERY_COST = 250;
  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_ID = 'delivery_service';

  useEffect(() => {
    // Находим товары (исключая доставку)
    const products = cart.filter(item => item.id !== DELIVERY_ID);
    const productsSubtotal = products.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Находим доставку в корзине
    const deliveryItem = cart.find(item => item.id === DELIVERY_ID);
    
    // Логика 1: Добавляем доставку при первом товаре
    if (products.length > 0 && !deliveryItem) {
      const deliveryService = {
        id: DELIVERY_ID,
        name: 'Доставка',
        price: DELIVERY_COST,
        quantity: 1,
        imageUrl: '🛵',  // Без белого фона, выглядит современно
        isDelivery: true,
        description: 'Доставка по городу',
        weight: ''
      };
      
      setCart(prev => [...prev, deliveryService]);
      return;
    }
    
    // Логика 2: Убираем доставку если нет товаров
    if (products.length === 0 && deliveryItem) {
      setCart(prev => prev.filter(item => item.id !== DELIVERY_ID));
      return;
    }
    
    // Логика 3: Управляем ценой доставки
    if (deliveryItem) {
      const shouldBeFree = deliveryItem.isFreeDelivery && productsSubtotal >= FREE_DELIVERY_THRESHOLD;
      const correctPrice = shouldBeFree ? 0 : DELIVERY_COST;
      
      // Если сумма упала ниже порога - возвращаем платную доставку
      if (deliveryItem.isFreeDelivery && productsSubtotal < FREE_DELIVERY_THRESHOLD) {
        setCart(prev => prev.map(item => 
          item.id === DELIVERY_ID 
            ? { 
                ...item, 
                price: DELIVERY_COST,
                name: 'Доставка',
                isFreeDelivery: false
              }
            : item
        ));
      }
      // Поддерживаем правильную цену
      else if (deliveryItem.price !== correctPrice) {
        setCart(prev => prev.map(item => 
          item.id === DELIVERY_ID 
            ? { ...item, price: correctPrice }
            : item
        ));
      }
    }
    
  }, [cart, setCart]);

  return null;
};

// Простой прогрессбар к бесплатной доставке (остается вверху)
const FreeDeliveryProgress = ({ cart, settings }) => {
  const FREE_DELIVERY_THRESHOLD = 2000;
  
  // Считаем сумму без доставки
  const productsSubtotal = cart
    .filter(item => !item.isDelivery)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Проверяем есть ли доставка
  const deliveryItem = cart.find(item => item.isDelivery);
  const hasDelivery = !!deliveryItem;
  const isFreeDelivery = deliveryItem?.isFreeDelivery;
  
  // Показываем только если есть платная доставка и сумма меньше порога
  if (!hasDelivery || isFreeDelivery || productsSubtotal >= FREE_DELIVERY_THRESHOLD) {
    return null;
  }
  
  const remaining = FREE_DELIVERY_THRESHOLD - productsSubtotal;
  const progress = Math.min((productsSubtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
      padding: '1rem',
      borderRadius: '12px',
      marginBottom: '1rem',
      border: '2px dashed #4caf50',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem',
        color: '#2e7d32'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
          🚚 До бесплатной доставки
        </div>
        <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>
          ещё {formatNumber(remaining)} {settings.currency || '₽'}
        </div>
      </div>
      
      <div style={{
        background: '#fff',
        borderRadius: '999px',
        height: '10px',
        overflow: 'hidden',
        marginBottom: '0.5rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
          height: '100%',
          width: `${Math.max(progress, 5)}%`,
          borderRadius: '999px',
          transition: 'width 0.3s ease',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            borderRadius: '999px',
          }} />
        </div>
      </div>
      
      <div style={{ 
        fontSize: '0.85rem', 
        color: '#2e7d32',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Добавь ещё товаров и получи бесплатную доставку! 🎉
      </div>
    </div>
  );
};

// Попап бесплатной доставки (теперь как модальное окно)
const FreeDeliveryPopup = ({ cart, setCart, settings }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_ID = 'delivery_service';
  
  // Считаем сумму без доставки
  const productsSubtotal = cart
    .filter(item => !item.isDelivery)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const deliveryItem = cart.find(item => item.isDelivery);
  const shouldShow = productsSubtotal >= FREE_DELIVERY_THRESHOLD && 
                   deliveryItem && 
                   !deliveryItem.isFreeDelivery && 
                   !hasShown;

  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      setHasShown(true);
    }
  }, [shouldShow]);

  const handleActivateFreeDelivery = () => {
    setCart(prev => prev.map(item => 
      item.id === DELIVERY_ID 
        ? {
            ...item,
            name: 'Доставка 🎉',
            price: 0,
            isFreeDelivery: true
          }
        : item
    ));
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
        color: 'white',
        padding: '2rem',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '350px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '3px solid #ffeb3b',
        position: 'relative',
        animation: 'popupBounce 0.5s ease-out'
      }}>
        <style>
          {`
            @keyframes popupBounce {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); }
              70% { transform: scale(0.95); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>

        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
        
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          animation: 'bounce 1s infinite'
        }}>
          🎉
        </div>

        <style>
          {`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          `}
        </style>
        
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Поздравляем!
        </div>
        
        <div style={{ 
          fontSize: '1.1rem', 
          marginBottom: '1.5rem',
          opacity: 0.95,
          lineHeight: '1.4'
        }}>
          Вы получили<br/>
          <strong>бесплатную доставку!</strong>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button
            onClick={handleActivateFreeDelivery}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #ffeb3b, #ffc107)',
              color: '#2e7d32',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 15px rgba(255, 235, 59, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎁 Активировать!
          </button>
          
          <button
            onClick={handleClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '25px',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            Может позже
          </button>
        </div>
      </div>
    </div>
  );
};

export { SimpleDeliveryManager, FreeDeliveryProgress, FreeDeliveryPopup, formatNumber };
