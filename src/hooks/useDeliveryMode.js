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
    console.log('Loading from localStorage:', saved); // Для отладки
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('Parsed data:', data); // Для отладки
        setState(prev => ({
          ...prev,
          mode: data.mode || null,
          savedAddress: data.address || '',
          isFirstVisit: false,
          isAddressConfirmed: data.mode === 'pickup' || (data.mode === 'delivery' && !!data.address),
          showOverlay: false // Не показываем оверлей если данные есть
        }));
      } catch (error) {
        console.error('Error loading delivery data:', error);
      }
    } else {
      // Если нет сохраненных данных, показываем оверлей
      setState(prev => ({ ...prev, showOverlay: true }));
    }
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
    setState(prev => {
      const newState = {
        ...prev,
        savedAddress: address,
        needsAddressInput: false, // ✅ Закрываем ввод адреса
        isAddressConfirmed: true,
        showOverlay: false
      };
      console.log('New state after setAddress:', newState); // Для отладки
      return newState;
    });
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
    // Показываем предупреждение если:
    // 1. Режим не выбран вообще
    // 2. Выбрана доставка, но нет адреса
    const result = (!state.mode) || (state.mode === 'delivery' && !state.savedAddress);
    console.log('shouldShowWarning:', result, 'mode:', state.mode, 'address:', state.savedAddress); // Для отладки
    return result;
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
