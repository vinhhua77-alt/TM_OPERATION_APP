import { useState, useEffect } from 'react';
import PageLogin from './pages/PageLogin';
import PageRegister from './pages/PageRegister';
import DashboardPage from './pages/PageDashboard';
import PageShiftLog from './pages/PageShiftLog';
import PageSetting from './pages/PageSetting';
import PageLeaderReport from './pages/PageLeaderReport';
import { authAPI } from './api/auth';
import TopMenu from './components/TopMenu';

function App() {
  const [currentPage, setCurrentPage] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            const validPages = ['HOME', 'SHIFT_LOG', 'DASHBOARD', 'SETTING', 'LEADER_REPORT'];
            setCurrentPage(validPages.includes(lastPage) ? lastPage : 'HOME');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('lastPage');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
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
    </div>
  );
}

export default App;
