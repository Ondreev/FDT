import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './components/Cart';
import OrderForm from './components/OrderForm';
import OrderingNowBanner from './components/OrderingNowBanner';
import AdminPage from './components/AdminPage';
import { SimpleDeliveryManager } from './components/SimpleDeliveryManager';
import ProductGrid from './components/ProductGrid';
import { MainPageFlashOffer, MainPageDeliveryOffer } from './components/MainPageOffers';
import FloatingButtons from './components/FloatingButtons';
import { StickyProgressBars, ActivationPopup } from './components/StickyProgressBars';

import { API_URL, CONFIG } from './config';

// И везде в коде использовать API_URL вместо прямой ссылки
fetch(API_URL + '?action=something')

// Компонент попапа для голосования
const RatingPopup = ({ isOpen, onClose, productName, onRatingSubmit }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    setIsSubmitted(true);
    onRatingSubmit(rating);
    
    // Определяем сообщение в зависимости от оценки
    if (rating >= 4) {
      setMessage('Спасибо за оценку! 😊');
    } else if (rating === 3) {
      setMessage('Мы сожалеем, облажались, дайте нам еще шанс, мы все исправим! Вы - наше сокровище! 💖');
    } else {
      setMessage('Мы очень сожалеем, что блюдо Вам не понравилось! Пожалуйста, напишите нам на WhatsApp, мы хотим все исправить и стать лучше 📱');
    }
    
    // Закрываем попап через 3 секунды
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setSelectedRating(0);
      setHoverRating(0);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        transform: isSubmitted ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }} onClick={(e) => e.stopPropagation()}>
        
        {!isSubmitted ? (
          <>
            <h3 style={{
              color: '#2c1e0f',
              fontSize: '1.5rem',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Оцените блюдо
            </h3>
            
            <p style={{
              color: '#666',
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              {productName}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '2rem'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2.5rem',
                    cursor: 'pointer',
                    color: (hoverRating || selectedRating) >= star ? '#FFD700' : '#ddd',
                    transform: (hoverRating || selectedRating) >= star ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRatingClick(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: '#f0f0f0',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '1rem'
              }}
            >
              Отмена
            </button>
          </>
        ) : (
          <div style={{
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {selectedRating >= 4 ? '🎉' : selectedRating === 3 ? '💝' : '🤝'}
            </div>
            
            <p style={{
              color: '#2c1e0f',
              fontSize: '1.2rem',
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              {message}
            </p>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

// Компонент для управления flash-товарами в корзине
const FlashItemManager = ({ cart, setCart, products, subtotal }) => {
  useEffect(() => {
    // Находим товар с R2000 в ID (это будет "6R2000") 
    const specialProduct = products.find(p => String(p.id).includes('R2000'));
    if (!specialProduct) return;

    // Ищем flash-товар в корзине (с суффиксом _flash)
    const flashItem = cart.find(item => item.id === `${specialProduct.id}_flash`);
    if (!flashItem) return;
    
    // ✅ ИСКЛЮЧАЕМ СЕТЫ ИЗ РАСЧЕТА FLASH-ТОВАРОВ
    const otherItemsSubtotal = cart
      .filter(item => item.id !== flashItem.id && !item.isDelivery && !String(item.id).includes('S'))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const conditionMet = otherItemsSubtotal >= 2000;
    
    // Определяем правильную цену и состояние
    const discountedPrice = Math.round(specialProduct.price * 0.01);
    const correctPrice = conditionMet ? discountedPrice : specialProduct.price;
    const shouldBeDiscounted = conditionMet;
    const shouldViolateCondition = !conditionMet;
    
    // Обновляем только если что-то изменилось
    if (flashItem.price !== correctPrice || 
        flashItem.isDiscounted !== shouldBeDiscounted || 
        flashItem.violatesCondition !== shouldViolateCondition) {
      
      setCart(prev => prev.map(item => 
        item.id === flashItem.id 
          ? { 
              ...item, 
              price: correctPrice,
              isDiscounted: shouldBeDiscounted,
              violatesCondition: shouldViolateCondition
            }
          : item
      ));
    }
  }, [cart, products, subtotal, setCart]);

  return null; // Этот компонент ничего не рендерит
};

// Основной компонент магазина
const ShopPage = () => {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  
  // ✅ ДОБАВЛЯЕМ СОСТОЯНИЕ ДЛЯ ДАННЫХ О СКИДКЕ
  const [discountData, setDiscountData] = useState(null);
  
  // Состояния для рейтинга
  const [ratingPopup, setRatingPopup] = useState({ isOpen: false, product: null });
  const [userRatings, setUserRatings] = useState({});
  
  // Состояние для попапов активации
  const [activationPopup, setActivationPopup] = useState({ type: null, isOpen: false, data: null });
  
  // Состояние для режима доставки
  const [deliveryMode, setDeliveryMode] = useState(() => {
    return localStorage.getItem('deliveryMode') || 'delivery';
  });
  
  // Состояния для плавного свайпа
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Сохраняем режим доставки в localStorage
  useEffect(() => {
    localStorage.setItem('deliveryMode', deliveryMode);
  }, [deliveryMode]);

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

  // Функция для очистки корзины после успешного заказа
  const clearCart = () => {
    setCart([]);
  };

  // Функции для рейтинга
  const openRatingPopup = (product) => {
    setRatingPopup({ isOpen: true, product });
  };

  const closeRatingPopup = () => {
    setRatingPopup({ isOpen: false, product: null });
  };

  const handleRatingSubmit = (rating) => {
    if (ratingPopup.product) {
      setUserRatings(prev => ({
        ...prev,
        [ratingPopup.product.id]: rating
      }));
    }
  };

  // Функции для плавного свайпа
  const handleTouchStart = (e) => {
    if (categories.length === 0 || isAnimating) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || isAnimating) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;
    
    // Проверяем что это горизонтальный свайп
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
      // Ограничиваем смещение для более естественного ощущения
      const maxOffset = window.innerWidth * 0.3;
      const limitedDelta = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      setSwipeOffset(limitedDelta);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping || categories.length === 0 || isAnimating) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Проверяем что это горизонтальный свайп с достаточным расстоянием
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      const allCategories = [null, ...categories.map(cat => cat.id)];
      const currentIndex = allCategories.indexOf(activeCategory);
      let newIndex = currentIndex;

      if (deltaX > 0 && currentIndex > 0) {
        // Свайп вправо - предыдущая категория
        newIndex = currentIndex - 1;
      } else if (deltaX < 0 && currentIndex < allCategories.length - 1) {
        // Свайп влево - следующая категория
        newIndex = currentIndex + 1;
      }

      if (newIndex !== currentIndex) {
        // Плавная смена категории
        setIsAnimating(true);
        setActiveCategory(allCategories[newIndex]);
        
        setTimeout(() => {
          setSwipeOffset(0);
          setTimeout(() => {
            setIsAnimating(false);
          }, 400);
        }, 50);
      } else {
        // Возвращаем на место
        setSwipeOffset(0);
      }
    } else {
      // Возвращаем на место
      setSwipeOffset(0);
    }

    setIsSwiping(false);
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ ФУНКЦИЯ ДЛЯ ОБРАБОТКИ ОТКРЫТИЯ ФОРМЫ ЗАКАЗА
  const handleOpenOrderForm = (discountData) => {
    setDiscountData(discountData);  // Сохраняем данные о скидке
    setIsCartOpen(false);
    setIsOrderFormOpen(true);
  };

  // Функция для показа попапов активации
  const handleShowActivationPopup = (type, data) => {
    setActivationPopup({ type, isOpen: true, data });
  };

  // Функция подтверждения активации
  const handleConfirmActivation = () => {
    if (activationPopup.type === 'flash' && activationPopup.data) {
      const flashItem = {
        ...activationPopup.data.product,
        id: `${activationPopup.data.product.id}_flash`,
        name: `${activationPopup.data.product.name} ⚡`,
        price: activationPopup.data.price,
        originalPrice: activationPopup.data.product.price,
        quantity: 1,
        isFlashOffer: true,
        isDiscounted: true,
        violatesCondition: false
      };
      addToCart(flashItem);
    } else if (activationPopup.type === 'delivery') {
      setCart(prev => prev.map(item => 
        item.id === 'delivery_service'
          ? { ...item, price: 0, name: 'Доставка 🎉', isFreeDelivery: true }
          : item
      ));
    }
    setActivationPopup({ type: null, isOpen: false, data: null });
  };

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

          /* ✅ АНИМАЦИИ ДЛЯ РЕКОМЕНДАЦИЙ ШЕФА */
          @keyframes chefGlow {
            0%, 100% { 
              box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4), 0 0 0 0 rgba(255, 215, 0, 0.7);
            }
            50% { 
              box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6), 0 0 0 4px rgba(255, 215, 0, 0);
            }
          }
          
          @keyframes crownBounce {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-3px) rotate(5deg); }
          }
          
          @keyframes chefBadgePulse {
            0%, 100% { 
              transform: scale(1);
              border-color: #FFA500;
              box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7);
            }
            50% { 
              transform: scale(1.02);
              border-color: #FF8C00;
              box-shadow: 0 0 0 3px rgba(255, 165, 0, 0);
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

        {/* ✅ ТОНКИЕ ЗАКРЕПЛЕННЫЕ ПРОГРЕСС-БАРЫ ПОД КАТЕГОРИЯМИ */}
        <StickyProgressBars 
          products={products}
          cart={cart}
          settings={settings}
          deliveryMode={deliveryMode}
          onShowPopup={handleShowActivationPopup}
        />

        {/* ✅ КОМПАКТНЫЕ ПРЕДЛОЖЕНИЯ НА ГЛАВНОЙ СТРАНИЦЕ */}
        <div style={{ padding: '0 1rem' }}>
          <MainPageDeliveryOffer 
            cart={cart}
            settings={settings}
            deliveryMode={deliveryMode}
          />

          <MainPageFlashOffer 
            products={products}
            cart={cart}
            settings={settings}
            addToCart={addToCart}
          />
        </div>

        {/* ✅ ИСПОЛЬЗУЕМ НОВЫЙ КОМПОНЕНТ ProductGrid */}
        <ProductGrid
          products={products}
          categories={categories}
          activeCategory={activeCategory}
          settings={settings}
          cart={cart}
          onAddToCart={addToCart}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onRatingClick={openRatingPopup}
        />

        {/* Менеджеры компонентов */}
        <SimpleDeliveryManager cart={cart} setCart={setCart} />
        
        <FlashItemManager 
          cart={cart} 
          setCart={setCart} 
          products={products} 
          subtotal={subtotal} 
        />
        
        <OrderingNowBanner products={products} settings={settings} addToCart={addToCart} />
        
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          settings={settings}
          addToCart={addToCart}
          setCart={setCart}
          onOpenOrderForm={handleOpenOrderForm}
        />

        <OrderForm
          isOpen={isOrderFormOpen}
          onClose={() => setIsOrderFormOpen(false)}
          discountData={discountData}
          settings={settings}
          onOrderSuccess={() => {
            clearCart();
            setIsOrderFormOpen(false);
            setDiscountData(null);
          }}
        />

        {/* Плавающие кнопки корзины и WhatsApp */}
        <FloatingButtons
          cartItemsCount={cartItemsCount}
          onCartOpen={() => setIsCartOpen(true)}
          settings={settings}
        />

        {/* Попап активации предложений */}
        <ActivationPopup 
          type={activationPopup.type}
          isOpen={activationPopup.isOpen}
          onClose={() => setActivationPopup({ type: null, isOpen: false, data: null })}
          data={activationPopup.data}
          settings={settings}
          onConfirm={handleConfirmActivation}
        />

        {/* Попап для голосования */}
        <RatingPopup
          isOpen={ratingPopup.isOpen}
          onClose={closeRatingPopup}
          productName={ratingPopup.product?.name}
          onRatingSubmit={handleRatingSubmit}
        />
      </div>
    </>
  );
};

// Главный App компонент с роутингом
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Основная страница магазина */}
        <Route path="/" element={<ShopPage />} />
        
        {/* Админ панель */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
