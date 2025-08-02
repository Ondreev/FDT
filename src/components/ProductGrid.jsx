import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products, 
  categories, 
  activeCategory, 
  settings, 
  cart, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onRatingClick 
}) => {
  // ✅ СОСТОЯНИЕ ДЛЯ ЛЕНИВОЙ ЗАГРУЗКИ КАТЕГОРИЙ В РАЗДЕЛЕ "ВСЕ"
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(1);

  // ✅ СБРАСЫВАЕМ СЧЕТЧИК КАТЕГОРИЙ ПРИ СМЕНЕ АКТИВНОЙ КАТЕГОРИИ
  useEffect(() => {
    if (activeCategory === null) {
      setVisibleCategoriesCount(1);
    }
  }, [activeCategory]);

  // ✅ ФУНКЦИЯ ДЛЯ ОБРАБОТКИ ЗАГРУЗКИ СЛЕДУЮЩЕЙ КАТЕГОРИИ
  const handleLoadMore = () => {
    setVisibleCategoriesCount(prev => prev + 1);
  };

  // ✅ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ОТФИЛЬТРОВАННЫХ ТОВАРОВ
  const getFilteredProducts = () => {
    if (activeCategory) {
      // Если выбрана конкретная категория - показываем все её товары
      return products.filter((p) => p.category === activeCategory);
    } else {
      // Если раздел "ВСЕ" - показываем товары только из видимых категорий
      const visibleCategories = categories.slice(0, visibleCategoriesCount);
      const visibleCategoryIds = visibleCategories.map(cat => cat.id);
      return products.filter(product => visibleCategoryIds.includes(product.category));
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <>
      <style>
        {`
          .product-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }

          /* ✅ СТИЛИ ДЛЯ СЕТОВ (товары с буквой S) */
          .product-card-set {
            grid-column: span 2;
            max-width: none;
          }

          /* На очень узких экранах сеты занимают всю ширину */
          @media (max-width: 400px) {
            .product-grid {
              grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            }
            .product-card-set {
              grid-column: span 2;
            }
          }

          /* На средних экранах (планшеты) */
          @media (min-width: 401px) and (max-width: 768px) {
            .product-card-set {
              grid-column: span 2;
            }
          }

          /* На десктопе ограничиваем максимум 2 колонками для сетов */
          @media (min-width: 769px) {
            .product-card-set {
              grid-column: span 2;
              max-width: calc(2 * 180px + 1rem);
            }
          }
        `}
      </style>
      
      <div className="product-grid">
      {activeCategory ? (
        // ✅ ПОКАЗЫВАЕМ ТОВАРЫ КОНКРЕТНОЙ КАТЕГОРИИ (КАК РАНЬШЕ)
        filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className={String(product.id).includes('S') ? 'product-card-set' : ''}
          >
            <ProductCard
              product={product}
              settings={settings}
              cart={cart}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveFromCart={onRemoveFromCart}
              onRatingClick={onRatingClick}
            />
          </div>
        ))
      ) : (
        // ✅ РАЗДЕЛ "ВСЕ" С ЛЕНИВОЙ ЗАГРУЗКОЙ
        <>
          {categories.slice(0, visibleCategoriesCount).map((category, categoryIndex) => {
            const categoryProducts = products.filter(p => p.category === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <React.Fragment key={category.id}>
                {/* Заголовок категории */}
                <div style={{
                  gridColumn: '1 / -1',
                  marginTop: categoryIndex > 0 ? '2rem' : '1rem',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: '#2c1e0f',
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: settings.font || 'Fredoka'
                  }}>
                    {category.name}
                  </h3>
                </div>
                
                {/* Товары категории */}
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className={String(product.id).includes('S') ? 'product-card-set' : ''}
                  >
                    <ProductCard
                      product={product}
                      settings={settings}
                      cart={cart}
                      onAddToCart={onAddToCart}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemoveFromCart={onRemoveFromCart}
                      onRatingClick={onRatingClick}
                    />
                  </div>
                ))}
              </React.Fragment>
            );
          })}

          {/* ✅ КНОПКА "СМОТРЕТЬ ЕЩЕ" ИЛИ ФИНАЛЬНОЕ СООБЩЕНИЕ */}
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            {visibleCategoriesCount < categories.length ? (
              <button
                onClick={handleLoadMore}
                style={{
                  background: settings.primaryColor || '#ff7f32',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: settings.font || 'Fredoka',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Смотреть еще
              </button>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#fff7ed',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                <p style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#2c1e0f',
                  margin: 0,
                  fontFamily: settings.font || 'Fredoka'
                }}>
                  Ну это все наше меню, Готов заказать?
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default ProductGrid;
