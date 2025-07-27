import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbwpgkiVZN5JwPdSYj-jLVZHZ_A5sw8P6PV4QXR7DJWchwP-19z31WUjcv7QRaHMAazCxg/exec';

// ...другие импорты и функции (оставлены без изменений)...

const AdminDashboard = ({ admin, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loadError, setLoadError] = useState(null);

  let touchStartX = 0;
  const handleSwipe = (deltaX) => {
    const filters = ['pending', 'active', 'archive'];
    const index = filters.indexOf(activeFilter);
    const newIndex = deltaX < 0 ? Math.min(index + 1, filters.length - 1) : Math.max(index - 1, 0);
    if (index !== newIndex) setActiveFilter(filters[newIndex]);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setIsLoading(true);
        setLoadError(null);
      }
      const [ordersRes, statusRes] = await Promise.all([
        fetch(`${API_URL}?action=getOrders&t=${Date.now()}`),
        fetch(`${API_URL}?action=getStatusLabels&t=${Date.now()}`),
      ]);
      const ordersData = await ordersRes.json();
      const statusData = await statusRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setStatusLabels(Array.isArray(statusData) ? statusData : []);
      setLastOrderCount(ordersData.length);
      setLastUpdateTime(new Date());
    } catch (e) {
      if (!isAutoRefresh) setLoadError(e.message);
    } finally {
      if (!isAutoRefresh) setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'pending') return order.status === 'pending';
    if (activeFilter === 'active') return ['cooking', 'delivering'].includes(order.status);
    if (activeFilter === 'archive') return ['done', 'archived'].includes(order.status);
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#fdf0f2' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            background: '#fdf0f2',
            zIndex: 999,
            paddingTop: '1rem',
            paddingBottom: '1rem',
          }}
          onTouchStart={(e) => (touchStartX = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 50) handleSwipe(deltaX);
          }}
        >
          {[
            { key: 'pending', label: 'Новые' },
            { key: 'active', label: 'В работе' },
            { key: 'archive', label: 'Архив' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              style={{
                padding: '0.75rem 1.5rem',
                background:
                  activeFilter === key
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'white',
                color: activeFilter === key ? 'white' : '#666',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
            >
              {label} ({orders.filter(o =>
                key === 'pending' ? o.status === 'pending' :
                key === 'active' ? ['cooking', 'delivering'].includes(o.status) :
                ['done', 'archived'].includes(o.status)
              ).length})
            </button>
          ))}
        </div>

        {filteredOrders.map(order => (
          <div key={order.orderId} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 'bold' }}>#{order.orderId} • {order.status}</div>
            <div>{order.customerName}</div>
            <div>{order.total} ₽</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_session');
    if (saved) setAdmin(JSON.parse(saved));
  }, []);

  return admin ? <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} /> : <div>Login...</div>;
};

export default AdminPage;
