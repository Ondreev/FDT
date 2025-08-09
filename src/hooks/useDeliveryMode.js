// hooks/useDeliveryMode.js
import { useState, useEffect } from 'react';

export const useDeliveryMode = () => {
  // ✅ Основное состояние
  const [state, setState] = useState({
    mode: null, // 'delivery' | 'pickup' | null
    savedAddress: '',
    needsSelection: true, // ✅ Заменяем showOverlay на needsSelection
    needsAddressInput: false,
    isAddressConfirmed: false
  });

  // ✅ Загрузка из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem('deliveryData');
    console.log('Loading from localStorage:', saved);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('Parsed data:', data);
        setState(prev => ({
          ...prev,
          mode: data.mode || null,
          savedAddress: data.address || '',
          needsSelection: !data.mode || (data.mode === 'delivery' && !data.address), // ✅ Нужен выбор если нет режима или нет адреса для доставки
          isAddressConfirmed: data.mode === 'pickup' || (data.mode === 'delivery' && !!data.address)
        }));
      } catch (error) {
        console.error('Error loading delivery data:', error);
      }
    } else {
      // Если нет сохраненных данных, нужен выбор
      setState(prev => ({ ...prev, needsSelection: true }));
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
      console.log('Saved to localStorage:', dataToSave);
    }
  }, [state.mode, state.savedAddress]);

  // ✅ Функция установки режима доставки
  const setDeliveryMode = (mode) => {
    console.log('Setting delivery mode:', mode);
    setState(prev => {
      const newState = { ...prev, mode };
      
      if (mode === 'pickup') {
        // Самовывоз - адрес не нужен, выбор завершен
        newState.needsAddressInput = false;
        newState.isAddressConfirmed = true;
        newState.needsSelection = false;
      } else if (mode === 'delivery') {
        // Доставка - проверяем есть ли адрес
        if (prev.savedAddress) {
          newState.isAddressConfirmed = true;
          newState.needsSelection = false; // ✅ Есть адрес, выбор завершен
        } else {
          newState.needsAddressInput = true;
          newState.isAddressConfirmed = false;
          // needsSelection остается true пока не введут адрес
        }
      }
      
      console.log('New state:', newState);
      return newState;
    });
  };

  // ✅ Функция установки адреса
  const setAddress = (address) => {
    console.log('Setting address:', address);
    setState(prev => {
      const newState = {
        ...prev,
        savedAddress: address,
        needsAddressInput: false,
        isAddressConfirmed: true,
        needsSelection: false // ✅ Адрес установлен, выбор завершен
      };
      console.log('New state after setAddress:', newState);
      return newState;
    });
  };

  // ✅ Функция закрытия выбора (клик вне области)
  const closeSelection = () => {
    setState(prev => ({
      ...prev,
      needsSelection: false,
      needsAddressInput: false
    }));
  };

  // ✅ Функция открытия ввода адреса
  const openAddressInput = () => {
    console.log('Opening address input');
    setState(prev => ({
      ...prev,
      needsAddressInput: true
    }));
  };

  // ✅ Проверка нужно ли показывать мигание
  const shouldShowWarning = () => {
    const result = (!state.mode) || (state.mode === 'delivery' && !state.savedAddress);
    return result && !state.needsSelection; // Не показываем предупреждение во время выбора
  };

  return {
    // Состояние
    deliveryMode: state.mode,
    savedAddress: state.savedAddress,
    needsSelection: state.needsSelection, // ✅ Новое свойство
    needsAddressInput: state.needsAddressInput,
    isAddressConfirmed: state.isAddressConfirmed,
    
    // Функции
    setDeliveryMode,
    setAddress,
    closeSelection, // ✅ Новая функция
    openAddressInput,
    shouldShowWarning,
    
    // Вычисляемые значения
    canProceedToOrder: state.isAddressConfirmed,
    displayAddress: state.savedAddress,
    isDeliveryMode: state.mode === 'delivery',
    isPickupMode: state.mode === 'pickup'
  };
};
