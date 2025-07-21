import { useEffect, useState } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

// Компонент "Заказывают сейчас"
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

// Компонент корзины
const Cart = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, settings }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        maxWidth: '400px',
        height: '100vh',
        background: settings.backgroundColor || '#fdf0e2',
        zIndex: 1001,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInLeft 0.3s ease-out',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
      }}
    >
      <style>
        {`
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c1e0f' }}>Корзина</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            color: '#666',
            fontSize: '20px',
          }}
        >
          ✕
        </button>
      </div>

      {cart.length > 0 && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            Итого: {total} {settings.currency || '₽'}
          </div>
          <button
            style={{
              padding: '0.75rem 2rem',
              background: settings.primaryColor || '#ff7f32',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Оформить заказ
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            Корзина пуста
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #eee',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c1e0f', marginBottom: '0.2rem' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1rem', color: '#666' }}>
                    {item.price} {settings.currency || '₽'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        fontSize: '18px',
                        cursor: 'pointer',
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        background: settings.primaryColor || '#ff7f32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        fontSize: '18px',
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e03636',
                        fontSize: '20px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Состояния для свайпа
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (settings.font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.font]);
  
  useEffect(() => {
    fetchData('getSettings', setSettings);
    fetchData('getProducts', setProducts);
    fetchData('getCategories', setCategories);
  }, []);

  const fetchData = (action, setter) => {
    fetch(`${API_URL}?action=${action}`)
      .then((res) => res.json())
      .then((data) => setter(data))
      .catch((err) => console.error(`Error fetching ${action}:`, err));
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Функции для свайпа
  const handleTouchStart = (e) => {
    if (categories.length === 0) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    // Предотвращаем скролл если это горизонтальный свайп
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
    
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping || categories.length === 0) {
      setIsSwiping(false);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Проверяем что это горизонтальный свайп
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const allCategories = [null, ...categories.map(cat => cat.id)];
      const currentIndex = allCategories.indexOf(activeCategory);

      if (deltaX > 0 && currentIndex > 0) {
        // Свайп вправо - предыдущая категория
        setActiveCategory(allCategories[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < allCategories.length - 1) {
        // Свайп влево - следующая категория
        setActiveCategory(allCategories[currentIndex + 1]);
      }
    }

    setIsSwiping(false);
  };

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
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
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>
      
      <div
        className="app"
        style={{
          fontFamily: settings.font || 'Fredoka',
          backgroundColor: settings.backgroundColor || '#fdf0e2',
          padding: '1rem',
          minHeight: '100vh',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                style={{ height: '60px', borderRadius: '8px' }}
              />
            )}
            <h1
              style={{
                fontWeight: '900',
                fontSize: '2.5rem',
                fontFamily: 'Fredoka',
                color: '#2c1e0f',
                margin: 0,
              }}
            >
              {settings.projectTitle || 'Заголовок'}
            </h1>
          </div>
          
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 1000,
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
            }}
          >
            🛒
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
                }}
              >
                {cartItemsCount}
              </span>
            )}
          </button>
        </header>

        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '5px',
            }}
          >
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '0.5rem 1.5rem',
                background: activeCategory === null ? settings.primaryColor || '#ff7f32' : '#fff5e6',
                color: activeCategory === null ? '#fff' : '#5c4022',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: activeCategory === cat.id ? settings.primaryColor || '#ff7f32' : '#fff5e6',
                  color: activeCategory === cat.id ? '#fff' : '#5c4022',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                position: 'relative',
                background: '#fff7ed',
                borderRadius: '20px',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {String(product.id).includes('H') && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#e03636',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '999px',
                    fontSize: '0.9rem',
                    fontFamily: settings.font || 'Fredoka',
                  }}
                >
                  ОСТРОЕ
                </div>
              )}
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', maxWidth: '160px', borderRadius: '12px', marginBottom: '0.5rem' }}
              />
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
              <p style={{ fontSize: '0.95rem', margin: 0, color: '#5a3d1d', textAlign: 'center' }}>{product.description}</p>
              <p style={{ fontSize: '0.9rem', color: '#b5834f', margin: '0.25rem 0' }}>{product.weight}</p>
              
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
                    onClick={() => {
                      const existing = cart.find(item => item.id === product.id);
                      if (existing && existing.quantity > 1) {
                        updateQuantity(product.id, existing.quantity - 1);
                      } else {
                        removeFromCart(product.id);
                      }
                    }}
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
                    {cart.find(item => item.id === product.id)?.quantity || 0}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
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
          ))}
        </div>

        <OrderingNowBanner products={products} settings={settings} addToCart={addToCart} />
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          settings={settings} 
        />
      </div>
    </>
  );
}
