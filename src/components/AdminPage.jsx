import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbytJQZKK_57WXTalemzNQgVmlcS_HajnL0vo-FxDT4DogOCLDnJ4vWl0GMp8oQCaOi0/exec';

// Рабочая админка с настоящим API
const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availablePasswords, setAvailablePasswords] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Получаем список админов из настоящего API
      const response = await fetch(`${API_URL}?action=getAdmins`);
      const admins = await response.json();
      
      console.log('Найденные админы:', admins); // Для отладки
      setAvailablePasswords(admins.map(a => a.passwordHash).filter(Boolean));
      
      // Проверяем пароль (убираем пробелы)
      const admin = admins.find(admin => 
        admin.passwordHash && admin.passwordHash.trim() === password.trim()
      );
      
      if (admin) {
        console.log('✅ Авторизация успешна!', admin);
        onLoginSuccess(admin);
      } else {
        setError('Неверный пароль');
        console.log('❌ Пароль не подошел');
        console.log('Доступные пароли:', admins.map(a => `"${a.passwordHash}"`));
        console.log('Введенный пароль:', `"${password}"`);
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c1e0f', marginBottom: '0.5rem' }}>
          Админ панель
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Добро пожаловать, Босс!
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль из таблицы..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
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
          💡 Введите пароль админа из Google Sheets (колонка passwordHash)
          
          {/* Отладочные кнопки */}
          {availablePasswords.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Быстрый вход (для отладки):
              </div>
              {availablePasswords.map((pass, index) => (
                <button
                  key={index}
                  onClick={() => setPassword(pass)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    margin: '0.25rem',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Использовать: "{pass}"
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SimpleAdminDashboard = ({ admin, onLogout }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c1e0f', margin: 0 }}>
            👑 Админ панель работает!
          </h1>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Добро пожаловать, {admin.login}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: '#ff5722',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#2c1e0f', marginBottom: '1rem' }}>
            Роутинг работает!
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Админка успешно загружается по адресу /#/admin<br/>
            Авторизация прошла успешно!<br/>
            Теперь можно заменить на полную версию с заказами
          </p>
          <button
            onClick={() => window.location.hash = '#/'}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Назад в магазин
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin_session');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('admin_session', JSON.stringify(adminData));
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
  };

  return admin ? (
    <SimpleAdminDashboard admin={admin} onLogout={handleLogout} />
  ) : (
    <AdminLogin onLoginSuccess={handleLoginSuccess} />
  );
};

export default AdminPage;
