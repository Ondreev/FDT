// hooks/useShopStatus.js
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export const useShopStatus = () => {
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showClosedModal, setShowClosedModal] = useState(false);

  useEffect(() => {
    checkShopStatus();
    // Проверяем статус каждые 30 секунд
    const interval = setInterval(checkShopStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkShopStatus = async () => {
    try {
      const response = await fetch(`${API_URL}?action=getSettings&t=${Date.now()}`);
      const settings = await response.json();
      
      console.log('🏪 Raw shop status from API:', settings.shopOpen, typeof settings.shopOpen);
      
      // ✅ ИСПРАВЛЕННАЯ ЛОГИКА: Проверяем все возможные варианты "закрыто"
      const shopOpenValue = settings.shopOpen;
      const shopClosed = shopOpenValue === 'FALSE' || 
                        shopOpenValue === 'false' || 
                        shopOpenValue === false ||
                        shopOpenValue === 0 ||
                        shopOpenValue === '0';
      
      const shopOpen = !shopClosed;
      
      console.log('🏪 Calculated shop status - Open:', shopOpen, 'Closed:', shopClosed);
      
      // ✅ Если магазин только что закрылся и мы не в процессе загрузки
      if (isShopOpen && !shopOpen && !isLoading) {
        console.log('🚨 Shop just closed! Showing modal immediately');
        setShowClosedModal(true);
      }
      
      setIsShopOpen(shopOpen);
      
    } catch (error) {
      console.error('Ошибка проверки статуса магазина:', error);
      // В случае ошибки считаем магазин открытым, чтобы не блокировать работу
      setIsShopOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ИСПРАВЛЕННАЯ функция для проверки можно ли добавить товар в корзину
  const canAddToCart = () => {
    console.log('🔍 canAddToCart check:', { isLoading, isShopOpen });
    
    if (isLoading) {
      console.log('⏳ Cannot add to cart: still loading shop status');
      return false;
    }
    
    if (!isShopOpen) {
      console.log('🚫 Cannot add to cart: shop is closed, showing modal');
      setShowClosedModal(true);
      return false;
    }
    
    console.log('✅ Can add to cart: shop is open');
    return true;
  };

  const closeModal = () => {
    setShowClosedModal(false);
  };

  // ✅ Принудительная проверка статуса (для использования в критических моментах)
  const forceCheckShopStatus = async () => {
    await checkShopStatus();
    return isShopOpen;
  };

  return {
    isShopOpen,
    isLoading,
    showClosedModal,
    canAddToCart,
    closeModal,
    checkShopStatus,
    forceCheckShopStatus
  };
};
