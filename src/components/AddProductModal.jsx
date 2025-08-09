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

  // ✅ ФУНКЦИЯ проверки заполненности поля
  const isFieldFilled = (field) => {
    switch (field) {
      case 'id':
        return productData.id.trim() !== '';
      case 'name':
        return productData.name.trim() !== '';
      case 'price':
        return productData.price !== '' && parseFloat(productData.price) > 0;
      case 'category':
        return productData.category !== '';
      case 'description':
        return productData.description.trim() !== '';
      case 'imageUrl':
        return productData.imageUrl.trim() !== '';
      case 'weight':
        return productData.weight.trim() !== '';
      default:
        return false;
    }
  };

  // ✅ ФУНКЦИЯ проверки обязательности поля
  const isRequiredField = (field) => {
    return ['id', 'name', 'price', 'category'].includes(field);
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

  // ✅ СТИЛИ для полей ввода
  const getInputStyle = (field) => {
    const isFilled = isFieldFilled(field);
    const isRequired = isRequiredField(field);
    
    let backgroundColor = 'white';
    if (isRequired && !isFilled) {
      backgroundColor = '#fff3cd'; // Желтый фон для обязательных незаполненных полей
    }

    return {
      width: '100%',
      padding: '0.75rem',
      paddingRight: isFilled ? '2.5rem' : '0.75rem', // Место для галочки
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      boxSizing: 'border-box',
      backgroundColor,
      position: 'relative',
      transition: 'all 0.3s ease'
    };
  };

  // ✅ КОМПОНЕНТ галочки
  const CheckIcon = ({ field }) => {
    if (!isFieldFilled(field)) return null;
    
    return (
      <div style={{
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: '#4caf50',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        animation: 'checkBounce 0.3s ease-out'
      }}>
        ✓
      </div>
    );
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
        {notification.message}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ✅ CSS для анимаций */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes checkBounce {
          0% { transform: translateY(-50%) scale(0); }
          50% { transform: translateY(-50%) scale(1.2); }
          100% { transform: translateY(-50%) scale(1); }
        }
      `}</style>

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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              ➕ Добавить товар
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* ID товара */}
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.7rem', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: '#2c3e50'
                }}>
                  ID товара * {isRequiredField('id') && !isFieldFilled('id') && '🟡'}
                </label>
                <input
                  type="text"
                  value={productData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  style={getInputStyle('id')}
                  placeholder="132 (можно добавить буквы: 132S)"
                />
                <CheckIcon field="id" />
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  Рекомендуется: {getNextRecommendedId(products)}. Можно добавить буквы для спец. товаров
                </div>
              </div>

              {/* Название */}
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.7rem', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: '#2c3e50'
                }}>
                  Название * {isRequiredField('name') && !isFieldFilled('name') && '🟡'} (будет в ВЕРХНЕМ РЕГИСТРЕ)
                </label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={getInputStyle('name')}
                  placeholder="Введите название товара"
                />
                <CheckIcon field="name" />
              </div>

              {/* Описание */}
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.7rem', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: '#2c3e50'
                }}>
                  Описание
                </label>
                <textarea
                  value={productData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  style={{
                    ...getInputStyle('description'),
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Описание товара"
                />
                <CheckIcon field="description" />
              </div>

              {/* Цена и Вес в одну строку */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.7rem', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    color: '#2c3e50'
                  }}>
                    Цена * {isRequiredField('price') && !isFieldFilled('price') && '🟡'} (₽)
                  </label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    style={getInputStyle('price')}
                    placeholder="350"
                    min="0"
                  />
                  <CheckIcon field="price" />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.7rem', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    color: '#2c3e50'
                  }}>
                    Вес
                  </label>
                  <input
                    type="text"
                    value={productData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    style={getInputStyle('weight')}
                    placeholder="130 г"
                  />
                  <CheckIcon field="weight" />
                </div>
              </div>

              {/* Категория */}
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.7rem', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: '#2c3e50'
                }}>
                  Категория * {isRequiredField('category') && !isFieldFilled('category') && '🟡'}
                </label>
                <select
                  value={productData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={getInputStyle('category')}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <CheckIcon field="category" />
              </div>

              {/* URL изображения */}
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.7rem', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: '#2c3e50'
                }}>
                  URL изображения
                </label>
                <input
                  type="url"
                  value={productData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  style={getInputStyle('imageUrl')}
                  placeholder="https://..."
                />
                <CheckIcon field="imageUrl" />
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
                        border: '2px solid #4caf50',
                        boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
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
                    marginBottom: '0.7rem', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    color: '#2c3e50'
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
                    backgroundColor: productData.isPromo ? '#e8f5e8' : '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: productData.isPromo ? '2px solid #4caf50' : '1px solid #ddd',
                    transition: 'all 0.3s ease'
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
                    backgroundColor: productData.active ? '#e8f5e8' : '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: productData.active ? '2px solid #4caf50' : '1px solid #ddd',
                    transition: 'all 0.3s ease'
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
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
                gap: '0.5rem',
                transition: 'all 0.3s ease'
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
