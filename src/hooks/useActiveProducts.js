// hooks/useActiveProducts.js
import { useMemo } from 'react';

export const useActiveProducts = (products) => {
  const activeProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
      const isActive = product.active !== 'FALSE' && product.active !== false && product.active !== 'false';
      
      if (!isActive) {
        console.log(`Product filtered out: ${product.name} (ID: ${product.id}) - active: ${product.active}`);
      }
      
      return isActive;
    });
  }, [products]);

  console.log(`Filtered products: ${activeProducts.length} out of ${products.length} total`);
  
  return activeProducts;
};
