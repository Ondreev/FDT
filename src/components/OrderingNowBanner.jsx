import { useState, useEffect } from 'react';

const OrderingNowBanner = ({ products, settings, addToCart }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('hidden'); // hidden, peeking, showing, hiding
  const [shownProducts, setShownProducts] = useState(new Set()); // Запоминаем показанные товары

  useEffect(() => {
    if (products.length === 0) return;

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

    // Отслеживаем скролл для ЗАПУСКА анимаций (как в PeekingPopup)
    let scrollTimeout;
    const handleScroll = () => {
      // Если уже показываем - не запускаем новую анимацию
      if (isVisible) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Пользователь поскроллил и остановился - запускаем анимацию!
        showBanner();
      }, 1500); // Через 1.5 секунды после остановки скролла
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Первый показ через 5 секунд (чуть раньше чем PeekingPopup)
    const initialTimer = setTimeout(showBanner, 5000);
    
    // Потом каждые 20-30 секунд (чаще чем PeekingPopup)
    const interval = setInterval(() => {
      showBanner();
    }, Math.random() * 10000 + 20000); // 20-30 секунд

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [products]);

  if (!isVisible || !currentProduct) return null;

  // Определяем позицию баннера в зависимости от фазы (СПРАВА)
  const getTransform = () => {
    switch (animationPhase) {
      case 'peeking':
        return 'translateX(60%) rotate(-5deg)';   // Выглядывает справа
      case 'showing':
        return 'translateX(0%) rotate(-2deg)';    // Полностью виден с легким наклоном
      case 'hiding':
        return 'translateX(100%) rotate(-10deg)'; // Прячется вправо
      default:
        return 'translateX(100%) rotate(-10deg)';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes bannerPulse {
            0%, 100% { transform: ${getTransform()} scale(1); }
            50% { transform: ${getTransform()} scale(1.02); }
          }
          
          @keyframes bannerGlow {
            0%, 100% { 
              box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            50% { 
              box-shadow: 0 12px 30px rgba(255, 127, 50, 0.3);
            }
          }
          
          @keyframes fadeInBounce {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.9);
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes starSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '-50px', // Начинаем за экраном
          zIndex: 1300, // Чуть ниже PeekingPopup (1400)
          background: `linear-gradient(135deg, ${settings.backgroundColor || '#fdf0e2'}, #fff8f0)`,
          color: '#2c1e0f',
          padding: '1.5rem',
          borderRadius: '25px',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          border: '3px solid #f0e6d2',
          boxSizing: 'border-box',
          transform: getTransform(),
          transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          animation: animationPhase === 'showing' ? 'bannerPulse 4s infinite, bannerGlow 3s infinite' : 'none',
          filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.2))'
        }}
      >
        {/* Заголовок с анимированной звездочкой */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          animation: animationPhase === 'showing' ? 'fadeInBounce 0.6s ease-out' : 'none'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '1.1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: '#2c1e0f'
          }}>
            <span style={{
              animation: animationPhase === 'showing' ? 'starSpin 2s infinite linear' : 'none',
              display: 'inline-block'
            }}>⭐</span> 
            <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              Сейчас заказывают
            </span>
          </div>
          <button
            onClick={() => {
              setAnimationPhase('hiding');
              setTimeout(() => {
                setIsVisible(false);
                setCurrentProduct(null);
                setAnimationPhase('hidden');
              }, 800);
            }}
            style={{
              background: 'rgba(153, 153, 153, 0.2)',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              fontSize: '20px',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(153, 153, 153, 0.4)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(153, 153, 153, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Блок с товаром */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.5)',
          padding: '1rem',
          borderRadius: '15px',
          border: '1px solid rgba(240, 230, 210, 0.5)',
          animation: animationPhase === 'showing' ? 'fadeInBounce 0.8s ease-out' : 'none'
        }}>
          <img
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '15px', 
              objectFit: 'cover',
              border: '2px solid #f0e6d2',
              filter: 'brightness(1.05)'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              marginBottom: '0.5rem',
              color: '#2c1e0f',
              lineHeight: '1.3'
            }}>
              {currentProduct.name}
            </div>
            <div style={{ 
              fontSize: '1.1rem', 
              color: settings.primaryColor || '#ff7f32',
              fontWeight: 'bold'
            }}>
              {currentProduct.price} {settings.currency || '₽'}
            </div>
          </div>
        </div>

        {/* Кнопка заказа */}
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
            width: '100%',
            padding: '1rem',
            background: `linear-gradient(135deg, ${settings.primaryColor || '#ff7f32'}, ${settings.primaryColor || '#ff7f32'}dd)`,
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 15px rgba(255, 127, 50, 0.3)',
            transition: 'all 0.2s ease',
            animation: animationPhase === 'showing' ? 'fadeInBounce 1s ease-out' : 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.02)';
            e.target.style.boxShadow = '0 6px 20px rgba(255, 127, 50, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(255, 127, 50, 0.3)';
          }}
        >
          🍽️ Хочешь? 😋
        </button>
      </div>
    </>
  );
};

export default OrderingNowBanner;
