// hooks/useDeliveryMode.js
import { useState, useEffect } from 'react';

export const useDeliveryMode = () => {
  // ✅ Основное состояние
  const [state, setState] = useState({
    mode: null, // 'delivery' | 'pickup' | null
    savedAddress: '',
    isFirstVisit: true,
    showOverlay: false,
    needsAddressInput: false,
    isAddressConfirmed: false
  });

  // ✅ Загрузка из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem('deliveryData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          mode: data.mode || null,
          savedAddress: data.address || '',
          isFirstVisit: false,
          isAddressConfirmed: data.mode === 'pickup' || !!data.address
        }));
      } catch (error) {
        console.error('Error loading delivery data:', error);
      }
    }

    // ✅ Показываем оверлей если это первый визит или нет сохраненных данных
    const shouldShowOverlay = !saved || !JSON.parse(saved || '{}').mode;
    setState(prev => ({ ...prev, showOverlay: shouldShowOverlay }));
  }, []);

  // ✅ Сохранение в localStorage при изменениях
  useEffect(() => {
    if (state.mode !== null) {
      const dataToSave = {
        mode: state.mode,
        address: state.savedAddress,
        timestamp: Date.now()
      };
      localStorage.setItem('deliveryData', JSON.stringify(dataToSave));
    }
  }, [state.mode, state.savedAddress]);

  // ✅ Функция установки режима доставки
  const setDeliveryMode = (mode) => {
    setState(prev => {
      const newState = { ...prev, mode };
      
      if (mode === 'pickup') {
        // Самовывоз - адрес не нужен
        newState.needsAddressInput = false;
        newState.isAddressConfirmed = true;
        newState.showOverlay = false;
      } else if (mode === 'delivery') {
        // Доставка - проверяем есть ли адрес
        if (!prev.savedAddress) {
          newState.needsAddressInput = true;
          newState.isAddressConfirmed = false;
        } else {
          newState.isAddressConfirmed = true;
          newState.showOverlay = false;
        }
      }
      
      return newState;
    });
  };

  // ✅ Функция установки адреса
  const setAddress = (address) => {
    console.log('Setting address:', address); // Для отладки
    setState(prev => ({
      ...prev,
      savedAddress: address,
      needsAddressInput: false,
      isAddressConfirmed: true,
      showOverlay: false
    }));
  };

  // ✅ Функция закрытия оверлея (отказ от ввода)
  const closeOverlay = () => {
    setState(prev => ({
      ...prev,
      showOverlay: false,
      needsAddressInput: false // ✅ Закрываем ввод адреса
    }));
  };

  // ✅ Функция открытия ввода адреса
  const openAddressInput = () => {
    console.log('Opening address input'); // Для отладки
    setState(prev => ({
      ...prev,
      needsAddressInput: true,
      showOverlay: false
    }));
  };

  // ✅ Проверка нужно ли показывать мигание
  const shouldShowWarning = () => {
    return !state.isAddressConfirmed && !state.showOverlay;
  };

  return {
    // Состояние
    deliveryMode: state.mode,
    savedAddress: state.savedAddress,
    showOverlay: state.showOverlay,
    needsAddressInput: state.needsAddressInput,
    isAddressConfirmed: state.isAddressConfirmed,
    isFirstVisit: state.isFirstVisit,
    
    // Функции
    setDeliveryMode,
    setAddress,
    closeOverlay,
    openAddressInput,
    shouldShowWarning,
    
    // Вычисляемые значения
    canProceedToOrder: state.isAddressConfirmed,
    displayAddress: state.savedAddress,
    isDeliveryMode: state.mode === 'delivery',
    isPickupMode: state.mode === 'pickup'
  };
};
