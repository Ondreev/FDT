// components/DeliveryModeSelector.jsx - ПРОСТАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import AddressInput from './AddressInput';

const DeliveryModeSelector = ({ 
  settings = {}, 
  inCart = false,
  compact = false 
}) => {
  // ✅ ПРОСТЫЕ ЛОКАЛЬНЫЕ СОСТОЯНИЯ
  const [deliveryMode, setDeliveryMode] = useState(null);
  const [savedAddress, setSavedAddress] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);

  // ✅ Загрузка при старте
  useEffect(() => {
    const saved = localStorage.getItem('deliveryData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDeliveryMode(data.mode || null);
        setSavedAddress(data.address || '');
      } catch (e) {}
    }
    
    // ✅ ВСЕГДА показываем оверлей на главной странице при загрузке
    if (!inCart) {
      setShowOverlay(true);
    }
  }, [inCart]);

  // ✅ Сохранение при изменении
  useEffect(() => {
    if (deliveryMode) {
      localStorage.setItem('deliveryData', JSON.stringify({
        mode: deliveryMode,
        address: savedAddress,
        timestamp: Date.now()
      }));
    }
  }, [deliveryMode, savedAddress]);

  // ✅ Обработка выбора доставки
  const handleDeliveryClick = () => {
    console.log('Delivery clicked');
    setDeliveryMode('delivery');
    
    if (!savedAddress) {
      setShowAddressInput(true);
    } else {
      setShowOverlay(false); // Есть адрес - закрываем
    }
  };

  // ✅ Обработка выбора самовывоза
  const handlePickupClick = () => {
    console.log('Pickup clicked');
    setDeliveryMode('pickup');
    setShowOverlay(false); // Сразу закрываем
  };

  // ✅ Сохранение адреса
  const handleAddressSave = (address) => {
    console.log('Address saved:', address);
    setSavedAddress(address);
    setShowAddressInput(false);
    setShowOverlay(false); // Закрываем после ввода адреса
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? '0.5rem' : '0.8rem',
    padding: inCart ? '0' : (compact ? '0.5rem 1rem' : '1rem'),
    background: inCart ? 'transparent' : (settings.backgroundColor || '#fdf0e2'),
    borderRadius: inCart ? '0' : '12px',
    marginBottom: inCart ? '0' : '1rem',
    position: 'relative',
    zIndex: showOverlay && !inCart ? 1000 : 'auto'
  };

  const switcherStyle = {
    background: '#f0f0f0',
    borderRadius: '25px',
    padding: '4px',
    display: 'flex',
    position: 'relative',
    boxShadow: showOverlay && !inCart
      ? '0 0 0 4px rgba(255, 127, 50, 0.3), 0 8px 32px rgba(0,0,0,0.3)' 
      : 'inset 0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '48px',
    transition: 'all 0.3s ease'
  };

  const getButtonStyle = (mode, isActive) => ({
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
    whiteSpace: 'nowrap',
    background: isActive ? (settings.primaryColor || '#ff7f32') : 'transparent',
    color: isActive ? 'white' : '#666',
    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
  });

  return (
    <>
      {/* ✅ ПРОСТОЕ затемнение */}
      {showOverlay && !inCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999,
          pointerEvents: 'none'
        }} />
      )}

      <div style={containerStyle}>
        {/* ✅ Подсказка при выборе */}
        {showOverlay && !inCart && (
          <div style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: settings.primaryColor || '#ff7f32'
          }}>
            {savedAddress 
              ? `ПРОВЕРЬ СВОЙ АДРЕС` 
              : 'Выберите способ получения заказа'
            }
          </div>
        )}

        {/* ✅ Простые кнопки */}
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

        {/* ✅ Показ адреса доставки */}
        {deliveryMode === 'delivery' && savedAddress && (
          <div style={{
            padding: '0.3rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ fontSize: '0.9rem' }}>📍</span>
            <div style={{ 
              fontSize: '0.9rem',
              color: '#2c1e0f',
              fontWeight: 'bold',
              flex: 1
            }}>
              {savedAddress}
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
                  textDecoration: 'underline'
                }}
              >
                изменить
              </button>
            )}
          </div>
        )}

        {/* ✅ Показ адреса самовывоза */}
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

        {/* ✅ Предупреждение если ничего не выбрано */}
        {!deliveryMode && !showOverlay && (
          <div 
            style={{
              padding: '0.3rem 0',
              textAlign: 'center',
              color: '#d32f2f',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            ⚠️ Выберите способ получения
          </div>
        )}
      </div>

      {/* ✅ ПРОСТОЙ ввод адреса */}
      <AddressInput
        isOpen={showAddressInput}
        onClose={() => setShowAddressInput(false)}
        onSave={handleAddressSave}
        settings={settings}
      />
    </>
  );
};

export default DeliveryModeSelector;
