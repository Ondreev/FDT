import React, { useState, useRef, useEffect } from 'react';

// Компонент плавающей панели с кнопками корзины и WhatsApp
const FloatingButtons = ({ cartItemsCount, onCartOpen, settings }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Начальная позиция (отступ от правого нижнего угла)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Размеры панели
  const PANEL_WIDTH = 60;
  const PANEL_HEIGHT = 130; // Высота для двух кнопок + отступ

  // Функция для ограничения позиции в пределах экрана
  const constrainPosition = (newX, newY) => {
    const maxX = window.innerWidth - PANEL_WIDTH - 10;
    const maxY = window.innerHeight - PANEL_HEIGHT - 10;
    
    return {
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY))
    };
  };

  // Сохранение позиции в localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingButtonsPosition');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(constrainPosition(parsed.x, parsed.y));
    } else {
      // Позиция по умолчанию - правый нижний угол
      setPosition(constrainPosition(
        window.innerWidth - PANEL_WIDTH - 20,
        window.innerHeight - PANEL_HEIGHT - 20
      ));
    }
  }, []);

  // Сохранение позиции при изменении
  useEffect(() => {
    localStorage.setItem('floatingButtonsPosition', JSON.stringify(position));
  }, [position]);

  // Touch события для перетаскивания
  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newPosition = constrainPosition(
      touch.clientX - dragStart.x,
      touch.clientY - dragStart.y
    );
    setPosition(newPosition);
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    e.preventDefault();
  };

  // Mouse события для десктопа
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newPosition = constrainPosition(
      e.clientX - dragStart.x,
      e.clientY - dragStart.y
    );
    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Добавляем глобальные обработчики для mouse событий
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Функция открытия WhatsApp
  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    const phoneNumber = '74951400557';
    const message = encodeURIComponent('Здравствуйте, у меня вопрос по заказу блюд.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Функция открытия корзины
  const handleCartClick = (e) => {
    e.stopPropagation();
    onCartOpen();
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: isDragging ? 'none' : 'all 0.2s ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Кнопка корзины */}
      <button
        onClick={handleCartClick}
        style={{
          background: settings.primaryColor || '#ff7f32',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '1.4rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }
        }}
      >
        {/* Белая иконка корзины */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: 'white' }}
        >
          <path
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="white"
          />
        </svg>
        
        {/* Счетчик товаров */}
        {cartItemsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#e03636',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              border: '2px solid white',
            }}
          >
            {cartItemsCount}
          </span>
        )}
      </button>

      {/* Кнопка WhatsApp */}
      <button
        onClick={handleWhatsAppClick}
        style={{
          background: '#25D366',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '1.4rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }
        }}
      >
        {/* WhatsApp иконка */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
        </svg>
      </button>

      {/* Индикатор перетаскивания */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          Перетаскивание...
        </div>
      )}
    </div>
  );
};

export default FloatingButtons;
