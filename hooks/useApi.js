import { useState, useEffect } from 'react';
import { API_URL } from '../utils/constants';

export const useApi = () => {
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (action, setter) => {
    try {
      const response = await fetch(`${API_URL}?action=${action}`);
      const data = await response.json();
      
      if (action === 'getDiscounts') {
        const processedDiscounts = data.map(d => ({
          minTotal: Number(d.minTotal),
          discountPercent: Number(d.discountPercent)
        }));
        setter(processedDiscounts);
      } else {
        setter(data);
      }
    } catch (error) {
      console.error(`Error fetching ${action}:`, error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchData('getSettings', setSettings),
        fetchData('getProducts', setProducts),
        fetchData('getCategories', setCategories),
        fetchData('getDiscounts', setDiscounts)
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    settings,
    products,
    categories,
    discounts,
    loading
  };
};
