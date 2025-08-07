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
      
      console.log('Shop status check:', settings.shopOpen, typeof settings.shopOpen);
      
      // ✅ ИСПРАВЛЕНО: Правильная проверка регистра
      const shopOpenValue = settings.shopOpen;
      const shopOpen = shopOpenValue !== 'FALSE' && shopOpenValue !== 'false' && shopOpenValue !== false;
      
      console.log('Shop is open:', shopOpen);
      
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
    if (isLoading) return false;
    
    if (!isShopOpen) {
      setShowClosedModal(true);
      return false;
    }
    
    return true;
  };

  const closeModal = () => {
    setShowClosedModal(false);
  };

  return {
    isShopOpen,
    isLoading,
    showClosedModal,
    canAddToCart,
    closeModal,
    checkShopStatus
  };
};
