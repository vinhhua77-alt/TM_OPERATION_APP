import { useState } from 'react';

const TopMenu = ({ user, sysConfig, onNavigate, onLogout, showMenu, onClose }) => {
    const [expandedConfigs, setExpandedConfigs] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    // State for collapsible sections
    const [openSections, setOpenSections] = useState({
        dailyTask: true,
        dailyReport: true,
        bgQt: true,
        advanced: false, // Default collapsed
        management: true, // User focused on this right now
        config: false // Default collapsed
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Sidebar styling constants
    const sidebarWidth = '280px';

    // Close menu helper
    const closeMenu = () => {
        onClose();
    };

    // Helper: Collapsible Section Header
    const MenuSectionHeader = ({ label, isOpen, onToggle }) => (
        <div
            onClick={onToggle}
            style={{
                padding: '0 20px',
                marginBottom: '4px',
                marginTop: '16px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
            }}
        >
            <span>{label}</span>
            <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
            </span>
        </div>
    );

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

                <MenuItem
                    icon="🏠"
                    label="Trang chủ Workspace"
                    onClick={() => { closeMenu(); onNavigate('HOME'); }}
                />

                {/* --- DAILY TASK --- */}
                {(sysConfig?.featureFlags?.some(f => ['MODULE_5S', 'MODULE_CASHIER', 'MODULE_WASTE', 'MODULE_INVENTORY'].includes(f))) && (
                    <>
                        <MenuSectionHeader
                            label="Daily Task"
                            isOpen={openSections.dailyTask}
                            onToggle={() => toggleSection('dailyTask')}
                        />
                        {openSections.dailyTask && (
                            <div className="fade-in">
                                {sysConfig?.featureFlags?.includes('MODULE_5S') && (
                                    <MenuItem icon="🧹" label="Báo cáo 5S" onClick={() => alert('Tính năng Báo cáo 5S đang phát triển')} />
                                )}
                                {sysConfig?.featureFlags?.includes('MODULE_CASHIER') && (
                                    <MenuItem icon="💰" label="Báo cáo Thu Ngân" onClick={() => alert('Tính năng Báo cáo Thu Ngân đang phát triển')} />
                                )}
                                {sysConfig?.featureFlags?.includes('MODULE_WASTE') && (
                                    <MenuItem icon="🗑️" label="Báo cáo Hàng Hủy" onClick={() => alert('Tính năng Báo cáo Hàng Hủy đang phát triển')} />
                                )}
                                {sysConfig?.featureFlags?.includes('MODULE_INVENTORY') && (
                                    <MenuItem icon="📦" label="Báo cáo Kho cuối ngày" onClick={() => alert('Tính năng Báo cáo Kho đang phát triển')} />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ---DAILY REPORT --- */}
                <MenuSectionHeader
                    label="Daily Report"
                    isOpen={openSections.dailyReport}
                    onToggle={() => toggleSection('dailyReport')}
                />
                {openSections.dailyReport && (
                    <div className="fade-in">
                        {user?.role !== 'LEADER' && (
                            <MenuItem icon="📝" label="Nhật ký ca trực - Staff" onClick={() => { closeMenu(); onNavigate('SHIFT_LOG'); }} />
                        )}

                        {['LEADER', 'SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                            <MenuItem icon="📈" label="Báo Cáo Ca - Leader" onClick={() => { closeMenu(); onNavigate('LEADER_REPORT'); }} />
                        )}

                        {['SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                            <MenuItem icon="📋" label="Báo Cáo Ngày - SM" onClick={() => alert('Tính năng đang phát triển: Nhật ký quản lý (SM Report)')} />
                        )}
                    </div>
                )}

                {/* --- DASHBOARD (Báo Cáo Quản Trị) --- */}
                {['LEADER', 'SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                    <>
                        <MenuSectionHeader
                            label="Báo cáo Quản trị"
                            isOpen={openSections.bgQt}
                            onToggle={() => toggleSection('bgQt')}
                        />
                        {openSections.bgQt && (
                            <div className="fade-in">
                                <MenuItem
                                    icon="📊"
                                    label="Leader Dashboard (Ngày)"
                                    onClick={() => { closeMenu(); onNavigate('ANALYTICS_LEADER'); }}
                                    style={{ color: '#004AAD' }}
                                />

                                {['SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                                    <MenuItem
                                        icon="📈"
                                        label="SM Dashboard (Tuần)"
                                        onClick={() => { closeMenu(); onNavigate('ANALYTICS_SM'); }}
                                        style={{ color: '#059669' }}
                                    />
                                )}

                                {['OPS', 'ADMIN', 'BOD'].includes(user?.role) && (
                                    <MenuItem
                                        icon="🌍"
                                        label="OPS Dashboard (Chuỗi)"
                                        onClick={() => { closeMenu(); onNavigate('ANALYTICS_OPS'); }}
                                        style={{ color: '#7C3AED', fontWeight: 'bold' }}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* --- TÍNH NĂNG NÂNG CAO --- */}
                {(sysConfig?.featureFlags?.includes('MODULE_GAMIFICATION') || sysConfig?.featureFlags?.includes('MODULE_CAREER')) && (
                    <>
                        <MenuSectionHeader
                            label="Tính Năng Nâng Cao"
                            isOpen={openSections.advanced}
                            onToggle={() => toggleSection('advanced')}
                        />
                        {openSections.advanced && (
                            <div className="fade-in">
                                {sysConfig?.featureFlags?.includes('MODULE_GAMIFICATION') && (
                                    <MenuItem icon="🏅" label="Thành tích Game" onClick={() => { closeMenu(); onNavigate('GAMIFICATION'); }} />
                                )}
                                {sysConfig?.featureFlags?.includes('MODULE_CAREER') && (
                                    <MenuItem icon="🏆" label="Hồ sơ năng lực" onClick={() => { closeMenu(); onNavigate('CAREER'); }} />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* --- QUẢN LÝ --- */}
                {['ADMIN', 'MANAGER', 'SM', 'OPS'].includes(user?.role) && (
                    <>
                        <MenuSectionHeader
                            label="Quản Lý"
                            isOpen={openSections.management}
                            onToggle={() => toggleSection('management')}
                        />
                        {openSections.management && (
                            <div className="fade-in">
                                <MenuItem icon="👥" label="Quản lý Nhân sự" onClick={() => { closeMenu(); onNavigate('STAFF_MANAGEMENT'); }} />
                                <MenuItem icon="🏪" label="Quản lý Cửa hàng" onClick={() => { closeMenu(); onNavigate('STORE_MANAGEMENT'); }} />
                                <MenuItem icon="📢" label="Quản lý Thông Báo" onClick={() => { closeMenu(); onNavigate('ANNOUNCEMENT_MANAGEMENT'); }} />
                                <MenuItem icon="⚠️" label="Quản lý Sự cố" onClick={() => { closeMenu(); onNavigate('INCIDENT_MANAGEMENT'); }} />
                            </div>
                        )}
                    </>
                )}

                {/* --- CẤU HÌNH HỆ THỐNG --- */}
                {['ADMIN', 'OPS'].includes(user?.role) && (
                    <>
                        <MenuSectionHeader
                            label="Cấu Hình Hệ Thống"
                            isOpen={openSections.config}
                            onToggle={() => toggleSection('config')}
                        />
                        {openSections.config && (
                            <div className="fade-in">
                                <MenuItem
                                    icon="🛡️"
                                    label="Admin Console"
                                    onClick={() => { closeMenu(); onNavigate('ADMIN_CONSOLE'); }}
                                    style={{ color: '#7C3AED', fontWeight: 'bold' }}
                                />

                                <MenuItem icon="📊" label="Cấu hình Benchmark" onClick={() => alert("Tính năng đang phát triển")} />
                            </div>
                        )}
                    </>
                )}

                <div style={{ borderTop: '1px solid #F3F4F6', margin: '16px 0' }} />

                <MenuItem icon="📖" label="Hướng Dẫn Sử Dụng" onClick={() => { closeMenu(); onNavigate('GUIDE'); }} />
                <MenuItem icon="ℹ️" label="About" onClick={() => { closeMenu(); onNavigate('ABOUT'); }} />

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
                Thái Mậu Group App v2.0
            </div>
        </div>
    );

    // Section Title
    const MenuSectionTitle = ({ label }) => (
        <div style={{ padding: '0 20px', marginBottom: '8px', marginTop: '16px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
            {label}
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
