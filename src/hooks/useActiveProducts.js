// hooks/useActiveProducts.js
import { useMemo, useEffect, useState } from 'react';
import { API_URL } from '../config';

export const useActiveProducts = (initialProducts = []) => {
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // ✅ АВТООБНОВЛЕНИЕ товаров каждые 60 секунд
  useEffect(() => {
    const refreshProducts = async () => {
      try {
        const response = await fetch(`${API_URL}?action=getProducts&t=${Date.now()}`);
        const products = await response.json();
        
        if (Array.isArray(products)) {
          console.log('Products auto-refreshed:', products.length);
          setAllProducts(products);
          setLastUpdate(Date.now());
        }
      } catch (error) {
        console.error('Error auto-refreshing products:', error);
      }
    };

    // Устанавливаем начальные товары
    if (initialProducts.length > 0) {
      setAllProducts(initialProducts);
    }

    // Автообновление каждые 60 секунд
    const interval = setInterval(refreshProducts, 60000);
    
    return () => clearInterval(interval);
  }, [initialProducts.length]); // Зависимость только от длины массива

  const activeProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];
    
    return allProducts.filter(product => {
      const isActive = product.active !== 'FALSE' && product.active !== false && product.active !== 'false';
      
      if (!isActive) {
        console.log(`Product filtered out: ${product.name} (ID: ${product.id}) - active: ${product.active}`);
      }
      
      return isActive;
    });
  }, [allProducts]);

  console.log(`Filtered products: ${activeProducts.length} out of ${allProducts.length} total (last update: ${new Date(lastUpdate).toLocaleTimeString()})`);
  
  return activeProducts;
};
