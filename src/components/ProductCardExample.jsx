// ProductCardExample.jsx - Пример использования новой системы конфигурации
// Показывает как правильно интегрировать clientConfig и productUtils

import React from 'react';
import { 
  getProductPrefixes, 
  isChefRecommended, 
  isFlashProduct,
  getProductCardStyles 
} from '../utils/productUtils.js';
import { getProductPrefixConfig, getProductSettings } from '../config/clientConfig.js';

/**
 * Пример компонента товара с новой системой конфигурации
 */
const ProductCardExample = ({ product, onAddToCart }) => {
  // Получаем настройки товаров из конфигурации
  const productSettings = getProductSettings();
  
  // Получаем префиксы товара
  const prefixes = getProductPrefixes(product.id);
  
  // Получаем стили для карточки товара
  const cardStyles = getProductCardStyles(product);

  // Функция для рендера бейджей с учетом кастомной конфигурации
  const renderBadges = () => {
    return prefixes.map((prefixInfo, index) => {
      if (prefixInfo.prefix === 'C') return null; // Корона рендерится отдельно
      
      // Пытаемся получить кастомную конфигурацию из Google Sheets
      const customConfig = getProductPrefixConfig(prefixInfo.prefix);
      const config = customConfig || prefixInfo;
      
      return (
        <div
          key={prefixInfo.prefix}
          style={{
            position: 'absolute',
            top: `${2.2 + (index * 1.3)}rem`,
            right: '1rem',
            backgroundColor: config.color,
            color: '#fff',
            fontWeight: 'bold',
            padding: '0.2rem 0.45rem',
            borderRadius: '999px',
            fontSize: '0.6rem',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem'
          }}
        >
          {config.emoji && <span>{config.emoji}</span>}
          {config.label}
        </div>
      );
    });
  };

  return (
    <div 
      style={{
        position: 'relative',
        background: '#fff7ed',
        borderRadius: '20px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Применяем стили из утилиты
        ...cardStyles.container
      }}
    >
      {/* Корона шефа */}
      {isChefRecommended(product) && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          fontSize: '1.5rem',
          zIndex: 3,
          animation: 'crownBounce 1.5s infinite'
        }}>
          {(() => {
            const customConfig = getProductPrefixConfig('C');
            return customConfig?.emoji || '👑';
          })()}
        </div>
      )}

      {/* Flash индикатор */}
      {isFlashProduct(product) && productSettings.flashDiscountPercent && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: '#ff0000',
          color: '#fff',
          textAlign: 'center',
          padding: '0.5rem',
          borderRadius: '20px 20px 0 0',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          animation: 'flashPulse 1s infinite'
        }}>
          ⚡ FLASH -{productSettings.flashDiscountPercent}%
        </div>
      )}

      {/* Изображение товара */}
      {product.image && (
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '100%',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '10px',
            marginTop: isFlashProduct(product) ? '2rem' : '0'
          }}
        />
      )}

      {/* Бейджи префиксов */}
      {productSettings.enablePrefixSystem && renderBadges()}

      {/* Информация о товаре */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 'bold',
          margin: '0 0 0.5rem 0'
        }}>
          {product.name}
        </h3>
        
        {product.description && (
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#666',
            margin: '0 0 1rem 0'
          }}>
            {product.description}
          </p>
        )}

        {/* Цена */}
        <div style={{ marginBottom: '1rem' }}>
          {isFlashProduct(product) ? (
            <div>
              <span style={{ 
                textDecoration: 'line-through',
                color: '#999',
                marginRight: '0.5rem'
              }}>
                {product.price}₽
              </span>
              <span style={{ 
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ff0000'
              }}>
                {Math.round(product.price * (100 - productSettings.flashDiscountPercent) / 100)}₽
              </span>
            </div>
          ) : (
            <span style={{ 
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {product.price}₽
            </span>
          )}
        </div>

        {/* Кнопка добавления */}
        <button
          onClick={() => onAddToCart(product)}
          style={{
            backgroundColor: isChefRecommended(product) ? '#FFD700' : '#ff7f32',
            color: isChefRecommended(product) ? '#000' : '#fff',
            border: 'none',
            borderRadius: '25px',
            padding: '0.8rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isChefRecommended(product) ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = isChefRecommended(product) ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none';
          }}
        >
          В корзину
        </button>
      </div>

      {/* Дебаг информация (только в dev режиме) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '0.5rem',
          fontSize: '0.7rem',
          borderRadius: '0 0 20px 20px'
        }}>
          ID: {product.id} | Префиксы: {prefixes.map(p => p.prefix).join(', ')}
        </div>
      )}
    </div>
  );
};

export default ProductCardExample;