import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './components/Cart';
import OrderForm from './components/OrderForm';
import OrderingNowBanner from './components/OrderingNowBanner';
import AdminPage from './components/AdminPage';
import { SimpleDeliveryManager } from './components/SimpleDeliveryManager';

const API_URL = 'https://script.google.com/macros/s/AKfycbxAQF0sfNYonRjjH3zFBW58gkXZ3u5mKZWUtDyspY3uyHxFc-WnZB13Hz8IH1w-h3bG2Q/exec';

// Компонент для отображения звездного рейтинга
const StarRating = ({ rating, size = 16, onClick, isClickable = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      cursor: isClickable ? 'pointer' : 'default'
    }} onClick={onClick}>
      {/* Полные звезды */}
      {Array(fullStars).fill().map((_, i) => (
        <span key={`full-${i}`} style={{ 
          color: '#FFD700', 
          fontSize: `${size}px`,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
        }}>
          ⭐
        </span>
      ))}
      
      {/* Половинчатая звезда */}
      {hasHalfStar && (
        <span style={{ 
          position: 'relative',
          color: '#FFD700',
          fontSize: `${size}px`,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
        }}>
          <span style={{ 
            position: 'absolute',
            overflow: 'hidden',
            width: '50%',
            color: '#FFD700'
          }}>⭐</span>
          <span style={{ color: '#ddd' }}>⭐</span>
        </span>
      )}
      
      {/* Пустые звезды */}
      {Array(emptyStars).fill().map((_, i) => (
        <span key={`empty-${i}`} style={{ 
          color: '#ddd', 
          fontSize: `${size}px`,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
        }}>
          ⭐
        </span>
      ))}
      
      {/* Числовой рейтинг */}
      <span style={{
        color: '#ff7f32',
        fontSize: `${size - 2}px`,
        fontWeight: 'bold',
        marginLeft: '4px'
      }}>
        {rating}
      </span>
    </div>
  );
};

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

// Компонент для управления flash-товарами в корзине так
const FlashItemManager = ({ cart, setCart, products, subtotal }) => {
  useEffect(() => {
    // Находим товар с R2000 в ID (это будет "6R2000") 
    const specialProduct = products.find(p => String(p.id).includes('R2000'));
    if (!specialProduct) return;

    // Ищем flash-товар в корзине (с суффиксом _flash)
    const flashItem = cart.find(item => item.id === `${specialProduct.id}_flash`);
    if (!flashItem) return;
    
    // Вычисляем сумму остальных товаров (исключая доставку и этот flash товар)
    const otherItemsSubtotal = cart
      .filter(item => item.id !== flashItem.id && !item.isDelivery)
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

// Основной компонент магазина (ваш существующий код)
const ShopPage = () => {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  
  // Состояния для рейтинга
  const [ratingPopup, setRatingPopup] = useState({ isOpen: false, product: null });
  const [userRatings, setUserRatings] = useState({}); // Локальное хранение оценок
  
  // Состояние для режима доставки (перенесено из Cart в App)
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
        
        // Сбрасываем смещение через короткую задержку
        setTimeout(() => {
          setSwipeOffset(0);
          setTimeout(() => {
            setIsAnimating(false);
          }, window.innerWidth <= 768 ? 400 : 600); // Быстрее на мобильных
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

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Рассчитываем финальную сумму со скидкой для формы заказа
  const calculateFinalTotal = () => {
    return subtotal;
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

          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8) translateX(var(--enter-direction, 0)) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateX(0) translateY(0);
            }
          }

          @keyframes fadeInScaleLeft {
            0% {
              opacity: 0;
              transform: scale(0.8) translateX(-30px) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateX(0) translateY(0);
            }
          }

          @keyframes fadeInScaleRight {
            0% {
              opacity: 0;
              transform: scale(0.8) translateX(30px) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateX(0) translateY(0);
            }
          }

          .product-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            transition: all 0.2s ease-out;
            will-change: transform;
          }

          .product-grid.swiping {
            transition: none;
          }

          .product-grid.animating {
            transition: all 0.2s ease-out;
          }

          /* Оптимизированные анимации для мобильных */
          @media (max-width: 768px) {
            .product-grid {
              transition: all 0.15s ease-out;
            }
            
            .product-card {
              backface-visibility: hidden;
              transform: translateZ(0);
            }
          }

          @media (max-width: 400px) {
            .product-grid {
              grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            }
          }

          /* Оптимизация для лучшей производительности */
          .product-card {
            backface-visibility: hidden;
            transform: translateZ(0);
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
          overflow: 'hidden' // Предотвращаем горизонтальный скролл при свайпе
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

        {/* Оптимизированная карусель */}
        <div 
          className={`product-grid ${isSwiping && !isAnimating ? 'swiping' : ''} ${isAnimating ? 'animating' : ''}`}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            opacity: isAnimating ? 0.4 : 1,
          }}
        >
          {filteredProducts.map((product, index) => {
            // Определяем анимацию в зависимости от размера экрана
            const isMobile = window.innerWidth <= 768;
            const getAnimation = (i) => {
              if (isMobile) {
                return 'mobileSlideIn 0.3s ease forwards';
              }
              const directions = ['tetrisFromLeft', 'tetrisFromTop', 'tetrisFromRight', 'tetrisFromBottom'];
              return `${directions[i % 4]} 0.5s ease forwards`;
            };

            return (
              <div
                key={product.id}
                className="product-card"
                style={{
                  position: 'relative',
                  background: '#fff7ed',
                  borderRadius: '20px',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: `scale(${isSwiping ? 0.99 : 1})`,
                  transition: 'transform 0.15s ease',
                  animationDelay: isAnimating ? `${index * (isMobile ? 0.05 : 0.08)}s` : '0s',
                  animation: isAnimating ? getAnimation(index) : 'none',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Рейтинг справа вверху */}
                {product.rating && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 3
                  }}>
                    <StarRating 
                      rating={parseFloat(product.rating)} 
                      size={12} 
                      onClick={() => openRatingPopup(product)}
                      isClickable={true}
                    />
                  </div>
                )}

                {/* Плашка ОСТРОЕ - под рейтингом */}
                {String(product.id).includes('H') && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '2.2rem',
                      right: '1rem',
                      backgroundColor: '#e03636',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '999px',
                      fontSize: '0.6rem',
                      fontFamily: settings.font || 'Fredoka',
                      zIndex: 2
                    }}
                  >
                    ОСТРОЕ
                  </div>
                )}
                
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    maxWidth: '160px', 
                    borderRadius: '12px', 
                    marginBottom: '0.5rem'
                  }}
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
            );
          })}
        </div>

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
          onOpenOrderForm={() => {
            setIsCartOpen(false);
            setIsOrderFormOpen(true);
          }}
        />

        <OrderForm
          isOpen={isOrderFormOpen}
          onClose={() => setIsOrderFormOpen(false)}
          cart={cart}
          total={calculateFinalTotal()}
          settings={settings}
          onOrderSuccess={() => {
            clearCart();
            setIsOrderFormOpen(false);
          }}
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
