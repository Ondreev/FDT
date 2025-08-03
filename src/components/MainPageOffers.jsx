import React, { useState } from 'react';
import { formatNumber } from './SimpleDeliveryManager';

// Компактная карточка флеш-предложения для главной страницы
export const MainPageFlashOffer = ({ products, cart, settings, addToCart }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const flashProduct = products.find(p => String(p.id).includes('R2000'));
  if (!flashProduct) return null;

  // Считаем сумму товаров (исключая доставку и сеты)
  const productsSubtotal = cart
    .filter(item => !item.isDelivery && !String(item.id).includes('S'))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const remaining = Math.max(0, 2000 - productsSubtotal);
  const progress = Math.min((productsSubtotal / 2000) * 100, 100);
  const conditionMet = productsSubtotal >= 2000;
  const discountedPrice = Math.round(flashProduct.price * 0.01);

  // Проверяем, есть ли уже flash товар в корзине
  const flashItem = cart.find(item => item.id === `${flashProduct.id}_flash`);
  if (flashItem) return null;

  const handleAddToCart = () => {
    const flashItemToAdd = {
      ...flashProduct,
      id: `${flashProduct.id}_flash`,
      name: `${flashProduct.name} ⚡`,
      price: conditionMet ? discountedPrice : flashProduct.price,
      originalPrice: flashProduct.price,
      quantity: 1,
      isFlashOffer: true,
      isDiscounted: conditionMet,
      violatesCondition: !conditionMet
    };
    addToCart(flashItemToAdd);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff0844, #ff4081)',
      borderRadius: '12px',
      padding: '12px',
      margin: '16px 0',
      color: 'white',
      position: 'relative',
      boxShadow: '0 4px 15px rgba(255, 8, 68, 0.25)'
    }}>
      {/* Компактный заголовок с крестиком */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 'bold'
        }}>
          <span>⚡</span>
          <span>ФЛЕШ ПРЕДЛОЖЕНИЕ</span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
      </div>

      {/* Компактная информация о товаре */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <img
          src={flashProduct.imageUrl}
          alt={flashProduct.name}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            {flashProduct.name}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px'
          }}>
            <span style={{ textDecoration: 'line-through', opacity: 0.8 }}>
              {formatNumber(flashProduct.price)}₽
            </span>
            <span style={{ fontWeight: 'bold', color: '#FFD700' }}>
              {discountedPrice}₽
            </span>
            <span style={{
              background: '#FFD700',
              color: '#ff0844',
              padding: '1px 4px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              -99%
            </span>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            background: 'rgba(255,255,255,0.9)',
            color: '#ff0844',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          В корзину
        </button>
      </div>

      {/* Компактный прогресс */}
      <div style={{ fontSize: '12px', marginBottom: '6px' }}>
        {conditionMet ? (
          <span style={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            ✓ Условие выполнено! Добавляйте за {discountedPrice}₽
          </span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>
            При заказе от 2000₽ • Ещё {formatNumber(remaining)}₽
          </span>
        )}
      </div>
      
      {!conditionMet && (
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '6px',
          height: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.max(progress, 5)}%`,
            height: '100%',
            background: '#FFD700',
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
    </div>
  );
};

// Компактная карточка бесплатной доставки для главной страницы
export const MainPageDeliveryOffer = ({ cart, settings, deliveryMode }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Показываем только при доставке
  if (deliveryMode !== 'delivery' || isDismissed) return null;

  // Используем те же константы что в SimpleDeliveryManager
  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_ID = 'delivery_service';

  // Считаем сумму товаров (исключая доставку) - как в SimpleDeliveryManager
  const products = cart.filter(item => item.id !== DELIVERY_ID);
  const productsSubtotal = products.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - productsSubtotal);
  const progress = Math.min((productsSubtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const isEligible = productsSubtotal >= FREE_DELIVERY_THRESHOLD;

  // Находим доставку в корзине
  const deliveryItem = cart.find(item => item.id === DELIVERY_ID);

  // Не показываем если:
  // - корзина пуста (нет товаров кроме доставки)
  // - уже есть бесплатная доставка
  // - нет доставки вообще
  if (products.length === 0 || !deliveryItem || deliveryItem.isFreeDelivery) return null;

  return (
    <div style={{
      background: isEligible 
        ? 'linear-gradient(135deg, #4CAF50, #66BB6A)'
        : 'linear-gradient(135deg, #2196F3, #42A5F5)',
      borderRadius: '12px',
      padding: '12px',
      margin: '16px 0',
      color: 'white',
      boxShadow: '0 4px 15px rgba(33, 150, 243, 0.25)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 'bold'
        }}>
          <span>{isEligible ? '🎉' : '🚚'}</span>
          <span>БЕСПЛАТНАЯ ДОСТАВКА</span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
        {isEligible ? (
          <span style={{ fontWeight: 'bold' }}>
            ✓ Поздравляем! Доставка бесплатная
          </span>
        ) : (
          <span>
            Добавьте товаров ещё на {formatNumber(remaining)}₽
          </span>
        )}
      </div>
      
      {!isEligible && (
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '6px',
          height: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.max(progress, 5)}%`,
            height: '100%',
            background: '#FFD700',
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
    </div>
  );
};
