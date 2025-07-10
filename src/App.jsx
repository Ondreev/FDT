import { useEffect, useState } from 'react';
import './style.css';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

export default function App() {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

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
          <img src={settings.logoUrl} alt="Logo" style={{ height: '40px', borderRadius: '8px' }} />
        )}
        <h1
          style={{
            fontWeight: '900',
            fontSize: '1.75rem',
            fontFamily: 'Fredoka',
            color: '#2c1e0f',
            margin: 0,
          }}
        >
          {settings.projectTitle || 'Заголовок'}
        </h1>
      </header>

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: '0.5rem 1rem',
                background: '#fff5e6',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {cat.name}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>{product.name}</h2>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>{product.description}</p>
            <p style={{ fontSize: '0.9rem', color: '#777', margin: '0.25rem 0' }}>{product.weight}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: '0.25rem 0' }}>{product.price} {settings.currency || '₽'}</p>
            <button
              style={{
                marginTop: '0.5rem',
                backgroundColor: settings.primaryColor || '#ff7f32',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                fontSize: '1.25rem',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
