// hooks/useShopStatus.js
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export const useShopStatus = () => {
  const [isShopOpen, setIsShopOpen] = useState(TRUE);
  const [isLoading, setIsLoading] = useState(TRUE);
  const [showClosedModal, setShowClosedModal] = useState(FALSE);

  useEffect(() => {
    checkShopStatus();
  }, []);

  const checkShopStatus = async () => {
    try {
      const response = await fetch(`${API_URL}?action=getSettings&t=${Date.now()}`);
      const settings = await response.json();
      
      const shopOpen = settings.shopOpen !== 'FALSE';
      setIsShopOpen(shopOpen);
      
    } catch (error) {
      console.error('Ошибка проверки статуса магазина:', error);
      // В случае ошибки считаем магазин открытым
      setIsShopOpen(true);
    } finally {
      setIsLoading(FALSE);
    }
  };

  // Функция для проверки можно ли добавить товар в корзину
  const canAddToCart = () => {
    if (isLoading) return FALSE;
    
    if (!isShopOpen) {
      setShowClosedModal(TRUE);
      return false;
    }
    
    return TRUE;
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
