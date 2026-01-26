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
import PageDailyReporting from './pages/PageDailyReporting';
import AnnouncementPopup from './components/AnnouncementPopup';
import { authAPI } from './api/auth';
import client from './api/client';
import TopMenu from './components/TopMenu';
import AppBar from './components/AppBar';
import LoadingSpinner from './components/LoadingSpinner';
import Breadcrumbs from './components/Breadcrumbs';
import PageGuide from './pages/PageGuide';
import PageAbout from './pages/PageAbout';
import PageRevenueConsole from './pages/PageRevenueConsole';
import PageOperationMetrics from './pages/PageOperationMetrics'; // [NEW]
import PageAdminConsole from './pages/PageAdminConsole';
import PageAnalytics from './pages/PageAnalytics';
import PageStoreSetup from './pages/PageStoreSetup';
import PageDecisionConsole from './pages/PageDecisionConsole'; // [NEW]
import Notification from './components/Notification';
import RoleImpersonator from './components/RoleImpersonator'; // [NEW]
import Page5SCompliance from './pages/Page5SCompliance'; // [RENAMED]

function App() {
  const [currentPage, setCurrentPage] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [realUser, setRealUser] = useState(null); // [NEW] Store original admin info
  const [loading, setLoading] = useState(true);
  const [resetTokenInfo, setResetTokenInfo] = useState(null);
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  // System Configuration (Feature Flags)
  const [sysConfig, setSysConfig] = useState({
    featureFlags: [],
    loaded: false
  });
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  useEffect(() => {
    // 1. Check authentication
    // 2. Load System Config (Feature Flags) - Move inside login success logic or check role
    const loadSystemConfig = () => {
      client.get('/master/active-features')
        .then(res => {
          if (res.success) {
            setSysConfig({ featureFlags: res.data, loaded: true });
          }
        })
        .catch(err => console.warn('System config restricted or unavailable', err.message));
    };

    authAPI.getMe()
      .then((res) => {
        if (res.success) {
          setUser(res.user);
          setRealUser(res.user); // [NEW]
          restoreLastPage();
          loadSystemConfig();
        } else {
          checkPasswordReset();
        }
      })
      .catch(() => checkPasswordReset())
      .finally(() => setLoading(false));

  }, []);

  const restoreLastPage = () => {
    const lastPage = localStorage.getItem('lastPage');
    const validPages = ['HOME', 'SHIFT_LOG', 'DASHBOARD', 'LEADER_REPORT', 'STAFF_MANAGEMENT', 'STORE_SETUP', 'ANNOUNCEMENT_MANAGEMENT', 'CAREER', 'GAMIFICATION', 'GUIDE', 'ABOUT', 'ADMIN_CONSOLE', 'ANALYTICS', 'DAILY_HUB', 'QAQC_HUB', 'REVENUE_CONSOLE', 'OPERATION_METRICS', 'DECISION_CONSOLE'];
    setCurrentPage(validPages.includes(lastPage) ? lastPage : 'HOME');
  };

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

  const notify = (message, type = 'info') => {
    setNotification({ message, type });
    // Auto-clear after 3 seconds
    setTimeout(() => setNotification({ message: '', type: 'info' }), 3000);
  };

  const handleLogin = (userData, token) => {
    // SECURITY: Switch to Bearer Token for cross-domain support
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    setRealUser(userData); // [NEW]
    handleNavigate('HOME');
  };

  const handleImpersonate = (role) => {
    if (!realUser || realUser.role !== 'ADMIN') return;
    setUser({ ...user, role });
    notify(`🛡️ Chế độ giả lập: Đang hiển thị UI với vai trò ${role}`, 'warning');
  };

  const handleImpersonateUser = (userData) => {
    if (!realUser || realUser.role !== 'ADMIN') return;
    setUser(userData);
    notify(`🎭 Giả lập: ${userData.staff_name} (${userData.role})`, 'warning');
  };

  const handleResetImpersonation = () => {
    setUser(realUser);
    notify('🔙 Đã quay lại vai trò Admin thực tế', 'info');
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
      case 'LEADER_REPORT':
        return <PageShiftLog user={user} onBack={() => handleNavigate('DAILY_HUB')} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'DASHBOARD':
        return <DashboardPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'STAFF_MANAGEMENT':
        return <PageStaffManagement user={user} onBack={() => handleNavigate('HOME')} />;
      case 'STORE_SETUP':
        return <PageStoreSetup user={user} onBack={() => handleNavigate('HOME')} />;
      case 'STORE_MANAGEMENT':
      case 'STORE_STORES':
      case 'STORE_CHECKLIST':
      case 'STORE_POSITIONS':
      case 'STORE_ROLES':
      case 'STORE_SHIFTS':
      case 'STORE_INCIDENTS':
      case 'STORE_LAYOUTS':
        return <PageStoreSetup user={user} onBack={() => handleNavigate('HOME')} />;
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
      case 'ADMIN_CONSOLE':
        if (user?.role !== 'ADMIN' && user?.role !== 'IT') return <DashboardPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
        return <PageAdminConsole user={user} onBack={() => handleNavigate('HOME')} />;
      case 'LAB_FEATURES':
        if (user?.role !== 'ADMIN' && user?.role !== 'IT') return <DashboardPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
        return <PageAdminConsole user={user} initialTab="lab" onBack={() => handleNavigate('HOME')} />;
      case 'ANALYTICS':
        return <PageAnalytics user={user} onBack={() => handleNavigate('HOME')} />;
      case 'DAILY_HUB':
        return <PageDailyReporting user={user} onBack={() => handleNavigate('HOME')} onNavigate={handleNavigate} sysConfig={sysConfig} />;
      case 'QAQC_HUB':
        return <Page5SCompliance user={user} onBack={() => handleNavigate('DAILY_HUB')} onNavigate={handleNavigate} />;
      case 'REVENUE_CONSOLE':
        return <PageRevenueConsole user={user} onBack={() => handleNavigate('HOME')} />;
      case 'OPERATION_METRICS':
        return <PageOperationMetrics user={user} onBack={() => handleNavigate('HOME')} />;
      case 'DECISION_CONSOLE':
        return <PageDecisionConsole user={user} onBack={() => handleNavigate('HOME')} />;
      case 'ANALYTICS_LEADER':
        return <PageAnalytics user={user} viewMode="leader" onBack={() => handleNavigate('HOME')} />;
      case 'ANALYTICS_SM':
        return <PageAnalytics user={user} viewMode="sm" onBack={() => handleNavigate('HOME')} />;
      case 'ANALYTICS_OPS':
        return <PageAnalytics user={user} viewMode="ops" onBack={() => handleNavigate('HOME')} />;
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
          sysConfig={sysConfig}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          showMenu={showMenu}
          onClose={() => setShowMenu(false)}
          notify={notify}
        />
      </div>

      {/* Announcement Popup */}
      {user && showAnnouncements && <AnnouncementPopup user={user} onClose={() => setShowAnnouncements(false)} />}

      {/* Notification Toast */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />
      )}

      {/* BottonNav REMOVED as requested */}

      {/* ADMIN ROLE IMPERSONATOR */}
      {realUser?.role === 'ADMIN' && sysConfig.featureFlags.includes('MODULE_DIVINE_MODE') && (
        <RoleImpersonator
          currentRole={user?.role}
          onRoleChange={handleImpersonate}
          onUserChange={handleImpersonateUser}
          onReset={handleResetImpersonation}
        />
      )}
    </div>
  );
}

export default App;
