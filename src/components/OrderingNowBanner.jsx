import { useState, useEffect } from 'react';

const OrderingNowBanner = ({ products, settings, addToCart }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (products.length === 0) return;

    const showBanner = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      setCurrentProduct(randomProduct);
      setVisible(true);

      setTimeout(() => setVisible(false), 8000);
    };

    const initialTimer = setTimeout(showBanner, 5000);
    const interval = setInterval(showBanner, Math.random() * 5000 + 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products]);

  if (!visible || !currentProduct) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: settings.backgroundColor || '#fdf0e2',
        color: '#2c1e0f',
        padding: '1rem',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: 'slideIn 0.4s ease-out',
        border: '2px solid #f0e6d2',
        boxSizing: 'border-box',
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⭐</span> Сейчас заказывают
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            {currentProduct.name}
          </div>
          <div style={{ fontSize: '1rem', color: '#666' }}>
            {currentProduct.price} {settings.currency || '₽'}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          addToCart(currentProduct);
          setVisible(false);
        }}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: settings.primaryColor || '#ff7f32',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Хочешь? 😋
      </button>
    </div>
  );
};

export default OrderingNowBanner;
