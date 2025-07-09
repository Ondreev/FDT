import React, { useEffect, useState } from 'react';
import './App.css';

export default function App() {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycby073FVIxsh4rQ_3OVHaGeZtE7mev33gJNAYKUVrG6-shTjhepo0Zg-xeXxEuPJu5m3QA/exec';
    const [settingsRes, productsRes] = await Promise.all([
      fetch(scriptUrl + '?action=getSettings'),
      fetch(scriptUrl + '?action=getProducts')
    ]);
    const settingsJson = await settingsRes.json();
    const productsJson = await productsRes.json();
    setSettings(settingsJson);
    setProducts(productsJson);
  };

  return (
    <div className="app" style={{ backgroundColor: settings.background || '#fef6e4' }}>
      <header className="header">
        {settings.logo && <img src={settings.logo} alt="logo" className="logo" />}
        <h1 className="site-title">{settings.title || 'Заголовок сайта'}</h1>
      </header>

      <div className="product-list">
        {products.map((item, index) => (
          <div className="card" key={index}>
            <div className="card-content">
              <div className="card-text">
                <h2 className="title">{item.name}</h2>
                <p className="desc">{item.description}</p>
                <p className="weight">{item.weight}</p>
                <p className="price">{item.price} ₽</p>
              </div>
              <img src={item.image} alt={item.name} className="product-img" />
            </div>
            <div className="actions">
              <button className="btn">–</button>
              <span className="qty">1</span>
              <button className="btn">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
