import { useState } from 'react';
import AnnouncementBadge from './AnnouncementBadge';

const AppBar = ({ user, currentPage, onNavigate, onMenuToggle }) => {
    const primaryColor = '#004AAD';
    const isSandbox = localStorage.getItem('sandbox_mode') === 'true';

    // Determine page title based on current page
    const getPageTitle = () => {
        const titles = {
            'HOME': '🏠 WORKSPACE',
            'DASHBOARD': '🏠 WORKSPACE',
            'SHIFT_LOG': '📝 NHẬT KÝ CA TRỰC',
            'LEADER_REPORT': '📈 LEADER REPORT',
            'GAMIFICATION': '🏅 THÀNH TÍCH',
            'CAREER': '🏆 HỒ SƠ NĂNG LỰC',
            'SETTING': '⚙️ CẤU HÌNH',
            'STAFF_MANAGEMENT': '👥 QUẢN LÝ NHÂN SỰ',
            'STORE_MANAGEMENT': '🏪 QUẢN LÝ CỬA HÀNG',
            'ANNOUNCEMENT_MANAGEMENT': '📢 QUẢN LÝ THÔNG BÁO',
            'INCIDENT_MANAGEMENT': '⚠️ QUẢN LÝ SỰ CỐ',
            'LOGIN': '🔐 ĐĂNG NHẬP',
            'REGISTER': '📝 ĐĂNG KÝ'
        };
        return titles[currentPage] || '🏠 WORKSPACE';
    };

    const isHomePage = ['HOME', 'DASHBOARD'].includes(currentPage);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            background: isSandbox
                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' // Amber/Orange for Sandbox
                : 'linear-gradient(135deg, #004AAD 0%, #0066CC 100%)',
            boxShadow: isSandbox
                ? '0 2px 12px rgba(217, 119, 6, 0.4)'
                : '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            color: 'white'
        }}>
            {/* Left: Hamburger Menu */}
            <div style={{ width: '48px', display: 'flex', alignItems: 'center' }}>
                {user && (
                    <button
                        onClick={onMenuToggle}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            width: '40px',
                            height: '40px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                        ☰
                    </button>
                )}
            </div>

            {/* Center: Logo or Page Title */}
            <div
                onClick={() => onNavigate('DASHBOARD')}
                style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: isHomePage ? '14px' : '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    userSelect: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                {isHomePage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                                src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91"
                                alt="TMG Logo"
                                style={{ height: '20px', filter: 'brightness(0) invert(1)' }}
                            />
                            <span style={{ fontSize: '12px', letterSpacing: '0.05em' }}>THÁI MẬU GROUP</span>
                            {isSandbox && (
                                <span style={{
                                    background: 'white',
                                    color: '#d97706',
                                    fontSize: '8px',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    fontWeight: '900',
                                    marginLeft: '4px'
                                }}>SANDBOX</span>
                            )}
                        </div>
                        {user && (
                            <div style={{ fontSize: '9px', fontWeight: '400', opacity: 0.8, marginTop: '-2px' }}>
                                {isSandbox ? '🧪 Chế độ thử nghiệm an toàn' : `Chúc ${user.full_name?.split(' ').pop()} một ngày tốt lành! ⚡`}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {getPageTitle()}
                        {isSandbox && (
                            <span style={{
                                background: 'white',
                                color: '#d97706',
                                fontSize: '8px',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontWeight: '900'
                            }}>SANDBOX</span>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Notification Bell */}
            <div style={{ width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {user && <AnnouncementBadge user={user} />}
            </div>
        </div>
    );
};

export default AppBar;
