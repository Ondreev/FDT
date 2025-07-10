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
            style={{ height: '90px', borderRadius: '8px' }}
          />
        )}
        <h1
          style={{
            fontWeight: '900',
            fontSize: '3rem',
            fontFamily: 'Fredoka',
            color: '#3d1f0e',
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
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.8rem 2rem',
                background: activeCategory === cat.id ? '#fff' : '#fcecd8',
                color: activeCategory === cat.id ? '#3c210b' : '#7c5030',
                borderRadius: '16px',
                fontSize: '1.3rem',
                fontFamily: 'Fredoka',
                fontWeight: 600,
                border: activeCategory === cat.id ? '4px solid #dca87a' : 'none',
                boxShadow: activeCategory === cat.id ? '0 3px 10px rgba(0,0,0,0.08)' : 'none',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.2rem',
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            style={{
              background: '#fff8ed',
              borderRadius: '24px',
              padding: '1.2rem',
              boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', maxWidth: '170px', borderRadius: '14px', marginBottom: '0.5rem' }}
            />
            <h2
              style={{
                fontSize: '1.7rem',
                fontWeight: 700,
                color: '#3d1f0e',
                fontFamily: 'Fredoka',
                margin: '0.5rem 0 0.3rem 0',
              }}
            >
              {product.name}
            </h2>
            <p style={{ fontSize: '1.1rem', margin: 0, color: '#7d5136', fontFamily: 'Fredoka' }}>{product.description}</p>
            <p style={{ fontSize: '1rem', color: '#b5834f', margin: '0.25rem 0', fontFamily: 'Fredoka' }}>{product.weight}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.4rem', margin: '0.25rem 0', color: '#3d1f0e', fontFamily: 'Fredoka' }}>
              {product.price} {settings.currency || '₽'}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.2rem',
                alignItems: 'center',
                marginTop: '0.6rem',
              }}
            >
              <button
                style={{
                  backgroundColor: settings.primaryColor || '#ff7f32',
                  color: '#fff',
                  fontSize: '1.5rem',
                  padding: '0.3rem 0.8rem',
                  border: 'none',
                  borderRadius: '16px 0 0 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <div
                style={{
                  background: '#ffe9c9',
                  padding: '0.35rem 1.2rem',
                  border: 'none',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  fontSize: '1.2rem',
                  fontFamily: 'Fredoka',
                }}
              >
                1
              </div>
              <button
                style={{
                  backgroundColor: settings.primaryColor || '#ff7f32',
                  color: '#fff',
                  fontSize: '1.5rem',
                  padding: '0.3rem 0.8rem',
                  border: 'none',
                  borderRadius: '0 16px 16px 0',
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
