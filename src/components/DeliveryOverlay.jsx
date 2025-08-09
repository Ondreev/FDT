// components/DeliveryOverlay.jsx
import React, { useState } from 'react';
import { useDeliveryMode } from '../hooks/useDeliveryMode';
import AddressInput from './AddressInput';

const DeliveryOverlay = ({ settings = {} }) => {
  const {
    showOverlay,
    savedAddress,
    isFirstVisit,
    setDeliveryMode,
    closeOverlay
  } = useDeliveryMode();

  const [showAddressInput, setShowAddressInput] = useState(false);

  // ✅ Обработка выбора доставки
  const handleDeliveryChoice = () => {
    if (savedAddress) {
      // Если есть сохраненный адрес, сразу устанавливаем режим
      setDeliveryMode('delivery');
    } else {
      // Если нет адреса, открываем ввод
      setShowAddressInput(true);
    }
  };

  // ✅ Обработка выбора самовывоза
  const handlePickupChoice = () => {
    setDeliveryMode('pickup');
  };

  // ✅ Обработка клика по затемненной области
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeOverlay();
    }
  };

  // ✅ Закрытие ввода адреса
  const handleAddressInputClose = () => {
    setShowAddressInput(false);
    if (!savedAddress) {
      // Если адрес не введен, остаемся в оверлее
      return;
    }
  };

  if (!showOverlay) return null;

  return (
    <>
      {/* ✅ CSS для анимаций */}
      <style jsx>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes addressBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>

      {/* ✅ Основной оверлей */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'overlayFadeIn 0.3s ease-out'
        }}
        onClick={handleOverlayClick}
      >
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          animation: 'cardSlideUp 0.4s ease-out',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          {/* ✅ Заголовок */}
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem'
          }}>
            🛒
          </div>
          
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '0.5rem',
            margin: 0
          }}>
            {isFirstVisit ? 'Добро пожаловать!' : 'Как получите заказ?'}
          </h2>

          <div style={{
            fontSize: '1rem',
            color: '#666',
            marginBottom: '1.5rem',
            lineHeight: '1.4'
          }}>
            {isFirstVisit 
              ? 'Выберите удобный способ получения заказа'
              : 'Укажите предпочтительный способ получения'
            }
          </div>

          {/* ✅ Блок с сохраненным адресом */}
          {savedAddress && (
            <div style={{
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '2px solid #2196f3',
              animation: 'addressBounce 2s infinite'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#1565c0',
                marginBottom: '0.5rem'
              }}>
                📍 Ваш сохраненный адрес:
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#1976d2',
                fontWeight: '500',
                lineHeight: '1.3'
              }}>
                {savedAddress}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#1565c0',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                Доставим на этот же адрес?
              </div>
            </div>
          )}

          {/* ✅ Кнопки выбора */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={handleDeliveryChoice}
              style={{
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '1.5rem' }}>🚗</span>
              <div>
                <div>{savedAddress ? 'Да, доставка на этот адрес' : 'Доставка'}</div>
                {!savedAddress && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Укажем адрес доставки
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={handlePickupChoice}
              style={{
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #ff7f32, #ff6b1a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(255, 127, 50, 0.3)'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '1.5rem' }}>🏃‍♂️</span>
              <div>
                <div>Самовывоз</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  Реутов, ул. Калинина, д. 8
                </div>
              </div>
            </button>
          </div>

          {/* ✅ Дополнительные действия */}
          {savedAddress && (
            <button
              onClick={() => setShowAddressInput(true)}
              style={{
                background: 'transparent',
                border: '1px solid #ddd',
                color: '#666',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                width: '100%'
              }}
            >
              📝 Изменить адрес доставки
            </button>
          )}

          {/* ✅ Кнопка "Выбрать позже" */}
          <button
            onClick={closeOverlay}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.5rem'
            }}
          >
            Выбрать позже
          </button>
        </div>
      </div>

      {/* ✅ Компонент ввода адреса */}
      <AddressInput
        isOpen={showAddressInput}
        onClose={handleAddressInputClose}
        settings={settings}
      />
    </>
  );
};

export default DeliveryOverlay;
