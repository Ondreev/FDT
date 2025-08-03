import React, { useState, useEffect } from 'react';

// Главный компонент выглядывающих товаров с буквой R
const PeekingPopup = ({ products, settings, addToCart, cart }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('hidden'); // hidden, peeking, showing, hiding

  // Находим ВСЕ товары с буквой W в ID
  const specialProducts = products.filter(product => 
    String(product.id).includes('W')
  );

  useEffect(() => {
    if (specialProducts.length === 0) return;

    const showRandomProduct = () => {
      const randomProduct = specialProducts[Math.floor(Math.random() * specialProducts.length)];
      setCurrentProduct(randomProduct);
      
      // Фаза 1: выглядывает (1 сек)
      setAnimationPhase('peeking');
      setIsVisible(true);
      
      // Фаза 2: полностью показывается через 1 сек (8 сек показа)
      setTimeout(() => {
        if (isVisible) { // Проверяем что попап еще активен
          setAnimationPhase('showing');
        }
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
      if (!isVisible) { // Запускаем только если не показываем уже
        showRandomProduct();
      }
    }, Math.random() * 15000 + 35000); // 35-50 секунд

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [specialProducts, isVisible]);

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
        return 'translateX(-75%) rotate(10deg)';  // Выглядывает слева
      case 'showing':
        return 'translateX(-20%) rotate(10deg)';  // Почти полностью виден слева
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
          left: '-150px', // Слева вместо справа
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

      {/* Парящая цена */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            left: '280px', // Слева от товара
            bottom: '380px', // Позиция для большого товара
            zIndex: 1500,
            fontSize: '24px', // Исходный размер
            fontWeight: 'bold',
            color: '#FFD700',
            animation: 'priceGlow 2s infinite, fadeInFloat 0.6s ease-out',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 16px', // Исходный размер
            borderRadius: '20px',
            border: '2px solid #FFD700', // Исходная толщина
            pointerEvents: 'none',
            textAlign: 'center',
            minWidth: '80px'
          }}
        >
          {currentProduct.price}₽
        </div>
      )}

      {/* Парящая кнопка заказа */}
      {animationPhase === 'showing' && (
        <button
          onClick={handleOrderProduct}
          style={{
            position: 'fixed',
            left: '260px', // Слева от товара
            bottom: '280px', // Позиция для большого товара
            zIndex: 1500,
            background: `linear-gradient(135deg, ${settings.primaryColor || '#ff7f32'}, ${settings.primaryColor || '#ff7f32'}dd)`,
            color: 'white',
            border: 'none',
            borderRadius: '25px', // Исходный размер
            padding: '12px 20px', // Исходный размер
            fontSize: '16px', // Исходный размер
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            animation: 'buttonFloat 2s infinite, fadeInFloat 0.8s ease-out',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            minWidth: '120px', // Исходный размер
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

      {/* Название товара (компактное) */}
      {animationPhase === 'showing' && (
        <div
          style={{
            position: 'fixed',
            left: '240px', // Слева от товара
            bottom: '330px', // Позиция для большого товара
            zIndex: 1500,
            fontSize: '14px', // Исходный размер
            fontWeight: 'bold',
            color: 'white',
            background: 'rgba(0,0,0,0.8)',
            padding: '6px 12px', // Исходный размер
            borderRadius: '15px',
            animation: 'fadeInFloat 1s ease-out',
            pointerEvents: 'none',
            textAlign: 'center',
            maxWidth: '140px', // Исходный размер
            lineHeight: '1.2'
          }}
        >
          {currentProduct.name}
        </div>
      )}
    </>
  );
};

export default PeekingPopup;
