// components/AddProductModal.jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AddProductModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  products, 
  categories, 
  admin 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [productData, setProductData] = useState({
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

  // ✅ ФУНКЦИЯ генерации следующего ID
  const getNextRecommendedId = (products) => {
    const numericIds = products
      .map(p => String(p.id))
      .filter(id => /^\d+$/.test(id)) // только цифры
      .map(id => parseInt(id))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b);
    
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return maxId + 1;
  };

  // Устанавливаем рекомендуемый ID при открытии модального окна
  useEffect(() => {
    if (isOpen && products.length > 0) {
      const nextId = getNextRecommendedId(products);
      setProductData(prev => ({ ...prev, id: nextId.toString() }));
    }
  }, [isOpen, products]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      showNotification('Введите название товара', 'warning');
      return false;
    }
    if (!productData.price || parseFloat(productData.price) <= 0) {
      showNotification('Введите корректную цену', 'warning');
      return false;
    }
    if (!productData.category) {
      showNotification('Выберите категорию', 'warning');
      return false;
    }
    // Проверка уникальности ID
    if (products.some(p => String(p.id) === String(productData.id))) {
      showNotification('Товар с таким ID уже существует', 'warning');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsCreating(true);
      
      const formData = new FormData();
      formData.append('action', 'createProduct');
      formData.append('id', productData.id.trim());
      formData.append('name', productData.name.trim());
      formData.append('description', productData.description.trim());
      formData.append('imageUrl', productData.imageUrl.trim());
      formData.append('price', productData.price);
      formData.append('weight', productData.weight.trim() || ' г');
      formData.append('category', productData.category);
      formData.append('isPromo', productData.isPromo.toString());
      formData.append('rating', productData.rating.toString());
      formData.append('active', productData.active.toString());
      formData.append('admin', admin.login);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();

      if (result.success) {
        showNotification(result.message || 'Товар успешно создан!');
        
        // Сбрасываем форму
        const nextId = getNextRecommendedId([...products, { id: productData.id }]);
        setProductData({
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
        
        // Уведомляем родительский компонент об успехе
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        showNotification(result.error || 'Ошибка создания товара', 'error');
      }
    } catch (error) {
      console.error('Ошибка создания товара:', error);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
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

  if (!isOpen) return null;

  return (
    <>
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
              onClick={onClose}
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
                  value={productData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
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
                  value={productData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
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
                  value={productData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
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
                    value={productData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
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
                    value={productData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
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
                  value={productData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
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
                  value={productData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
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
                {productData.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={productData.imageUrl}
                      alt="Предпросмотр"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Рейтинг и чекбоксы */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem' 
                  }}>
                    Рейтинг
                  </label>
                  <input
                    type="number"
                    value={productData.rating}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 5)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={productData.isPromo}
                      onChange={(e) => handleInputChange('isPromo', e.target.checked)}
                    />
                    🎉 Акция
                  </label>
                </div>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={productData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                    />
                    ✅ Активен
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa',
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '1rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              style={{
                flex: 2,
                padding: '1rem',
                background: isCreating ? '#ccc' : 'linear-gradient(135deg, #4caf50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isCreating ? (
                <>
                  <span>⏳</span>
                  Создание...
                </>
              ) : (
                <>
                  <span>➕</span>
                  Создать товар
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      <NotificationToast />
    </>
  );
};

export default AddProductModal;
