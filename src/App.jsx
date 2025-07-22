import { useEffect, useState } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

// Компонент прогрессбара скидки - ВСЕГДА показывает следующую цель
const DiscountProgressBar = ({ subtotal, discounts, settings }) => {
  if (!discounts || discounts.length === 0) return null;

  // Находим ближайшую БОЛЬШУЮ скидку (мотивируем увеличивать чек)
  const nextDiscount = discounts
    .filter(d => d.minTotal > subtotal)
    .sort((a, b) => a.minTotal - b.minTotal)[0];

  // Находим текущую скидку
  const currentDiscount = discounts
    .filter(d => d.minTotal <= subtotal)
    .sort((a, b) => b.minTotal - a.minTotal)[0];

  // Если достигли максимальной скидки - показываем достижение, но не прогрессбар
  if (!nextDiscount && currentDiscount) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #6f42c1, #e83e8c)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        textAlign: 'center',
        border: '2px solid #ffd700',
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          👑 МАКСИМАЛЬНАЯ СКИДКА {currentDiscount.discountPercent}%!
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Экономия: {Math.round(subtotal * currentDiscount.discountPercent / 100)} {settings.currency || '₽'}
        </div>
      </div>
    );
  }

  // Если есть следующая цель - показываем прогрессбар к ней
  if (nextDiscount) {
    const remaining = nextDiscount.minTotal - subtotal;
    const startPoint = currentDiscount ? currentDiscount.minTotal : 0;
    const progress = Math.min(((subtotal - startPoint) / (nextDiscount.minTotal - startPoint)) * 100, 100);

    return (
      <div style={{
        background: currentDiscount 
          ? 'linear-gradient(135deg, #d1ecf1, #bee5eb)' // Если уже есть скидка - голубоватый фон
          : 'linear-gradient(135deg, #fff3cd, #ffeaa7)', // Если скидки нет - жёлтый фон
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        border: `2px dashed ${currentDiscount ? '#17a2b8' : '#f39c12'}`,
      }}>
        {/* Показываем текущую скидку, если есть */}
        {currentDiscount && (
          <div style={{
            textAlign: 'center',
            marginBottom: '0.75rem',
            padding: '0.5rem',
            background: 'rgba(23, 162, 184, 0.1)',
            borderRadius: '8px',
            color: '#0c5460',
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              🎉 Сейчас скидка {currentDiscount.discountPercent}%
            </div>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.75rem',
          color: currentDiscount ? '#0c5460' : '#856404'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
            До скидки {nextDiscount.discountPercent}%
          </div>
          <div style={{ fontWeight: 'bold', color: '#d63384' }}>
            ещё {remaining} {settings.currency || '₽'}
          </div>
        </div>
        
        <div style={{
          background: '#fff',
          borderRadius: '999px',
          height: '10px',
          overflow: 'hidden',
          marginBottom: '0.5rem',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            background: currentDiscount 
              ? 'linear-gradient(90deg, #17a2b8, #20c997)' 
              : 'linear-gradient(90deg, #ff7f32, #ff6b47)',
            height: '100%',
            width: `${Math.max(progress, 5)}%`, // Минимум 5% для видимости
            borderRadius: '999px',
            transition: 'width 0.3s ease',
            position: 'relative',
          }}>
            {/* Блестящий эффект */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              borderRadius: '999px',
            }} />
          </div>
        </div>
        
        <div style={{ 
          fontSize: '0.85rem', 
          color: currentDiscount ? '#0c5460' : '#856404',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {currentDiscount 
            ? `Увеличьте заказ и получите ещё больше скидки! 🚀`
            : 'Добавьте ещё товаров и получите скидку! 💰'
          }
        </div>
      </div>
    );
  }

  return null;
};

// Компонент таймера со скидкой 99% - КОМПАКТНАЯ ВЕРСИЯ
const FlashOfferTimer = ({ subtotal, products, settings, addToCart, cart }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Находим товар с R2000 в ID
  const specialProduct = products.find(p => String(p.id).includes('R2000'));
  
  // Проверяем, есть ли уже этот flash-товар в корзине
  const isInCart = cart.some(item => item.id === `${specialProduct?.id}_flash`);

  useEffect(() => {
    // Активируем предложение при достижении 2000₽ (только один раз)
  const flashItemId = `${specialProduct?.id}_flash`;
  const shouldShow = subtotal >= 2000;
  const isFlashInCart = cart.some((item) => item.id === flashItemId);

  if (shouldShow && !isFlashInCart) {
    setTimeLeft(120);
    setIsActive(true);
    setHasTriggered(true);
  }

  if (!shouldShow) {
    if (isFlashInCart) {
      // 💡 Удаляем только flash-блюдо, не трогаем остальное
      removeFromCart(flashItemId);
    }

    setIsActive(false);
    setTimeLeft(0);
    setHasTriggered(false);
  }
}, [subtotal, specialProduct, cart]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Не показываем, если нет специального товара или предложение неактивно
  if (!specialProduct || !isActive || timeLeft <= 0 || isInCart) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const originalPrice = specialProduct.price;
  const discountedPrice = Math.round(originalPrice * 0.01); // 99% скидка

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff0844, #ffb199)',
      color: 'white',
      padding: '1rem',
      borderRadius: '12px',
      marginBottom: '1rem',
      border: '2px solid #ffd700',
      boxShadow: '0 4px 15px rgba(255, 8, 68, 0.3)',
      animation: 'flashPulse 2s infinite',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>
        {`
          @keyframes flashPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.01); }
          }
          
          @keyframes timerBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>

      {/* Компактный заголовок */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          ⚡ МОЛНИЕНОСНОЕ ПРЕДЛОЖЕНИЕ
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          animation: timeLeft <= 30 ? 'timerBlink 1s infinite' : 'none',
          color: timeLeft <= 30 ? '#ffff00' : '#ffffff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Компактный товар */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '0.75rem',
      }}>
        <img
          src={specialProduct.imageUrl}
          alt={specialProduct.name}
          style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '8px', 
            objectFit: 'cover',
            border: '2px solid #ffd700',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            marginBottom: '0.25rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {specialProduct.name}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem'
          }}>
            <span style={{ 
              textDecoration: 'line-through', 
              fontSize: '0.9rem',
              opacity: 0.8 
            }}>
              {originalPrice} ₽
            </span>
            <span style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              color: '#ffff00',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {discountedPrice} ₽
            </span>
            <span style={{
              background: '#ffff00',
              color: '#ff0844',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}>
              -99%
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          // Проверяем, нет ли уже этого товара в корзине
          const existingFlashItem = cart.find(item => 
            item.id === `${specialProduct.id}_flash`
          );
          
          if (existingFlashItem) {
            // Если уже есть - не добавляем и скрываем предложение
            setIsActive(false);
            return;
          }

          // Добавляем товар со скидкой 99% (только 1 штука)
          const discountedProduct = {
            ...specialProduct,
            price: discountedPrice,
            originalPrice: originalPrice,
            isFlashOffer: true,
            quantity: 1, // Фиксированное количество
            name: `${specialProduct.name} ⚡`,
            id: `${specialProduct.id}_flash` // Уникальный ID для flash-версии
          };
          addToCart(discountedProduct);
          setIsActive(false); // Скрываем предложение после добавления
        }}
        style={{
          width: '100%',
          padding: '0.6rem',
          background: 'linear-gradient(135deg, #ffff00, #ffd700)',
          color: '#ff0844',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.02)';
          e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.4)';
        }}
      >
        🔥 СХВАТИТЬ! 🔥
      </button>
    </div>
  );
};

// Компонент "Заказывают сейчас"
const OrderingNowBanner = ({ products, settings, addToCart }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (products.length === 0) return;

    const showBanner = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      setCurrentProduct(randomProduct);
      setVisible(true);

      setTimeout(() => setVisible(false), 8000);
    };

    const initialTimer = setTimeout(showBanner, 5000);
    const interval = setInterval(showBanner, Math.random() * 5000 + 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products]);

  if (!visible || !currentProduct) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: settings.backgroundColor || '#fdf0e2',
        color: '#2c1e0f',
        padding: '1rem',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: 'slideIn 0.4s ease-out',
        border: '2px solid #f0e6d2',
        boxSizing: 'border-box',
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⭐</span> Сейчас заказывают
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            {currentProduct.name}
          </div>
          <div style={{ fontSize: '1rem', color: '#666' }}>
            {currentProduct.price} {settings.currency || '₽'}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          addToCart(currentProduct);
          setVisible(false);
        }}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: settings.primaryColor || '#ff7f32',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Хочешь? 😋
      </button>
    </div>
  );
};

// Обновленный компонент корзины с таймером flash-предложения
const Cart = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, settings, addToCart }) => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);

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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Рассчитываем скидку
  const currentDiscount = discounts
    .filter(d => d.minTotal <= subtotal)
    .sort((a, b) => b.minTotal - a.minTotal)[0];
  
  const discountAmount = currentDiscount ? Math.round(subtotal * currentDiscount.discountPercent / 100) : 0;
  const total = subtotal - discountAmount;

  if (!isOpen) return null;

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

      {/* Flash-предложение с таймером - ПЕРВЫМ */}
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

      {/* Итоговая информация - ЗАФИКСИРОВАННАЯ */}
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

      {/* Список товаров - СКРОЛЛИРУЕМЫЙ */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 400px)', // Ограничиваем высоту
        paddingRight: '0.5rem'
      }}>
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
          ))
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Состояния для свайпа
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (settings.font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.font]);
  
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

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Функции для свайпа
  const handleTouchStart = (e) => {
    if (categories.length === 0) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    // Предотвращаем скролл если это горизонтальный свайп
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
    
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping || categories.length === 0) {
      setIsSwiping(false);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Проверяем что это горизонтальный свайп
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const allCategories = [null, ...categories.map(cat => cat.id)];
      const currentIndex = allCategories.indexOf(activeCategory);

      if (deltaX > 0 && currentIndex > 0) {
        // Свайп вправо - предыдущая категория
        setActiveCategory(allCategories[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < allCategories.length - 1) {
        // Свайп влево - следующая категория
        setActiveCategory(allCategories[currentIndex + 1]);
      }
    }

    setIsSwiping(false);
  };

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <style>
  {`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .product-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    @media (max-width: 400px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
      }
    }
  `}
</style>
      
      <div
        className="app"
        style={{
          fontFamily: settings.font || 'Fredoka',
          backgroundColor: settings.backgroundColor || '#fdf0e2',
          padding: '1rem',
          minHeight: '100vh',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                style={{ height: '60px', borderRadius: '8px' }}
              />
            )}
            <h1
              style={{
                fontWeight: '900',
                fontSize: '2.5rem',
                fontFamily: 'Fredoka',
                color: '#2c1e0f',
                margin: 0,
              }}
            >
              {settings.projectTitle || 'Заголовок'}
            </h1>
          </div>
          
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 1000,
              background: settings.primaryColor || '#ff7f32',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              fontSize: '1.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            🛒
            {cartItemsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#e03636',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                {cartItemsCount}
              </span>
            )}
          </button>
        </header>

        {categories.length > 0 && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 900,
              background: settings.backgroundColor || '#fdf0e2',
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem 0',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '0.5rem 1.5rem',
                background: activeCategory === null ? settings.primaryColor || '#ff7f32' : '#fff5e6',
                color: activeCategory === null ? '#fff' : '#5c4022',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: activeCategory === cat.id ? settings.primaryColor || '#ff7f32' : '#fff5e6',
                  color: activeCategory === cat.id ? '#fff' : '#5c4022',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                position: 'relative',
                background: '#fff7ed',
                borderRadius: '20px',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {String(product.id).includes('H') && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#e03636',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '999px',
                    fontSize: '0.9rem',
                    fontFamily: settings.font || 'Fredoka',
                  }}
                >
                  ОСТРОЕ
                </div>
              )}
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', maxWidth: '160px', borderRadius: '12px', marginBottom: '0.5rem' }}
              />
              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#4b2e12',
                  margin: '0.5rem 0 0.25rem 0',
                  textAlign: 'center',
                }}
              >
                {product.name}
              </h2>
              <p style={{ fontSize: '0.95rem', margin: 0, color: '#5a3d1d', textAlign: 'center' }}>{product.description}</p>
              <p style={{ fontSize: '0.9rem', color: '#b5834f', margin: '0.25rem 0' }}>{product.weight}</p>
              
              {/* Нижняя часть карточки */}
              <div style={{ 
                marginTop: 'auto',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%'
              }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0', color: '#2c1e0f' }}>
                  {product.price} {settings.currency || '₽'}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.25rem',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      const existing = cart.find(item => item.id === product.id);
                      if (existing && existing.quantity > 1) {
                        updateQuantity(product.id, existing.quantity - 1);
                      } else {
                        removeFromCart(product.id);
                      }
                    }}
                    style={{
                      backgroundColor: settings.primaryColor || '#ff7f32',
                      color: '#fff',
                      fontSize: '1.25rem',
                      padding: '0.2rem 0.7rem',
                      border: 'none',
                      borderRadius: '12px 0 0 12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    −
                  </button>
                  <div
                    style={{
                      background: '#fff1dd',
                      padding: '0.2rem 1rem',
                      border: 'none',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      minWidth: '40px',
                      textAlign: 'center',
                    }}
                  >
                    {cart.find(item => item.id === product.id)?.quantity || 0}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    style={{
                      backgroundColor: settings.primaryColor || '#ff7f32',
                      color: '#fff',
                      fontSize: '1.25rem',
                      padding: '0.2rem 0.7rem',
                      border: 'none',
                      borderRadius: '0 12px 12px 0',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <OrderingNowBanner products={products} settings={settings} addToCart={addToCart} />
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          settings={settings}
          addToCart={addToCart}
        />
      </div>
    </>
  );
}
