// components/FlashItemManager.jsx
import { useEffect } from 'react';

// ✅ ДОБАВЛЯЕМ ФУНКЦИЮ ПОЛУЧЕНИЯ ЗОНЫ
const getZoneInfo = () => {
  try {
    const zoneInfo = localStorage.getItem('deliveryZoneInfo');
    return zoneInfo ? JSON.parse(zoneInfo) : { freeFrom: 3000 };
  } catch (e) {
    return { freeFrom: 3000 };
  }
};

// Компонент для управления flash-товарами в корзине
const FlashItemManager = ({ cart, setCart, products, subtotal }) => {
  useEffect(() => {
    // ✅ ПОЛУЧАЕМ ДИНАМИЧЕСКИЙ ПОРОГ БЕСПЛАТНОЙ ДОСТАВКИ
    const freeDeliveryThreshold = getZoneInfo().freeFrom;
    
    // Находим товар с R2000 в ID (это будет "6R2000") 
    const specialProduct = products.find(p => String(p.id).includes('R2000'));
    if (!specialProduct) return;

    // Ищем flash-товар в корзине (с суффиксом _flash)
    const flashItem = cart.find(item => item.id === `${specialProduct.id}_flash`);
    if (!flashItem) return;
    
    // ✅ ИСКЛЮЧАЕМ СЕТЫ ИЗ РАСЧЕТА FLASH-ТОВАРОВ
    const otherItemsSubtotal = cart
      .filter(item => item.id !== flashItem.id && !item.isDelivery && !String(item.id).includes('S'))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // ✅ ИСПОЛЬЗУЕМ ДИНАМИЧЕСКИЙ ПОРОГ ВМЕСТО ЗАХАРДКОЖЕННОГО 2000
    const conditionMet = otherItemsSubtotal >= freeDeliveryThreshold;
    
    // Определяем правильную цену и состояние
    const discountedPrice = Math.round(specialProduct.price * 0.01);
    const correctPrice = conditionMet ? discountedPrice : specialProduct.price;
    const shouldBeDiscounted = conditionMet;
    const shouldViolateCondition = !conditionMet;
    
    // Обновляем только если что-то изменилось
    if (flashItem.price !== correctPrice || 
        flashItem.isDiscounted !== shouldBeDiscounted || 
        flashItem.violatesCondition !== shouldViolateCondition) {
      
      setCart(prev => prev.map(item => 
        item.id === flashItem.id 
          ? { 
              ...item, 
              price: correctPrice,
              isDiscounted: shouldBeDiscounted,
              violatesCondition: shouldViolateCondition
            }
          : item
      ));
    }
  }, [cart, products, subtotal, setCart]);

  return null; // Этот компонент ничего не рендерит
};

export default FlashItemManager;
