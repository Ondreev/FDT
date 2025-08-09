import { useEffect, useState, useRef } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Основные компоненты
import Cart from './components/Cart';
import OrderForm from './components/OrderForm';
import AdminPage from './components/AdminPage';
import { SimpleDeliveryManager } from './components/SimpleDeliveryManager';
import ProductGrid from './components/ProductGrid';
import { MainPageFlashOffer, MainPageDeliveryOffer } from './components/MainPageOffers';
import FloatingButtons from './components/FloatingButtons';
import PeekingPopup from './components/PeekingPopup';

// ✅ НОВЫЕ КОМПОНЕНТЫ
import RatingPopup from './components/RatingPopup';
import FlashItemManager from './components/FlashItemManager';
import PopupsContainer from './components/PopupsContainer';
import UpsellModal, { useUpsellFlow } from './components/UpsellModal';
import ShopClosedModal from './components/ShopClosedModal';

// ✅ КОМПОНЕНТЫ ДОСТАВКИ
import DeliveryModeSelector from './components/DeliveryModeSelector';
import AddressInput from './components/AddressInput';

// ✅ ХУКИ
import { useShopStatus } from './hooks/useShopStatus';
import { useActiveProducts } from './hooks/useActiveProducts';
import { useDeliveryMode } from './hooks/useDeliveryMode';

import { API_URL, CONFIG } from './config';

// Основной компонент магазина
const ShopPage = () => {
  // ✅ ПРОВЕРКА СТАТУСА МАГАЗИНА
  const { 
    isShopOpen, 
    isLoading: shopStatusLoading, 
    showClosedModal, 
    canAddToCart, 
    closeModal 
  } = useShopStatus();

  // ✅ ХУК УПРАВЛЕНИЯ ДОСТАВКОЙ
  const deliveryState = useDeliveryMode();
  const {
    deliveryMode,
    savedAddress,
    needsSelection,
    needsAddressInput,
    setDeliveryMode,
    closeSelection
  } = deliveryState;

  // Основные состояния
  const [settings, setSettings] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [discountData, setDiscountData] = useState(null);
  
  // ✅ ФИЛЬТРАЦИЯ АКТИВНЫХ ТОВАРОВ с автообновлением
  const products = useActiveProducts(allProducts);
  
  // Состояния для рейтинга
  const [ratingPopup, setRatingPopup] = useState({ isOpen: false, product: null });
  const [userRatings, setUserRatings] = useState({});
  
  // ✅ ОБЩИЕ СОСТОЯНИЯ ДЛЯ ФЛЕШ-ПРЕДЛОЖЕНИЯ
  const [flashOfferDismissed, setFlashOfferDismissed] = useState(false);
  const [flashOfferShown, setFlashOfferShown] = useState(false);
  
  // Состояния для попапов в меню
  const [showFlashPopup, setShowFlashPopup] = useState(false);
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [flashPopupData, setFlashPopupData] = useState(null);
  const [flashTimeLeft, setFlashTimeLeft] = useState(120);
  const [deliveryTimeLeft, setDeliveryTimeLeft] = useState(180);
  
  // Состояния для плавного свайпа
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ УПРАВЛЕНИЕ UPSELL
  const {
    isUpsellOpen,
    currentUpsellStep,
    startUpsellFlow,
    nextUpsellStep,
    closeUpsellFlow
  } = useUpsellFlow();

  // REF для панели категорий
  const categoriesRef = useRef(null);

  // ✅ ФУНКЦИЯ АВТОСКРОЛЛА К АКТИВНОЙ КАТЕГОРИИ
  const scrollToActiveCategory = () => {
    if (!categoriesRef.current || categories.length === 0) return;
    
    const allCategories = [null, ...categories.map(cat => cat.id)];
    const activeIndex = allCategories.indexOf(activeCategory);
    
    if (activeIndex === -1) return;
    
    const categoryButtons = categoriesRef.current.children;
    const activeButton = categoryButtons[activeIndex];
    
    if (activeButton) {
      const containerRect = categoriesRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      const scrollLeft = categoriesRef.current.scrollLeft;
      const buttonLeft = buttonRect.left - containerRect.left + scrollLeft;
      const buttonWidth = buttonRect.width;
      const containerWidth = containerRect.width;
      
      const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      
      categoriesRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  };

  // ОСНОВНЫЕ ФУНКЦИИ
  const fetchData = (action, setter) => {
    fetch(`${API_URL}?action=${action}`)
      .then((res) => res.json())
      .then((data) => setter(data))
      .catch((err) => console.error(`Error fetching ${action}:`, err));
  };

  // ✅ ОПТИМИЗИРОВАННАЯ ФУНКЦИЯ addToCart - БЕЗ ЛИШНИХ ЗАПРОСОВ
const addToCart = async (product, skipUpsell = false) => {
  // Проверяем, можно ли добавить товар в корзину (статус магазина)
  if (!canAddToCart()) {
    return; // Если магазин закрыт, покажется модальное окно
  }

  // ✅ УПРОЩЕННАЯ ПРОВЕРКА: товар есть в списке активных товаров?
  const isFlashOffer = product.isFlashOffer || String(product.id).includes('_flash');
  const isDeliveryService = product.id === 'delivery_service' || product.isDelivery;

  // ✅ Для обычных товаров проверяем через уже загруженные активные товары
  if (!isDeliveryService && !isFlashOffer) {
    const originalId = String(product.id);
    const currentProduct = products.find(p => String(p.id) === originalId);
    
    if (!currentProduct) {
      alert('❌ К сожалению, этот товар временно недоступен');
      return;
    }
  }

  // ✅ Для флеш-товаров проверяем базовый товар
  if (isFlashOffer && !isDeliveryService) {
    const originalId = String(product.id).replace('_flash', '');
    const baseProduct = products.find(p => String(p.id) === originalId);
    
    if (!baseProduct) {
      alert('❌ К сожалению, этот товар временно недоступен');
      return;
    }
  }

  // ✅ ДОБАВЛЯЕМ ТОВАР В КОРЗИНУ
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

  // ✅ ЗАПУСКАЕМ UPSELL ТОЛЬКО ДЛЯ ОСНОВНЫХ БЛЮД (не для флеш-товаров и спецпредложений)
  if (!skipUpsell && !isUpsellOpen && !isFlashOffer && !isDeliveryService) {
    const productId = String(product.id);
    const isMainDish = !productId.includes('Q') && !productId.includes('Y') && 
                      !productId.includes('D') && !productId.includes('S') && 
                      !productId.includes('R2000');
    
    if (isMainDish) {
      setTimeout(() => {
        startUpsellFlow();
      }, 300);
    }
  }
};

  // ✅ ФУНКЦИЯ ДЛЯ ДОБАВЛЕНИЯ БЕЗ UPSELL
  const addToCartWithoutUpsell = (product) => {
    addToCart(product, true);
  };

  // ✅ ФУНКЦИЯ ОТКЛОНЕНИЯ ФЛЕШ-ПРЕДЛОЖЕНИЯ
  const dismissFlashOffer = () => {
    setFlashOfferDismissed(true);
    setShowFlashPopup(false);
    localStorage.setItem('flashOfferDismissed', 'true');
  };

  // ✅ ФУНКЦИЯ ПОКАЗА ФЛЕШ-ПОПАПА
  const showFlashOfferPopup = (productData) => {
    if (flashOfferDismissed) return;
    
    setFlashPopupData(productData);
    setFlashTimeLeft(120);
    setShowFlashPopup(true);
    setFlashOfferShown(true);
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
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      const allCategories = [null, ...categories.map(cat => cat.id)];
      const currentIndex = allCategories.indexOf(activeCategory);
      let newIndex = currentIndex;

      if (deltaX > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (deltaX < 0 && currentIndex < allCategories.length - 1) {
        newIndex = currentIndex + 1;
      }

      if (newIndex !== currentIndex) {
        setIsAnimating(true);
        setActiveCategory(allCategories[newIndex]);
        
        setTimeout(() => {
          setSwipeOffset(0);
          setTimeout(() => {
            setIsAnimating(false);
          }, 400);
        }, 50);
      } else {
        setSwipeOffset(0);
      }
    } else {
      setSwipeOffset(0);
    }

    setIsSwiping(false);
  };

  const handleOpenOrderForm = (discountData) => {
    setDiscountData(discountData);
    setIsCartOpen(false);
    setIsOrderFormOpen(true);
  };

  // Вычисляемые значения
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // EFFECTS
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveCategory();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeCategory, categories]);

  useEffect(() => {
    let flashTimer = null;
    if (showFlashPopup && flashTimeLeft > 0) {
      flashTimer = setInterval(() => {
        setFlashTimeLeft(prev => {
          if (prev <= 1) {
            setShowFlashPopup(false);
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(flashTimer);
  }, [showFlashPopup, flashTimeLeft]);

  useEffect(() => {
    let deliveryTimer = null;
    if (showDeliveryPopup && deliveryTimeLeft > 0) {
      deliveryTimer = setInterval(() => {
        setDeliveryTimeLeft(prev => {
          if (prev <= 1) {
            setShowDeliveryPopup(false);
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(deliveryTimer);
  }, [showDeliveryPopup, deliveryTimeLeft]);

  // ✅ ОБНОВЛЕННЫЙ useEffect для флеш-предложения
  useEffect(() => {
    // Проверяем было ли отклонено в этой сессии
    const dismissed = localStorage.getItem('flashOfferDismissed');
    if (dismissed === 'true') {
      setFlashOfferDismissed(true);
      return;
    }

    // Проверка флеш-предложения
    const flashProduct = products.find(p => String(p.id).includes('R2000'));
    if (flashProduct) {
      const productsSubtotal = cart
        .filter(item => !item.isDelivery && !String(item.id).includes('S'))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const flashItem = cart.find(item => item.id === `${flashProduct.id}_flash`);
      const conditionMet = productsSubtotal >= 2000;
      
      if (conditionMet && !flashItem && !showFlashPopup && !flashOfferShown && !flashOfferDismissed) {
        const discountedPrice = Math.round(flashProduct.price * 0.01);
        showFlashOfferPopup({ product: flashProduct, price: discountedPrice });
      }
    }

    // Проверка бесплатной доставки (без изменений)
    if (deliveryMode === 'delivery') {
      const productsSubtotal = cart
        .filter(item => item.id !== 'delivery_service')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const deliveryItem = cart.find(item => item.id === 'delivery_service');
      const conditionMet = productsSubtotal >= 2000;
      
      if (conditionMet && deliveryItem && !deliveryItem.isFreeDelivery && !showDeliveryPopup) {
        setDeliveryTimeLeft(180);
        setShowDeliveryPopup(true);
      }
    }
  }, [cart, products, deliveryMode, showFlashPopup, flashOfferShown, flashOfferDismissed]);

  // ✅ СБРОС состояния при загрузке страницы
  useEffect(() => {
    localStorage.removeItem('flashOfferDismissed');
  }, []);

  useEffect(() => {
    if (settings.font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.font]);
  
  // ✅ ОБНОВЛЕННОЕ использование хука для товаров
  useEffect(() => {
    fetchData('getSettings', setSettings);
    fetchData('getProducts', setAllProducts); // ✅ Загружаем все товары
    fetchData('getCategories', setCategories);
  }, []);

  // ✅ ДОБАВЛЯЕМ проверку обновлений товаров каждые 60 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing products...');
      fetchData('getProducts', setAllProducts);
    }, 60000); // Обновляем каждые 60 секунд

    return () => clearInterval(interval);
  }, []);

  // ✅ ПОКАЗЫВАЕМ ЗАГРУЗКУ ЕСЛИ ПРОВЕРЯЕТСЯ СТАТУС МАГАЗИНА
  if (shopStatusLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Проверяем статус магазина...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
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

          @keyframes popupBounce {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); opacity: 1; }
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

        {/* ✅ НОВЫЙ КОМПОНЕНТ ВЫБОРА ДОСТАВКИ */}
        <DeliveryModeSelector 
          settings={settings}
          compact={false}
        />

        {categories.length > 0 && (
          <div
            ref={categoriesRef}
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
              // ✅ Скрываем полосу прокрутки
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE
            }}
            // ✅ Добавляем CSS для webkit браузеров
            className="hide-scrollbar"
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

        {/* Компактные предложения на главной странице */}
        <div style={{ padding: '0 1rem' }}>
          <MainPageDeliveryOffer 
            cart={cart}
            settings={settings}
            deliveryMode={deliveryMode}
          />

          {/* ✅ ПЕРЕДАЕМ СОСТОЯНИЯ В MainPageFlashOffer */}
          <MainPageFlashOffer 
            products={products}
            cart={cart}
            settings={settings}
            addToCart={addToCartWithoutUpsell}
            isDismissed={flashOfferDismissed}
            onDismiss={dismissFlashOffer}
          />
        </div>

        {/* Сетка товаров */}
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
        
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          settings={settings}
          addToCart={addToCartWithoutUpsell}
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

        {/* ✅ НОВЫЕ КОМПОНЕНТЫ */}
        {/* ✅ ПЕРЕДАЕМ СОСТОЯНИЯ В PopupsContainer */}
        <PopupsContainer
          showFlashPopup={showFlashPopup}
          setShowFlashPopup={setShowFlashPopup}
          flashPopupData={flashPopupData}
          flashTimeLeft={flashTimeLeft}
          showDeliveryPopup={showDeliveryPopup}
          setShowDeliveryPopup={setShowDeliveryPopup}
          deliveryTimeLeft={deliveryTimeLeft}
          addToCartWithoutUpsell={addToCartWithoutUpsell}
          setCart={setCart}
          onDismissFlash={dismissFlashOffer}
        />

        <RatingPopup
          isOpen={ratingPopup.isOpen}
          onClose={closeRatingPopup}
          productName={ratingPopup.product?.name}
          onRatingSubmit={handleRatingSubmit}
        />

        <PeekingPopup
          products={products}
          settings={settings}
          addToCart={addToCartWithoutUpsell}
          cart={cart}
        />

        {/* ✅ UPSELL MODAL */}
        <UpsellModal
          isOpen={isUpsellOpen}
          onClose={closeUpsellFlow}
          products={products}
          settings={settings}
          addToCart={addToCartWithoutUpsell}
          currentStep={currentUpsellStep}
          onNextStep={nextUpsellStep}
        />

        {/* ✅ МОДАЛЬНОЕ ОКНО ЗАКРЫТОГО МАГАЗИНА */}
        <ShopClosedModal
          isOpen={showClosedModal}
          onClose={closeModal}
          settings={settings}
        />

        {/* ✅ КОМПОНЕНТ ВВОДА АДРЕСА */}
        <AddressInput 
          isOpen={needsAddressInput}
          onClose={() => {
            deliveryState.closeSelection();
          }}
          settings={settings}
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
        <Route path="/" element={<ShopPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
