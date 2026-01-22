import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/dashboard';

const PageDashboard = ({ user, onNavigate, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user?.id && !isInitialized) {
      console.log('Loading available months for user:', user.id);
      loadAvailableMonths();
      setIsInitialized(true);
    }
  }, [user?.id, isInitialized]);

  useEffect(() => {
    if (user?.id && selectedMonth && isInitialized) {
      console.log('Loading dashboard for month:', selectedMonth);
      loadDashboard();
    }
  }, [selectedMonth]);

  const loadAvailableMonths = async () => {
    try {
      console.log('Fetching available months...');
      const res = await dashboardAPI.getAvailableMonths(user.id);
      console.log('Available months response:', res);

      if (res.success && res.data?.length > 0) {
        setAvailableMonths(res.data);
        // Set current month as default
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
      } else {
        // No shifts yet, set current month only
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
        setAvailableMonths([currentMonth]);
      }
    } catch (error) {
      console.error('Error loading months:', error);
      setError('Không thể tải danh sách tháng');
      // Fallback to current month only
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(currentMonth);
      setAvailableMonths([currentMonth]);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data...');
      const res = await dashboardAPI.getDashboard(user.id, selectedMonth);
      console.log('Dashboard response:', res);

      if (res.success) {
        setDashboardData(res.data);
      } else {
        setError(res.error || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Lỗi kết nối: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatMonthDisplay = (yearMonth) => {
    if (!yearMonth) return '';
    const [year, month] = yearMonth.split('-');
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  const getFeelingIcon = (feeling) => {
    const icons = { OK: '🟢', BUSY: '🟡', FIXED: '🟠', OPEN: '🔴', OVER: '⚫' };
    return icons[feeling] || '⚪';
  };

  const getFeelingLabel = (feeling) => {
    const labels = { OK: 'Ổn', BUSY: 'Bận', FIXED: 'Đã xử lý', OPEN: 'Cần hỗ trợ', OVER: 'Quá tải' };
    return labels[feeling] || feeling;
  };

  // Quick Actions Menu Data
  const menuItems = [
    { id: 'SHIFT_LOG', label: 'Báo Cáo Ca', icon: '📝', color: '#4F46E5' },
    { id: 'LEADER_REPORT', label: 'Báo Cáo Leader', icon: '📈', color: '#059669' },
    { id: 'CAREER', label: 'Hồ Sơ Năng Lực', icon: '🏆', color: '#DB2777' },
    { id: 'SETTING', label: 'Cấu Hình', icon: '🔧', color: '#4B5563' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="header">
        <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
        <h2 className="brand-title">🚀 WORKSPACE CỦA BẠN</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="sub-title-dev">Xin chào, {user?.name}! 👋</p>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Đăng xuất</button>
        </div>
      </div>

      {/* Current Month Display */}
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#004AAD',
          padding: '10px',
          background: '#F3F4F6',
          borderRadius: '8px',
          border: '2px solid #E5E7EB'
        }}>
          📅 {formatMonthDisplay(selectedMonth)}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px', fontWeight: '600' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '14px', color: '#666' }}>
          ⌛ Đang tải...
        </div>
      ) : dashboardData ? (
        <>
          {/* Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <StatCard label="Số ca" value={dashboardData.stats.totalShifts} icon="📅" color="#4F46E5" />
            <StatCard label="Tổng giờ" value={`${dashboardData.stats.totalHours} h`} icon="⏰" color="#059669" />
            <StatCard label="TB/Ca" value={`${dashboardData.stats.avgDuration} h`} icon="📊" color="#F59E0B" />
            <StatCard label="Đánh giá" value={`${dashboardData.stats.avgRating}⭐`} icon="🌟" color="#EF4444" />
          </div>

          {/* Feelings Distribution */}
          {dashboardData.stats.totalShifts > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: '#111' }}>🎯 Cảm nhận gần đây</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(dashboardData.feelings).map(([feeling, percentage]) => (
                  percentage > 0 && (
                    <div key={feeling} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{getFeelingIcon(feeling)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600' }}>{getFeelingLabel(feeling)}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#004AAD' }}>{percentage}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percentage}% `, background: '#004AAD', borderRadius: '3px', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Gamification Stats */}
          {dashboardData.gamification && (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '16px', marginBottom: '16px', color: 'white' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px' }}>🏆 Thành tích</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800' }}>Level {dashboardData.gamification.level}</span>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>{dashboardData.gamification.xp} / {dashboardData.gamification.nextLevelXp} XP</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${dashboardData.gamification.progress}% `, background: 'white', borderRadius: '4px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
                <div>🔥 Streak: <strong>{dashboardData.gamification.streak} ngày</strong></div>
                <div>🏅 Huy hiệu: <strong>{dashboardData.gamification.badges}</strong></div>
              </div>
            </div>
          )}

          {/* Recent Shifts */}
          {dashboardData.recentShifts?.length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: '#111' }}>📝 Ca làm gần đây</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dashboardData.recentShifts.map((shift, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#F9FAFB', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>{shift.date}</span>
                      <span style={{ fontSize: '10px', background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{shift.layout}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>{shift.duration}h</span>
                      <span style={{ fontSize: '14px' }}>{getFeelingIcon(shift.rating)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data Message */}
          {dashboardData.stats.totalShifts === 0 && (
            <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center', borderLeft: '4px solid #4F46E5' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                Chưa có dữ liệu cho tháng này. Hãy bắt đầu báo cáo ca làm việc! 🚀
              </p>
            </div>
          )}
        </>
      ) : null}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '20px' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '20px', borderRadius: '12px', border: 'none',
              background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer', transition: 'transform 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: item.color }}>{item.label}</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
        TM Operation App v2.0<br />
        Developed by Vinh Gà - 2026
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color} `
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>{label}</span>
      <span style={{ fontSize: '20px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: '800', color: color }}>{value}</div>
  </div>
);

export default PageDashboard;
