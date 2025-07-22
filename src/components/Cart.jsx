import { useEffect, useState } from 'react';
import DiscountProgressBar from './DiscountProgressBar';
import FlashOfferTimer from './FlashOfferTimer';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

const Cart = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, settings, addToCart, onOpenOrderForm }) => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [violatingItems, setViolatingItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Загружаем скидки
      fetch(`${API_URL}?action=getDiscounts`)
        .then(res => res.json())
        .then(data => {
          const processedDiscounts = data.map(d => ({
            minTotal: Number(d.minTotal),
            discountPercent: Number(d.discountPercent)
          }));
          setDiscounts(processedDiscounts);
        })
        .catch(err => console.error('Error fetching discounts:', err));

      // Загружаем товары для flash-предложения
      fetch(`${API_URL}?action=getProducts`)
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.error('Error fetching products:', err));
    }
  }, [isOpen]);

  const addToCartHandler = (product) => {
    addToCart(product);
  };

  // Функция проверки flash-товаров
  const checkFlashViolations = () => {
    const violations = [];
    
    cart.forEach(item => {
      if (item.isFlashOffer) {
        // Находим оригинальный товар
        const originalProduct = products.find(p => String(p.id).includes('R2000'));
        if (!originalProduct) return;
        
        // Считаем сумму остальных товаров
        const otherItemsTotal = cart
          .filter(cartItem => cartItem.id !== item.id)
          .reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
        
        // Проверяем условие (остальные товары >= 2000₽)
        if (otherItemsTotal < 2000) {
          violations.push({
            ...item,
            requiredAmount: 2000,
            currentAmount: otherItemsTotal,
            missing: 2000 - otherItemsTotal
          });
        }
      }
    });
    
    return violations;
  };

  // Функция оформления заказа
  const handleOrderSubmit = () => {
    const violations = checkFlashViolations();
    
    if (violations.length > 0) {
      setViolatingItems(violations);
      setShowViolationAlert(true);
      return;
    }
    
    // Открываем форму заказа
    onOpenOrderForm();
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Рассчитываем скидку
  const currentDiscount = discounts
    .filter(d => d.minTotal <= subtotal)
    .sort((a, b) => b.minTotal - a.minTotal)[0];
  
  const discountAmount = currentDiscount ? Math.round(subtotal * currentDiscount.discountPercent / 100) : 0;
  const total = subtotal - discountAmount;

  if (!isOpen) return null;

  return (
    <>
      {/* Попап с предупреждением о нарушении условий */}
      {showViolationAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#e03636', marginBottom: '16px', fontSize: '20px' }}>
              Нарушены условия акции!
            </h2>
            <div style={{ marginBottom: '20px', color: '#666', lineHeight: '1.5' }}>
              {violatingItems.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#ffebee',
                  borderRadius: '8px',
                  border: '2px solid #ff5722'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '4px' }}>
                    Нужно добавить товаров на <strong>{item.missing}₽</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    (сейчас: {item.currentAmount}₽ из {item.requiredAmount}₽)
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowViolationAlert(false)}
              style={{
                padding: '12px 24px',
                background: settings.primaryColor || '#ff7f32',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          background: settings.backgroundColor || '#fdf0e2',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.3s ease-out',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
          overflowY: 'auto', // ИСПРАВЛЕНО: теперь вся корзина скроллится
        }}
      >
        <style>
          {`
            @keyframes slideInLeft {
              from {
                transform: translateX(-100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}
        </style>

        {/* Заголовок корзины */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem',
          borderBottom: '1px solid #e0e0e0',
          background: settings.backgroundColor || '#fdf0e2',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c1e0f', margin: 0 }}>Корзина</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              color: '#666',
              fontSize: '20px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Контент корзины */}
        <div style={{ padding: '1rem', flex: 1 }}>
          {/* Flash-предложение с таймером */}
          {cart.length > 0 && (
            <FlashOfferTimer 
              subtotal={subtotal} 
              products={products}
              settings={settings} 
              addToCart={addToCartHandler}
              cart={cart}
            />
          )}

          {/* Прогрессбар скидки */}
          {cart.length > 0 && (
            <DiscountProgressBar 
              subtotal={subtotal} 
              discounts={discounts} 
              settings={settings} 
            />
          )}

          {/* Итоговая информация */}
          {cart.length > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              textAlign: 'center',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.25rem' }}>
                  Сумма: {subtotal} {settings.currency || '₽'}
                </div>
                {discountAmount > 0 && (
                  <div style={{ fontSize: '1rem', color: '#28a745', marginBottom: '0.25rem' }}>
                    Скидка: -{discountAmount} {settings.currency || '₽'}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#2c1e0f' }}>
                Итого: {total} {settings.currency || '₽'}
              </div>
              <button
                onClick={handleOrderSubmit}
                style={{
                  padding: '0.75rem 2rem',
                  background: settings.primaryColor || '#ff7f32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                Оформить заказ
              </button>
            </div>
          )}

          {/* Список товаров */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
              Корзина пуста
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.isFlashOffer ? 'flash' : 'regular'}`}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #eee',
                    background: item.isFlashOffer ? 'linear-gradient(135deg, #fff5f5, #ffe6e6)' : 'transparent',
                    borderRadius: item.isFlashOffer ? '8px' : '0',
                    padding: item.isFlashOffer ? '0.5rem' : '0',
                    border: item.isFlashOffer ? '2px solid #ff0844' : 'none',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1rem', 
                      color: item.isFlashOffer ? '#ff0844' : '#2c1e0f', 
                      marginBottom: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {item.name}
                      {item.isFlashOffer && (
                        <span style={{
                          background: '#ff0844',
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '8px',
                          fontWeight: 'bold'
                        }}>
                          -99%
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {item.isFlashOffer && item.originalPrice && (
                          <span style={{ 
                            textDecoration: 'line-through', 
                            marginRight: '0.5rem',
                            fontSize: '0.8rem' 
                          }}>
                            {item.originalPrice} {settings.currency || '₽'}
                          </span>
                        )}
                        <span style={{ 
                          fontWeight: item.isFlashOffer ? 'bold' : 'normal',
                          color: item.isFlashOffer ? '#ff0844' : '#666'
                        }}>
                          {item.price} {settings.currency || '₽'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {!item.isFlashOffer ? (
                          // Обычные товары - можно изменять количество
                          <>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                background: '#f0f0f0',
                                border: 'none',
                                borderRadius: '6px',
                                width: '28px',
                                height: '28px',
                                fontSize: '16px',
                                cursor: 'pointer',
                              }}
                            >
                              −
                            </button>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                background: settings.primaryColor || '#ff7f32',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                width: '28px',
                                height: '28px',
                                fontSize: '16px',
                                cursor: 'pointer',
                              }}
                            >
                              +
                            </button>
                          </>
                        ) : (
                          // Flash-товары - фиксированное количество
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#fff0f0',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #ff0844',
                          }}>
                            <span style={{ 
                              fontWeight: 'bold', 
                              fontSize: '0.9rem',
                              color: '#ff0844'
                            }}>
                              1 шт
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e03636',
                            fontSize: '18px',
                            cursor: 'pointer',
                            marginLeft: '0.3rem',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
