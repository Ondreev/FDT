// components/DeliveryModeSelector.jsx
import React from 'react';
import { useDeliveryMode } from '../hooks/useDeliveryMode';

const DeliveryModeSelector = ({ 
  settings = {}, 
  inCart = false,
  compact = false 
}) => {
  const {
    deliveryMode,
    savedAddress,
    setDeliveryMode,
    openAddressInput,
    shouldShowWarning,
    isAddressConfirmed
  } = useDeliveryMode();

  // ✅ Обработка клика по доставке
  const handleDeliveryClick = () => {
    setDeliveryMode('delivery');
    // Если нет адреса, открываем ввод
    if (!savedAddress) {
      openAddressInput();
    }
  };

  // ✅ Обработка клика по самовывозу
  const handlePickupClick = () => {
    setDeliveryMode('pickup');
  };

  // ✅ Стили для разных режимов отображения
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? '0.5rem' : '0.8rem',
    padding: inCart ? '0' : (compact ? '0.5rem 1rem' : '1rem'),
    background: inCart ? 'transparent' : (settings.backgroundColor || '#fdf0e2'),
    borderRadius: inCart ? '0' : '12px',
    marginBottom: inCart ? '0' : '1rem'
  };

  const switcherStyle = {
    background: '#f0f0f0',
    borderRadius: '25px',
    padding: '4px',
    display: 'flex',
    position: 'relative',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '48px'
  };

  const buttonBaseStyle = {
    border: 'none',
    borderRadius: '20px',
    fontSize: compact ? '0.8rem' : '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    transition: 'all 0.3s ease',
    flex: 1,
    padding: compact ? '0.6rem' : '0.8rem',
    whiteSpace: 'nowrap'
  };

  const getButtonStyle = (mode, isActive) => ({
    ...buttonBaseStyle,
    background: isActive ? (settings.primaryColor || '#ff7f32') : 'transparent',
    color: isActive ? 'white' : '#666',
    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
  });

  return (
    <>
      {/* ✅ CSS для анимаций */}
      <style jsx>{`
        @keyframes warningBlink {
          0%, 100% { opacity: 1; background: #ffebee; border-color: #f44336; }
          50% { opacity: 0.7; background: #ffcdd2; border-color: #e53935; }
        }
        
        @keyframes addressSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={containerStyle}>
        {/* ✅ Переключатель режимов */}
        <div style={switcherStyle}>
          <button
            onClick={handleDeliveryClick}
            style={getButtonStyle('delivery', deliveryMode === 'delivery')}
          >
            <span>🚗</span>
            <span>Доставка</span>
          </button>
          
          <button
            onClick={handlePickupClick}
            style={getButtonStyle('pickup', deliveryMode === 'pickup')}
          >
            <span>🏃‍♂️</span>
            <span>Самовывоз</span>
          </button>
        </div>

        {/* ✅ Отображение адреса доставки */}
        {deliveryMode === 'delivery' && savedAddress && isAddressConfirmed && (
          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            padding: compact ? '0.6rem' : '0.8rem',
            borderRadius: '8px',
            border: '2px solid #2196f3',
            animation: 'addressSlide 0.3s ease-out'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.3rem'
            }}>
              <span style={{ fontSize: compact ? '1rem' : '1.1rem' }}>📍</span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: compact ? '0.8rem' : '0.9rem',
                color: '#1565c0'
              }}>
                Адрес доставки:
              </span>
            </div>
            <div style={{ 
              fontSize: compact ? '0.8rem' : '0.9rem',
              color: '#1976d2',
              fontWeight: '500',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {savedAddress}
            </div>
            <button
              onClick={openAddressInput}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1976d2',
                fontSize: compact ? '0.7rem' : '0.8rem',
                cursor: 'pointer',
                marginTop: '0.3rem',
                textDecoration: 'underline',
                padding: '0'
              }}
            >
              Изменить адрес
            </button>
          </div>
        )}

        {/* ✅ Адрес самовывоза */}
        {deliveryMode === 'pickup' && (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
            padding: compact ? '0.6rem' : '0.8rem',
            borderRadius: '8px',
            border: '2px solid #4caf50',
            animation: 'addressSlide 0.3s ease-out'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.3rem'
            }}>
              <span style={{ fontSize: compact ? '1rem' : '1.1rem' }}>🏪</span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: compact ? '0.8rem' : '0.9rem',
                color: '#2e7d32'
              }}>
                Адрес самовывоза:
              </span>
            </div>
            <div style={{ 
              fontSize: compact ? '0.8rem' : '0.9rem',
              color: '#388e3c',
              fontWeight: '500',
              lineHeight: '1.3'
            }}>
              Реутов, ул. Калинина, д. 8
            </div>
          </div>
        )}

        {/* ✅ Мигающее предупреждение */}
        {shouldShowWarning() && (
          <div style={{
            padding: compact ? '0.6rem' : '0.8rem',
            borderRadius: '8px',
            textAlign: 'center',
            animation: 'warningBlink 1.5s infinite',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (deliveryMode === 'delivery') {
              openAddressInput();
            }
          }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: compact ? '0.8rem' : '0.9rem',
              color: '#d32f2f'
            }}>
              {deliveryMode === 'delivery' ? '📍 Введите адрес доставки' : '⚠️ Выберите способ получения'}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeliveryModeSelector;
