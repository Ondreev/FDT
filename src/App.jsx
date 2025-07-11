import { useEffect, useState } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

export default function App() {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Подключение шрифтов
  useEffect(() => {
    if (settings.font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.font]);
  
  // Загрузка данных
  useEffect(() => {
    fetchData('getSettings', setSettings);
    fetchData('getProducts', setProducts);
    fetchData('getCategories', setCategories);
  }, []);

  // Установка первой категории как активной
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const fetchData = (action, setter) => {
    fetch(`${API_URL}?action=${action}`)
      .then((res) => res.json())
      .then((data) => setter(data))
      .catch((err) => console.error(`Error fetching ${action}:`, err));
  };

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  // Обработчики свайпов
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
      
      if (isLeftSwipe && currentIndex < categories.length - 1) {
        setActiveCategory(categories[currentIndex + 1].id);
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveCategory(categories[currentIndex - 1].id);
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
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
        }}
      >
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt="Logo"
            style={{ height: '60px', borderRadius: '8px' }}
          />
        )}
        <div style={{ flex: 1 }}>
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
          {/* Убираем плашку "ОСТРОЕ" отсюда */}
        </div>
      </header>

      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '0.5rem',
          }}
        >
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
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                transform: activeCategory === cat.id ? 'scale(1.05)' : 'scale(1)',
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
              background: '#fff7ed',
              borderRadius: '20px',
              padding: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative', // Важно для позиционирования плашки
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
            }}
          >
            {/* Плашка "ОСТРОЕ" теперь правильно позиционирована */}
            {String(product.id).includes('H') && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  backgroundColor: '#e03636',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontFamily: settings.font || 'Fredoka',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(224, 54, 54, 0.3)',
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
                marginBottom: '0.5rem',
                aspectRatio: '1/1',
                objectFit: 'cover',
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
              textAlign: 'center',
              lineHeight: '1.4',
            }}>
              {product.description}
            </p>
            
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#b5834f', 
              margin: '0.25rem 0',
              textAlign: 'center',
            }}>
              {product.weight}
            </p>
            
            <p style={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              margin: '0.25rem 0', 
              color: '#2c1e0f',
              textAlign: 'center',
            }}>
              {product.price} {settings.currency || '₽'}
            </p>
            
            <div
              style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
                marginTop: '0.5rem',
              }}
            >
              <button
                style={{
                  backgroundColor: settings.primaryColor || '#ff7f32',
                  color: '#fff',
                  fontSize: '1.25rem',
                  padding: '0.2rem 0.7rem',
                  border: 'none',
                  borderRadius: '12px 0 0 12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e66d29';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = settings.primaryColor || '#ff7f32';
                }}
              >
                -
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
                1
              </div>
              
              <button
                style={{
                  backgroundColor: settings.primaryColor || '#ff7f32',
                  color: '#fff',
                  fontSize: '1.25rem',
                  padding: '0.2rem 0.7rem',
                  border: 'none',
                  borderRadius: '0 12px 12px 0',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e66d29';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = settings.primaryColor || '#ff7f32';
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Индикатор свайпа */}
      {categories.length > 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeCategory === cat.id ? settings.primaryColor || '#ff7f32' : '#ddd',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
