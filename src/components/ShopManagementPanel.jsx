// components/ShopManagementPanel.jsx
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const ShopManagementPanel = ({ admin }) => {
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        fetch(`${API_URL}?action=getSettings&t=${Date.now()}`),
        fetch(`${API_URL}?action=getProducts&t=${Date.now()}`)
      ]);

      const settings = await settingsRes.json();
      const productsData = await productsRes.json();

      // Проверяем статус магазина
      setIsShopOpen(settings.shopOpen !== 'false');
      
      // Загружаем товары с их статусами
      setProducts(productsData.map(product => ({
        ...product,
        isActive: product.active !== false && product.active !== 'FALSE'
      })));

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка загрузки данных');
    }
  };

  const updateShopStatus = async (newStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=updateShopStatus&status=${newStatus}&admin=${admin.login}`, {
        method: 'GET'
      });

      const result = await response.json();
      
      if (result.success) {
        setIsShopOpen(newStatus === 'open');
        setLastAction({
          type: newStatus === 'open' ? 'opened' : 'closed',
          time: new Date().toLocaleTimeString(),
          admin: admin.login
        });
        alert(newStatus === 'open' ? '✅ Магазин открыт!' : '🔒 Магазин закрыт!');
      } else {
        alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductsStatus = async (productIds, newStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=updateProductsStatus&productIds=${productIds.join(',')}&status=${newStatus}&admin=${admin.login}`, {
        method: 'GET'
      });

      const result = await response.json();
      
      if (result.success) {
        // Обновляем локальное состояние товаров
        setProducts(prev => prev.map(product => 
          productIds.includes(product.id.toString()) 
            ? { ...product, isActive: newStatus === 'active' }
            : product
        ));
        
        setSelectedProducts([]);
        setLastAction({
          type: newStatus === 'active' ? 'products_enabled' : 'products_disabled',
          count: productIds.length,
          time: new Date().toLocaleTimeString(),
          admin: admin.login
        });
        
        const action = newStatus === 'active' ? 'включены' : 'отключены';
        alert(`✅ ${productIds.length} товаров ${action}!`);
      } else {
        alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка обновления товаров:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id.toString()));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleProductSelect = (productId, checked) => {
    const id = productId.toString();
    if (checked) {
      setSelectedProducts(prev => [...prev, id]);
    } else {
      setSelectedProducts(prev => prev.filter(pid => pid !== id));
    }
  };

  const activeProducts = products.filter(p => p.isActive);
  const inactiveProducts = products.filter(p => !p.isActive);

  return (
    <>
      {/* Основная панель управления */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '2px solid #f0f0f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#2c1e0f',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚙️ Управление магазином
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: isShopOpen ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>
            <span>{isShopOpen ? '🟢' : '🔴'}</span>
            {isShopOpen ? 'ОТКРЫТ' : 'ЗАКРЫТ'}
          </div>
        </div>

        {/* Кнопки управления */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => updateShopStatus('close')}
            disabled={isLoading || !isShopOpen}
            style={{
              padding: '1rem',
              background: !isShopOpen ? '#6c757d' : 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: !isShopOpen ? 'not-allowed' : 'pointer',
              opacity: !isShopOpen ? 0.6 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            🔒 Закрыть магазин
          </button>

          <button
            onClick={() => updateShopStatus('open')}
            disabled={isLoading || isShopOpen}
            style={{
              padding: '1rem',
              background: isShopOpen ? '#6c757d' : 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isShopOpen ? 'not-allowed' : 'pointer',
              opacity: isShopOpen ? 0.6 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            🟢 Открыть магазин
          </button>

          <button
            onClick={() => setShowProductsModal(true)}
            disabled={isLoading}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            📋 Управление товарами
          </button>
        </div>

        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {activeProducts.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Активных товаров</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {inactiveProducts.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Отключенных товаров</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
              {products.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Всего товаров</div>
          </div>
        </div>

        {/* Информация о последнем действии */}
        {lastAction && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#e8f5e8',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            fontSize: '0.9rem',
            color: '#155724'
          }}>
            <strong>Последнее действие:</strong>{' '}
            {lastAction.type === 'opened' && '🟢 Магазин открыт'}
            {lastAction.type === 'closed' && '🔒 Магазин закрыт'}
            {lastAction.type === 'products_enabled' && `✅ Включено товаров: ${lastAction.count}`}
            {lastAction.type === 'products_disabled' && `❌ Отключено товаров: ${lastAction.count}`}
            {' '}в {lastAction.time}
            {lastAction.admin && ` (${lastAction.admin})`}
          </div>
        )}
      </div>

      {/* Модальное окно управления товарами */}
      {showProductsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Заголовок модала */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#2c1e0f',
                margin: 0
              }}>
                📋 Управление товарами ({products.length})
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
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Панель действий */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e0e0e0',
              background: '#f8f9fa'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>Выбрать все</span>
                  </label>

                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    Выбrano: {selectedProducts.length}
                  </span>
                </div>

                {selectedProducts.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => updateProductsStatus(selectedProducts, 'active')}
                      disabled={isLoading}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Включить ({selectedProducts.length})
                    </button>

                    <button
                      onClick={() => updateProductsStatus(selectedProducts, 'inactive')}
                      disabled={isLoading}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ СТОП ({selectedProducts.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Список товаров */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem'
            }}>
              {products.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
                  <div>Товары не найдены</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '0.5rem'
                }}>
                  {products.map(product => (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: product.isActive ? 'white' : '#f8f9fa',
                        opacity: product.isActive ? 1 : 0.6
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id.toString())}
                        onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />

                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            objectFit: 'cover'
                          }}
                        />
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          color: product.isActive ? '#2c1e0f' : '#666'
                        }}>
                          {product.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          {product.price} ₽ • ID: {product.id}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: product.isActive ? '#e8f5e8' : '#ffeaea',
                          color: product.isActive ? '#28a745' : '#dc3545'
                        }}>
                          {product.isActive ? '✅ Активен' : '❌ СТОП'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShopManagementPanel;
