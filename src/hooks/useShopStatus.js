// hooks/useShopStatus.js
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export const useShopStatus = () => {
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showClosedModal, setShowClosedModal] = useState(false);

  useEffect(() => {
    checkShopStatus();
    // ✅ УМЕНЬШИЛ интервал проверки до 10 секунд для быстрого реагирования
    const interval = setInterval(checkShopStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkShopStatus = async () => {
    try {
      const response = await fetch(`${API_URL}?action=getSettings&t=${Date.now()}`);
      const settings = await response.json();
      
      console.log('🏪 Shop status check:', settings.shopOpen, typeof settings.shopOpen);
      
      // ✅ ИСПРАВЛЕНО: Правильная проверка регистра
      const shopOpenValue = settings.shopOpen;
      const shopOpen = shopOpenValue !== 'FALSE' && shopOpenValue !== 'false' && shopOpenValue !== false;
      
      console.log('🏪 Shop is open:', shopOpen);
      
      // ✅ ДОБАВЛЕНО: Если магазин только что закрылся, сразу показываем уведомление
      if (isShopOpen && !shopOpen && !isLoading) {
        console.log('🚨 Shop just closed! Showing modal immediately');
        setShowClosedModal(true);
      }
      
      setIsShopOpen(shopOpen);
      
    } catch (error) {
      console.error('Ошибка проверки статуса магазина:', error);
      // В случае ошибки считаем магазин открытым
      setIsShopOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для проверки можно ли добавить товар в корзину
  const canAddToCart = () => {
    if (isLoading) {
      console.log('⏳ Cannot add to cart: still loading shop status');
      return false;
    }
    
    if (!isShopOpen) {
      console.log('🚫 Cannot add to cart: shop is closed');
      setShowClosedModal(true);
      return false;
    }
    
    console.log('✅ Can add to cart: shop is open');
    return true;
  };

  const closeModal = () => {
    setShowClosedModal(false);
  };

  // ✅ ПРИНУДИТЕЛЬНОЕ закрытие магазина (для использования в addToCart)
  const forceCloseShop = () => {
    console.log('🔒 Forcing shop to close');
    setIsShopOpen(false);
    setShowClosedModal(true);
  };

  return {
    isShopOpen,
    isLoading,
    showClosedModal,
    canAddToCart,
    closeModal,
    checkShopStatus, // Для принудительной проверки
    setIsShopOpen,   // ✅ Экспортируем для внешнего использования
    setShowClosedModal, // ✅ Экспортируем для внешнего использования
    forceCloseShop   // ✅ Удобная функция для закрытия
  };
};
