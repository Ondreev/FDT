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
        fontFamily: settings.font || 'sans-serif',
        backgroundColor: settings.backgroundColor || '#fff',
      }}
    >
      <header className="header">
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt="Logo" className="logo" />
        )}
        <h1 className="title">{settings.projectTitle || 'Заголовок сайта'}</h1>
      </header>

      <main className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-img" />
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-weight">{product.weight}</p>
              <p className="product-price">
                {product.price} {settings.currency || '₽'}
              </p>
            </div>
            <button
              className="product-btn"
              style={{ backgroundColor: settings.primaryColor || '#f90' }}
            >
              +
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
