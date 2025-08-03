import { useState, useEffect } from 'react';

const OrderingNowBanner = ({ products, settings, addToCart }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('hidden'); // hidden, peeking, showing, hiding
  const [shownProducts, setShownProducts] = useState(new Set()); // Запоминаем показанные товары
  const [isDisabled, setIsDisabled] = useState(() => {
    // Проверяем, отключил ли пользователь баннер
    return localStorage.getItem('orderingBannerDisabled') === 'true';
  });

  useEffect(() => {
    if (products.length === 0 || isDisabled) return;

    const showBanner = () => {
      setShownProducts(currentShown => {
        // Находим товары, которые еще не показывались
        const notShownYet = products.filter(product => 
          !currentShown.has(product.id)
        );
        
        // Если все товары уже показаны - используем все товары
        const productsToShow = notShownYet.length > 0 ? notShownYet : products;
        
        if (productsToShow.length === 0) return currentShown;
        
        const randomProduct = productsToShow[Math.floor(Math.random() * productsToShow.length)];
        setCurrentProduct(randomProduct);
        
        // Фаза 1: выглядывает справа (1 сек)
        setAnimationPhase('peeking');
        setIsVisible(true);
        
        // Фаза 2: полностью показывается через 1 сек (8 сек показ)
        setTimeout(() => {
          setAnimationPhase('showing');
        }, 1000);
        
        // Фаза 3: прячется через 8 сек показа
        setTimeout(() => {
          setAnimationPhase('hiding');
          setTimeout(() => {
            setIsVisible(false);
            setCurrentProduct(null);
            setAnimationPhase('hidden');
          }, 800);
        }, 9000); // 1 сек пикинг + 8 сек показ
        
        // Если использовали все товары - сбрасываем и добавляем текущий
        if (notShownYet.length === 0) {
          return new Set([randomProduct.id]);
        }
        
        // Добавляем текущий товар к показанным
        return new Set([...currentShown, randomProduct.id]);
      });
    };

    // Отслеживаем скролл для ЗАПУСКА анимаций
    let scrollTimeout;
    const handleScroll = () => {
      // Если уже показываем - не запускаем новую анимацию
      if (isVisible) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Пользователь поскроллил и остановился - запускаем анимацию!
        showBanner();
      }, 2000); // Через 2 секунды после остановки скролла
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Первый показ через 15 секунд (позже чем PeekingPopup)
    const initialTimer = setTimeout(showBanner, 15000);
    
    // Потом каждые 3 минуты (180 секунд)
    const interval = setInterval(() => {
      showBanner();
    }, 180000); // 3 минуты = 180000 мс

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [products, isDisabled]);

  if (!isVisible || !currentProduct || isDisabled) return null;

  // Определяем позицию товара в зависимости от фазы (СПРАВА)
  const getTransform = () => {
    switch (animationPhase) {
      case 'peeking':
        return 'translateX(50%) rotate(-10deg)';  // Выглядывает справа
      case 'showing':
        return 'translateX(-10%) rotate(-10deg)'; // Почти полностью виден справа
      case 'hiding':
        return 'translateX(100%) rotate(-10deg)'; // Прячется вправо
      default:
        return 'translateX(100%) rotate(-10deg)';
    }
  };

  const handleDisable = () => {
    // Сохраняем в localStorage что пользователь отключил баннер
    localStorage.setItem('orderingBannerDisabled', 'true');
    setIsDisabled(true);
    setAnimationPhase('hiding');
    setTimeout(() => {
      setIsVisible(false);
      setCurrentProduct(null);
      setAnimationPhase('hidden');
    }, 500);
  };

  return (
    <>
      <style>
        {`
          @keyframes productPulseRight {
            0%, 100% { transform: ${getTransform()} scale(1); }
            50% { transform: ${getTransform()} scale(1.02); }
          }
          
          @keyframes buttonFloatRight {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.05); }
          }
          
          @keyframes priceGlowRight {
            0%, 100% { 
              text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
              transform: scale(1);
            }
            50% { 
              text-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
              transform: scale(1.05);
            }
          }
          
          @keyframes fadeInFloatRight {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.8);
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {/* Основное изображение товара */}
      <div
        style={{
          position: 'fixed',
          right: '-80px', // Справа
          bottom: '150px',
          zIndex: 1300, // Ниже PeekingPopup
          transform: getTransform(),
          transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          animation: animationPhase === 'showing' ? 'productPulseRight 3s infinite' : 'none',
          pointerEvents: 'none'
        }}
      >
        <img
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          style={{
            width: '200px',   // Чуть меньше чем PeekingPopup
            height: '300px',  // Чуть меньше чем PeekingPopup
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* Крестик для отключения - ВСЕГДА видимый */}
      {animationPhase === 'showing' && (
        <button
          onClick={handleDisable}
          style={{
            position: 'fixed',
            right: '20px', // Справа от товара
            bottom: '420px', // Верх группы элементов
            zIndex: 1500,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeInFloatRight 0.5s ease-out',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.background = 'rgba(255,0,0,0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'rgba(0,0,0,0.7)';
          }}
          title="Отключить баннер навсегда"
        >
          ✕
        </button>
      )}

      {/* Парящая цена - НА блюде */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            right: '80px', // Поверх левой части блюда
            bottom: '380px', // Верх группы элементов
            zIndex: 1500,
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#FFD700',
            animation: 'priceGlowRight 2s infinite, fadeInFloatRight 0.6s ease-out',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #FFD700',
            pointerEvents: 'none',
            textAlign: 'center',
            minWidth: '80px'
          }}
        >
          {currentProduct.price}₽
        </div>
      )}

      {/* Название товара - под ценой */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            right: '60px', // Чуть правее цены
            bottom: '340px', // Под ценой
            zIndex: 1500,
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            background: 'rgba(0,0,0,0.8)',
            padding: '6px 12px',
            borderRadius: '15px',
            animation: 'fadeInFloatRight 1s ease-out',
            pointerEvents: 'none',
            textAlign: 'center',
            maxWidth: '140px',
            lineHeight: '1.2'
          }}
        >
          {currentProduct.name}
        </div>
      )}

      {/* Парящая кнопка заказа - под названием */}
      {animationPhase === 'showing' && (
        <button
          onClick={() => {
            addToCart(currentProduct);
            setAnimationPhase('hiding');
            setTimeout(() => {
              setIsVisible(false);
              setCurrentProduct(null);
              setAnimationPhase('hidden');
            }, 500);
          }}
          style={{
            position: 'fixed',
            right: '60px', // По центру группы
            bottom: '280px', // Под названием
            zIndex: 1500,
            background: `linear-gradient(135deg, ${settings.primaryColor || '#ff7f32'}, ${settings.primaryColor || '#ff7f32'}dd)`,
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            animation: 'buttonFloatRight 2s infinite, fadeInFloatRight 0.8s ease-out',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            minWidth: '120px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.1)';
            e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.05)';
            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
          }}
        >
          🛒 Заказать
        </button>
      )}

      {/* Маленький текст "Сейчас заказывают" */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            right: '40px',
            bottom: '240px', // Под кнопкой
            zIndex: 1500,
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#666',
            background: 'rgba(255,255,255,0.9)',
            padding: '4px 8px',
            borderRadius: '10px',
            animation: 'fadeInFloatRight 1.2s ease-out',
            pointerEvents: 'none',
            textAlign: 'center',
            opacity: 0.8
          }}
        >
          ⭐ Сейчас заказывают
        </div>
      )}
    </>
  );
};

export default OrderingNowBanner;
