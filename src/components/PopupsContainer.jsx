import React from 'react';

// ✅ ОПТИМИЗИРОВАННЫЙ PopupsContainer.jsx для мобильных
const PopupsContainer = ({
  showFlashPopup,
  setShowFlashPopup,
  flashPopupData,
  flashTimeLeft,
  showDeliveryPopup,
  setShowDeliveryPopup,
  deliveryTimeLeft,
  addToCartWithoutUpsell,
  setCart,
  onDismissFlash
}) => {
  // ✅ Функция закрытия флеш-попапа
  const handleCloseFlashPopup = () => {
    setShowFlashPopup(false);
    onDismissFlash();
  };

  // ✅ Функция "Не сейчас"
  const handleNotNowFlash = () => {
    setShowFlashPopup(false);
    onDismissFlash();
  };

  const handleAddFlashToCart = () => {
    if (flashPopupData) {
      const flashItem = {
        ...flashPopupData.product,
        id: `${flashPopupData.product.id}_flash`,
        name: `${flashPopupData.product.name} ⚡`,
        price: flashPopupData.price,
        originalPrice: flashPopupData.product.price,
        quantity: 1,
        isFlashOffer: true,
        isDiscounted: true
      };
      addToCartWithoutUpsell(flashItem);
      setShowFlashPopup(false);
      onDismissFlash();
    }
  };

  const handleActivateFreeDelivery = () => {
    setCart(prevCart => {
      return prevCart.map(item => 
        item.id === 'delivery_service'
          ? { ...item, isFreeDelivery: true, price: 0, name: 'Доставка (бесплатно)' }
          : item
      );
    });
    setShowDeliveryPopup(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* ✅ CSS для анимаций */}
      <style jsx>{`
        @keyframes popupBounce {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes flashPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 8, 68, 0.6), 0 0 40px rgba(255, 215, 0, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 8, 68, 0.8), 0 0 60px rgba(255, 215, 0, 0.6);
            transform: scale(1.02);
          }
        }

        @keyframes timerBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* ✅ Компактный Flash Offer Popup с мерцанием */}
      {showFlashPopup && flashPopupData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '10px' // ✅ Уменьшены отступы для мобильных
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff0844, #ff4081)',
            borderRadius: '16px',
            padding: '16px', // ✅ Уменьшен padding
            maxWidth: '340px', // ✅ Уменьшена максимальная ширина
            width: 'calc(100% - 20px)', // ✅ Учитываем отступы
            color: 'white',
            position: 'relative',
            animation: 'popupBounce 0.5s ease-out, flashPulse 2s infinite', // ✅ Добавлено мерцание
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
          }}>
            {/* ✅ Компактный крестик */}
            <button
              onClick={handleCloseFlashPopup}
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              ✕
            </button>

            {/* ✅ Компактный заголовок */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              paddingTop: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                МОЛНИЕНОСНОЕ<br/>ПРЕДЛОЖЕНИЕ
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                animation: 'timerBlink 1s infinite' // ✅ Мигающий таймер
              }}>
                {formatTime(flashTimeLeft)}
              </div>
            </div>

            {/* ✅ Компактная карточка товара */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px',
              border: '2px solid #FFD700'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* ✅ Увеличенная картинка */}
                <img
                  src={flashPopupData.product.imageUrl}
                  alt={flashPopupData.product.name}
                  style={{
                    width: '70px', // ✅ Увеличено с 60px
                    height: '70px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    border: '2px solid #FFD700'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}> {/* ✅ minWidth: 0 предотвращает overflow */}
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '14px', 
                    marginBottom: '4px',
                    lineHeight: '1.2',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' // ✅ Обрезаем длинные названия
                  }}>
                    {flashPopupData.product.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      textDecoration: 'line-through',
                      opacity: 0.8,
                      fontSize: '12px'
                    }}>
                      {flashPopupData.product.price}₽
                    </span>
                    <span style={{
                      fontSize: '20px', // ✅ Немного уменьшено
                      fontWeight: 'bold',
                      color: '#FFD700'
                    }}>
                      {flashPopupData.price}₽
                    </span>
                    <span style={{
                      background: '#FFD700',
                      color: '#ff0844',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      -99%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Компактное описание экономии */}
            <div style={{
              textAlign: 'center',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Экономия {flashPopupData.product.price - flashPopupData.price}₽! 🔥
            </div>

            {/* ✅ Компактная основная кнопка */}
            <button
              onClick={handleAddFlashToCart}
              style={{
                width: '100%',
                background: '#FFD700',
                color: '#ff0844',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}
            >
              <span>🔥</span>
              СХВАТИТЬ!
              <span>🔥</span>
            </button>

            {/* ✅ Компактная кнопка "Не сейчас" */}
            <button
              onClick={handleNotNowFlash}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Не сейчас
            </button>
          </div>
        </div>
      )}

      {/* ✅ Delivery Popup - оставляем без изменений */}
      {showDeliveryPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            color: 'white',
            position: 'relative',
            animation: 'popupBounce 0.5s ease-out',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setShowDeliveryPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '24px' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  ПОЗДРАВЛЯЕМ!
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  Бесплатная доставка
                </div>
              </div>
              <div style={{
                marginLeft: 'auto',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 12px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {formatTime(deliveryTimeLeft)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '2px solid #FFD700'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚚</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                Ваш заказ превысил 2000₽!
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>
                Доставка теперь совершенно бесплатная
              </div>
            </div>

            <button
              onClick={handleActivateFreeDelivery}
              style={{
                width: '100%',
                background: '#FFD700',
                color: '#4CAF50',
                border: 'none',
                borderRadius: '15px',
                padding: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              🎉 Активировать бесплатную доставку
            </button>

            <button
              onClick={() => setShowDeliveryPopup(false)}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                padding: '12px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Позже
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PopupsContainer;
