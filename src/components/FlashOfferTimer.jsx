import { useState, useEffect } from 'react';

const FlashOfferTimer = ({ subtotal, products, settings, addToCart, cart }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Находим товар с R2000 в ID (это будет "6R2000")
  const specialProduct = products.find(p => String(p.id).includes('R2000'));
  
  // Проверяем, есть ли уже этот flash-товар в корзине
  const flashItem = cart.find(item => item.id === `${specialProduct?.id}_flash`);
  const isInCart = !!flashItem;

  // Простая логика активации предложения
  useEffect(() => {
    if (!specialProduct) return;

    const shouldShow = subtotal >= 2000 && !isInCart && !hasTriggered;
    
    if (shouldShow) {
      setTimeLeft(120);
      setIsActive(true);
      setHasTriggered(true);
    }
    
    // Скрываем если сумма упала или товар добавлен
    if ((subtotal < 2000 || isInCart) && isActive) {
      setIsActive(false);
      setTimeLeft(0);
    }
  }, [subtotal, specialProduct, isInCart, hasTriggered, isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Не показываем, если нет специального товара или предложение неактивно
  if (!specialProduct || !isActive || timeLeft <= 0 || isInCart) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const originalPrice = specialProduct.price;
  const discountedPrice = Math.round(originalPrice * 0.01); // 99% скидка

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff0844, #ffb199)',
      color: 'white',
      padding: '1rem',
      borderRadius: '12px',
      marginBottom: '1rem',
      border: '2px solid #ffd700',
      boxShadow: '0 4px 15px rgba(255, 8, 68, 0.3)',
      animation: 'flashPulse 2s infinite',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>
        {`
          @keyframes flashPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.01); }
          }
          
          @keyframes timerBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>

      {/* Компактный заголовок */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          ⚡ МОЛНИЕНОСНОЕ ПРЕДЛОЖЕНИЕ
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          animation: timeLeft <= 30 ? 'timerBlink 1s infinite' : 'none',
          color: timeLeft <= 30 ? '#ffff00' : '#ffffff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Компактный товар */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '0.75rem',
      }}>
        <img
          src={specialProduct.imageUrl}
          alt={specialProduct.name}
          style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '8px', 
            objectFit: 'cover',
            border: '2px solid #ffd700',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            marginBottom: '0.25rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {specialProduct.name}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem'
          }}>
            <span style={{ 
              textDecoration: 'line-through', 
              fontSize: '0.9rem',
              opacity: 0.8 
            }}>
              {originalPrice} ₽
            </span>
            <span style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              color: '#ffff00',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {discountedPrice} ₽
            </span>
            <span style={{
              background: '#ffff00',
              color: '#ff0844',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}>
              -99%
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          // Проверяем, нет ли уже этого товара в корзине
          const existingFlashItem = cart.find(item => 
            item.id === `${specialProduct.id}_flash`
          );
          
          if (existingFlashItem) {
            // Если уже есть - не добавляем и скрываем предложение
            setIsActive(false);
            return;
          }

          // Добавляем товар со скидкой 99% (только 1 штука)
          const discountedProduct = {
            ...specialProduct,
            price: discountedPrice,
            originalPrice: originalPrice,
            isFlashOffer: true,
            quantity: 1, // Фиксированное количество
            name: `${specialProduct.name} ⚡`,
            id: `${specialProduct.id}_flash` // Уникальный ID для flash-версии
          };
          addToCart(discountedProduct);
          setIsActive(false); // Скрываем предложение после добавления
        }}
        style={{
          width: '100%',
          padding: '0.6rem',
          background: 'linear-gradient(135deg, #ffff00, #ffd700)',
          color: '#ff0844',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.02)';
          e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.4)';
        }}
      >
        🔥 СХВАТИТЬ! 🔥
      </button>
    </div>
  );
};

export default FlashOfferTimer;
