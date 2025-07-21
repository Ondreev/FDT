import { useState, useEffect } from 'react';
import { DELIVERY_COST, DELIVERY_THRESHOLD } from '../utils/constants';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  // Автоматически управляем доставкой
  useEffect(() => {
    const hasProducts = cart.some(item => !item.isDelivery);
    const hasDelivery = cart.some(item => item.isDelivery);
    
    if (hasProducts && !hasDelivery) {
      // Добавляем платную доставку по умолчанию
      const deliveryItem = {
        id: 'delivery',
        name: 'Доставка',
        price: DELIVERY_COST,
        quantity: 1,
        isDelivery: true,
        imageUrl: '🚚'
      };
      setCart(prev => [...prev, deliveryItem]);
    } else if (!hasProducts && hasDelivery) {
      // Убираем доставку если нет товаров
      setCart(prev => prev.filter(item => !item.isDelivery));
    }
  }, [cart]);

  // ЗАЩИТА: Автоматически убираем flash-товары при снижении суммы
  useEffect(() => {
    const regularSubtotal = cart
      .filter(item => !item.isDelivery && !item.isFlashOffer)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const hasFlashItems = cart.some(item => item.isFlashOffer);
    
    // Если сумма обычных товаров упала ниже порога, убираем все flash-товары
    if (regularSubtotal < DELIVERY_THRESHOLD && hasFlashItems) {
      setCart(prev => prev.filter(item => !item.isFlashOffer));
      
      // Показываем уведомление пользователю
      console.warn('Flash-товары удалены: сумма обычных товаров ниже порога');
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const activateFreeDelivery = () => {
    // Убираем платную доставку
    setCart(prev => prev.filter(item => item.id !== 'delivery'));
    
    // Добавляем бесплатную доставку
    const freeDeliveryItem = {
      id: 'free_delivery',
      name: 'Доставка (бесплатно)',
      price: 0,
      originalPrice: DELIVERY_COST,
      quantity: 1,
      isDelivery: true,
      isFreeDelivery: true,
      imageUrl: '🚚'
    };
    addToCart(freeDeliveryItem);
  };

  // Расчёты
  const subtotal = cart
    .filter(item => !item.isDelivery)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Сумма только обычных товаров (без flash-предложений)
  const regularSubtotal = cart
    .filter(item => !item.isDelivery && !item.isFlashOffer)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const deliveryItem = cart.find(item => item.isDelivery);
  const deliveryCost = deliveryItem ? deliveryItem.price : 0;
  
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const calculateDiscount = (discounts) => {
    // Скидки применяются только к обычным товарам
    const currentDiscount = discounts
      .filter(d => d.minTotal <= regularSubtotal)
      .sort((a, b) => b.minTotal - a.minTotal)[0];
    
    return currentDiscount ? Math.round(regularSubtotal * currentDiscount.discountPercent / 100) : 0;
  };

  // ЗАЩИТА: Проверка возможности оформления заказа
  const canPlaceOrder = () => {
    const hasFlashItems = cart.some(item => item.isFlashOffer);
    const hasRegularItems = cart.some(item => !item.isDelivery && !item.isFlashOffer);
    
    // Если есть flash-товары, должны быть и обычные товары на минимальную сумму
    if (hasFlashItems && regularSubtotal < DELIVERY_THRESHOLD) {
      return {
        canOrder: false,
        reason: `Для заказа товаров со скидкой необходимо добавить обычных товаров на сумму от ${DELIVERY_THRESHOLD}₽`
      };
    }
    
    // Должен быть хотя бы один товар (не считая доставку)
    if (!hasRegularItems && !hasFlashItems) {
      return {
        canOrder: false,
        reason: 'Добавьте товары в корзину'
      };
    }
    
    return {
      canOrder: true,
      reason: null
    };
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    activateFreeDelivery,
    subtotal,
    regularSubtotal,
    deliveryCost,
    cartItemsCount,
    calculateDiscount,
    canPlaceOrder
  };
};
