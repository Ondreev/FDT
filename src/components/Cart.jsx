import { useEffect, useState } from 'react';
import DiscountProgressBar from './DiscountProgressBar';
import FlashOfferPopup from './FlashOfferTimer';
import { FreeDeliveryProgress, FreeDeliveryPopup, formatNumber } from './SimpleDeliveryManager';
import { useDeliveryMode } from '../hooks/useDeliveryMode';
import DeliveryModeSelector from './DeliveryModeSelector';
import { API_URL } from '../config';

// ✅ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ЗОНЕ
const getZoneInfo = () => {
  try {
    const zoneInfo = localStorage.getItem('deliveryZoneInfo');
    if (zoneInfo) {
      return JSON.parse(zoneInfo);
    }
  } catch (e) {
    console.error('Error parsing deliveryZoneInfo:', e);
  }
  
  // Fallback к стандартной зоне
  return {
    cost: 300,
    freeFrom: 3000,
    label: 'Стандартная зона'
  };
};

const Cart = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, settings, addToCart, onOpenOrderForm, setCart }) => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [violatingItems, setViolatingItems] = useState([]);
  
  const { deliveryMode } = useDeliveryMode();

  useEffect(() => {
    if (isOpen) {
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

  const addToCartHandler = (product) => {
    addToCart(product);
  };

  const safeUpdateQuantity = (id, newQuantity) => {
    const item = cart.find(cartItem => cartItem.id === id);
    
    if (item && item.isFlashOffer && newQuantity !== 1) {
      return;
    }
    
    updateQuantity(id, newQuantity);
  };

  // ✅ ОБНОВЛЕННАЯ ФУНКЦИЯ ПРОВЕРКИ FLASH-ТОВАРОВ С УЧЕТОМ ЗОН
  const checkFlashViolations = () => {
    const violations = [];
    
    cart.forEach(item => {
      if (item.isFlashOffer) {
        const originalProduct = products.find(p => String(p.id).includes('R2000'));
        if (!originalProduct) return;
        
        // ✅ ИСПОЛЬЗУЕМ ЗОНАЛЬНЫЙ ПОРОГ ВМЕСТО ФИКСИРОВАННОГО 2000
        const zoneInfo = getZoneInfo();
        const FLASH_THRESHOLD = zoneInfo.freeFrom || 3000; // Используем порог бесплатной доставки
        
        const otherItemsTotal = cart
          .filter(cartItem => cartItem.id !== item.id && !cartItem.isDelivery)
          .reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
        
        if (otherItemsTotal < FLASH_THRESHOLD) {
          violations.push({
            ...item,
            requiredAmount: FLASH_THRESHOLD,
            currentAmount: otherItemsTotal,
            missing: FLASH_THRESHOLD - otherItemsTotal
          });
        }
      }
    });
    
    return violations;
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const productsSubtotal = cart
  .filter(item => !item.isDelivery && !String(item.id).includes('S'))
  .reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const currentDiscount = discounts
    .filter(d => d.minTotal <= productsSubtotal)
    .sort((a, b) => b.minTotal - a.minTotal)[0];
  
  const discountAmount = currentDiscount ? Math.round(productsSubtotal * currentDiscount.discountPercent / 100) : 0;
  const total = subtotal - discountAmount;

  const handleOrderSubmit = () => {
    const violations = checkFlashViolations();
    
    if (violations.length > 0) {
      setViolatingItems(violations);
      setShowViolationAlert(true);
      return;
    }
    
    const discountData = {
      total,
      discountPercent: currentDiscount?.discountPercent || 0,
      discountAmount: discountAmount || 0,
      productsSubtotal,
      subtotal,
      cart
    };
    
    onOpenOrderForm(discountData);
  };

  if (!isOpen) return null;

  return (
    <>
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
                    Нужно добавить товаров на <strong>{formatNumber(item.missing)}₽</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    (сейчас: {formatNumber(item.currentAmount)}₽ из {formatNumber(item.requiredAmount)}₽)
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

      {deliveryMode === 'delivery' && (
        <FreeDeliveryPopup 
          cart={cart}
          setCart={setCart}
          settings={settings}
        />
      )}

      {cart.length > 0 && (
        <FlashOfferPopup 
          subtotal={productsSubtotal}
          products={products}
          settings={settings} 
          addToCart={addToCartHandler}
          cart={cart}
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        maxWidth: '400px',
        height: '100vh',
        background: settings.backgroundColor || '#fdf0e2',
        zIndex: 1001,
        overflowY: 'auto',
        animation: 'slideInLeft 0.3s ease-out',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
      }}>
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

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem',
          borderBottom: '1px solid #e0e0e0',
          background: settings.backgroundColor || '#fdf0e2',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2c1e0f', margin: 0 }}>Корзина</h2>
          
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

        <div style={{ padding: '0 1rem' }}>
          <DeliveryModeSelector 
            settings={settings}
            inCart={true}
            compact={true}
          />
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem 1rem 0' }}>
            {cart.length > 0 && (
              <DiscountProgressBar 
                subtotal={productsSubtotal}
                discounts={discounts} 
                settings={settings} 
              />
            )}

            {deliveryMode === 'delivery' && (
              <FreeDeliveryProgress 
                cart={cart}
                settings={settings}
              />
            )}
          </div>

          <div style={{ 
            padding: '0 1rem',
            flex: 1
          }}>
            {cart.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                marginTop: '2rem',
                fontSize: '1.1rem'
              }}>
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
                    <div style={{ 
                      width: '70px', 
                      height: '70px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: item.isDelivery ? '#f5f5f5' : 'transparent'
                    }}>
                      {item.isDelivery ? (
                        <span style={{ fontSize: '2.5rem' }}>{item.imageUrl}</span>
                      ) : (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        color: item.isFlashOffer ? '#ff0844' : (item.isFreeDelivery ? '#4caf50' : '#2c1e0f'), 
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
                          {item.isFlashOffer && item.originalPrice && (
                            <span style={{ 
                              textDecoration: 'line-through', 
                              marginRight: '0.5rem',
                              fontSize: '0.8rem' 
                            }}>
                              {formatNumber(item.originalPrice)} {settings.currency || '₽'}
                            </span>
                          )}
                          <span style={{ 
                            fontWeight: item.isFlashOffer ? 'bold' : 'normal',
                            color: item.isFlashOffer ? '#ff0844' : (item.isFreeDelivery ? '#4caf50' : '#666')
                          }}>
                            {item.price > 0 ? `${formatNumber(item.price)} ${settings.currency || '₽'}` : 'Бесплатно'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {!item.isDelivery ? (
                            item.isFlashOffer ? (
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.2rem',
                                background: '#ffe6e6',
                                padding: '0.3rem 0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #ff0844',
                                minWidth: '60px'
                              }}>
                                <span style={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '1rem',
                                  color: '#ff0844'
                                }}>
                                  {item.quantity}
                                </span>
                                <span style={{
                                  background: '#ff0844',
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  padding: '0.1rem 0.3rem',
                                  borderRadius: '3px',
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap'
                                }}>
                                  ФИКС
                                </span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => safeUpdateQuantity(item.id, item.quantity - 1)}
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
                                  onClick={() => safeUpdateQuantity(item.id, item.quantity + 1)}
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
                            )
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: item.isFreeDelivery ? '#e8f5e8' : '#f5f5f5',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              border: `1px solid ${item.isFreeDelivery ? '#4caf50' : '#ddd'}`,
                            }}>
                              <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: '0.9rem',
                                color: item.isFreeDelivery ? '#4caf50' : '#666'
                              }}>
                                Авто
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
                ))}
              </div>
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <div style={{ 
            backgroundColor: 'white',
            padding: '1rem',
            borderTop: '1px solid #e0e0e0',
            marginTop: '1rem'
          }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1rem', 
                color: '#666', 
                marginBottom: '0.5rem' 
              }}>
                <span>Товары:</span>
                <span>{formatNumber(productsSubtotal)} {settings.currency || '₽'}</span>
              </div>
              
              {cart.filter(item => item.isDelivery).map(delivery => (
                <div key={delivery.id} style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem', 
                  color: delivery.isFreeDelivery ? '#4caf50' : '#666',
                  marginBottom: '0.5rem'
                }}>
                  <span>{delivery.name}:</span>
                  <span>
                    {delivery.price > 0 ? `${formatNumber(delivery.price)} ${settings.currency || '₽'}` : 'Бесплатно 🎉'}
                  </span>
                </div>
              ))}
              
              {discountAmount > 0 && (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem', 
                  color: '#28a745', 
                  marginBottom: '0.5rem' 
                }}>
                  <span>Скидка на товары:</span>
                  <span>-{formatNumber(discountAmount)} {settings.currency || '₽'}</span>
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.4rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem', 
              color: '#2c1e0f',
              paddingTop: '0.75rem',
              borderTop: '2px solid #e0e0e0'
            }}>
              <span>Итого:</span>
              <span>{formatNumber(total)} {settings.currency || '₽'}</span>
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
      </div>
    </>
  );
};

export default Cart;
