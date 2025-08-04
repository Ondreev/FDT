// components/UpsellModal.jsx
import { useState } from 'react';

const UpsellModal = ({ isOpen, onClose, products, settings, addToCart, currentStep, onNextStep }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Конфигурация шагов предложений
  const upsellSteps = [
    {
      id: 'appetizers',
      title: 'Выбери закуску',
      description: 'Дополни свой заказ вкусной закуской',
      categoryLetter: 'X', // Товары с ID содержащим букву X
      emoji: '🥗',
      color: '#ff7f32'
    },
    {
      id: 'sauces',
      title: 'Выбери соус',
      description: 'Добавь пикантности своему блюду',
      categoryLetter: 'Y', // Товары с ID содержащим букву Y
      emoji: '🍯',
      color: '#e74c3c'
    },
    {
      id: 'drinks',
      title: 'Выбери напиток',
      description: 'Утоли жажду освежающим напитком',
      categoryLetter: 'Z', // Товары с ID содержащим букву Z
      emoji: '🥤',
      color: '#3498db'
    }
  ];

  const currentStepConfig = upsellSteps[currentStep];
  
  // Фильтруем товары по букве в ID
  const stepProducts = products.filter(product => 
    String(product.id).includes(currentStepConfig?.categoryLetter)
  );

  const handleItemSelect = (product) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleNext = () => {
    // Добавляем выбранные товары в корзину
    selectedItems.forEach(item => {
      addToCart(item);
    });
    
    setSelectedItems([]);
    
    if (currentStep < upsellSteps.length - 1) {
      onNextStep();
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    setSelectedItems([]);
    
    if (currentStep < upsellSteps.length - 1) {
      onNextStep();
    } else {
      onClose();
    }
  };

  if (!isOpen || !currentStepConfig) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 3000,
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
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        animation: 'upsellSlideIn 0.3s ease-out'
      }}>
        <style>
          {`
            @keyframes upsellSlideIn {
              from { transform: translateY(50px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes upsellItemPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          `}
        </style>

        {/* Заголовок */}
        <div style={{
          background: `linear-gradient(135deg, ${currentStepConfig.color}, ${currentStepConfig.color}dd)`,
          color: 'white',
          padding: '1.5rem',
          borderRadius: '20px 20px 0 0',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
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

          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {currentStepConfig.emoji}
          </div>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            {currentStepConfig.title}
          </h2>
          
          <p style={{ 
            margin: 0, 
            opacity: 0.9,
            fontSize: '1rem'
          }}>
            {currentStepConfig.description}
          </p>

          {/* Индикатор прогресса */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            {upsellSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === currentStep ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Список товаров */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          {stepProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤷‍♂️</div>
              <p>В этой категории пока нет товаров</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '0.75rem',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {stepProducts.map(product => {
                const isSelected = selectedItems.find(item => item.id === product.id);
                
                return (
                  <div
                    key={product.id}
                    onClick={() => handleItemSelect(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '15px',
                      border: `2px solid ${isSelected ? currentStepConfig.color : '#f0f0f0'}`,
                      backgroundColor: isSelected ? `${currentStepConfig.color}15` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? `0 5px 15px ${currentStepConfig.color}30` : '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Чекбокс */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${currentStepConfig.color}`,
                      backgroundColor: isSelected ? currentStepConfig.color : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {isSelected && '✓'}
                    </div>

                    {/* Изображение товара */}
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    )}

                    {/* Информация о товаре */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        color: '#2c1e0f',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.name}
                      </div>
                      
                      {product.description && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#666',
                          marginBottom: '0.5rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.description}
                        </div>
                      )}
                      
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: currentStepConfig.color
                      }}>
                        {product.price} ₽
                      </div>
                    </div>

                    {/* Анимированная иконка при выборе */}
                    {isSelected && (
                      <div style={{
                        fontSize: '1.5rem',
                        animation: 'upsellItemPulse 1s infinite'
                      }}>
                        🎉
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              color: '#666',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          >
            Пропустить
          </button>

          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: '1rem',
              backgroundColor: currentStepConfig.color,
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {selectedItems.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ff4757',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {selectedItems.length}
              </span>
            )}
            
            {currentStep < upsellSteps.length - 1 
              ? (selectedItems.length > 0 ? 'Добавить и продолжить' : 'Далее')
              : (selectedItems.length > 0 ? 'Добавить в корзину' : 'Завершить')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// Хук для управления upsell процессом
export const useUpsellFlow = () => {
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [currentUpsellStep, setCurrentUpsellStep] = useState(0);

  const startUpsellFlow = () => {
    setCurrentUpsellStep(0);
    setIsUpsellOpen(true);
  };

  const nextUpsellStep = () => {
    setCurrentUpsellStep(prev => prev + 1);
  };

  const closeUpsellFlow = () => {
    setIsUpsellOpen(false);
    setCurrentUpsellStep(0);
  };

  return {
    isUpsellOpen,
    currentUpsellStep,
    startUpsellFlow,
    nextUpsellStep,
    closeUpsellFlow
  };
};

export default UpsellModal;
