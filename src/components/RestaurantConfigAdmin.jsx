// RestaurantConfigAdmin.jsx - Административный интерфейс для управления настройками ресторанов

import { useState, useEffect } from 'react';
import { restaurantConfig } from '../config';
import { googleSheetsIntegration } from '../config/googleSheetsIntegration';
import RestaurantSelector from './RestaurantSelector';

const RestaurantConfigAdmin = ({ isOpen, onClose }) => {
  const [currentConfig, setCurrentConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [activeTab, setActiveTab] = useState('general');

  // Загружаем текущую конфигурацию при открытии
  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    setLoading(true);
    try {
      const config = await restaurantConfig.loadGoogleSheetsConfig();
      setCurrentConfig(config);
    } catch (error) {
      console.error('Error loading config:', error);
      showMessage('Ошибка загрузки конфигурации', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const success = await restaurantConfig.saveGoogleSheetsConfig(currentConfig);
      if (success) {
        showMessage('Настройки успешно сохранены', 'success');
      } else {
        showMessage('Ошибка сохранения настроек', 'error');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showMessage('Ошибка сохранения настроек', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const updateConfig = (path, value) => {
    setCurrentConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleRestaurantChange = (restaurantId) => {
    loadCurrentConfig();
  };

  if (!isOpen) return null;

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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Заголовок */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              🏪 Настройки ресторанов
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Управление конфигурацией и настройками ресторанов
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Селектор ресторана */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Текущий ресторан:
            </span>
            <RestaurantSelector 
              currentRestaurantId={restaurantConfig.currentRestaurantId}
              onRestaurantChange={handleRestaurantChange}
            />
          </div>
        </div>

        {/* Сообщения */}
        {message && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            fontSize: '14px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {message}
          </div>
        )}

        {/* Вкладки */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}>
          {[
            { id: 'general', label: '🏪 Основные', icon: '🏪' },
            { id: 'visual', label: '🎨 Внешний вид', icon: '🎨' },
            { id: 'delivery', label: '🚚 Доставка', icon: '🚚' },
            { id: 'contact', label: '📞 Контакты', icon: '📞' },
            { id: 'advanced', label: '⚙️ Дополнительно', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '500' : 'normal',
                color: activeTab === tab.id ? '#007bff' : '#666',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Содержимое вкладок */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#666'
            }}>
              Загрузка конфигурации...
            </div>
          ) : (
            <>
              {/* Основные настройки */}
              {activeTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Название ресторана
                    </label>
                    <input
                      type="text"
                      value={currentConfig.name || ''}
                      onChange={(e) => updateConfig('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Название ресторана"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Название приложения
                    </label>
                    <input
                      type="text"
                      value={currentConfig.appName || ''}
                      onChange={(e) => updateConfig('appName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Название приложения"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Заголовок проекта
                    </label>
                    <input
                      type="text"
                      value={currentConfig.projectTitle || ''}
                      onChange={(e) => updateConfig('projectTitle', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Заголовок проекта"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      URL логотипа
                    </label>
                    <input
                      type="url"
                      value={currentConfig.logoUrl || ''}
                      onChange={(e) => updateConfig('logoUrl', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              )}

              {/* Внешний вид */}
              {activeTab === 'visual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Основной цвет
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentConfig.primaryColor || '#ff7f32'}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        style={{
                          width: '50px',
                          height: '40px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={currentConfig.primaryColor || '#ff7f32'}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Цвет фона
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentConfig.backgroundColor || '#fdf0e2'}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                        style={{
                          width: '50px',
                          height: '40px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={currentConfig.backgroundColor || '#fdf0e2'}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Шрифт
                    </label>
                    <select
                      value={currentConfig.font || 'Fredoka'}
                      onChange={(e) => updateConfig('font', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="Fredoka">Fredoka</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Nunito">Nunito</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Валюта
                    </label>
                    <input
                      type="text"
                      value={currentConfig.currency || '₽'}
                      onChange={(e) => updateConfig('currency', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="₽"
                    />
                  </div>
                </div>
              )}

              {/* Доставка */}
              {activeTab === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Минимальная сумма для бесплатной доставки
                    </label>
                    <input
                      type="number"
                      value={currentConfig.delivery?.threshold || 2000}
                      onChange={(e) => updateConfig('delivery.threshold', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Стоимость доставки
                    </label>
                    <input
                      type="number"
                      value={currentConfig.delivery?.cost || 200}
                      onChange={(e) => updateConfig('delivery.cost', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Текст о бесплатной доставке
                    </label>
                    <input
                      type="text"
                      value={currentConfig.delivery?.freeDeliveryText || 'Бесплатная доставка от 2000 ₽'}
                      onChange={(e) => updateConfig('delivery.freeDeliveryText', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Контакты */}
              {activeTab === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={currentConfig.contact?.phone || ''}
                      onChange={(e) => updateConfig('contact.phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Адрес
                    </label>
                    <input
                      type="text"
                      value={currentConfig.contact?.address || ''}
                      onChange={(e) => updateConfig('contact.address', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="ул. Примерная, 1"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Время работы
                    </label>
                    <input
                      type="text"
                      value={currentConfig.contact?.workingHours || ''}
                      onChange={(e) => updateConfig('contact.workingHours', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ежедневно с 10:00 до 23:00"
                    />
                  </div>
                </div>
              )}

              {/* Дополнительные настройки */}
              {activeTab === 'advanced' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Flash маркер товаров
                    </label>
                    <input
                      type="text"
                      value={currentConfig.productMarkers?.flash || 'R2000'}
                      onChange={(e) => updateConfig('productMarkers.flash', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="R2000"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Маркер горячих товаров
                    </label>
                    <input
                      type="text"
                      value={currentConfig.productMarkers?.hot || 'H'}
                      onChange={(e) => updateConfig('productMarkers.hot', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="H"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Минимальная сумма заказа
                    </label>
                    <input
                      type="number"
                      value={currentConfig.order?.minOrderAmount || 500}
                      onChange={(e) => updateConfig('order.minOrderAmount', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Максимальная сумма заказа
                    </label>
                    <input
                      type="number"
                      value={currentConfig.order?.maxOrderAmount || 10000}
                      onChange={(e) => updateConfig('order.maxOrderAmount', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Кнопки действий */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Отмена
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#007bff',
              color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantConfigAdmin;