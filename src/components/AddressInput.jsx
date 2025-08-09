// components/AddressInput.jsx - Обновленная версия с проверкой зон доставки
import React, { useState } from 'react';
import { checkDeliveryZone } from '../utils/deliveryZones';

const AddressInput = ({ 
  isOpen, 
  onClose, 
  onSave, 
  settings = {} 
}) => {
  const [address, setAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [error, setError] = useState('');

  // ✅ ФУНКЦИЯ ПРОВЕРКИ ЗОНЫ ДОСТАВКИ
  const handleAddressCheck = async () => {
    if (!address.trim()) {
      setError('Введите адрес');
      return;
    }

    setIsChecking(true);
    setError('');
    setZoneInfo(null);

    try {
      console.log('🔍 Проверяем адрес:', address);
      const result = await checkDeliveryZone(address);
      
      if (result.success) {
        console.log('✅ Зона найдена:', result);
        setZoneInfo(result);
        setError('');
      } else {
        console.log('❌ Зона не найдена:', result.error);
        setZoneInfo(null);
        setError(result.error);
      }
    } catch (err) {
      console.error('💥 Ошибка проверки:', err);
      setError('Ошибка при проверке адреса');
      setZoneInfo(null);
    }

    setIsChecking(false);
  };

  // ✅ ФУНКЦИЯ СОХРАНЕНИЯ АДРЕСА
  const handleSave = () => {
    if (!address.trim()) {
      setError('Введите адрес');
      return;
    }

    if (!zoneInfo) {
      setError('Сначала проверьте адрес');
      return;
    }

    // Сохраняем адрес и информацию о зоне
    const addressData = {
      address: address.trim(),
      zone: zoneInfo.zone,
      cost: zoneInfo.cost,
      freeFrom: zoneInfo.freeFrom,
      label: zoneInfo.label
    };

    console.log('💾 Сохраняем адрес с зоной:', addressData);
    
    // Сохраняем в localStorage для использования в других компонентах
    localStorage.setItem('deliveryZoneInfo', JSON.stringify(addressData));
    
    // Вызываем callback родителя
    onSave(address.trim());
    
    // Закрываем модальное окно
    onClose();
  };

  // ✅ ФУНКЦИЯ СБРОСА
  const handleReset = () => {
    setAddress('');
    setZoneInfo(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        {/* ✅ ЗАГОЛОВОК */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: '#2c1e0f'
          }}>
            📍 Укажите адрес доставки
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* ✅ ПОЛЕ ВВОДА АДРЕСА */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              // Сбрасываем результаты при изменении адреса
              if (zoneInfo || error) {
                setZoneInfo(null);
                setError('');
              }
            }}
            placeholder="Например: Реутов, ул. Калинина, 8"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = settings.primaryColor || '#ff7f32'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddressCheck();
              }
            }}
          />
        </div>

        {/* ✅ КНОПКА ПРОВЕРКИ */}
        <button
          onClick={handleAddressCheck}
          disabled={!address.trim() || isChecking}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: isChecking 
              ? '#ccc' 
              : (settings.primaryColor || '#ff7f32'),
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          {isChecking ? '🔍 Проверяем адрес...' : '🔍 Проверить зону доставки'}
        </button>

        {/* ✅ РЕЗУЛЬТАТ ПРОВЕРКИ */}
        {zoneInfo && (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #4caf50'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <div style={{
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#2e7d32'
              }}>
                {zoneInfo.label}
              </div>
            </div>
            
            <div style={{
              fontSize: '1rem',
              color: '#2e7d32',
              lineHeight: '1.4'
            }}>
              💰 <strong>Стоимость доставки: {zoneInfo.cost}₽</strong>
              <br />
              🆓 Бесплатно при заказе от {zoneInfo.freeFrom}₽
            </div>
          </div>
        )}

        {/* ✅ ОШИБКА */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #f44336'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>❌</span>
              <div style={{
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#d32f2f'
              }}>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* ✅ КНОПКИ ДЕЙСТВИЙ */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px'
        }}>
          {zoneInfo ? (
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✅ Сохранить адрес
            </button>
          ) : null}
          
          <button
            onClick={handleReset}
            style={{
              flex: zoneInfo ? 0.5 : 1,
              padding: '12px 24px',
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🔄 Очистить
          </button>
          
          <button
            onClick={onClose}
            style={{
              flex: zoneInfo ? 0.5 : 1,
              padding: '12px 24px',
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>

        {/* ✅ ПОДСКАЗКА */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center'
        }}>
          💡 Введите полный адрес с названием города и номером дома для точной проверки зоны доставки
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
