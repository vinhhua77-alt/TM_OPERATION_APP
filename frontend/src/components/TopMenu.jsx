import { useState } from 'react';

const TopMenu = ({ user, onNavigate, onLogout }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Menu logic similar to PageShiftLog but reusable
    return (
        <>
            {/* ☰ HAMBURGER MENU (LEFT) */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
                <div onClick={() => setShowMenu(!showMenu)} style={{ fontSize: '24px', cursor: 'pointer', color: '#004AAD', padding: '5px' }}>☰</div>
                {showMenu && (
                    <>
                        <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }}></div>
                        <div style={{ position: 'absolute', top: '40px', left: 0, background: '#FFF', border: '1px solid #DDD', borderRadius: '8px', width: '220px', zIndex: 1000, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            <div style={{ padding: '12px', fontSize: '11px', fontWeight: '800', background: '#F0F7FF', color: '#004AAD' }}>● MENU TMG</div>

                            {user ? (
                                <>
                                    <div onClick={() => { setShowMenu(false); onNavigate('HOME'); }} style={{ padding: '12px 15px', fontSize: '11px', fontWeight: '700', borderTop: '1px solid #EEE', cursor: 'pointer' }}>🏠 TRANG CHỦ</div>
                                    <div onClick={() => { setShowMenu(false); onNavigate('SHIFT_LOG'); }} style={{ padding: '12px 15px', fontSize: '11px', fontWeight: '700', borderTop: '1px solid #EEE', cursor: 'pointer' }}>📝 NHẬT KÝ CA TRỰC</div>

                                    {user.role !== 'STAFF' && (
                                        <>
                                            <div onClick={() => { setShowMenu(false); onNavigate('LEADER_REPORT'); }} style={{ padding: '12px 15px', fontSize: '11px', fontWeight: '700', borderTop: '1px solid #EEE', cursor: 'pointer' }}>📈 LEADER REPORT</div>
                                        </>
                                    )}

                                    {['ADMIN', 'MANAGER'].includes(user.role) && (
                                        <div onClick={() => { setShowMenu(false); onNavigate('SETTING'); }} style={{ padding: '12px 15px', fontSize: '11px', fontWeight: '700', borderTop: '1px solid #EEE', color: '#004AAD', cursor: 'pointer' }}>⚙️ CẤU HÌNH HỆ THỐNG</div>
                                    )}

                                    <div onClick={() => { setShowMenu(false); onLogout(); }} style={{ padding: '12px 15px', fontSize: '11px', fontWeight: '700', borderTop: '1px solid #EEE', color: '#EF4444', cursor: 'pointer' }}>🚪 ĐĂNG XUẤT</div>
                                </>
                            ) : (
                                <div onClick={() => { setShowMenu(false); onNavigate('LOGIN'); }} style={{ padding: '12px 15px', fontSize: '11px', fontWeight: '700', borderTop: '1px solid #EEE', color: '#004AAD', cursor: 'pointer' }}>🔐 ĐĂNG NHẬP</div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* 🔔 BELL NOTIFICATION (RIGHT) */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                <div style={{ fontSize: '24px', cursor: 'pointer', padding: '5px' }}>🔔</div>
            </div>
        </>
    );
};

export default TopMenu;
