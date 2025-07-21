import { useState, useEffect } from 'react';
import { API_URL, DELIVERY_THRESHOLD } from '../../utils/constants';

const Cart = ({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  settings, 
  addToCart, 
  activateFreeDelivery, 
  calculateDiscount,
  regularSubtotal,
  canPlaceOrder
}) => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Загружаем данные для продвинутых функций
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

      fetch(`${API_URL}?action=getProducts`)
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.error('Error fetching products:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cart
    .filter(item => !item.isDelivery)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const deliveryItem = cart.find(item => item.isDelivery);
  const deliveryCost = deliveryItem ? deliveryItem.price : 0;
  
  const discountAmount = calculateDiscount(discounts);
  const total = subtotal - discountAmount + deliveryCost;

  const orderStatus = canPlaceOrder();
  const hasFlashItems = cart.some(item => item.isFlashOffer);

  return (
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
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInLeft 0.3s ease-out',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c1e0f' }}>Корзина</h2>
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

      {/* ЗАЩИТНОЕ УВЕДОМЛЕНИЕ */}
      {hasFlashItems && regularSubtotal < DELIVERY_THRESHOLD && (
        <div style={{
          background: 'linear-gradient(135deg, #ffeb3b, #ffc107)',
          color: '#8a6914',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '2px solid #ff9800',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          ⚠️ Внимание! <br />
          Для товаров со скидкой нужны обычные товары на сумму от {DELIVERY_THRESHOLD}₽
        </div>
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
          position: 'sticky',
          top: 0,
          zIndex: 100,
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.25rem' }}>
              Товары: {subtotal} {settings.currency || '₽'}
              {hasFlashItems && (
                <div style={{ fontSize: '0.8rem', color: '#ff9800', marginTop: '0.25rem' }}>
                  (обычные: {regularSubtotal} {settings.currency || '₽'})
                </div>
              )}
            </div>
            <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.25rem' }}>
              Доставка: {deliveryCost > 0 ? `${deliveryCost} ${settings.currency || '₽'}` : 'Бесплатно 🎉'}
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
          
          {/* ЗАЩИЩЕННАЯ КНОПКА ЗАКАЗА */}
          <button
            disabled={!orderStatus.canOrder}
            style={{
              padding: '0.75rem 2rem',
              background: orderStatus.canOrder 
                ? (settings.primaryColor || '#ff7f32')
                : '#ccc',
              color: orderStatus.canOrder ? 'white' : '#666',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: orderStatus.canOrder ? 'pointer' : 'not-allowed',
              width: '100%',
              boxShadow: orderStatus.canOrder ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              opacity: orderStatus.canOrder ? 1 : 0.7,
              transition: 'all 0.2s ease',
            }}
            title={orderStatus.reason || 'Оформить заказ'}
          >
            {orderStatus.canOrder ? 'Оформить заказ' : '⚠️ Заказ недоступен'}
          </button>
          
          {!orderStatus.canOrder && (
            <div style={{
              fontSize: '0.8rem',
              color: '#d32f2f',
              marginTop: '0.5rem',
              lineHeight: '1.3',
            }}>
              {orderStatus.reason}
            </div>
          )}
        </div>
      )}

      {/* Список товаров */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 350px)', paddingRight: '0.5rem' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            Корзина пуста
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={`${item.id}-${item.isFlashOffer ? 'flash' : 'regular'}`}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #eee',
                background: item.isFlashOffer ? 'linear-gradient(135deg, #fff5f5, #ffe6e6)' : 
                           item.isFreeDelivery ? 'linear-gradient(135deg, #e8f5e8, #f1f8e9)' : 'transparent',
                borderRadius: (item.isFlashOffer || item.isFreeDelivery) ? '8px' : '0',
                padding: (item.isFlashOffer || item.isFreeDelivery) ? '0.5rem' : '0',
                border: item.isFlashOffer ? 
                  (regularSubtotal < DELIVERY_THRESHOLD ? '2px solid #ff9800' : '2px solid #ff0844') : 
                  item.isFreeDelivery ? '2px solid #4caf50' : 'none',
                opacity: item.isFlashOffer && regularSubtotal < DELIVERY_THRESHOLD ? 0.7 : 1,
              }}
            >
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: item.isDelivery ? '#f5f5f5' : 'transparent',
                fontSize: item.isDelivery ? '2rem' : 'inherit'
              }}>
                {item.isDelivery ? (
                  '🚚'
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  color: item.isFlashOffer ? 
                    (regularSubtotal < DELIVERY_THRESHOLD ? '#ff9800' : '#ff0844') : 
                    item.isFreeDelivery ? '#4caf50' :
                    item.isDelivery ? '#666' : '#2c1e0f', 
                  marginBottom: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {item.name}
                  {item.isFlashOffer && (
                    <span style={{
                      background: regularSubtotal < DELIVERY_THRESHOLD ? '#ff9800' : '#ff0844',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      {regularSubtotal < DELIVERY_THRESHOLD ? '⚠️ РИСК' : '-99%'}
                    </span>
                  )}
                  {item.isFreeDelivery && (
                    <span style={{
                      background: '#4caf50',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      БЕСПЛАТНО
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {(item.isFlashOffer || item.isFreeDelivery) && item.originalPrice && (
                      <span style={{ 
                        textDecoration: 'line-through', 
                        marginRight: '0.5rem',
                        fontSize: '0.8rem' 
                      }}>
                        {item.originalPrice} {settings.currency || '₽'}
                      </span>
                    )}
                    <span style={{ 
                      fontWeight: (item.isFlashOffer || item.isFreeDelivery) ? 'bold' : 'normal',
                      color: item.isFlashOffer ? 
                        (regularSubtotal < DELIVERY_THRESHOLD ? '#ff9800' : '#ff0844') : 
                        item.isFreeDelivery ? '#4caf50' : '#666'
                    }}>
                      {item.price > 0 ? `${item.price} ${settings.currency || '₽'}` : 'Бесплатно'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {!item.isFlashOffer && !item.isDelivery ? (
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
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: item.isFlashOffer ? '#fff0f0' : 
                                   item.isFreeDelivery ? '#f0fff0' :
                                   item.isDelivery ? '#f8f8f8' : '#fff0f0',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        border: `1px solid ${item.isFlashOffer ? 
                          (regularSubtotal < DELIVERY_THRESHOLD ? '#ff9800' : '#ff0844') : 
                          item.isFreeDelivery ? '#4caf50' : '#ccc'}`,
                      }}>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.9rem',
                          color: item.isFlashOffer ? 
                            (regularSubtotal < DELIVERY_THRESHOLD ? '#ff9800' : '#ff0844') : 
                            item.isFreeDelivery ? '#4caf50' :
                            item.isDelivery ? '#666' : '#ff0844'
                        }}>
                          {item.isDelivery ? 'Услуга' : '1 шт'}
                        </span>
                      </div>
                    )}
                    
                    {!item.isDelivery && (
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cart;
