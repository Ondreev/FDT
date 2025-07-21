import { useEffect, useState } from 'react';
import { useApi } from './hooks/useApi';
import { useCart } from './hooks/useCart';
import { ANIMATIONS, HOT_PRODUCT_MARKER } from './utils/constants';
import OrderingNowBanner from './components/Banners/OrderingNowBanner';
import Cart from './components/Cart/Cart';

function App() {
  const { settings, products, categories, discounts } = useApi();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    activateFreeDelivery,
    subtotal, 
    deliveryCost, 
    cartItemsCount,
    calculateDiscount
  } = useCart();

  const [activeCategory, setActiveCategory] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Загрузка шрифтов
  useEffect(() => {
    if (settings.font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.font]);

  // Свайп навигация
  const handleTouchStart = (e) => {
    if (categories.length === 0) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
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

    const touchEndX = e.changedTouches[0].client
