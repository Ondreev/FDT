import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxAQF0sfNYonRjjH3zFBW58gkXZ3u5mKZWUtDyspY3uyHxFc-WnZB13Hz8IH1w-h3bG2Q/exec';

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
  
  // Читаем deliveryMode прямо из localStorage
  const deliveryMode = localStorage.getItem('deliveryMode') || 'delivery';
  
  // Ref для автоскролла
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Скроллим при добавлении новых сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Функция для получения шагов в зависимости от режима доставки
  const getSteps = () => {
    // Читаем актуальный режим каждый раз при вызове
    const currentMode = localStorage.getItem('deliveryMode') || 'delivery';
    
    return [
      {
        id: 'greeting',
        botMessage: '👋 Привет! Давай оформим твой заказ?\n\nКак к тебе обращаться?',
        type: 'text',
        field: 'customerName',
        placeholder: 'Введи своё имя...'
      },
      {
        id: 'delivery',
        type: 'delivery_info', // Адаптивный шаг
        field: currentMode === 'pickup' ? 'phone' : 'address' // Для самовывоза сразу телефон, для доставки - адрес
      },
      {
        id: 'phone',
        type: 'phone',
        field: 'phone',
        placeholder: '+7 999 123 45 67',
        skip: currentMode === 'pickup' // Пропускаем если уже ввели на предыдущем шаге
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
  };

  useEffect(() => {
    if (isOpen) {
      // Читаем актуальный режим доставки
      const currentDeliveryMode = localStorage.getItem('deliveryMode') || 'delivery';
      
      setCurrentStep(0);
      setMessages([]);
      setInputValue('');
      
      // Устанавливаем режим доставки из localStorage
      setFormData({
        customerName: '',
        deliveryType: currentDeliveryMode,
        address: currentDeliveryMode === 'pickup' ? 'Самовывоз' : '',
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
            text: getSteps()[0].botMessage,
            timestamp: new Date()
          }]);
        }, 1500);
      }, 500);
    }
  }, [isOpen]); // Убираем зависимость от deliveryMode

  const getBotMessage = (stepIndex, updatedFormData) => {
    const step = getSteps()[stepIndex];
    // Читаем актуальный режим каждый раз
    const currentMode = localStorage.getItem('deliveryMode') || 'delivery';
    
    switch(step.id) {
      case 'delivery':
        // Используем актуальный режим из localStorage
        if (currentMode === 'pickup') {
          return `Отлично, ${updatedFormData.customerName}! 🚀\n\nЯ уже знаю, что ты выбрал самовывоз, заскочишь к нам в ресторан! 🏪\n\nТеперь напиши свой номер WhatsApp:`;
        } else {
          return `Отлично, ${updatedFormData.customerName}! 🚀\n\nЯ знаю, ты выбрал нашу скоростную доставку, напиши свой адрес, чтобы заказ не увезли другому чуваку! 😄📍`;
        }
      
      case 'phone':
        return '📱 Теперь напиши свой номер WhatsApp:';
      
      case 'confirmation':
        return '🎯 Проверь заказ:\n\n' +
          `👤 ${updatedFormData.customerName}\n` +
          `${currentMode === 'pickup' ? '🏪 Самовывоз (Реутов, ул. Калинина, д. 8)' : '🚗 Доставка: ' + updatedFormData.address}\n` +
          `📱 ${updatedFormData.phone}\n` +
          `${updatedFormData.comment ? '💬 ' + updatedFormData.comment + '\n' : ''}` +
          `💰 Итого: ${total} ${settings.currency || '₽'}\n\n` +
          'Отправляю заказ? 🚀';
      
      default:
        return step.botMessage || '';
    }
  };

  const handleUserInput = (value) => {
    const currentStepData = getSteps()[currentStep];
    
    // Добавляем сообщение пользователя
    let userDisplayText = value;
    
    const userMessage = {
      type: 'user',
      text: userDisplayText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Обновляем данные формы
    const updatedFormData = { ...formData };
    
    if (currentStepData.field) {
      updatedFormData[currentStepData.field] = value;
    }
    
    setFormData(updatedFormData);
    setInputValue('');
    
    // Переходим к следующему шагу
    setTimeout(() => {
      const nextStepIndex = findNextStep(currentStep, updatedFormData);
      if (nextStepIndex < getSteps().length) {
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
    const steps = getSteps();
    const currentMode = localStorage.getItem('deliveryMode') || 'delivery';
    
    for (let i = currentIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      
      // Пропускаем шаг телефона если самовывоз (телефон уже введен на шаге delivery)
      if (step.skip && currentMode === 'pickup') {
        continue;
      }
      
      return i;
    }
    return steps.length;
  };

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ ЗАКАЗА
  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // ✅ СОЗДАЕМ ПРАВИЛЬНУЮ ДАТУ С ВРЕМЕНЕМ В НУЖНОМ ФОРМАТЕ
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Формат: 25.07.2025 19:51:45
      const formattedDateTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

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
        date: formattedDateTime  // ✅ ДОБАВЛЯЕМ ДАТУ С ВРЕМЕНЕМ В ПРАВИЛЬНОМ ФОРМАТЕ
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
    if (currentStep >= getSteps().length || isTyping) return null;
    
    const step = getSteps()[currentStep];
    
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

    // Определяем placeholder в зависимости от шага и режима доставки
    const currentMode = localStorage.getItem('deliveryMode') || 'delivery';
    let placeholder = step.placeholder;
    if (step.id === 'delivery' && currentMode === 'pickup') {
      placeholder = '+7 999 123 45 67';
    } else if (step.id === 'delivery' && currentMode === 'delivery') {
      placeholder = 'Улица, дом, квартира...';
    }

    return (
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div style={{ position: 'relative' }}>
          {step.type === 'textarea' ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
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
              type={(step.type === 'phone' || step.id === 'delivery' && currentMode === 'pickup') ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
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
        <div 
          ref={chatContainerRef}
          style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minHeight: '300px'
          }}
        >
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
          
          {/* Элемент для автоскролла */}
          <div ref={messagesEndRef} />
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
