import React from 'react';

// Компонент для отображения звездного рейтинга
const StarRating = ({ rating, size = 16, onClick, isClickable = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      cursor: isClickable ? 'pointer' : 'default'
    }} onClick={onClick}>
      {/* Полные звезды */}
      {Array(fullStars).fill().map((_, i) => (
        <span key={`full-${i}`} style={{ 
          color: '#FFD700', 
          fontSize: `${size}px`,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
        }}>
          ⭐
        </span>
      ))}
      
      {/* Половинчатая звезда */}
      {hasHalfStar && (
        <span style={{ 
          position: 'relative',
          color: '#FFD700',
          fontSize: `${size}px`,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
        }}>
          <span style={{ 
            position: 'absolute',
            overflow: 'hidden',
            width: '50%',
            color: '#FFD700'
          }}>⭐</span>
          <span style={{ color: '#ddd' }}>⭐</span>
        </span>
      )}
      
      {/* Числовой рейтинг */}
      <span style={{
        color: '#ff7f32',
        fontSize: `${size - 2}px`,
        fontWeight: 'bold',
        marginLeft: '4px'
      }}>
        {rating}
      </span>
    </div>
  );
};

// Основной компонент карточки товара
const ProductCard = ({ 
  product, 
  settings, 
  cart, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onRatingClick 
}) => {
  const quantity = cart.find(item => item.id === product.id)?.quantity || 0;

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    } else {
      onRemoveFromCart(product.id);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        background: '#fff7ed',
        borderRadius: '20px',
        padding: '1rem',
        boxShadow: String(product.id).includes('C') 
          ? '0 8px 25px rgba(255, 215, 0, 0.4)' 
          : '0 4px 12px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // ✅ ОБВОДКА ДЛЯ ТОВАРОВ ШЕФА
        border: String(product.id).includes('C') 
          ? '3px solid #FFD700' 
          : 'none',
        // ✅ АНИМАЦИЯ ДЛЯ ТОВАРОВ ШЕФА
        animation: String(product.id).includes('C') 
          ? 'chefGlow 2s infinite' 
          : 'none'
      }}
    >
      {/* Рейтинг справа вверху */}
      {product.rating && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 3
        }}>
          <StarRating 
            rating={parseFloat(product.rating)} 
            size={12} 
            onClick={() => onRatingClick(product)}
            isClickable={true}
          />
        </div>
      )}

      {/* ✅ КОРОНА ШЕФА - слева вверху */}
      {String(product.id).includes('C') && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          fontSize: '1.5rem',
          zIndex: 3,
          animation: 'crownBounce 1.5s infinite'
        }}>
          👑
        </div>
      )}

      {/* Плашки для типов блюд */}
      {String(product.id).includes('H') && (
        <div
          style={{
            position: 'absolute',
            top: '2.2rem',
            right: '1rem',
            backgroundColor: '#e03636',
            color: '#fff',
            fontWeight: 'bold',
            padding: '0.2rem 0.45rem',
            borderRadius: '999px',
            fontSize: '0.6rem',
            fontFamily: settings.font || 'Fredoka',
            zIndex: 2
          }}
        >
          ОСТРОЕ
        </div>
      )}

      {String(product.id).includes('Z') && (
        <div
          style={{
            position: 'absolute',
            top: String(product.id).includes('H') ? '3.5rem' : '2.2rem',
            right: '1rem',
            backgroundColor: '#ff7f32',
            color: '#fff',
            fontWeight: 'bold',
            padding: '0.2rem 0.45rem',
            borderRadius: '999px',
            fontSize: '0.6rem',
            fontFamily: settings.font || 'Fredoka',
            zIndex: 2
          }}
        >
          ЗАПЕЧЕННЫЙ
        </div>
      )}

      {String(product.id).includes('T') && (
        <div
          style={{
            position: 'absolute',
            top: (String(product.id).includes('H') ? '3.5rem' : 
                  String(product.id).includes('Z') ? '3.5rem' : '2.2rem'),
            right: '1rem',
            backgroundColor: '#8bc34a',
            color: '#fff',
            fontWeight: 'bold',
            padding: '0.2rem 0.45rem',
            borderRadius: '999px',
            fontSize: '0.6rem',
            fontFamily: settings.font || 'Fredoka',
            zIndex: 2
          }}
        >
          ТЕПЛЫЙ
        </div>
      )}
      
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{ 
          width: '100%', 
          maxWidth: '160px', 
          borderRadius: '12px', 
          marginBottom: '0.5rem'
        }}
      />

      {/* ✅ ПЛАШКА ШЕФА - под картинкой */}
      {String(product.id).includes('C') && (
        <div style={{
          background: '#FFD700',
          color: '#000',
          fontWeight: 'bold',
          padding: '0.2rem 0.5rem',
          borderRadius: '8px',
          fontSize: '0.6rem',
          fontFamily: settings.font || 'Fredoka',
          marginBottom: '0.5rem',
          animation: 'chefBadgePulse 2s infinite',
          textAlign: 'center',
          border: '2px solid #FFA500'
        }}>
          Шеф рекомендует!
        </div>
      )}
      
      <h2
        style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#4b2e12',
          margin: '0.5rem 0 0.25rem 0',
          textAlign: 'center',
        }}
      >
        {product.name}
      </h2>
      <p style={{ fontSize: '0.95rem', margin: 0, color: '#5a3d1d', textAlign: 'center' }}>
        {product.description}
      </p>
      <p style={{ fontSize: '0.9rem', color: '#b5834f', margin: '0.25rem 0' }}>
        {product.weight}
      </p>
      
      {/* Нижняя часть карточки */}
      <div style={{ 
        marginTop: 'auto',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%'
      }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0', color: '#2c1e0f' }}>
          {product.price} {settings.currency || '₽'}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleDecrement}
            style={{
              backgroundColor: settings.primaryColor || '#ff7f32',
              color: '#fff',
              fontSize: '1.25rem',
              padding: '0.2rem 0.7rem',
              border: 'none',
              borderRadius: '12px 0 0 12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            −
          </button>
          <div
            style={{
              background: '#fff1dd',
              padding: '0.2rem 1rem',
              border: 'none',
              fontWeight: 'bold',
              borderRadius: '4px',
              minWidth: '40px',
              textAlign: 'center',
            }}
          >
            {quantity}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            style={{
              backgroundColor: settings.primaryColor || '#ff7f32',
              color: '#fff',
              fontSize: '1.25rem',
              padding: '0.2rem 0.7rem',
              border: 'none',
              borderRadius: '0 12px 12px 0',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
