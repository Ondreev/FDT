import { useEffect, useState } from 'react';
import './style.css';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

export default function App() {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

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

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <div
      className="app"
      style={{
        fontFamily: settings.font || 'Fredoka',
        backgroundColor: settings.backgroundColor || '#fdf0e2',
        padding: '1rem',
      }}
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
      </header>

      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
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
            }}
          >
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
              }}
            >
              {product.name}
            </h2>
            <p style={{ fontSize: '0.95rem', margin: 0, color: '#5a3d1d' }}>{product.description}</p>
            <p style={{ fontSize: '0.9rem', color: '#b5834f', margin: '0.25rem 0' }}>{product.weight}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0.25rem 0', color: '#2c1e0f' }}>
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
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
