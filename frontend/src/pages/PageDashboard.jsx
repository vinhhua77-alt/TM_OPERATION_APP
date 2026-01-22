import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/dashboard';
import { staffAPI } from '../api/staff';

const PageDashboard = ({ user, onNavigate, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.id && !isInitialized) {
      console.log('Loading available months for user:', user.id);
      loadAvailableMonths();
      // Load pending approvals for authorized roles
      if (['SM', 'ADMIN', 'OPS', 'BOD'].includes(user?.role)) {
        loadPendingApprovals();
      }
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

  const loadPendingApprovals = async () => {
    try {
      const res = await staffAPI.getStatistics();
      if (res.success && res.data) {
        setPendingCount(res.data.pending || 0);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
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



  return (
    <div className="fade-in">
      {/* Header */}
      {/* Header Compact */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: '800', color: '#004AAD' }}>Xin chào, {user?.name || 'Bạn'}! 👋</p>
          <p style={{ fontSize: '11px', color: '#6B7280' }}>Chúc bạn một ngày làm việc hiệu quả.</p>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Đăng xuất</button>
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

      {/* Pending Approvals Alert (for SM/Admin/OPS/BOD) */}
      {['SM', 'ADMIN', 'OPS', 'BOD'].includes(user?.role) && pendingCount > 0 && (
        <div
          onClick={() => onNavigate('STAFF_MANAGEMENT')}
          style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1px solid #F59E0B',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '24px' }}>⚠️</div> {/* Smaller icon */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', marginBottom: '2px' }}>
                Cần duyệt: {pendingCount} nhân viên
              </div>
              <div style={{ fontSize: '10px', color: '#B45309' }}>
                Nhấn để xem ngay
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        // SKELETON LOADING STATE - Prevents Layout Shift
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[1, 2, 3, 4].map(k => (
              <div key={k} style={{ height: '80px', background: '#F3F4F6', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
          <div style={{ height: '150px', background: '#F3F4F6', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ height: '100px', background: '#F3F4F6', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
          <style>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}</style>
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
