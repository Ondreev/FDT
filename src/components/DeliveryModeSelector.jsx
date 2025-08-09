// components/DeliveryModeSelector.jsx
import React, { useState } from 'react';
import { useDeliveryMode } from '../hooks/useDeliveryMode';
import AddressInput from './AddressInput';

const DeliveryModeSelector = ({ 
  settings = {}, 
  inCart = false,
  compact = false 
}) => {
  const {
    deliveryMode,
    savedAddress,
    needsSelection,
    setDeliveryMode,
    openAddressInput,
    shouldShowWarning,
    isAddressConfirmed
  } = useDeliveryMode();

  const [showAddressInput, setShowAddressInput] = useState(false);

  // ✅ Обработка клика по доставке
  const handleDeliveryClick = () => {
    console.log('Delivery clicked');
    setDeliveryMode('delivery');
    
    // Если нет адреса, открываем ввод
    if (!savedAddress) {
      setShowAddressInput(true);
    }
  };

  // ✅ Обработка клика по самовывозу
  const handlePickupClick = () => {
    console.log('Pickup clicked');
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
    marginBottom: inCart ? '0' : '1rem',
    position: 'relative',
    zIndex: needsSelection ? 1000 : 'auto'
  };

  const switcherStyle = {
    background: '#f0f0f0',
    borderRadius: '25px',
    padding: '4px',
    display: 'flex',
    position: 'relative',
    boxShadow: needsSelection 
      ? '0 0 0 4px rgba(255, 127, 50, 0.3), 0 8px 32px rgba(0,0,0,0.3)' 
      : 'inset 0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '48px',
    transition: 'all 0.3s ease'
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
      {/* ✅ Затемнение при выборе режима */}
      {needsSelection && !inCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999,
          pointerEvents: 'none' // Позволяет кликать через затемнение
        }} />
      )}

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
        {/* ✅ Подсказка при выборе режима */}
        {needsSelection && !inCart && (
          <div style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: settings.primaryColor || '#ff7f32'
          }}>
            {savedAddress 
              ? `Вам на этот же адрес? ${savedAddress}` 
              : 'Выберите способ получения заказа'
            }
          </div>
        )}

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

        {/* ✅ Простое отображение адреса доставки */}
        {deliveryMode === 'delivery' && savedAddress && isAddressConfirmed && (
          <div style={{
            padding: '0.3rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.4rem',
              flex: 1,
              minWidth: 0
            }}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>📍</span>
              <div style={{ 
                fontSize: '0.9rem',
                color: '#2c1e0f',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {savedAddress}
              </div>
            </div>
            {!compact && (
              <button
                onClick={() => setShowAddressInput(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '3px',
                  flexShrink: 0,
                  textDecoration: 'underline'
                }}
              >
                изменить
              </button>
            )}
          </div>
        )}

        {/* ✅ Простое отображение адреса самовывоза */}
        {deliveryMode === 'pickup' && (
          <div style={{
            padding: '0.3rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ fontSize: '0.9rem' }}>🏪</span>
            <div style={{ 
              fontSize: '0.9rem',
              color: '#2c1e0f',
              fontWeight: 'bold'
            }}>
              Реутов, ул. Калинина, д. 8
            </div>
          </div>
        )}

        {/* ✅ Кнопка изменить адрес если выбрана доставка но нет адреса */}
        {needsSelection && deliveryMode === 'delivery' && savedAddress && (
          <button
            onClick={() => setShowAddressInput(true)}
            style={{
              background: 'transparent',
              border: '2px solid #ff7f32',
              color: '#ff7f32',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📝 Изменить адрес
          </button>
        )}

        {/* ✅ Простое мигающее предупреждение */}
        {shouldShowWarning() && !needsSelection && (
          <div 
            style={{
              padding: '0.3rem 0',
              textAlign: 'center',
              animation: 'warningBlink 1.5s infinite',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (deliveryMode === 'delivery') {
                setShowAddressInput(true);
              }
            }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '0.9rem',
              color: '#d32f2f'
            }}>
              {deliveryMode === 'delivery' ? '📍 Введите адрес доставки' : '⚠️ Выберите способ получения'}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Компонент ввода адреса */}
      <AddressInput
        isOpen={showAddressInput}
        onClose={() => setShowAddressInput(false)}
        settings={settings}
      />
    </>
  );
};

export default DeliveryModeSelector;
