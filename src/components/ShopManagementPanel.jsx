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

  // Загружаем данные при открытии попапа
  useEffect(() => {
    if (isPopupOpen) {
      loadShopData();
    }
  }, [isPopupOpen]);

  const loadShopData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем настройки и товары
      const [settingsRes, productsRes] = await Promise.all([
        fetch(`${API_URL}?action=getSettings&t=${Date.now()}`),
        fetch(`${API_URL}?action=getProducts&t=${Date.now()}`)
      ]);

      const settings = await settingsRes.json();
      const productsData = await productsRes.json();

      // Определяем статус магазина
      const shopOpenValue = settings.shopOpen;
      const isOpen = shopOpenValue !== 'FALSE' && shopOpenValue !== 'false' && shopOpenValue !== false;
      setShopStatus(isOpen);

      // Обрабатываем товары
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      }

    } catch (error) {
      console.error('Ошибка загрузки данных магазина:', error);
      alert('Ошибка загрузки данных');
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
        alert(newStatus ? '✅ Магазин открыт!' : '🔒 Магазин закрыт!');
      } else {
        alert('Ошибка обновления статуса магазина');
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductsStatus = async (status) => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для обновления');
      return;
    }

    try {
      setIsUpdatingProducts(true);
      
      const productIds = selectedProducts.join(',');
      const response = await fetch(`${API_URL}?action=updateProductsStatus&productIds=${encodeURIComponent(productIds)}&status=${status}&admin=${admin.login}&t=${Date.now()}`);
      const result = await response.json();

      if (result.success) {
        alert(`✅ Обновлено товаров: ${result.updatedCount}`);
        setSelectedProducts([]);
        loadShopData(); // Перезагружаем данные
      } else {
        alert('Ошибка обновления товаров');
      }
    } catch (error) {
      console.error('Ошибка обновления товаров:', error);
      alert('Ошибка соединения');
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
          maxHeight: '80vh',
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
            justifyContent: 'space-between'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
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
                padding: '0.5rem'
              }}
            >
              ✕
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
              <div style={{ color: '#666' }}>Активных</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {inactiveProducts.length}
              </div>
              <div style={{ color: '#666' }}>Отключенных</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#2196f3', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {products.length}
              </div>
              <div style={{ color: '#666' }}>Всего</div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => selectAllProducts(inactiveProducts)}
              disabled={inactiveProducts.length === 0}
              style={{
                padding: '0.5rem 1rem',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: inactiveProducts.length === 0 ? 'not-allowed' : 'pointer',
                opacity: inactiveProducts.length === 0 ? 0.5 : 1
              }}
            >
              ✓ Выбрать отключенные ({inactiveProducts.length})
            </button>
            
            <button
              onClick={() => selectAllProducts(activeProducts)}
              disabled={activeProducts.length === 0}
              style={{
                padding: '0.5rem 1rem',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: activeProducts.length === 0 ? 'not-allowed' : 'pointer',
                opacity: activeProducts.length === 0 ? 0.5 : 1
              }}
            >
              ✓ Выбрать активные ({activeProducts.length})
            </button>

            <button
              onClick={() => setSelectedProducts([])}
              style={{
                padding: '0.5rem 1rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Очистить выбор
            </button>
          </div>

          {/* Список товаров */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '1rem 1.5rem'
          }}>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                Товары не найдены
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: isSelected ? '#e3f2fd' : '#f8f9fa',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: isSelected ? '#2196f3' : 'white',
                        border: '2px solid #2196f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {isSelected ? '✓' : ''}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          color: '#2c1e0f'
                        }}>
                          {product.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          ID: {product.id} • {product.price}₽
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        background: isActive ? '#e8f5e8' : '#ffebee',
                        color: isActive ? '#2e7d32' : '#c62828'
                      }}>
                        {isActive ? 'АКТИВЕН' : 'ОТКЛЮЧЕН'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Кнопки управления */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              onClick={() => updateProductsStatus('active')}
              disabled={selectedProducts.length === 0 || isUpdatingProducts}
              style={{
                flex: 1,
                padding: '1rem',
                background: selectedProducts.length === 0 ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ✅ Включить выбранные ({selectedProducts.length})
            </button>
            
            <button
              onClick={() => updateProductsStatus('inactive')}
              disabled={selectedProducts.length === 0 || isUpdatingProducts}
              style={{
                flex: 1,
                padding: '1rem',
                background: selectedProducts.length === 0 ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              🛑 Отключить выбранные ({selectedProducts.length})
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Компактная кнопка "Управление" */}
      <button
        onClick={() => setIsPopupOpen(true)}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        }}
      >
        ⚙️ Управление
      </button>

      {/* Попап панель управления */}
      {isPopupOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2c1e0f',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              ⚙️ Управление магазином
            </h2>

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
                {/* Статус магазина */}
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#2c1e0f',
                    marginBottom: '1rem'
                  }}>
                    Статус магазина
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: shopStatus ? '#4caf50' : '#f44336'
                    }} />
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: shopStatus ? '#4caf50' : '#f44336'
                    }}>
                      {shopStatus ? 'ОТКРЫТ' : 'ЗАКРЫТ'}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
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
                </div>

                {/* Статистика товаров */}
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#2c1e0f',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    Товары
                  </div>
                  
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
                      gap: '0.5rem'
                    }}
                  >
                    📦 Управление товарами
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно управления товарами */}
      <ProductsManagementModal />
    </>
  );
};

export default ShopManagementPanel;
