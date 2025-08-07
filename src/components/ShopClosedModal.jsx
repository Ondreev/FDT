// components/ShopClosedModal.jsx
import React from 'react';

const ShopClosedModal = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '3px solid #ff7f32',
        position: 'relative',
        animation: 'shopClosedBounce 0.5s ease-out'
      }}>
        <style>
          {`
            @keyframes shopClosedBounce {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); }
              70% { transform: scale(0.95); }
              100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes sadFaceBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            
            @keyframes pulseGlow {
              0%, 100% { 
                box-shadow: 0 0 20px rgba(255, 127, 50, 0.4);
              }
              50% { 
                box-shadow: 0 0 30px rgba(255, 127, 50, 0.8);
              }
            }
          `}
        </style>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            color: '#666',
            fontSize: '1.5rem',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,0,0,0.2)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,0,0,0.1)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>

        {/* Грустная иконка */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'sadFaceBounce 2s infinite ease-in-out'
        }}>
          😔
        </div>

        {/* Заголовок */}
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#2c1e0f',
          marginBottom: '1rem',
          fontFamily: settings?.font || 'Fredoka'
        }}>
          Упс! Мы временно закрыты
        </h2>

        {/* Основное сообщение */}
        <div style={{
          backgroundColor: '#fff3e0',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '1.5rem',
          border: '2px solid #ffe0b3',
          animation: 'pulseGlow 3s infinite'
        }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#e65100',
            lineHeight: '1.6',
            margin: 0,
            fontWeight: '500'
          }}>
            🧹 <strong>Сегодня санитарный день!</strong>
            <br /><br />
            Заказать товары сейчас нельзя, но не расстраивайтесь — 
            <strong style={{ color: '#ff7f32' }}> завтра мы снова будем работать для вас!</strong>
          </p>
        </div>

        {/* Дополнительная информация */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          color: '#666'
        }}>
          <span>⏰</span>
          <span>Обычно мы работаем каждый день</span>
        </div>

        {/* Призыв к действию */}
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid #c3e6cb'
        }}>
          <div style={{
            fontSize: '1rem',
            color: '#2e7d32',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            💡 А пока можете:
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#4caf50',
            lineHeight: '1.5'
          }}>
            • Посмотреть наше меню<br />
            • Добавить любимые блюда в избранное<br />
            • Подписаться на нас в соцсетях
          </div>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            background: `linear-gradient(135deg, ${settings?.primaryColor || '#ff7f32'}, ${settings?.primaryColor || '#ff7f32'}dd)`,
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(255, 127, 50, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🤗 Понятно, увидимся завтра!
        </button>

        {/* Маленький текст внизу */}
        <div style={{
          fontSize: '0.8rem',
          color: '#999',
          marginTop: '1rem',
          fontStyle: 'italic'
        }}>
          Спасибо за понимание! ❤️
        </div>
      </div>
    </div>
  );
};

export default ShopClosedModal;
