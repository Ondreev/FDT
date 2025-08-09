// components/AddressInput.jsx - ПРОСТАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';

const AddressInput = ({ 
  isOpen, 
  onClose, 
  onSave, // ✅ Простой коллбек для сохранения
  settings = {} 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setIsValid(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsValid(inputValue.trim().length >= 10);
  }, [inputValue]);

  const handleSave = () => {
    if (isValid && onSave) {
      onSave(inputValue.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
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
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
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
            color: '#2c3e50'
          }}>
            📍 Адрес доставки
          </h3>
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
            marginBottom: '1rem'
          }}
        />

        <div style={{
          display: 'flex',
          gap: '0.8rem'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.8rem',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
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
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
