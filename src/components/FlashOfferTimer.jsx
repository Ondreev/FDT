import { useState, useEffect } from 'react';

const FlashOfferPopup = ({ subtotal, products, settings, addToCart, cart }) => {
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

  const handleClose = () => {
    setIsActive(false);
  };

  const handleAddToCart = () => {
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
  };

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
        background: 'linear-gradient(135deg, #ff0844, #ffb199)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '20px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '3px solid #ffd700',
        position: 'relative',
        animation: 'flashPopupBounce 0.5s ease-out'
      }}>
        <style>
          {`
            @keyframes flashPopupBounce {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); }
              70% { transform: scale(0.95); }
              100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes timerBlink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }

            @keyframes flashPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
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

        {/* Заголовок с таймером */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            ⚡ МОЛНИЕНОСНОЕ ПРЕДЛОЖЕНИЕ
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            animation: timeLeft <= 30 ? 'timerBlink 1s infinite' : 'none',
            color: timeLeft <= 30 ? '#ffff00' : '#ffffff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Товар */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '1rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '12px'
        }}>
          <img
            src={specialProduct.imageUrl}
            alt={specialProduct.name}
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '10px', 
              objectFit: 'cover',
              border: '2px solid #ffd700',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              marginBottom: '0.5rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              {specialProduct.name}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                textDecoration: 'line-through', 
                fontSize: '1rem',
                opacity: 0.8 
              }}>
                {originalPrice} ₽
              </span>
              <span style={{ 
                fontSize: '1.4rem', 
                fontWeight: 'bold',
                color: '#ffff00',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                {discountedPrice} ₽
              </span>
              <span style={{
                background: '#ffff00',
                color: '#ff0844',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}>
                -99%
              </span>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.95rem',
          marginBottom: '1.5rem',
          opacity: 0.9,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          lineHeight: '1.4'
        }}>
          Экономия {originalPrice - discountedPrice} ₽!<br/>
          Только сейчас и только для вас! ⏰
        </div>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button
            onClick={handleAddToCart}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #ffff00, #ffd700)',
              color: '#ff0844',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              transition: 'all 0.2s ease',
              animation: 'flashPulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
            }}
          >
            🔥 СХВАТИТЬ! 🔥
          </button>

          <button
            onClick={handleClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '15px',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            Не сейчас
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashOfferPopup;
