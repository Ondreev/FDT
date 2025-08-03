import React, { useState, useEffect } from 'react';

// Главный компонент выглядывающих товаров с буквой W
const PeekingPopup = ({ products, settings, addToCart, cart }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('hidden'); // hidden, peeking, showing, hiding
  const [shownProducts, setShownProducts] = useState(new Set()); // Запоминаем показанные товары

  // Находим ВСЕ товары с буквой W в ID
  const specialProducts = products.filter(product => 
    String(product.id).includes('W')
  );

  useEffect(() => {
    if (specialProducts.length === 0) return;

    const showRandomProduct = () => {
      // Получаем текущее состояние показанных товаров
      setShownProducts(currentShown => {
        // Находим товары, которые еще не показывались - ЗДЕСЬ определяем availableProducts
        const notShownYet = specialProducts.filter(product => 
          !currentShown.has(product.id)
        );
        
        // Если все товары уже показаны - используем все товары и сбрасываем память
        const productsToShow = notShownYet.length > 0 ? notShownYet : specialProducts;
        
        if (productsToShow.length === 0) return currentShown;
        
        const randomProduct = productsToShow[Math.floor(Math.random() * productsToShow.length)];
        setCurrentProduct(randomProduct);
        
        // Фаза 1: выглядывает (1 сек)
        setAnimationPhase('peeking');
        setIsVisible(true);
        
        // Фаза 2: полностью показывается через 1 сек (8 сек показа)
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
        showRandomProduct();
      }, 1000); // Через 1 секунду после остановки скролла
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Первый показ через 10 секунд
    const initialTimer = setTimeout(showRandomProduct, 10000);
    
    // Потом каждые 35-50 секунд
    const interval = setInterval(() => {
      showRandomProduct();
    }, Math.random() * 15000 + 35000); // 35-50 секунд

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [specialProducts]); // Только specialProducts в зависимостях

  if (!isVisible || !currentProduct) return null;

  const handleOrderProduct = () => {
    addToCart(currentProduct);
    setAnimationPhase('hiding');
    setTimeout(() => {
      setIsVisible(false);
      setCurrentProduct(null);
      setAnimationPhase('hidden');
    }, 500);
  };

  // Определяем позицию товара в зависимости от фазы (СЛЕВА)
  const getTransform = () => {
    switch (animationPhase) {
      case 'peeking':
        return 'translateX(-50%) rotate(10deg)';  // Выглядывает слева - больше видно
      case 'showing':
        return 'translateX(10%) rotate(10deg)';   // Почти полностью виден - еще больше сдвинут
      case 'hiding':
        return 'translateX(-100%) rotate(10deg)'; // Прячется влево
      default:
        return 'translateX(-100%) rotate(10deg)';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes productPulse {
            0%, 100% { transform: ${getTransform()} scale(1); }
            50% { transform: ${getTransform()} scale(1.02); }
          }
          
          @keyframes buttonFloat {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.05); }
          }
          
          @keyframes priceGlow {
            0%, 100% { 
              text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
              transform: scale(1);
            }
            50% { 
              text-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
              transform: scale(1.05);
            }
          }
          
          @keyframes fadeInFloat {
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
          left: '-80px', // Меньше отступ слева, чтобы блюдо было видно
          bottom: '150px',
          zIndex: 1400,
          transform: getTransform(),
          transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          animation: animationPhase === 'showing' ? 'productPulse 3s infinite' : 'none',
          pointerEvents: 'none'
        }}
      >
        <img
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          style={{
            width: '300px',   // Увеличено в 2.5 раза (120px * 2.5)
            height: '450px',  // Увеличено в 2.5 раза (180px * 2.5)
            objectFit: 'contain',
            filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))',
            borderRadius: '16px'
          }}
        />
      </div>

      {/* Крестик для закрытия - ВСЕГДА видимый */}
      {animationPhase === 'showing' && (
        <button
          onClick={() => {
            setAnimationPhase('hiding');
            setTimeout(() => {
              setIsVisible(false);
              setCurrentProduct(null);
              setAnimationPhase('hidden');
            }, 500);
          }}
          style={{
            position: 'fixed',
            left: '20px', // Слева от товара
            bottom: '470px', // Над группой элементов
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
            animation: 'fadeInFloat 0.5s ease-out',
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
          title="Закрыть"
        >
          ✕
        </button>
      )}

      {/* Парящая цена - НА блюде */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            left: '180px', // Поверх правой части блюда
            bottom: '420px', // Верх группы элементов
            zIndex: 1500,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFD700',
            animation: 'priceGlow 2s infinite, fadeInFloat 0.6s ease-out',
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

      {/* Название товара - сразу под ценой */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            left: '160px', // Чуть левее цены
            bottom: '380px', // Под ценой
            zIndex: 1500,
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            background: 'rgba(0,0,0,0.8)',
            padding: '6px 12px',
            borderRadius: '15px',
            animation: 'fadeInFloat 1s ease-out',
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
          onClick={handleOrderProduct}
          style={{
            position: 'fixed',
            left: '160px', // По центру группы
            bottom: '320px', // Под названием
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
            animation: 'buttonFloat 2s infinite, fadeInFloat 0.8s ease-out',
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
    </>
  );
};

export default PeekingPopup;
