import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbzXeMAkXVVy618VdDT6ICPOemHu6P046QTpCH2R1fM8WlHNhHXdamqeBIntaVeuwz4U4A/exec';

const OrderForm = ({ isOpen, onClose, cart, total, settings, onOrderSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    deliveryType: '',
    address: '',
    phone: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const steps = [
    {
      id: 'greeting',
      botMessage: '👋 Привет! Давай оформим твой заказ?\n\nКак к тебе обращаться?',
      type: 'text',
      field: 'customerName',
      placeholder: 'Введи своё имя...'
    },
    {
      id: 'delivery',
      type: 'buttons',
      field: 'deliveryType',
      options: [
        { value: 'pickup', label: '🏃‍♂️ Заберу сам', emoji: '🏪' },
        { value: 'delivery', label: '🚗 Привезите', emoji: '📍' }
      ]
    },
    {
      id: 'address',
      type: 'address',
      field: 'address',
      placeholder: 'Улица, дом, квартира...'
    },
    {
      id: 'phone',
      type: 'phone',
      field: 'phone',
      placeholder: '+7 999 123 45 67'
    },
    {
      id: 'comment',
      botMessage: '💬 Хочешь добавить комментарий к заказу?\n\n(Можешь пропустить этот шаг)',
      type: 'textarea',
      field: 'comment',
      placeholder: 'Например: без лука, очень острое...',
      optional: true
    },
    {
      id: 'confirmation',
      type: 'confirmation'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setMessages([]);
      setInputValue('');
      setFormData({
        customerName: '',
        deliveryType: '',
        address: '',
        phone: '',
        comment: ''
      });
      
      // Показываем первое сообщение бота
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages([{
            type: 'bot',
            text: steps[0].botMessage,
            timestamp: new Date()
          }]);
        }, 1500);
      }, 500);
    }
  }, [isOpen]);

  const getBotMessage = (stepIndex, updatedFormData) => {
    const step = steps[stepIndex];
    
    switch(step.id) {
      case 'delivery':
        return `Отлично, ${updatedFormData.customerName}! 🚀\n\nКак получишь заказ?`;
      
      case 'address':
        return updatedFormData.deliveryType === 'pickup' 
          ? '👌 Супер! Заберёшь по адресу самовывоза.\n\nТеперь напиши свой номер WhatsApp:'
          : '📍 Куда привезти заказ?\n\nНапиши точный адрес:';
      
      case 'phone':
        return '📱 Теперь напиши свой номер WhatsApp:';
      
      case 'confirmation':
        return '🎯 Проверь заказ:\n\n' +
          `👤 ${updatedFormData.customerName}\n` +
          `${updatedFormData.deliveryType === 'pickup' ? '🏪 Самовывоз' : '🚗 Доставка: ' + updatedFormData.address}\n` +
          `📱 ${updatedFormData.phone}\n` +
          `${updatedFormData.comment ? '💬 ' + updatedFormData.comment + '\n' : ''}` +
          `💰 Итого: ${total} ${settings.currency || '₽'}\n\n` +
          'Отправляю заказ? 🚀';
      
      default:
        return step.botMessage || '';
    }
  };

  const handleUserInput = (value) => {
    const currentStepData = steps[currentStep];
    
    // Добавляем сообщение пользователя
    let userDisplayText = value;
    if (currentStepData.type === 'buttons') {
      userDisplayText = currentStepData.options.find(opt => opt.value === value)?.label || value;
    }
    
    const userMessage = {
      type: 'user',
      text: userDisplayText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Обновляем данные формы
    const updatedFormData = { ...formData };
    
    if (currentStepData.field === 'address' && formData.deliveryType === 'pickup') {
      // Если самовывоз - в поле address записываем "Самовывоз", а в phone записываем введенное значение
      updatedFormData.address = 'Самовывоз';
      updatedFormData.phone = value;
    } else {
      updatedFormData[currentStepData.field] = value;
    }
    
    setFormData(updatedFormData);
    setInputValue('');
    
    // Переходим к следующему шагу
    setTimeout(() => {
      const nextStepIndex = findNextStep(currentStep, updatedFormData);
      if (nextStepIndex < steps.length) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setCurrentStep(nextStepIndex);
          
          const botMessage = {
            type: 'bot',
            text: getBotMessage(nextStepIndex, updatedFormData),
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
        }, 1200);
      }
    }, 800);
  };

  const findNextStep = (currentIndex, formData) => {
    for (let i = currentIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      
      // Пропускаем шаг с телефоном если самовывоз (телефон уже спросили в поле адреса)
      if (step.id === 'phone' && formData.deliveryType === 'pickup') {
        continue;
      }
      
      return i;
    }
    return steps.length;
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // Создаем данные заказа
      const orderData = {
        action: 'createOrder',
        orderId: Date.now().toString(),
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        comment: formData.comment || '',
        products: JSON.stringify(cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))),
        total: total.toString(),
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };

      // Формируем URL параметры
      const params = new URLSearchParams(orderData);

      // Отправляем через GET (как и остальные запросы в приложении)
      const response = await fetch(`${API_URL}?${params.toString()}`, {
        method: 'GET'
      });

      const result = await response.text();
      
      if (result.includes('success') || response.ok) {
        // Показываем сообщение об успехе
        setMessages(prev => [...prev, {
          type: 'bot',
          text: '🎉 Заказ отправлен!\n\nМы свяжемся с тобой в WhatsApp в ближайшее время!\n\nСпасибо за заказ! ❤️',
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          onClose();
          if (onOrderSuccess) {
            onOrderSuccess(); // Очищаем корзину
          }
        }, 3000);
      } else {
        throw new Error('Server response: ' + result);
      }
      
    } catch (error) {
      console.error('Error submitting order:', error);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '😔 Упс! Что-то пошло не так...\n\nПопробуй еще раз или напиши нам напрямую в WhatsApp\n\nОшибка: ' + error.message,
        timestamp: new Date()
      }]);
    }
    
    setIsSubmitting(false);
  };

  const renderInput = () => {
    if (currentStep >= steps.length || isTyping) return null;
    
    const step = steps[currentStep];
    
    if (step.type === 'buttons') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          {step.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleUserInput(option.value)}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
              }}
            >
              <span>{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
      );
    }
    
    if (step.type === 'confirmation') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            style={{
              padding: '1rem 2rem',
              background: isSubmitting 
                ? 'linear-gradient(135deg, #ccc, #999)' 
                : 'linear-gradient(135deg, #ff6b47, #ff8e32)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 71, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? '📤 Отправляю...' : '🚀 Да, отправляй!'}
          </button>
          <button
            onClick={() => {
              // Возвращаемся на предыдущий шаг
              const prevStep = currentStep - 1;
              setCurrentStep(prevStep);
              // Убираем последнее сообщение бота
              setMessages(prev => prev.slice(0, -1));
            }}
            disabled={isSubmitting}
            style={{
              padding: '0.8rem 1.5rem',
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            ← Назад
          </button>
        </div>
      );
    }
    
    // Обычные инпуты
    const handleSubmit = (e) => {
      e.preventDefault();
      if (inputValue.trim() || step.optional) {
        handleUserInput(inputValue.trim());
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div style={{ position: 'relative' }}>
          {step.type === 'textarea' ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step.placeholder}
              autoFocus
              style={{
                width: '100%',
                padding: '1rem 4rem 1rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '1rem',
                resize: 'none',
                minHeight: '50px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#25d366'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          ) : (
            <input
              type={step.type === 'phone' ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step.placeholder}
              required={!step.optional}
              autoFocus
              style={{
                width: '100%',
                padding: '1rem 4rem 1rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#25d366'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}
          
          <button
            type="submit"
            disabled={!inputValue.trim() && !step.optional}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: (!inputValue.trim() && !step.optional) 
                ? '#ccc' 
                : 'linear-gradient(135deg, #25d366, #128c7e)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: (!inputValue.trim() && !step.optional) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            ➤
          </button>
        </div>
        
        {step.optional && (
          <button
            type="button"
            onClick={() => handleUserInput('')}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: '#666',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Пропустить ⏭️
          </button>
        )}
      </form>
    );
  };

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
        background: 'linear-gradient(135deg, #e5ddd5, #f0f0f0)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Заголовок как в WhatsApp */}
        <div style={{
          background: 'linear-gradient(135deg, #25d366, #128c7e)',
          color: 'white',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🍕
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {settings.projectTitle || 'Ресторан'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                онлайн
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%'
            }}
          >
            ✕
          </button>
        </div>

        {/* Чат */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '300px'
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                animation: 'messageSlideIn 0.3s ease-out'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '0.8rem 1rem',
                  borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #dcf8c6, #d1f2cc)' 
                    : 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem',
                  lineHeight: '1.4'
                }}
              >
                {message.text}
              </div>
            </div>
          ))}
          
          {/* Индикатор печатания */}
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '0.8rem 1rem',
                borderRadius: '20px 20px 20px 5px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '3px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'typing 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'typing 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Поле ввода */}
        <div style={{ padding: '1rem', flexShrink: 0 }}>
          {renderInput()}
        </div>
      </div>

      <style>
        {`
          @keyframes messageSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-10px);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OrderForm;
