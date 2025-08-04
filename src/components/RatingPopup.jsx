// components/RatingPopup.jsx
import { useState } from 'react';

const RatingPopup = ({ isOpen, onClose, productName, onRatingSubmit }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    setIsSubmitted(true);
    onRatingSubmit(rating);
    
    // Определяем сообщение в зависимости от оценки
    if (rating >= 4) {
      setMessage('Спасибо за оценку! 😊');
    } else if (rating === 3) {
      setMessage('Мы сожалеем, облажались, дайте нам еще шанс, мы все исправим! Вы - наше сокровище! 💖');
    } else {
      setMessage('Мы очень сожалеем, что блюдо Вам не понравилось! Пожалуйста, напишите нам на WhatsApp, мы хотим все исправить и стать лучше 📱');
    }
    
    // Закрываем попап через 3 секунды
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setSelectedRating(0);
      setHoverRating(0);
    }, 3000);
  };

  if (!isOpen) return null;

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
      zIndex: 10000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        transform: isSubmitted ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }} onClick={(e) => e.stopPropagation()}>
        
        {!isSubmitted ? (
          <>
            <h3 style={{
              color: '#2c1e0f',
              fontSize: '1.5rem',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Оцените блюдо
            </h3>
            
            <p style={{
              color: '#666',
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              {productName}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '2rem'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2.5rem',
                    cursor: 'pointer',
                    color: (hoverRating || selectedRating) >= star ? '#FFD700' : '#ddd',
                    transform: (hoverRating || selectedRating) >= star ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRatingClick(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: '#f0f0f0',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '1rem'
              }}
            >
              Отмена
            </button>
          </>
        ) : (
          <div style={{
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {selectedRating >= 4 ? '🎉' : selectedRating === 3 ? '💝' : '🤝'}
            </div>
            
            <p style={{
              color: '#2c1e0f',
              fontSize: '1.2rem',
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              {message}
            </p>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default RatingPopup;
