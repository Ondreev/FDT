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
      }}
    >
      <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt="Logo" style={{ height: '36px' }} />
        )}
        <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>{settings.projectTitle || 'Заголовок сайта'}</h1>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1rem' }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              width: 'calc(50% - 1rem)',
              background: '#fff',
              borderRadius: '1rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '0.95rem',
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', maxWidth: '180px', objectFit: 'contain' }}
            />
            <h2 style={{ marginTop: '0.75rem', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center' }}>{product.name}</h2>
            <p style={{ margin: 0, textAlign: 'center', color: '#444' }}>{product.description}</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>{product.weight}</p>
            <p style={{ margin: '0.25rem 0', fontWeight: 'bold', fontSize: '1rem' }}>{product.price} {settings.currency || '₽'}</p>
            <button
              style={{
                backgroundColor: settings.primaryColor || '#ff7f32',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: '#fff',
                fontSize: '1.25rem',
                marginTop: '0.5rem',
                cursor: 'pointer',
                width: '100%',
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
