import React, { useState, useEffect, useRef } from 'react';
import { checkDeliveryZone, getDeliveryZoneByCoords } from '../utils/deliveryZones';

const AddressInput = ({ 
  isOpen, 
  onClose, 
  onSave, 
  settings = {} 
}) => {
  const [address, setAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [error, setError] = useState('');
  
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const YANDEX_API_KEY = '74b46206-b9f0-4591-a22c-5fabeb409e5b';

  const getSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(query)}&format=json&results=7&kind=house`;
      const response = await fetch(url);
      const data = await response.json();
      const geoObjects = data.response?.GeoObjectCollection?.featureMember || [];
      
      const addressSuggestions = geoObjects.map(item => {
        const geoObject = item.GeoObject;
        const fullAddress = geoObject.metaDataProperty.GeocoderMetaData.text;
        const coordinates = geoObject.Point.pos.split(' ');
        
        return {
          text: fullAddress,
          description: geoObject.description || '',
          coordinates: {
            lon: parseFloat(coordinates[0]),
            lat: parseFloat(coordinates[1])
          }
        };
      });

      setSuggestions(addressSuggestions);
      setShowSuggestions(addressSuggestions.length > 0);
      setSelectedSuggestion(-1);
      
    } catch (error) {
      console.error('Ошибка получения подсказок:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }

    setIsLoadingSuggestions(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(address);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [address]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          selectSuggestion(suggestions[selectedSuggestion]);
        } else {
          handleAddressCheck();
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion) => {
    setAddress(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    setSuggestions([]);
    
    setTimeout(() => {
      handleAddressCheckWithCoords(suggestion.text, suggestion.coordinates);
    }, 100);
  };

  const handleAddressCheckWithCoords = async (addressText, coords = null) => {
    setIsChecking(true);
    setError('');
    setZoneInfo(null);

    try {
      let result;
      if (coords) {
        const zone = getDeliveryZoneByCoords(coords);
        
        if (zone) {
          result = {
            success: true,
            zone: zone.zone,
            cost: zone.cost,
            freeFrom: zone.freeFrom,
            label: zone.label,
            coordinates: coords
          };
        } else {
          result = {
            success: false,
            error: 'Доставка по указанному адресу недоступна',
            coordinates: coords
          };
        }
      } else {
        result = await checkDeliveryZone(addressText);
      }
      
      if (result.success) {
        setZoneInfo(result);
        setError('');
      } else {
        setZoneInfo(null);
        setError(result.error);
      }
    } catch (err) {
      console.error('Ошибка проверки:', err);
      setError('Ошибка при проверке адреса');
      setZoneInfo(null);
    }

    setIsChecking(false);
  };

  const handleAddressCheck = () => {
    if (!address.trim()) {
      setError('Введите адрес');
      return;
    }
    handleAddressCheckWithCoords(address);
  };

  const handleSave = () => {
    if (!address.trim()) {
      setError('Введите адрес');
      return;
    }

    if (!zoneInfo) {
      setError('Сначала проверьте адрес');
      return;
    }

    const addressData = {
      address: address.trim(),
      zone: zoneInfo.zone,
      cost: zoneInfo.cost,
      freeFrom: zoneInfo.freeFrom,
      label: zoneInfo.label
    };

    localStorage.setItem('deliveryZoneInfo', JSON.stringify(addressData));
    onSave(address.trim());
    onClose();
  };

  const handleReset = () => {
    setAddress('');
    setZoneInfo(null);
    setError('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: '#2c1e0f'
          }}>
            📍 Укажите адрес доставки
          </h2>
          <button
            onClick={onClose}
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

        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (zoneInfo || error) {
                setZoneInfo(null);
                setError('');
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Начните вводить адрес..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = settings.primaryColor || '#ff7f32';
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          
          {isLoadingSuggestions && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }}>
              🔍
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '2px solid #e0e0e0',
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                maxHeight: '240px',
                overflowY: 'auto',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    backgroundColor: selectedSuggestion === index ? '#f5f5f5' : 'white',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={() => setSelectedSuggestion(index)}
                >
                  <div style={{
                    fontWeight: '500',
                    fontSize: '0.95rem',
                    color: '#2c1e0f',
                    marginBottom: '2px'
                  }}>
                    📍 {suggestion.text}
                  </div>
                  {suggestion.description && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      {suggestion.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleAddressCheck}
          disabled={!address.trim() || isChecking}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: isChecking 
              ? '#ccc' 
              : (settings.primaryColor || '#ff7f32'),
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          {isChecking ? '🔍 Проверяем адрес...' : '🔍 Проверить зону доставки'}
        </button>

        {zoneInfo && (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #4caf50'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <div style={{
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#2e7d32'
              }}>
                {zoneInfo.label}
              </div>
            </div>
            
            <div style={{
              fontSize: '1rem',
              color: '#2e7d32',
              lineHeight: '1.4'
            }}>
              💰 <strong>Стоимость доставки: {zoneInfo.cost}₽</strong>
              <br />
              🆓 Бесплатно при заказе от {zoneInfo.freeFrom}₽
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #f44336'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>❌</span>
              <div style={{
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#d32f2f'
              }}>
                {error}
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px'
        }}>
          {zoneInfo && (
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✅ Сохранить адрес
            </button>
          )}
          
          <button
            onClick={handleReset}
            style={{
              flex: zoneInfo ? 0.5 : 1,
              padding: '12px 24px',
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🔄 Очистить
          </button>
          
          <button
            onClick={onClose}
            style={{
              flex: zoneInfo ? 0.5 : 1,
              padding: '12px 24px',
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center'
        }}>
          💡 Начните вводить адрес - появятся подсказки. Выберите нужный или используйте стрелки ↑↓ и Enter
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
