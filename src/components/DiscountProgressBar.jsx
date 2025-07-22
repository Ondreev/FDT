const DiscountProgressBar = ({ subtotal, discounts, settings }) => {
  if (!discounts || discounts.length === 0) return null;

  // Находим ближайшую БОЛЬШУЮ скидку (мотивируем увеличивать чек)
  const nextDiscount = discounts
    .filter(d => d.minTotal > subtotal)
    .sort((a, b) => a.minTotal - b.minTotal)[0];

  // Находим текущую скидку
  const currentDiscount = discounts
    .filter(d => d.minTotal <= subtotal)
    .sort((a, b) => b.minTotal - a.minTotal)[0];

  // Если достигли максимальной скидки - показываем достижение, но не прогрессбар
  if (!nextDiscount && currentDiscount) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #6f42c1, #e83e8c)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        textAlign: 'center',
        border: '2px solid #ffd700',
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          👑 МАКСИМАЛЬНАЯ СКИДКА {currentDiscount.discountPercent}%!
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Экономия: {Math.round(subtotal * currentDiscount.discountPercent / 100)} {settings.currency || '₽'}
        </div>
      </div>
    );
  }

  // Если есть следующая цель - показываем прогрессбар к ней
  if (nextDiscount) {
    const remaining = nextDiscount.minTotal - subtotal;
    const startPoint = currentDiscount ? currentDiscount.minTotal : 0;
    const progress = Math.min(((subtotal - startPoint) / (nextDiscount.minTotal - startPoint)) * 100, 100);

    return (
      <div style={{
        background: currentDiscount 
          ? 'linear-gradient(135deg, #d1ecf1, #bee5eb)' // Если уже есть скидка - голубоватый фон
          : 'linear-gradient(135deg, #fff3cd, #ffeaa7)', // Если скидки нет - жёлтый фон
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        border: `2px dashed ${currentDiscount ? '#17a2b8' : '#f39c12'}`,
      }}>
        {/* Показываем текущую скидку, если есть */}
        {currentDiscount && (
          <div style={{
            textAlign: 'center',
            marginBottom: '0.75rem',
            padding: '0.5rem',
            background: 'rgba(23, 162, 184, 0.1)',
            borderRadius: '8px',
            color: '#0c5460',
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              🎉 Сейчас скидка {currentDiscount.discountPercent}%
            </div>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.75rem',
          color: currentDiscount ? '#0c5460' : '#856404'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
            До скидки {nextDiscount.discountPercent}%
          </div>
          <div style={{ fontWeight: 'bold', color: '#d63384' }}>
            ещё {remaining} {settings.currency || '₽'}
          </div>
        </div>
        
        <div style={{
          background: '#fff',
          borderRadius: '999px',
          height: '10px',
          overflow: 'hidden',
          marginBottom: '0.5rem',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            background: currentDiscount 
              ? 'linear-gradient(90deg, #17a2b8, #20c997)' 
              : 'linear-gradient(90deg, #ff7f32, #ff6b47)',
            height: '100%',
            width: `${Math.max(progress, 5)}%`, // Минимум 5% для видимости
            borderRadius: '999px',
            transition: 'width 0.3s ease',
            position: 'relative',
          }}>
            {/* Блестящий эффект */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              borderRadius: '999px',
            }} />
          </div>
        </div>
        
        <div style={{ 
          fontSize: '0.85rem', 
          color: currentDiscount ? '#0c5460' : '#856404',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {currentDiscount 
            ? `Увеличьте заказ и получите ещё больше скидки! 🚀`
            : 'Добавьте ещё товаров и получите скидку! 💰'
          }
        </div>
      </div>
    );
  }

  return null;
};

export default DiscountProgressBar;
