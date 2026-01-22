import { useState, useEffect } from 'react';
import PageLogin from './pages/PageLogin';
import PageRegister from './pages/PageRegister';
import DashboardPage from './pages/PageDashboard';
import PageShiftLog from './pages/PageShiftLog';
import PageSetting from './pages/PageSetting';
import PageLeaderReport from './pages/PageLeaderReport';
import PageResetPassword from './pages/PageResetPassword';
import PageStaffManagement from './pages/PageStaffManagement';
import PageStoreManagement from './pages/PageStoreManagement';
import PageAnnouncementManagement from './pages/PageAnnouncementManagement';
import PageIncidentManagement from './pages/PageIncidentManagement';
import PageCareer from './pages/PageCareer';
import AnnouncementPopup from './components/AnnouncementPopup';
import AnnouncementBadge from './components/AnnouncementBadge';
import { authAPI } from './api/auth';
import TopMenu from './components/TopMenu';

function App() {
  const [currentPage, setCurrentPage] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetTokenInfo, setResetTokenInfo] = useState(null);

  useEffect(() => {
    // Kiểm tra token và lấy thông tin user
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then((res) => {
          if (res.success) {
            setUser(res.user);
            // Restore last page or default to HOME
            const lastPage = localStorage.getItem('lastPage');
            const validPages = ['HOME', 'SHIFT_LOG', 'DASHBOARD', 'SETTING', 'LEADER_REPORT', 'STAFF_MANAGEMENT', 'STORE_MANAGEMENT', 'ANNOUNCEMENT_MANAGEMENT', 'INCIDENT_MANAGEMENT', 'CAREER'];
            setCurrentPage(validPages.includes(lastPage) ? lastPage : 'HOME');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('lastPage');
        })
        .finally(() => setLoading(false));
    } else {
      // Check for Reset Password Token in URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const staffId = params.get('staffId');

      if (token && staffId) {
        setResetTokenInfo({ token, staffId });
        setCurrentPage('RESET_PASSWORD');
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    localStorage.setItem('lastPage', page);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    handleNavigate('HOME');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastPage');
    setUser(null);
    setCurrentPage('LOGIN');
    // Clear URL params if any
    window.history.replaceState({}, document.title, "/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'REGISTER':
        return <PageRegister onNavigate={handleNavigate} />;
      case 'HOME':
        return <DashboardPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'SHIFT_LOG':
        return <PageShiftLog user={user} onBack={() => handleNavigate('HOME')} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'DASHBOARD':
        return <DashboardPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'LEADER_REPORT':
        return <PageLeaderReport user={user} onNavigate={handleNavigate} />;
      case 'SETTING':
        return <PageSetting user={user} onNavigate={handleNavigate} />;
      case 'STAFF_MANAGEMENT':
        return <PageStaffManagement user={user} onBack={() => handleNavigate('SETTING')} />;
      case 'STORE_MANAGEMENT':
        return <PageStoreManagement user={user} onBack={() => handleNavigate('SETTING')} />;
      case 'CAREER':
        return <PageCareer user={user} onBack={() => handleNavigate('HOME')} />;
      case 'ANNOUNCEMENT_MANAGEMENT':
        return <PageAnnouncementManagement user={user} onBack={() => handleNavigate('SETTING')} />;
      case 'INCIDENT_MANAGEMENT':
        return <PageIncidentManagement user={user} onBack={() => handleNavigate('SETTING')} />;
      case 'RESET_PASSWORD':
        return <PageResetPassword token={resetTokenInfo?.token} staffId={resetTokenInfo?.staffId} onNavigate={(page) => {
          if (page === 'LOGIN') {
            window.history.replaceState({}, document.title, "/");
            setResetTokenInfo(null);
          }
          handleNavigate(page);
        }} />;
      default:
        return <PageLogin onLogin={handleLogin} onGoToRegister={() => handleNavigate('REGISTER')} />;
    }
  };

  return (
    <div className="container">
      <div className="card" id="main-card" style={{ position: 'relative' }}>
        {renderPage()}
        <TopMenu user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
      </div>
      {user && <AnnouncementPopup user={user} onClose={() => { }} />}
      {user && <AnnouncementBadge user={user} />}
    </div>
  );
}

export default App;
