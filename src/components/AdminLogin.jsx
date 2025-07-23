import { useState } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxAQF0sfNYonRjjH3zFBW58gkXZ3u5mKZWUtDyspY3uyHxFc-WnZB13Hz8IH1w-h3bG2Q/exec';

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Получаем список админов так
      const response = await fetch(`${API_URL}?action=getAdmins`);
      const admins = await response.json();
      
      // Проверяем пароль (простая проверка по passwordHash)
      const admin = admins.find(admin => admin.passwordHash === password);
      
      if (admin) {
        onLoginSuccess(admin);
      } else {
        setError('Неверный пароль');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка подключения к серверу');
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          👑
        </div>
        
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#2c1e0f',
          marginBottom: '0.5rem'
        }}>
          Админ панель
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '2rem'
        }}>
          Добро пожаловать, Босс!
        </p>

        <form onSubmit={handleLogin}>
          <div style={{
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: isLoading 
                ? 'linear-gradient(135deg, #ccc, #999)' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {isLoading ? '🔐 Проверяю...' : '🚀 Войти в систему'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          💡 Введите пароль админа для доступа к панели управления заказами
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
