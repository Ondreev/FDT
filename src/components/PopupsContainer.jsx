import React from 'react';

// ✅ ОБНОВЛЕННЫЙ PopupsContainer.jsx
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
  onDismissFlash // ✅ Новый проп для отклонения флеш-предложения
}) => {
  // ✅ ОБНОВЛЕННАЯ функция закрытия флеш-попапа
  const handleCloseFlashPopup = () => {
    setShowFlashPopup(false);
    onDismissFlash(); // ✅ Отмечаем как отклоненное глобально
  };

  // ✅ ОБНОВЛЕННАЯ функция "Не сейчас"
  const handleNotNowFlash = () => {
    setShowFlashPopup(false);
    onDismissFlash(); // ✅ Отмечаем как отклоненное глобально
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
      onDismissFlash(); // ✅ После добавления тоже отмечаем как закрытое
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
      {/* Flash Offer Popup */}
      {showFlashPopup && flashPopupData && (
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
            background: 'linear-gradient(135deg, #ff0844, #ff4081)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            color: 'white',
            position: 'relative',
            animation: 'popupBounce 0.5s ease-out',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {/* ✅ Крестик закрытия */}
            <button
              onClick={handleCloseFlashPopup}
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
              <span style={{ fontSize: '24px' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  МОЛНИЕНОСНОЕ
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  ПРЕДЛОЖЕНИЕ
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
                {formatTime(flashTimeLeft)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '15px',
              marginBottom: '20px',
              border: '2px solid #FFD700'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={flashPopupData.product.imageUrl}
                  alt={flashPopupData.product.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '10px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                    {flashPopupData.product.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      textDecoration: 'line-through',
                      opacity: 0.8,
                      fontSize: '14px'
                    }}>
                      {flashPopupData.product.price}₽
                    </span>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#FFD700'
                    }}>
                      {flashPopupData.price}₽
                    </span>
                    <span style={{
                      background: '#FFD700',
                      color: '#ff0844',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      -99%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Экономия {flashPopupData.product.price - flashPopupData.price}₽!
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              fontSize: '14px',
              opacity: 0.9
            }}>
              Только сейчас и только для вас! 🔥
            </div>

            <button
              onClick={handleAddFlashToCart}
              style={{
                width: '100%',
                background: '#FFD700',
                color: '#ff0844',
                border: 'none',
                borderRadius: '15px',
                padding: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔥</span>
              СХВАТИТЬ!
              <span>🔥</span>
            </button>

            {/* ✅ Кнопка "Не сейчас" тоже отклоняет предложение */}
            <button
              onClick={handleNotNowFlash}
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
              Не сейчас
            </button>
          </div>
        </div>
      )}

      {/* Delivery Popup - без изменений */}
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
