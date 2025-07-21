import { useEffect, useState } from 'react';
import { useApi } from './hooks/useApi';
import { useCart } from './hooks/useCart';
import { ANIMATIONS, HOT_PRODUCT_MARKER } from './utils/constants';
import OrderingNowBanner from './components/Banners/OrderingNowBanner';
import Cart from './components/Cart/Cart';

function App() {
  const { settings, products, categories, discounts } = useApi();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    activateFreeDelivery,
    subtotal, 
    deliveryCost, 
    cartItemsCount,
    calculateDiscount
  } = useCart();

  const [activeCategory, setActiveCategory] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Загрузка шрифтов
  useEffect(() => {
    if (settings.font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.font]);

  // Свайп навигация
  const handleTouchStart = (e) => {
    if (categories.length === 0) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const allCategories = [null, ...categories.map(cat => cat.id)];
      const currentIndex = allCategories.indexOf(activeCategory);

      if (deltaX > 0 && currentIndex > 0) {
        setActiveCategory(allCategories[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < allCategories.length - 1) {
        setActiveCategory(allCategories[currentIndex + 1]);
      }
    }

    setIsSwiping(false);
  };

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      <style>
        {`
          ${ANIMATIONS.slideIn}
          ${ANIMATIONS.slideInLeft}
          
          @media (max-width: 400px) {
            .product-grid {
              grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
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
        {/* Header */}
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
          
          {/* Кнопка корзины */}
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

        {/* Категории */}
        {categories.length > 0 && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 900,
              background: settings.backgroundColor || '#fdf0e2',
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem 0',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
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

        {/* Сетка товаров */}
        <div
          className="product-grid"
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
              }}
            >
              {String(product.id).includes(HOT_PRODUCT_MARKER) && (
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
                style={{ 
                  width: '100%', 
                  maxWidth: '160px', 
                  borderRadius: '12px', 
                  marginBottom: '0.5rem' 
                }}
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
              
              <p style={{ 
                fontSize: '0.95rem', 
                margin: 0, 
                color: '#5a3d1d', 
                textAlign: 'center' 
              }}>
                {product.description}
              </p>
              
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#b5834f', 
                margin: '0.25rem 0' 
              }}>
                {product.weight}
              </p>
              
              <div style={{ 
                marginTop: 'auto',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%'
              }}>
                <p style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem', 
                  margin: '0', 
                  color: '#2c1e0f' 
                }}>
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

        {/* Баннеры */}
        <OrderingNowBanner 
          products={products} 
          settings={settings} 
          addToCart={addToCart} 
        />

        {/* Корзина */}
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          settings={settings}
          addToCart={addToCart}
          activateFreeDelivery={activateFreeDelivery}
          calculateDiscount={(discounts) => calculateDiscount(discounts)}
        />
      </div>
    </>
  );
}

export default App;
