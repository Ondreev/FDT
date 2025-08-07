// productUtils.js - Утилиты для работы с товарами и их ID префиксами
// Основано на реальной логике проекта

/**
 * Конфигурация префиксов ID товаров
 */
export const PRODUCT_ID_PREFIXES = {
  // Условия в ID
  H: { type: 'condition', label: 'Острое', color: '#e03636', emoji: '🌶️' },
  Z: { type: 'condition', label: 'Запеченный', color: '#ff7f32', emoji: '🔥' },
  T: { type: 'condition', label: 'Теплый', color: '#8bc34a', emoji: '🔥' },
  R2000: { type: 'flash', label: 'FLASH блюдо скидка 99%', color: '#ff0000', emoji: '⚡' },
  X: { type: 'promo', label: 'Блюдо участвует в 1+1=3', color: '#9c27b0', emoji: '🎁' },
  S: { type: 'set', label: 'СЕТ - товар не участвует в условиях скидок и флеш', color: '#607d8b', emoji: '📦' },
  C: { type: 'chef', label: 'Шеф рекомендует', color: '#FFD700', emoji: '👑' },
  W: { type: 'recommend', label: 'Рекомендует к заказу', color: '#4caf50', emoji: '⭐' },

  // Построение КОМБО
  Q: { type: 'combo', label: 'Закуски', category: 'appetizers', emoji: '🥗' },
  Y: { type: 'combo', label: 'Соусы', category: 'sauces', emoji: '🥫' },
  D: { type: 'combo', label: 'Напитки', category: 'drinks', emoji: '🥤' }
};

/**
 * Проверить содержит ли ID товара определенный префикс
 */
export function hasProductPrefix(productId, prefix) {
  return String(productId).includes(prefix);
}

/**
 * Получить все префиксы товара
 */
export function getProductPrefixes(productId) {
  const id = String(productId);
  const prefixes = [];
  
  for (const [prefix, config] of Object.entries(PRODUCT_ID_PREFIXES)) {
    if (id.includes(prefix)) {
      prefixes.push({ prefix, ...config });
    }
  }
  
  return prefixes;
}

/**
 * Проверить является ли товар основным блюдом (для upsell)
 */
export function isMainDish(product) {
  const productId = String(product.id);
  return !productId.includes('Q') && 
         !productId.includes('Y') && 
         !productId.includes('D') && 
         !productId.includes('S') && 
         !productId.includes('R2000') && 
         !product.isFlashOffer && 
         !product.isDelivery;
}

/**
 * Проверить является ли товар флеш-предложением
 */
export function isFlashProduct(product) {
  return hasProductPrefix(product.id, 'R2000');
}

/**
 * Проверить является ли товар сетом
 */
export function isSetProduct(product) {
  return hasProductPrefix(product.id, 'S');
}

/**
 * Проверить рекомендует ли шеф товар
 */
export function isChefRecommended(product) {
  return hasProductPrefix(product.id, 'C');
}

/**
 * Проверить рекомендуется ли товар к заказу
 */
export function isRecommendedToOrder(product) {
  return hasProductPrefix(product.id, 'W');
}

/**
 * Проверить участвует ли товар в акции 1+1=3
 */
export function isPromoProduct(product) {
  return hasProductPrefix(product.id, 'X');
}

/**
 * Получить товары по типу комбо
 */
export function getComboProducts(products, comboType) {
  const comboLetters = {
    appetizers: 'Q',
    sauces: 'Y', 
    drinks: 'D'
  };
  
  const letter = comboLetters[comboType];
  if (!letter) return [];
  
  return products.filter(product => hasProductPrefix(product.id, letter));
}

/**
 * Фильтровать товары исключая сеты (для расчета скидок)
 */
export function filterNonSetProducts(cartItems) {
  return cartItems.filter(item => 
    !item.isDelivery && 
    !hasProductPrefix(item.id, 'S')
  );
}

/**
 * Получить стили для товара на основе его префиксов
 */
export function getProductCardStyles(product) {
  const styles = {
    container: {},
    badges: []
  };

  // Стили для товаров шефа
  if (isChefRecommended(product)) {
    styles.container = {
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
      border: '3px solid #FFD700',
      animation: 'chefGlow 2s infinite'
    };
  }

  // Создаем бейджи для каждого префикса
  const prefixes = getProductPrefixes(product.id);
  let topOffset = 2.2; // rem

  prefixes.forEach(({ prefix, label, color }) => {
    if (prefix !== 'C') { // Корона отображается отдельно
      styles.badges.push({
        label,
        color,
        backgroundColor: color,
        top: `${topOffset}rem`,
        right: '1rem'
      });
      topOffset += 1.3; // Смещение для следующего бейджа
    }
  });

  return styles;
}

/**
 * Получить позицию для размещения бейджей (избегаем наложения)
 */
export function getBadgePosition(product, badgeIndex = 0) {
  const baseTop = 2.2;
  let offset = 0;

  // Учитываем другие бейджи
  const prefixes = getProductPrefixes(product.id);
  const visibleBadges = prefixes.filter(p => p.prefix !== 'C').length;
  
  if (badgeIndex > 0) {
    offset = badgeIndex * 1.3;
  }

  return `${baseTop + offset}rem`;
}

/**
 * Проверить должен ли товар участвовать в расчете скидок
 */
export function canParticipateInDiscounts(product) {
  return !isSetProduct(product) && !isFlashProduct(product);
}

/**
 * Получить flash товар из списка
 */
export function getFlashProduct(products) {
  return products.find(p => isFlashProduct(p));
}

/**
 * Получить товары для показа в peeking popup (с префиксом W)
 */
export function getRecommendedProducts(products) {
  return products.filter(product => isRecommendedToOrder(product));
}

/**
 * Создать flash версию товара для корзины
 */
export function createFlashCartItem(product) {
  return {
    id: `${product.id}_flash`,
    name: `${product.name} (FLASH 99% скидка)`,
    price: Math.round(product.price * 0.01), // 99% скидка
    originalPrice: product.price,
    quantity: 1,
    isFlashOffer: true,
    image: product.image,
    flashDiscount: 99
  };
}

/**
 * Получить конфигурацию для upsell шагов
 */
export function getUpsellSteps() {
  return [
    { 
      title: 'Добавить закуски?', 
      categoryLetter: 'Q',
      type: 'appetizers',
      emoji: '🥗'
    },
    { 
      title: 'Выберите соусы', 
      categoryLetter: 'Y',
      type: 'sauces', 
      emoji: '🥫'
    },
    { 
      title: 'Добавить напитки?', 
      categoryLetter: 'D',
      type: 'drinks',
      emoji: '🥤'
    }
  ];
}

/**
 * Отладочная функция - показать все префиксы товара
 */
export function debugProductPrefixes(product) {
  const prefixes = getProductPrefixes(product.id);
  console.log(`Товар ${product.name} (ID: ${product.id}):`, {
    prefixes,
    isMainDish: isMainDish(product),
    isFlash: isFlashProduct(product),
    isSet: isSetProduct(product),
    isChef: isChefRecommended(product),
    canDiscount: canParticipateInDiscounts(product)
  });
}

export default {
  PRODUCT_ID_PREFIXES,
  hasProductPrefix,
  getProductPrefixes,
  isMainDish,
  isFlashProduct,
  isSetProduct,
  isChefRecommended,
  isRecommendedToOrder,
  isPromoProduct,
  getComboProducts,
  filterNonSetProducts,
  getProductCardStyles,
  getBadgePosition,
  canParticipateInDiscounts,
  getFlashProduct,
  getRecommendedProducts,
  createFlashCartItem,
  getUpsellSteps,
  debugProductPrefixes
};