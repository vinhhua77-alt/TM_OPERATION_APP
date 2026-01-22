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
  // ... (existing state)

  // ... (existing useEffects & handlers)

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
