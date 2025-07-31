import { useEffect, useState } from 'react';
import DiscountProgressBar from './DiscountProgressBar';
import FlashOfferPopup from './FlashOfferTimer';
import { FreeDeliveryProgress, FreeDeliveryPopup, formatNumber } from './SimpleDeliveryManager';
import { API_URL } from '../config';

const Cart = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, settings, addToCart, onOpenOrderForm, setCart, deliveryMode: propDeliveryMode, setDeliveryMode: propSetDeliveryMode }) => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [violatingItems, setViolatingItems] = useState([]);
  
  // Локальное состояние как fallback если пропсы не переданы
  const [localDeliveryMode, setLocalDeliveryMode] = useState(() => {
    return localStorage.getItem('deliveryMode') || 'delivery';
  });
  
  // Используем пропсы если они переданы, иначе локальное состояние
  const deliveryMode = propDeliveryMode !== undefined ? propDeliveryMode : localDeliveryMode;
  const setDeliveryMode = propSetDeliveryMode || setLocalDeliveryMode;

  // Сохраняем режим доставки в localStorage и принудительно обновляем корзину
  // Синхронизируем с localStorage
  useEffect(() => {
    localStorage.setItem('deliveryMode', deliveryMode);
  }, [deliveryMode]);

  useEffect(() => {
    localStorage.setItem('deliveryMode', deliveryMode);
    
    // Принудительно обновляем корзину при переключении режима
    // Добавляем/убираем один товар и сразу возвращаем обратно для триггера
    if (cart.length > 0) {
      const firstNonDeliveryItem = cart.find(item => !item.isDelivery);
      if (firstNonDeliveryItem) {
        // Микро-изменение для триггера SimpleDeliveryManager
        setCart(prev => prev.map(item => 
          item.id === firstNonDeliveryItem.id 
            ? { ...item, quantity: item.quantity + 0.001 } // Добавляем микро-количество
            : item
        ));
        
        // Сразу возвращаем обратно
        setTimeout(() => {
          setCart(prev => prev.map(item => 
            item.id === firstNonDeliveryItem.id 
              ? { ...item, quantity: Math.round(item.quantity) } // Округляем обратно
              : item
          ));
        }, 10);
      }
    }
  }, [deliveryMode]);

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

  // Обертка для updateQuantity с защитой flash-товаров
  const safeUpdateQuantity = (id, newQuantity) => {
    // Найдем товар в корзине
    const item = cart.find(cartItem => cartItem.id === id);
    
    // Запрещаем изменение количества для flash-товаров
    if (item && item.isFlashOffer && newQuantity !== 1) {
      return; // Просто выходим, не изменяя количество
    }
    
    // Для обычных товаров вызываем оригинальную функцию
    updateQuantity(id, newQuantity);
  };

  // Функция проверки flash-товаров так
  const checkFlashViolations = () => {
    const violations = [];
    
    cart.forEach(item => {
      if (item.isFlashOffer) {
        const originalProduct = products.find(p => String(p.id).includes('R2000'));
        if (!originalProduct) return;
        
        // Считаем сумму остальных товаров (исключая доставку и этот flash товар)
        const otherItemsTotal = cart
          .filter(cartItem => cartItem.id !== item.id && !cartItem.isDelivery)
          .reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
        
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

  // ✅ РАССЧИТЫВАЕМ ВСЕ СУММЫ
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Рассчитываем скидку (только на товары, не на доставку)
  const productsSubtotal = cart
    .filter(item => !item.isDelivery)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const currentDiscount = discounts
    .filter(d => d.minTotal <= productsSubtotal)
    .sort((a, b) => b.minTotal - a.minTotal)[0];
  
  const discountAmount = currentDiscount ? Math.round(productsSubtotal * currentDiscount.discountPercent / 100) : 0;
  const total = subtotal - discountAmount; // ← ИТОГОВАЯ СУММА СО СКИДКАМИ

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ОФОРМЛЕНИЯ ЗАКАЗА
  const handleOrderSubmit = () => {
    const violations = checkFlashViolations();
    
    if (violations.length > 0) {
      setViolatingItems(violations);
      setShowViolationAlert(true);
      return;
    }
    
    // ✅ ПЕРЕДАЕМ СУММУ И ДАННЫЕ О СКИДКЕ
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

      {/* Попап бесплатной доставки - только при доставке */}
      {deliveryMode === 'delivery' && (
        <FreeDeliveryPopup 
          cart={cart}
          setCart={setCart}
          settings={settings}
        />
      )}

      {/* Попап flash-предложения товара - работает всегда */}
      {cart.length > 0 && (
        <FlashOfferPopup 
          subtotal={productsSubtotal}
          products={products}
          settings={settings} 
          addToCart={addToCartHandler}
          cart={cart}
        />
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

        {/* Заголовок корзины с переключателем */}
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
          
          {/* Переключатель доставки - современный дизайн */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Переключатель в стиле iOS */}
            <div style={{
              background: '#f0f0f0',
              borderRadius: '25px',
              padding: '4px',
              display: 'flex',
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={() => setDeliveryMode('delivery')}
                style={{
                  background: deliveryMode === 'delivery' ? settings.primaryColor || '#ff7f32' : 'transparent',
                  color: deliveryMode === 'delivery' ? 'white' : '#666',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.3s ease',
                  boxShadow: deliveryMode === 'delivery' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                <span>🚗</span>
                <span style={{ fontSize: '0.8rem' }}>Доставка</span>
              </button>
              
              <button
                onClick={() => setDeliveryMode('pickup')}
                style={{
                  background: deliveryMode === 'pickup' ? settings.primaryColor || '#ff7f32' : 'transparent',
                  color: deliveryMode === 'pickup' ? 'white' : '#666',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.3s ease',
                  boxShadow: deliveryMode === 'pickup' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                <span>🏃‍♂️</span>
                <span style={{ fontSize: '0.8rem' }}>Самовывоз</span>
              </button>
            </div>
            
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
        </div>

        {/* Скроллируемая область с маркетингом и товарами */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* МАРКЕТИНГОВЫЕ ФИШКИ ВВЕРХУ */}
          <div style={{ padding: '1rem 1rem 0' }}>
            {/* Прогрессбар скидки на товары */}
            {cart.length > 0 && (
              <DiscountProgressBar 
                subtotal={productsSubtotal}
                discounts={discounts} 
                settings={settings} 
              />
            )}

            {/* Прогрессбар бесплатной доставки - только при доставке */}
            {deliveryMode === 'delivery' && (
              <FreeDeliveryProgress 
                cart={cart}
                settings={settings}
              />
            )}

            {/* Адрес самовывоза */}
            {deliveryMode === 'pickup' && cart.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                border: '2px solid #2196f3',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#1565c0'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🏪</span>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    Адрес самовывоза
                  </div>
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#1976d2',
                  fontWeight: '500',
                  lineHeight: '1.4'
                }}>
                  Реутов, ул. Калинина, д. 8
                </div>
              </div>
            )}
          </div>

          {/* СПИСОК ТОВАРОВ */}
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
                    {/* Изображение товара */}
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
                            // Проверяем, является ли товар flash-предложением
                            item.isFlashOffer ? (
                              // Для flash-товаров показываем компактный блок
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
                              // Обычные товары - показываем кнопки +/-
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
                            // Доставка - авто
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

        {/* БЛОК СУММЫ ВНИЗУ - НЕ ЗАКРЕПЛЕННЫЙ */}
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
              
              {/* Показываем доставку отдельно */}
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
