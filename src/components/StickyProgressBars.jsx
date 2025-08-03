import React, { useState, useEffect } from 'react';
import { formatNumber } from './SimpleDeliveryManager';

// Тонкий прогресс-бар для бесплатной доставки
const StickyDeliveryProgress = ({ cart, settings, deliveryMode, onActivate }) => {
  if (deliveryMode !== 'delivery') return null;

  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_ID = 'delivery_service';

  const products = cart.filter(item => item.id !== DELIVERY_ID);
  const productsSubtotal = products.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  const deliveryItem = cart.find(item => item.id === DELIVERY_ID);
  
  // Не показываем если нет товаров или уже бесплатная доставка
  if (products.length === 0 || !deliveryItem || deliveryItem.isFreeDelivery) return null;

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - productsSubtotal);
  const progress = Math.min((productsSubtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const isEligible = productsSubtotal >= FREE_DELIVERY_THRESHOLD;

  // Если условие выполнено - показываем попап
  useEffect(() => {
    if (isEligible && onActivate) {
      onActivate('delivery');
    }
  }, [isEligible, onActivate]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
      padding: '6px 12px',
      fontSize: '11px',
      color: '#1565c0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(33, 150, 243, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span style={{ fontSize: '12px' }}>🚚</span>
        <span style={{ fontWeight: '600' }}>
          До бесплатной доставки: {formatNumber(remaining)}₽
        </span>
      </div>
      
      <div style={{
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '10px',
        height: '6px',
        width: '80px',
        overflow: 'hidden',
        marginLeft: '8px'
      }}>
        <div style={{
          width: `${Math.max(progress, 5)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

// Тонкий прогресс-бар для флеш-предложения с эффектами
const StickyFlashProgress = ({ products, cart, settings, onActivate }) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 час

  const flashProduct = products.find(p => String(p.id).includes('R2000'));
  if (!flashProduct) return null;

  const productsSubtotal = cart
    .filter(item => !item.isDelivery && !String(item.id).includes('S'))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const flashItem = cart.find(item => item.id === `${flashProduct.id}_flash`);
  if (flashItem) return null; // Не показываем если уже добавлен

  const remaining = Math.max(0, 2000 - productsSubtotal);
  const progress = Math.min((productsSubtotal / 2000) * 100, 100);
  const conditionMet = productsSubtotal >= 2000;
  const discountedPrice = Math.round(flashProduct.price * 0.01);

  // Таймер обратного отсчета
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 3600); // Сброс на час
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Сверкающий эффект при выполнении условия
  useEffect(() => {
    if (conditionMet) {
      setIsGlowing(true);
      if (onActivate) {
        onActivate('flash', { product: flashProduct, price: discountedPrice });
      }
    } else {
      setIsGlowing(false);
    }
  }, [conditionMet, onActivate, flashProduct, discountedPrice]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: conditionMet 
        ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
        : 'linear-gradient(135deg, #ff0844, #ff4081)',
      padding: '6px 12px',
      fontSize: '11px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: isGlowing ? 'flashGlow 1s infinite' : 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Сверкающий эффект */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: conditionMet ? 'shimmer 2s infinite' : 'none'
      }} />

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        flex: 1,
        position: 'relative',
        zIndex: 1
      }}>
        <span style={{ fontSize: '12px' }}>⚡</span>
        <span style={{ fontWeight: '600' }}>
          {conditionMet 
            ? `${flashProduct.name} за ${discountedPrice}₽!`
            : `До флеш-скидки: ${formatNumber(remaining)}₽`
          }
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Таймер */}
        <span style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          fontWeight: 'bold',
          color: conditionMet ? '#fff' : '#ffd700'
        }}>
          {formatTime(timeLeft)}
        </span>
        
        {/* Прогресс-бар */}
        <div style={{
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '10px',
          height: '6px',
          width: '60px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.max(progress, 5)}%`,
            height: '100%',
            background: conditionMet 
              ? 'linear-gradient(90deg, #ffd700, #ffeb3b)'
              : 'linear-gradient(90deg, #ffd700, #ffab00)',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
            animation: conditionMet ? 'pulse 1s infinite' : 'none'
          }} />
        </div>
      </div>

      <style>
        {`
          @keyframes flashGlow {
            0%, 100% { 
              box-shadow: 0 0 5px rgba(255,215,0,0.5);
            }
            50% { 
              box-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.6);
            }
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
};

// Главный компонент закрепленных прогресс-баров
const StickyProgressBars = ({ products, cart, settings, deliveryMode, onShowPopup }) => {
  const [showBars, setShowBars] = useState(false);

  // Показываем только если есть товары в корзине
  const hasProducts = cart.filter(item => !item.isDelivery).length > 0;

  useEffect(() => {
    const handleScroll = () => {
      // Показываем тонкие бары после прокрутки на 200px
      setShowBars(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!hasProducts || !showBars) return null;

  const handleActivation = (type, data) => {
    if (onShowPopup) {
      onShowPopup(type, data);
    }
  };

  return (
    <div style={{
      position: 'sticky',
      top: '0px', // Прямо под категориями
      zIndex: 899, // Ниже категорий (900), но выше остального контента
      background: settings.backgroundColor || '#fdf0e2',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <StickyDeliveryProgress 
        cart={cart}
        settings={settings}
        deliveryMode={deliveryMode}
        onActivate={handleActivation}
      />
      
      <StickyFlashProgress 
        products={products}
        cart={cart}
        settings={settings}
        onActivate={handleActivation}
      />
    </div>
  );
};

// Попапы при выполнении условий
const ActivationPopup = ({ type, isOpen, onClose, data, settings, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: type === 'flash' 
          ? 'linear-gradient(135deg, #ff0844, #ff4081)'
          : 'linear-gradient(135deg, #4caf50, #66bb6a)',
        color: 'white',
        padding: '24px',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '350px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'popupBounce 0.5s ease-out'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {type === 'flash' ? '⚡' : '🎉'}
        </div>
        
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '12px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {type === 'flash' ? 'ФЛЕШ ПРЕДЛОЖЕНИЕ!' : 'БЕСПЛАТНАЯ ДОСТАВКА!'}
        </h3>
        
        <p style={{
          fontSize: '16px',
          marginBottom: '20px',
          opacity: 0.95
        }}>
          {type === 'flash' 
            ? `${data?.product?.name} всего за ${data?.price}₽!`
            : 'Поздравляем! Вы получили бесплатную доставку!'
          }
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onConfirm}
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: type === 'flash' ? '#ff0844' : '#4caf50',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {type === 'flash' ? 'Добавить в корзину!' : 'Активировать!'}
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Позже
          </button>
        </div>
      </div>
      
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
    </div>
  );
};

export { StickyProgressBars, ActivationPopup };
