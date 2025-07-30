// PrintSystem.jsx - Система печати заказов
import React, { useState } from 'react';

// Компонент для генерации PDF
export const PrintOrderModal = ({ order, isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('receipt');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !order) return null;

  const formats = [
    {
      id: 'receipt',
      name: 'Чек 75×120мм',
      icon: '🧾',
      description: 'Для принтеров чеков'
    },
    {
      id: 'a4',
      name: 'A4 формат',
      icon: '📄',
      description: 'Для обычных принтеров'
    }
  ];

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Создаем HTML контент для печати
      const printContent = generatePrintHTML(order, selectedFormat);
      
      // Создаем новое окно для печати
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Ждем загрузки и печатаем
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
      onClose();
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      alert('Ошибка при создании документа для печати');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrintHTML = (order, format) => {
    const products = JSON.parse(order.products || '[]');
    const isReceipt = format === 'receipt';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Заказ #${order.orderId}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: ${isReceipt ? '12px' : '14px'};
            line-height: 1.4;
            ${isReceipt ? 'width: 75mm; margin: 0 auto;' : 'max-width: 210mm; margin: 0 auto; padding: 20mm;'}
            background: white;
            color: black;
          }
          
          .header {
            text-align: center;
            margin-bottom: ${isReceipt ? '10px' : '20px'};
            border-bottom: ${isReceipt ? '1px dashed #000' : '2px solid #000'};
            padding-bottom: ${isReceipt ? '5px' : '10px'};
          }
          
          .restaurant-name {
            font-size: ${isReceipt ? '16px' : '24px'};
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .order-info {
            margin: ${isReceipt ? '10px 0' : '20px 0'};
          }
          
          .order-number {
            font-size: ${isReceipt ? '14px' : '18px'};
            font-weight: bold;
            text-align: center;
            margin-bottom: ${isReceipt ? '5px' : '10px'};
          }
          
          .customer-info {
            margin-bottom: ${isReceipt ? '10px' : '15px'};
          }
          
          .products {
            border-top: ${isReceipt ? '1px dashed #000' : '1px solid #000'};
            border-bottom: ${isReceipt ? '1px dashed #000' : '1px solid #000'};
            padding: ${isReceipt ? '5px 0' : '10px 0'};
            margin: ${isReceipt ? '10px 0' : '15px 0'};
          }
          
          .product-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: ${isReceipt ? '3px' : '5px'};
            ${isReceipt ? '' : 'padding: 2px 0;'}
          }
          
          .product-name {
            flex: 1;
            margin-right: 10px;
          }
          
          .product-price {
            white-space: nowrap;
            font-weight: bold;
          }
          
          .product-details {
            font-size: ${isReceipt ? '10px' : '12px'};
            color: #666;
            margin-left: 5px;
          }
          
          .total {
            text-align: right;
            font-size: ${isReceipt ? '14px' : '18px'};
            font-weight: bold;
            margin-top: ${isReceipt ? '5px' : '10px'};
          }
          
          .footer {
            text-align: center;
            margin-top: ${isReceipt ? '10px' : '20px'};
            font-size: ${isReceipt ? '10px' : '12px'};
            border-top: ${isReceipt ? '1px dashed #000' : '1px solid #000'};
            padding-top: ${isReceipt ? '5px' : '10px'};
          }
          
          .pickup-notice {
            background: #ffeeee;
            border: 2px solid #ff4444;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            margin: 10px 0;
            font-size: ${isReceipt ? '12px' : '16px'};
          }
          
          @media print {
            body {
              ${isReceipt ? 'width: 75mm;' : ''}
            }
            
            .pickup-notice {
              background: #f0f0f0 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">🍕 РЕСТОРАН</div>
          <div>Заказ для ${order.customerName}</div>
        </div>
        
        <div class="order-info">
          <div class="order-number">ЗАКАЗ #${order.orderId}</div>
          <div>Дата: ${order.date ? new Date(order.date).toLocaleString('ru-RU') : 'Не указана'}</div>
        </div>
        
        <div class="customer-info">
          <div><strong>Клиент:</strong> ${order.customerName}</div>
          <div><strong>Телефон:</strong> ${order.phone || 'Не указан'}</div>
          <div><strong>Адрес:</strong> ${order.address}</div>
          ${order.comment ? `<div><strong>Комментарий:</strong> ${order.comment}</div>` : ''}
        </div>
        
        ${order.address && order.address.toLowerCase().includes('самовывоз') ? 
          '<div class="pickup-notice">🔥 СРОЧНО! САМОВЫВОЗ 🔥</div>' : ''}
        
        <div class="products">
          <div style="font-weight: bold; margin-bottom: ${isReceipt ? '5px' : '10px'};">Состав заказа:</div>
          ${products.map(item => `
            <div class="product-item">
              <div class="product-name">
                ${item.name}
                ${item.name.includes('⚡') ? ' [FLASH]' : ''}
                ${item.name.includes('🎉') ? ' [БЕСПЛАТНО]' : ''}
                <div class="product-details">${item.quantity} × ${item.price} ₽</div>
              </div>
              <div class="product-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
            </div>
          `).join('')}
        </div>
        
        <div class="total">
          ИТОГО: ${parseInt(order.total).toLocaleString()} ₽
        </div>
        
        <div class="footer">
          <div>Спасибо за заказ!</div>
          <div>Время печати: ${new Date().toLocaleString('ru-RU')}</div>
          ${isReceipt ? '<div>- - - - - - - - - - - -</div>' : ''}
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2c1e0f',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🖨️ Печать заказа #{order.orderId}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#999',
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#2c1e0f'
          }}>
            Выберите формат печати:
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {formats.map((format) => (
              <label
                key={format.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  border: selectedFormat === format.id ? '2px solid #667eea' : '2px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: selectedFormat === format.id ? '#f8f9ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.id}
                  checked={selectedFormat === format.id}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.5rem',
                  marginRight: '1rem'
                }}>
                  {format.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: 'bold',
                    color: selectedFormat === format.id ? '#667eea' : '#2c1e0f'
                  }}>
                    {format.name}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    {format.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            Отмена
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            style={{
              padding: '0.75rem 1.5rem',
              background: isGenerating 
                ? 'linear-gradient(135deg, #ccc, #999)' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isGenerating ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Генерирую...
              </>
            ) : (
              <>
                📥 Печать
              </>
            )}
          </button>
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Информация:</div>
          <div>• Формат чека оптимален для термопринтеров 58-80мм</div>
          <div>• Формат A4 подходит для обычных принтеров и сохранения</div>
          <div>• После нажатия "Печать" откроется окно предварительного просмотра</div>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

// Компонент кнопки печати
export const PrintButton = ({ order, onPrintClick }) => {
  return (
    <button
      onClick={onPrintClick}
      title={`Печать заказа #${order.orderId}`}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'linear-gradient(135deg, #28a745, #20c997)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        width: '36px',
        height: '36px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
        transition: 'all 0.2s ease',
        zIndex: 5
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
      }}
    >
      🖨️
    </button>
  );
};
