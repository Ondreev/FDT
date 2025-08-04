// components/PopupsContainer.jsx
import React from 'react';

const PopupsContainer = ({ 
  showFlashPopup, 
  setShowFlashPopup, 
  flashPopupData, 
  flashTimeLeft,
  showDeliveryPopup,
  setShowDeliveryPopup,
  deliveryTimeLeft,
  addToCartWithoutUpsell,
  setCart
}) => {
  return (
    <>
      {/* ✅ КРАСИВЫЙ ПОПАП ФЛЕШ-ПРЕДЛОЖЕНИЯ В МЕНЮ */}
      {showFlashPopup && flashPopupData && (
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
                
                @keyframes flashTimerBlink {
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
              onClick={() => setShowFlashPopup(false)}
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
                animation: flashTimeLeft <= 30 ? 'flashTimerBlink 1s infinite' : 'none',
                color: flashTimeLeft <= 30 ? '#ffff00' : '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}>
                {String(Math.floor(flashTimeLeft / 60)).padStart(2, '0')}:{String(flashTimeLeft % 60).padStart(2, '0')}
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
                src={flashPopupData.product.imageUrl}
                alt={flashPopupData.product.name}
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
                  {flashPopupData.product.name}
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
                    {flashPopupData.product.price} ₽
                  </span>
                  <span style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold',
                    color: '#ffff00',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {flashPopupData.price} ₽
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
              Экономия {flashPopupData.product.price - flashPopupData.price} ₽!<br/>
              Только сейчас и только для вас! ⏰
            </div>

            {/* Кнопки */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => {
                  const flashItem = {
                    ...flashPopupData.product,
                    id: `${flashPopupData.product.id}_flash`,
                    name: `${flashPopupData.product.name} ⚡`,
                    price: flashPopupData.price,
                    originalPrice: flashPopupData.product.price,
                    quantity: 1,
                    isFlashOffer: true,
                    isDiscounted: true,
                    violatesCondition: false
                  };
                  addToCartWithoutUpsell(flashItem);
                  setShowFlashPopup(false);
                }}
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
                onClick={() => setShowFlashPopup(false)}
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
      )}

      {/* ✅ КРАСИВЫЙ ПОПАП БЕСПЛАТНОЙ ДОСТАВКИ В МЕНЮ */}
      {showDeliveryPopup && (
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
            animation: 'deliveryPopupBounce 0.5s ease-out'
          }}>
            <style>
              {`
                @keyframes deliveryPopupBounce {
                  0% { transform: scale(0.3); opacity: 0; }
                  50% { transform: scale(1.05); }
                  70% { transform: scale(0.95); }
                  100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes deliveryTimerBlink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }

                @keyframes deliveryPulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.02); }
                }

                @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                  40% { transform: translateY(-10px); }
                  60% { transform: translateY(-5px); }
                }
              `}
            </style>

            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowDeliveryPopup(false)}
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

            {/* Таймер */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              animation: deliveryTimeLeft <= 30 ? 'deliveryTimerBlink 1s infinite' : 'none',
              color: deliveryTimeLeft <= 30 ? '#ffff00' : '#ffffff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}>
              {String(Math.floor(deliveryTimeLeft / 60)).padStart(2, '0')}:{String(deliveryTimeLeft % 60).padStart(2, '0')}
            </div>
            
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              animation: 'bounce 1s infinite'
            }}>
              🎉
            </div>
            
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
                onClick={() => {
                  setCart(prev => prev.map(item => 
                    item.id === 'delivery_service'
                      ? { ...item, price: 0, name: 'Доставка 🎉', isFreeDelivery: true }
                      : item
                  ));
                  setShowDeliveryPopup(false);
                }}
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
                  animation: 'deliveryPulse 2s infinite'
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
                onClick={() => setShowDeliveryPopup(false)}
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
      )}
    </>
  );
};

export default PopupsContainer;
