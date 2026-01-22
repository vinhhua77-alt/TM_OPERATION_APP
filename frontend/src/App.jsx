import { useState, useEffect } from 'react';
import PageLogin from './pages/PageLogin';
import PageRegister from './pages/PageRegister';
import DashboardPage from './pages/PageDashboard';
import PageShiftLog from './pages/PageShiftLog';
import PageLeaderReport from './pages/PageLeaderReport';
import PageResetPassword from './pages/PageResetPassword';
import PageStaffManagement from './pages/PageStaffManagement';
import PageStoreManagement from './pages/PageStoreManagement';
import PageAnnouncementManagement from './pages/PageAnnouncementManagement';
import PageIncidentManagement from './pages/PageIncidentManagement';
import PageCareer from './pages/PageCareer';
import PageGamification from './pages/PageGamification';
import AnnouncementPopup from './components/AnnouncementPopup';
import { authAPI } from './api/auth';
import TopMenu from './components/TopMenu';
import AppBar from './components/AppBar';
import LoadingSpinner from './components/LoadingSpinner';
import Breadcrumbs from './components/Breadcrumbs';
import PageGuide from './pages/PageGuide';
import PageAbout from './pages/PageAbout';

function App() {
  const [currentPage, setCurrentPage] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetTokenInfo, setResetTokenInfo] = useState(null);
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // SECURITY: Check authentication via HttpOnly cookie (backend validates)
    authAPI.getMe()
      .then((res) => {
        if (res.success) {
          setUser(res.user);
          // Restore last page or default to HOME
          const lastPage = localStorage.getItem('lastPage');
          const validPages = ['HOME', 'SHIFT_LOG', 'DASHBOARD', 'LEADER_REPORT', 'STAFF_MANAGEMENT', 'STORE_MANAGEMENT', 'ANNOUNCEMENT_MANAGEMENT', 'INCIDENT_MANAGEMENT', 'CAREER', 'GAMIFICATION', 'GUIDE', 'ABOUT'];
          setCurrentPage(validPages.includes(lastPage) ? lastPage : 'HOME');
        } else {
          // Not authenticated, check for password reset
          checkPasswordReset();
        }
      })
      .catch(() => {
        // Not authenticated, check for password reset
        checkPasswordReset();
      })
      .finally(() => setLoading(false));
  }, []);

  const checkPasswordReset = () => {
    // Check for Reset Password Token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const staffId = params.get('staffId');

    if (token && staffId) {
      setResetTokenInfo({ token, staffId });
      setCurrentPage('RESET_PASSWORD');
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    localStorage.setItem('lastPage', page);
  };

  const handleLogin = (userData, token) => {
    // SECURITY: Switch to Bearer Token for cross-domain support
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    handleNavigate('HOME');
  };

  const handleLogout = async () => {
    try {
      // SECURITY: Call backend to clear HttpOnly cookie
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API call fails
    }

    // Clear state regardless of backend success
    setUser(null);
    handleNavigate('LOGIN');
    localStorage.removeItem('lastPage');
    localStorage.removeItem('token'); // Clear auth token
    // Clear URL params if any
    window.history.replaceState({}, document.title, "/");
  };

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
      case 'STAFF_MANAGEMENT':
        return <PageStaffManagement user={user} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'STORE_MANAGEMENT':
        return <PageStoreManagement user={user} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'CAREER':
        return <PageCareer user={user} onBack={() => handleNavigate('HOME')} />;
      case 'GAMIFICATION':
        return <PageGamification user={user} onBack={() => handleNavigate('HOME')} />;
      case 'ANNOUNCEMENT_MANAGEMENT':
        return <PageAnnouncementManagement user={user} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'INCIDENT_MANAGEMENT':
        return <PageIncidentManagement user={user} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'GUIDE':
        return <PageGuide onBack={() => handleNavigate('HOME')} />;
      case 'ABOUT':
        return <PageAbout onBack={() => handleNavigate('HOME')} />;
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container" style={{ padding: currentPage === 'LOGIN' ? '0' : undefined }}>
      {/* Global AppBar - Hide on Login */}
      {currentPage !== 'LOGIN' && (
        <AppBar
          user={user}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onMenuToggle={() => setShowMenu(!showMenu)}
        />
      )}

      {/* Main Content with top padding for AppBar */}
      <div
        className="card"
        id="main-card"
        style={{
          position: 'relative',
          paddingTop: currentPage === 'LOGIN' ? '0' : '56px',
          background: currentPage === 'LOGIN' ? 'transparent' : undefined,
          boxShadow: currentPage === 'LOGIN' ? 'none' : undefined,
          minHeight: currentPage === 'LOGIN' ? '100vh' : undefined // Ensure full height on login
        }}
      >
        <Breadcrumbs currentPage={currentPage} onNavigate={handleNavigate} />
        {renderPage()}
        <TopMenu
          user={user}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          showMenu={showMenu}
          onClose={() => setShowMenu(false)}
        />
      </div>

      {/* Announcement Popup */}
      {user && showAnnouncements && <AnnouncementPopup user={user} onClose={() => setShowAnnouncements(false)} />}

      {/* BottomNav REMOVED as requested */}
    </div>
  );
}

export default App;
