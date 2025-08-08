// components/ShopManagementPanel.jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const ShopManagementPanel = ({ admin }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [shopStatus, setShopStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [isUpdatingProducts, setIsUpdatingProducts] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // ✅ НОВЫЕ СОСТОЯНИЯ для добавления товара
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductData, setNewProductData] = useState({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    weight: '',
    category: '',
    isPromo: false,
    rating: 5,
    active: true
  });

  // Загружаем данные при открытии попапа
  useEffect(() => {
    if (isPopupOpen) {
      loadShopData();
    }
  }, [isPopupOpen]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadShopData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем настройки, товары и категории
      const [settingsRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}?action=getSettings&t=${Date.now()}`),
        fetch(`${API_URL}?action=getProducts&t=${Date.now()}`),
        fetch(`${API_URL}?action=getCategories&t=${Date.now()}`)
      ]);

      const settings = await settingsRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      // Определяем статус ресторана
      const shopOpenValue = settings.shopOpen;
      const isOpen = shopOpenValue !== 'FALSE' && shopOpenValue !== 'false' && shopOpenValue !== false;
      setShopStatus(isOpen);

      // Обрабатываем товары
      if (Array.isArray(productsData)) {
        setProducts(productsData);
        
        // ✅ Устанавливаем рекомендуемый ID для нового товара
        const nextId = getNextRecommendedId(productsData);
        setNewProductData(prev => ({ ...prev, id: nextId.toString() }));
      }

      // ✅ Обрабатываем категории
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }

    } catch (error) {
      console.error('Ошибка загрузки данных ресторана:', error);
      showNotification('Ошибка загрузки данных', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateShopStatus = async (newStatus) => {
    try {
      setIsLoading(true);
      
      const statusValue = newStatus ? 'open' : 'closed';
      const response = await fetch(`${API_URL}?action=updateShopStatus&status=${statusValue}&admin=${admin.login}&t=${Date.now()}`);
      const result = await response.json();

      if (result.success) {
        setShopStatus(newStatus);
        showNotification(newStatus ? '✅ Ресторан открыт!' : '🔒 Ресторан закрыт!');
      } else {
        showNotification('Ошибка обновления статуса ресторана', 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductsStatus = async (status) => {
    if (selectedProducts.length === 0) {
      showNotification('Выберите товары для обновления', 'warning');
      return;
    }

    try {
      setIsUpdatingProducts(true);
      
      const productIds = selectedProducts.join(',');
      const response = await fetch(`${API_URL}?action=updateProductsStatus&productIds=${encodeURIComponent(productIds)}&status=${status}&admin=${admin.login}&t=${Date.now()}`);
      const result = await response.json();

      if (result.success) {
        showNotification(`✅ Обновлено товаров: ${result.updatedCount}`);
        setSelectedProducts([]);
        loadShopData(); // Перезагружаем данные
      } else {
        showNotification('Ошибка обновления товаров', 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления товаров:', error);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setIsUpdatingProducts(false);
    }
  };

  const getActiveProducts = () => {
    return products.filter(p => p.active !== 'FALSE' && p.active !== false && p.active !== 'false');
  };

  const getInactiveProducts = () => {
    return products.filter(p => p.active === 'FALSE' || p.active === false || p.active === 'false');
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = (productsList) => {
    const productIds = productsList.map(p => String(p.id));
    setSelectedProducts(productIds);
  };

  // ✅ ФУНКЦИЯ генерации следующего ID
  const getNextRecommendedId = (products) => {
    // Извлекаем только числовые ID
    const numericIds = products
      .map(p => String(p.id))
      .filter(id => /^\d+$/.test(id)) // только цифры
      .map(id => parseInt(id))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b);
    
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return maxId + 1;
  };

  // ✅ ФУНКЦИЯ создания товара
  const createProduct = async () => {
    // Валидация
    if (!newProductData.name.trim()) {
      showNotification('Введите название товара', 'warning');
      return;
    }
    if (!newProductData.price || parseFloat(newProductData.price) <= 0) {
      showNotification('Введите корректную цену', 'warning');
      return;
    }
    if (!newProductData.category) {
      showNotification('Выберите категорию', 'warning');
      return;
    }

    try {
      setIsCreatingProduct(true);
      
      const formData = new FormData();
      formData.append('action', 'createProduct');
      formData.append('id', newProductData.id);
      formData.append('name', newProductData.name.trim());
      formData.append('description', newProductData.description.trim());
      formData.append('imageUrl', newProductData.imageUrl.trim());
      formData.append('price', newProductData.price);
      formData.append('weight', newProductData.weight.trim());
      formData.append('category', newProductData.category);
      formData.append('isPromo', newProductData.isPromo.toString());
      formData.append('rating', newProductData.rating.toString());
      formData.append('active', newProductData.active.toString());
      formData.append('admin', admin.login);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();

      if (result.success) {
        showNotification(result.message || 'Товар успешно создан!');
        setShowAddProductModal(false);
        
        // Сбрасываем форму и обновляем данные
        const nextId = getNextRecommendedId([...products, { id: newProductData.id }]);
        setNewProductData({
          id: nextId.toString(),
          name: '',
          description: '',
          imageUrl: '',
          price: '',
          weight: '',
          category: '',
          isPromo: false,
          rating: 5,
          active: true
        });
        
        loadShopData(); // Перезагружаем данные
      } else {
        showNotification(result.error || 'Ошибка создания товара', 'error');
      }
    } catch (error) {
      console.error('Ошибка создания товара:', error);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Компонент уведомлений
  const NotificationToast = () => {
    if (!notification) return null;

    const bgColor = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800'
    }[notification.type];

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 15000,
        background: bgColor,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        animation: 'slideInFromRight 0.3s ease-out',
        maxWidth: '300px'
      }}>
        <style>
          {`
            @keyframes slideInFromRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}
        </style>
        {notification.message}
      </div>
    );
  };

  // Компонент модального окна управления товарами
  const ProductsManagementModal = () => {
    if (!showProductsModal) return null;

    const activeProducts = getActiveProducts();
    const inactiveProducts = getInactiveProducts();

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Заголовок */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8f9fa'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#2c1e0f'
            }}>
              📦 Управление товарами
            </h3>
            <button
              onClick={() => {
                setShowProductsModal(false);
                setSelectedProducts([]);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0.5rem',
                borderRadius: '50%'
              }}
            >
              ✕
            </button>
          </div>

          {/* 3 кнопки в ряд */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => updateProductsStatus('inactive')}
              disabled={selectedProducts.length === 0 || isUpdatingProducts}
              style={{
                padding: '0.75rem 0.5rem',
                background: selectedProducts.length === 0 ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth <= 400 ? '0.7rem' : '0.8rem',
                fontWeight: 'bold',
                cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              🛑 СТОП
            </button>
            
            <button
              onClick={() => updateProductsStatus('active')}
              disabled={selectedProducts.length === 0 || isUpdatingProducts}
              style={{
                padding: '0.75rem 0.5rem',
                background: selectedProducts.length === 0 ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth <= 400 ? '0.7rem' : '0.8rem',
                fontWeight: 'bold',
                cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              ✅ АКТИВ
            </button>

            <button
              onClick={() => setSelectedProducts([])}
              style={{
                padding: '0.75rem 0.5rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth <= 400 ? '0.7rem' : '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              🗑️ ОЧИСТИТЬ
            </button>
          </div>

          {/* Статистика */}
          <div style={{
            padding: '1rem 1.5rem',
            background: '#f8f9fa',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {activeProducts.length}
              </div>
              <div style={{ color: '#666', fontSize: '0.8rem' }}>Активных</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {inactiveProducts.length}
              </div>
              <div style={{ color: '#666', fontSize: '0.8rem' }}>Отключенных</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#2196f3', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {selectedProducts.length}
              </div>
              <div style={{ color: '#666', fontSize: '0.8rem' }}>Выбрано</div>
            </div>
          </div>

          {/* Список товаров с исправленной прокруткой */}
          <div 
            style={{
              flex: 1,
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: 0,
              margin: 0
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                Товары не найдены
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 'min-content'
              }}>
                {products.map(product => {
                  const isActive = product.active !== 'FALSE' && product.active !== false && product.active !== 'false';
                  const isSelected = selectedProducts.includes(String(product.id));
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProductSelection(String(product.id))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.5rem',
                        background: isSelected ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        borderLeft: isSelected ? '4px solid #2196f3' : '4px solid transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        minHeight: '70px',
                        userSelect: 'none'
                      }}
                    >
                      {/* Картинка товара */}
                      <img
                        src={product.imageUrl || '/placeholder-food.jpg'}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '2px solid #e0e0e0',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEMyNyAyMCAyOSAyMiAyOSAyNEMyOSAyNiAyNyAyOCAyNSAyOEMyMyAyOCAyMSAyNiAyMSAyNEMyMSAyMiAyMyAyMCAyNSAyMFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+';
                        }}
                      />
                      
                      {/* Чекбокс */}
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isSelected ? '#2196f3' : 'white',
                        border: '2px solid #2196f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {isSelected ? '✓' : ''}
                      </div>
                      
                      {/* Информация о товаре */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          color: '#2c1e0f',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>ID: {product.id}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 'bold' }}>{product.price}₽</span>
                        </div>
                      </div>
                      
                      {/* Статус товара */}
                      <div style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        background: isActive ? '#e8f5e8' : '#ffebee',
                        color: isActive ? '#2e7d32' : '#c62828',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {isActive ? 'АКТИВЕН' : 'СТОП'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ КОМПОНЕНТ модального окна добавления товара
  const AddProductModal = () => {
    if (!showAddProductModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Заголовок */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8f9fa'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#2c1e0f'
            }}>
              ➕ Добавить товар
            </h3>
            <button
              onClick={() => setShowAddProductModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0.5rem',
                borderRadius: '50%'
              }}
            >
              ✕
            </button>
          </div>

          {/* Форма */}
          <div 
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* ID товара */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem' 
                }}>
                  ID товара *
                </label>
                <input
                  type="text"
                  value={newProductData.id}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, id: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="132 (можно добавить буквы: 132S)"
                />
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  Рекомендуется: {getNextRecommendedId(products)}. Можно добавить буквы для спец. товаров
                </div>
              </div>

              {/* Название */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem' 
                }}>
                  Название * (будет в ВЕРХНЕМ РЕГИСТРЕ)
                </label>
                <input
                  type="text"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Введите название товара"
                />
              </div>

              {/* Описание */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem' 
                }}>
                  Описание
                </label>
                <textarea
                  value={newProductData.description}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Описание товара"
                />
              </div>

              {/* Цена и Вес в одну строку */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem' 
                  }}>
                    Цена * (₽)
                  </label>
                  <input
                    type="number"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData(prev => ({ ...prev, price: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="350"
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem' 
                  }}>
                    Вес
                  </label>
                  <input
                    type="text"
                    value={newProductData.weight}
                    onChange={(e) => setNewProductData(prev => ({ ...prev, weight: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="130 г"
                  />
                </div>
              </div>

              {/* Категория */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem' 
                }}>
                  Категория *
                </label>
                <select
                  value={newProductData.category}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL изображения */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem' 
                }}>
                  URL изображения
                </label>
                <input
                  type="url"
                  value={newProductData.imageUrl}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://..."
                />
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  💡 Рекомендуется изображение до 150 КБ для быстрой загрузки
                </div>
                {/* Предпросмотр изображения */}
                {newProductData.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={newProductData.imageUrl}
                      alt="Предпросмотр"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '2px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Кнопка создания */}
              <button
                onClick={createProduct}
                disabled={isCreatingProduct}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: isCreatingProduct ? '#ccc' : 'linear-gradient(135deg, #4caf50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: isCreatingProduct ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}
              >
                {isCreatingProduct ? '⏳ Создание...' : '✅ Создать товар'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ✅ ИКОНКА УПРАВЛЕНИЯ рядом с именем админа */}
      <button
        onClick={() => setIsPopupOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '6px',
          fontSize: '1rem',
          color: '#667eea',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(102, 126, 234, 0.1)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'none';
          e.target.style.transform = 'scale(1)';
        }}
        title="Управление рестораном"
      >
        ⚙️
      </button>

      {/* Попап панель управления */}
      {isPopupOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Кнопка закрытия */}
            <button
              onClick={() => setIsPopupOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                color: '#666',
                fontSize: '1.5rem',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Заголовок */}
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#2c1e0f',
              marginBottom: '0.5rem',
              textAlign: 'left'
            }}>
              Управление рестораном
            </h2>

            {/* Статус */}
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Статус:
              <span style={{
                background: shopStatus ? '#e8f5e8' : '#ffebee',
                color: shopStatus ? '#2e7d32' : '#c62828',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {shopStatus ? 'ОТКРЫТ' : 'ЗАКРЫТ'}
              </span>
            </div>

            {isLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                Загрузка данных...
              </div>
            ) : (
              <>
                {/* Кнопки открыть/закрыть */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <button
                    onClick={() => updateShopStatus(true)}
                    disabled={shopStatus === true}
                    style={{
                      padding: '0.75rem',
                      background: shopStatus === true ? '#ccc' : '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: shopStatus === true ? 'not-allowed' : 'pointer'
                    }}
                  >
                    🟢 Открыть
                  </button>
                  
                  <button
                    onClick={() => updateShopStatus(false)}
                    disabled={shopStatus === false}
                    style={{
                      padding: '0.75rem',
                      background: shopStatus === false ? '#ccc' : '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: shopStatus === false ? 'not-allowed' : 'pointer'
                    }}
                  >
                    🔴 Закрыть
                  </button>
                </div>

                {/* Статистика товаров */}
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ 
                        color: '#4caf50', 
                        fontWeight: 'bold', 
                        fontSize: '1.5rem' 
                      }}>
                        {getActiveProducts().length}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>
                        Активных
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        color: '#f44336', 
                        fontWeight: 'bold', 
                        fontSize: '1.5rem' 
                      }}>
                        {getInactiveProducts().length}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>
                        Отключенных
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        color: '#2196f3', 
                        fontWeight: 'bold', 
                        fontSize: '1.5rem' 
                      }}>
                        {products.length}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>
                        Всего
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProductsModal(true)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    📦 Управление товарами
                  </button>

                  {/* Кнопка добавления товара */}
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    ➕ Добавить товар
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно управления товарами */}
      <ProductsManagementModal />

      {/* Модальное окно добавления товара */}
      <AddProductModal />

      {/* Стильные уведомления */}
      <NotificationToast />
    </>
  );
};

export default ShopManagementPanel;
