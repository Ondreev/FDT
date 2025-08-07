// RestaurantSelector.jsx - Компонент для выбора ресторана

import { useState, useEffect } from 'react';
import { restaurantConfig } from '../config';
import { googleSheetsIntegration } from '../config/googleSheetsIntegration';

const RestaurantSelector = ({ onRestaurantChange, currentRestaurantId }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Загружаем список ресторанов при монтировании
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      // Получаем список из Google таблицы
      const googleRestaurants = await googleSheetsIntegration.getRestaurantsList();
      
      // Получаем локальные конфигурации
      const localRestaurants = restaurantConfig.getAvailableRestaurants();
      
      // Объединяем списки, приоритет отдаем Google таблице
      const allRestaurants = [...googleRestaurants];
      
      // Добавляем локальные, которых нет в Google таблице
      localRestaurants.forEach(local => {
        if (!allRestaurants.find(r => r.id === local.id)) {
          allRestaurants.push(local);
        }
      });
      
      setRestaurants(allRestaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      // Fallback к локальным конфигурациям
      setRestaurants(restaurantConfig.getAvailableRestaurants());
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = (restaurantId) => {
    if (restaurantId !== currentRestaurantId) {
      restaurantConfig.setCurrentRestaurant(restaurantId);
      if (onRestaurantChange) {
        onRestaurantChange(restaurantId);
      }
    }
    setIsOpen(false);
  };

  const currentRestaurant = restaurants.find(r => r.id === currentRestaurantId) || 
                           { name: 'Неизвестный ресторан', id: currentRestaurantId };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#fff',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          transition: 'all 0.2s ease',
          minWidth: '200px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#007bff';
          e.target.style.backgroundColor = '#f8f9fa';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#e0e0e0';
          e.target.style.backgroundColor = '#fff';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🏪</span>
          <span>{loading ? 'Загрузка...' : currentRestaurant.name}</span>
        </div>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay для закрытия при клике вне */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Выпадающий список */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {restaurants.length === 0 ? (
              <div style={{
                padding: '12px',
                color: '#666',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {loading ? 'Загрузка ресторанов...' : 'Рестораны не найдены'}
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => handleRestaurantSelect(restaurant.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: restaurant.id === currentRestaurantId ? '#f0f8ff' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (restaurant.id !== currentRestaurantId) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (restaurant.id !== currentRestaurantId) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🏪</span>
                  <div>
                    <div style={{ fontWeight: '500', color: '#333' }}>
                      {restaurant.name || restaurant.appName}
                    </div>
                    {restaurant.appName && restaurant.name !== restaurant.appName && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {restaurant.appName}
                      </div>
                    )}
                  </div>
                  {restaurant.id === currentRestaurantId && (
                    <span style={{ 
                      marginLeft: 'auto', 
                      color: '#007bff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              ))
            )}
            
            {/* Кнопка обновления списка */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                loadRestaurants();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                border: 'none',
                borderTop: '1px solid #e0e0e0',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              disabled={loading}
            >
              <span>🔄</span>
              {loading ? 'Обновление...' : 'Обновить список'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantSelector;