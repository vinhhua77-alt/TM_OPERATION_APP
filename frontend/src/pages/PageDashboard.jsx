import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/dashboard';

const PageDashboard = ({ user, onNavigate }) => {
  const [reportData, setReportData] = useState({
    totalLogs: 0,
    totalIncidents: 0,
    moodSummary: { "Rất ổn": 0, "Hơi căng": 0, "Quá tải": 0 },
    moodIcons: { "Rất ổn": "🟢", "Hơi căng": "🟡", "Quá tải": "🔴" }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.success && response.data) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="header">
        <h2 className="brand-title">BÁO CÁO NHANH</h2>
        <p className="sub-title-dev">Thống kê vận hành trong ngày</p>
      </div>

      {/* Thống kê số lượng */}
      <div className="grid-2 mt-10">
        <div style={{ background: '#F0F7FF', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#004AAD' }}>{loading ? '-' : reportData.totalLogs}</div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#888' }}>LƯỢT TRỰC</div>
        </div>
        <div style={{ background: '#FEF2F2', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#EF4444' }}>{loading ? '-' : reportData.totalIncidents}</div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#888' }}>SỰ CỐ</div>
        </div>
      </div>

      {/* Mood Summary */}
      <div className="section-title">NHỊP ĐỘ VẬN HÀNH</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 10px' }}>
        {Object.entries(reportData.moodSummary).map(([key, val]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>{reportData.moodIcons[key]}</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#2B2B2B' }}>{loading ? '-' : val}</div>
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#AAA', textTransform: 'uppercase' }}>{key}</div>
          </div>
        ))}
      </div>

      {/* Navigation Actions */}
      <div className="section-title">CHỨC NĂNG</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
        <button className="btn-login" onClick={() => onNavigate('SHIFT_LOG')} style={{ justifyContent: 'space-between', padding: '12px 20px' }}>
          <span>📝 VIẾT NHẬT KÝ CA</span>
          <span>➜</span>
        </button>

        {user?.role !== 'STAFF' && (
          <button className="btn-login btn-outline" onClick={() => onNavigate('LEADER_REPORT')} style={{ justifyContent: 'space-between', padding: '12px 20px' }}>
            <span>📈 LEADER REPORT</span>
            <span>➜</span>
          </button>
        )}
      </div>

      {/* REMOVED: QUAY LẠI TRANG CHỦ BUTTON */}
    </div>
  );
};

export default PageDashboard;
