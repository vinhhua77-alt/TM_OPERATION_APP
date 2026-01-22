import { useState } from 'react';

const TopMenu = ({ user, onNavigate, onLogout, showMenu, onClose }) => {
    const [expandedConfigs, setExpandedConfigs] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    // Sidebar styling constants
    const sidebarWidth = '280px';
    const primaryColor = '#004AAD';

    // Close menu helper
    const closeMenu = () => {
        onClose();
    };

    // Menu content component
    const MenuContent = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: showMenu ? 0 : `-${sidebarWidth}`, // Slide in/out
            bottom: 0,
            width: sidebarWidth,
            background: '#FFFFFF',
            zIndex: 1001,
            boxShadow: showMenu ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* 1. Header: User Info */}
            <div style={{
                padding: '24px 20px',
                background: 'linear-gradient(135deg, #004AAD 0%, #0066CC 100%)',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Simplified Avatar */}
                    <div style={{
                        width: '48px',
                        height: '48px',
                        flexShrink: 0, // Prevent shrinking
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    {/* User Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: '1.2' }}>
                            {user?.name || 'Khách'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                            <span style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: '600'
                            }}>
                                {user?.role || 'Guest'}
                            </span>
                            <span style={{ opacity: 0.9 }}>
                                {user?.store_code || 'TMG'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Scrollable Menu Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>

                {/* Section: Main */}
                <div style={{ padding: '0 20px', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Menu Chính
                </div>

                <MenuItem
                    icon="🏠"
                    label="Trang chủ Workspace"
                    onClick={() => { closeMenu(); onNavigate('HOME'); }}
                />

                <MenuItem
                    icon="📝"
                    label="Nhật ký ca trực"
                    onClick={() => { closeMenu(); onNavigate('SHIFT_LOG'); }}
                />

                <MenuItem
                    icon="🏅"
                    label="Thành tích Game"
                    onClick={() => { closeMenu(); onNavigate('GAMIFICATION'); }}
                />

                <MenuItem
                    icon="🏆"
                    label="Hồ sơ năng lực (Career)"
                    onClick={() => { closeMenu(); onNavigate('CAREER'); }}
                />

                {/* Section: Management */}
                {['ADMIN', 'MANAGER', 'SM', 'LEADER', 'OPS'].includes(user?.role) && (
                    <>
                        <div style={{ borderTop: '1px solid #F3F4F6', margin: '12px 0' }} />
                        <div style={{ padding: '0 20px', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
                            Quản lý
                        </div>

                        {user.role !== 'STAFF' && (
                            <MenuItem
                                icon="📈"
                                label="Leader Report"
                                onClick={() => { closeMenu(); onNavigate('LEADER_REPORT'); }}
                            />
                        )}

                        {['ADMIN', 'MANAGER', 'SM', 'OPS'].includes(user?.role) && (
                            <>
                                {/* Staff Management - Standalone as requested */}
                                <MenuItem
                                    icon="👥"
                                    label="Quản lý nhân sự"
                                    onClick={() => { closeMenu(); onNavigate('STAFF_MANAGEMENT'); }}
                                />

                                {/* Settings with Accordion Submenu */}
                                <div
                                    onClick={() => setExpandedConfigs(!expandedConfigs)}
                                    className="sidebar-item"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        cursor: 'pointer',
                                        color: '#374151',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        transition: 'background 0.2s',
                                        background: expandedConfigs ? '#F9FAFB' : 'transparent'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                                    onMouseLeave={e => !expandedConfigs && (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ fontSize: '18px' }}>⚙️</span>
                                    <div style={{ flex: 1 }}>Cấu hình hệ thống</div>
                                    <span style={{ fontSize: '10px', transform: expandedConfigs ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                                </div>

                                {/* Expanded Submenu */}
                                {expandedConfigs && (
                                    <div style={{ background: '#F9FAFB', paddingBottom: '8px' }}>
                                        <MenuItem
                                            icon="🏪"
                                            label="Quản lý Cửa hàng"
                                            onClick={() => { closeMenu(); onNavigate('STORE_MANAGEMENT'); }}
                                            style={{ paddingLeft: '50px', fontSize: '12px' }}
                                        />
                                        <MenuItem
                                            icon="📢"
                                            label="Quản lý Thông báo"
                                            onClick={() => { closeMenu(); onNavigate('ANNOUNCEMENT_MANAGEMENT'); }}
                                            style={{ paddingLeft: '50px', fontSize: '12px' }}
                                        />
                                        <MenuItem
                                            icon="⚠️"
                                            label="Quản lý Sự cố"
                                            onClick={() => { closeMenu(); onNavigate('INCIDENT_MANAGEMENT'); }}
                                            style={{ paddingLeft: '50px', fontSize: '12px' }}
                                        />
                                        <MenuItem
                                            icon="📊"
                                            label="Cấu hình Benchmark"
                                            onClick={() => {
                                                alert("Tính năng đang phát triển: Cấu hình các chỉ số KPI/Benchmark cho hệ thống.");
                                            }}
                                            style={{ paddingLeft: '50px', fontSize: '12px' }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Section: Account */}
                <div style={{ borderTop: '1px solid #F3F4F6', margin: '12px 0' }} />
                <MenuItem
                    icon="🚪"
                    label="Đăng xuất"
                    color="#EF4444"
                    onClick={() => setLogoutConfirm(true)}
                />

            </div>

            {/* 3. Footer: App Version */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid #E5E7EB',
                textAlign: 'center',
                fontSize: '10px',
                color: '#9CA3AF'
            }}>
                Thái Mậu Group App v1.0
            </div>
        </div>
    );

    // Reuseable MenuItem Component
    const MenuItem = ({ icon, label, onClick, color = '#374151', style = {} }) => (
        <div
            onClick={onClick}
            className="sidebar-item"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                cursor: 'pointer',
                color: color,
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s',
                ...style
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            {label}
        </div>
    );

    return (
        <>
            {/* BACKDROP OVERLAY */}
            {showMenu && (
                <div
                    onClick={() => closeMenu()}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(2px)', // Modern glass effect
                        zIndex: 1000,
                        transition: 'opacity 0.3s'
                    }}
                />
            )}

            {/* SIDEBAR CONTENT */}
            <MenuContent />

            {/* LOGOUT CONFIRMATION MODAL */}
            {logoutConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10002, // Top of everything
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        width: '300px',
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚪</div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#111827' }}>Xác nhận đăng xuất?</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#6B7280' }}>
                            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setLogoutConfirm(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    background: 'white',
                                    color: '#374151',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => { setLogoutConfirm(false); closeMenu(); onLogout(); }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#EF4444',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopMenu;
