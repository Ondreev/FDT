// components/AddressInput.jsx
import React, { useState, useEffect } from 'react';
import { useDeliveryMode } from '../hooks/useDeliveryMode';

const AddressInput = ({ 
  isOpen, 
  onClose, 
  settings = {} 
}) => {
  const { setAddress, savedAddress } = useDeliveryMode();
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  // ✅ Инициализация значения при открытии
  useEffect(() => {
    if (isOpen) {
      console.log('AddressInput opened, savedAddress:', savedAddress);
      setInputValue(savedAddress || '');
      setIsValid(!!savedAddress && savedAddress.length >= 10);
    }
  }, [isOpen, savedAddress]);

  // ✅ Валидация ввода
  useEffect(() => {
    const trimmed = inputValue.trim();
    setIsValid(trimmed.length >= 10); // Минимум 10 символов для адреса
  }, [inputValue]);

  // ✅ ИСПРАВЛЕННАЯ обработка сохранения
  const handleSave = () => {
    if (isValid) {
      const address = inputValue.trim();
      console.log('Saving address:', address);
      setAddress(address);
      // Закрываем модальное окно сразу
      onClose();
    }
  };

  // ✅ Обработка нажатия Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSave();
    }
  };

  // ✅ ИСПРАВЛЕННАЯ обработка закрытия
  const handleClose = () => {
    console.log('Closing address input'); // Для отладки
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ✅ CSS для анимаций */}
      <style jsx>{`
        @keyframes modalSlide {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          maxWidth: '400px',
          width: '100%',
          animation: 'modalSlide 0.3s ease-out',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          {/* ✅ Заголовок */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📍</span>
              Адрес доставки
            </h3>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0.5rem',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          {/* ✅ Описание */}
          <div style={{
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            Укажите полный адрес доставки включая город, улицу, дом и квартиру
          </div>

          {/* ✅ Поле ввода */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Москва, ул. Пушкина, д. 10, кв. 5"
              autoFocus
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: `2px solid ${isValid ? '#4caf50' : '#ddd'}`,
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease',
                fontFamily: 'inherit'
              }}
            />
            
            {/* ✅ Индикатор валидности */}
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: isValid ? '#4caf50' : '#f44336',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <span>{isValid ? '✓' : '⚠️'}</span>
              {isValid ? 'Адрес корректный' : 'Введите полный адрес (минимум 10 символов)'}
            </div>
          </div>

          {/* ✅ Кнопки */}
          <div style={{
            display: 'flex',
            gap: '0.8rem',
            marginTop: '1.5rem'
          }}>
            <button
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '0.8rem',
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              Отмена
            </button>
            
            <button
              onClick={handleSave}
              disabled={!isValid}
              style={{
                flex: 2,
                padding: '0.8rem',
                background: isValid ? (settings.primaryColor || '#ff7f32') : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isValid ? 'pointer' : 'not-allowed',
                transition: 'background 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>💾</span>
              Сохранить адрес
            </button>
          </div>

          {/* ✅ Подсказка для быстрого ввода */}
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#666',
            lineHeight: '1.3'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>💡 Пример:</div>
            Москва, Тверская улица, дом 15, квартира 42
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressInput;
