import { useState } from 'react';

const TopMenu = ({ user, sysConfig, onNavigate, onLogout, showMenu, onClose }) => {
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    // Default open states for sections
    const [expandedSections, setExpandedSections] = useState({
        reports: true,
        analytics: true,
        management: false,
        store: false,
        system: false
    });

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const closeMenu = () => {
        onClose();
    };

    // --- COMPONENTS ---

    const SectionHeader = ({ label, isOpen, onClick }) => (
        <div
            onClick={onClick}
            className="flex items-center justify-between px-5 py-2 mt-2 cursor-pointer group select-none hover:bg-slate-50 transition-colors"
        >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600">
                {label}
            </span>
            <span className={`text-[10px] text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
            </span>
        </div>
    );

    const MenuItem = ({ icon, label, onClick, active = false }) => (
        <div
            onClick={onClick}
            className={`
                flex items-center gap-3.5 px-5 py-2.5 cursor-pointer transition-all border-l-[3px]
                ${active ? 'bg-blue-50/50 border-[#004AAD]' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}
            `}
        >
            <span className="text-lg w-6 text-center">{icon}</span>
            <span className={`text-[13px] font-semibold ${active ? 'text-[#004AAD]' : 'text-slate-700'}`}>
                {label}
            </span>
        </div>
    );

    // --- MENU CONTENT ---
    const MenuContent = () => (
        <div className={`
            fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-white z-[1001] shadow-2xl flex flex-col
            transform transition-transform duration-300 ease-out
            ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* 1. HEADER (Compact Blue/White) */}
            <div className="relative bg-[#004AAD] flex flex-col justify-end p-5 pt-12 border-b border-[#003d8f] overflow-hidden shrink-0">
                {/* Decorative Circles */}
                <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-white rounded-full opacity-5 blur-2xl"></div>
                <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-blue-400 rounded-full opacity-20 blur-xl"></div>

                {/* Close Button */}
                <button
                    onClick={closeMenu}
                    className="absolute top-3 right-3 p-1.5 bg-black/10 rounded-full text-white/80 hover:bg-black/20 transition backdrop-blur-sm"
                >
                    ✕
                </button>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/30 backdrop-blur-md">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="text-white font-bold text-base leading-tight truncate max-w-[160px]">
                            {user?.name || 'Guest'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-[2px] rounded text-[9px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10">
                                {user?.role || 'Guest'}
                            </span>
                            <span className="text-[10px] text-blue-100 font-medium opacity-90">#{user?.store_code || 'TMG'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">

                {/* GLOBAL */}
                <MenuItem
                    icon="🏠"
                    label="Trang chủ"
                    onClick={() => { closeMenu(); onNavigate('HOME'); }}
                />

                {/* --- DAILY OPERATIONS --- */}
                <SectionHeader
                    label="Vận Hành"
                    isOpen={expandedSections.reports}
                    onClick={() => toggleSection('reports')}
                />

                {expandedSections.reports && (
                    <div className="animate-in slide-in-from-left-2 duration-200">
                        {user?.role !== 'LEADER' && (
                            <MenuItem
                                icon="📝"
                                label="Gửi Báo Cáo Ca"
                                onClick={() => { closeMenu(); onNavigate('SHIFT_LOG'); }}
                            />
                        )}

                        {['LEADER', 'SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                            <MenuItem
                                icon="📋"
                                label="Báo Cáo Ca Trưởng"
                                onClick={() => { closeMenu(); onNavigate('LEADER_REPORT'); }}
                            />
                        )}

                        {sysConfig?.featureFlags?.includes('MODULE_5S') && (
                            <MenuItem icon="🧹" label="Chấm điểm 5S" onClick={() => alert('Đang phát triển')} />
                        )}
                    </div>
                )}

                {/* --- ANALYTICS --- */}
                {['LEADER', 'SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                    <>
                        <SectionHeader
                            label="Báo Cáo"
                            isOpen={expandedSections.analytics}
                            onClick={() => toggleSection('analytics')}
                        />
                        {expandedSections.analytics && (
                            <div className="animate-in slide-in-from-left-2 duration-200">
                                <MenuItem
                                    icon="📊"
                                    label="Leader Dashboard"
                                    onClick={() => { closeMenu(); onNavigate('ANALYTICS_LEADER'); }}
                                />
                                {['SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                                    <MenuItem
                                        icon="📈"
                                        label="SM Dashboard"
                                        onClick={() => { closeMenu(); onNavigate('ANALYTICS_SM'); }}
                                    />
                                )}
                                {['OPS', 'ADMIN', 'BOD'].includes(user?.role) && (
                                    <MenuItem
                                        icon="🌍"
                                        label="OPS Dashboard Chain"
                                        onClick={() => { closeMenu(); onNavigate('ANALYTICS_OPS'); }}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* --- MANAGEMENT --- */}
                {['ADMIN', 'MANAGER', 'SM', 'OPS'].includes(user?.role) && (
                    <>
                        <SectionHeader
                            label="Quản Lý Cửa Hàng"
                            isOpen={expandedSections.store}
                            onClick={() => toggleSection('store')}
                        />
                        {expandedSections.store && (
                            <div className="animate-in slide-in-from-left-2 duration-200 border-l border-slate-100 ml-6 my-1 pl-1">
                                <MenuItem icon="🏪" label="Hồ sơ Cửa Hàng" onClick={() => { closeMenu(); onNavigate('STORE_STORES'); }} />
                                <MenuItem icon="👥" label="Ca & Lịch Trực" onClick={() => { closeMenu(); onNavigate('STORE_SHIFTS'); }} />
                                <MenuItem icon="📋" label="Bộ Checklist" onClick={() => { closeMenu(); onNavigate('STORE_CHECKLIST'); }} />
                                <MenuItem icon="🛡️" label="Vai Trò" onClick={() => { closeMenu(); onNavigate('STORE_ROLES'); }} />
                                <MenuItem icon="📍" label="Vị Trí" onClick={() => { closeMenu(); onNavigate('STORE_POSITIONS'); }} />
                                <MenuItem icon="⚠️" label="Loại Sự Cố" onClick={() => { closeMenu(); onNavigate('STORE_INCIDENTS'); }} />
                                <MenuItem icon="🏗️" label="Sơ đồ Khu vưc" onClick={() => { closeMenu(); onNavigate('STORE_LAYOUTS'); }} />
                            </div>
                        )}

                        <SectionHeader
                            label="Hệ Thống"
                            isOpen={expandedSections.management}
                            onClick={() => toggleSection('management')}
                        />
                        {expandedSections.management && (
                            <div className="animate-in slide-in-from-left-2 duration-200">
                                <MenuItem icon="👥" label="Nhân Sự" onClick={() => { closeMenu(); onNavigate('STAFF_MANAGEMENT'); }} />
                                <MenuItem icon="📢" label="Thông Báo" onClick={() => { closeMenu(); onNavigate('ANNOUNCEMENT_MANAGEMENT'); }} />
                                <MenuItem icon="⚠️" label="Nhật ký Sự Cố" onClick={() => { closeMenu(); onNavigate('INCIDENT_MANAGEMENT'); }} />
                                {['ADMIN', 'OPS'].includes(user?.role) && (
                                    <MenuItem
                                        icon="⚙️"
                                        label="Admin Console"
                                        onClick={() => { closeMenu(); onNavigate('ADMIN_CONSOLE'); }}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* --- GAME & CAREER --- */}
                {(sysConfig?.featureFlags?.includes('MODULE_GAMIFICATION') || sysConfig?.featureFlags?.includes('MODULE_CAREER')) && (
                    <>
                        <SectionHeader label="Phát Triển" isOpen={true} onClick={() => { }} />
                        {sysConfig?.featureFlags?.includes('MODULE_GAMIFICATION') && (
                            <MenuItem icon="🎮" label="Game & Thưởng" onClick={() => { closeMenu(); onNavigate('GAMIFICATION'); }} />
                        )}
                        {sysConfig?.featureFlags?.includes('MODULE_CAREER') && (
                            <MenuItem icon="🏆" label="Hồ sơ năng lực" onClick={() => { closeMenu(); onNavigate('CAREER'); }} />
                        )}
                    </>
                )}

                <div className="my-3 border-t border-slate-100 mx-5 opacity-50"></div>

                <MenuItem icon="📖" label="Hướng Dẫn" onClick={() => { closeMenu(); onNavigate('GUIDE'); }} />
                <MenuItem icon="ℹ️" label="Giới Thiệu" onClick={() => { closeMenu(); onNavigate('ABOUT'); }} />
            </div>

            {/* 3. FOOTER */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/80">
                <button
                    onClick={() => setLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-[0.98]"
                >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                </button>
                <div className="text-center mt-2 text-[9px] text-slate-400 font-mono tracking-wider opacity-60">
                    TMG v2.0 • Supabase
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* BACKDROP */}
            {showMenu && (
                <div
                    onClick={closeMenu}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] animate-in fade-in duration-200"
                />
            )}

            {/* DRAWER */}
            <MenuContent />

            {/* LOGOUT MODAL */}
            {logoutConfirm && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-white p-5 rounded-2xl w-full max-w-[280px] shadow-2xl text-center">
                        <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                            🚪
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">Đăng xuất?</h3>
                        <p className="text-xs text-slate-500 mb-5 leading-relaxed">Bạn sẽ cần đăng nhập lại để tiếp tục.</p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setLogoutConfirm(false)}
                                className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => { setLogoutConfirm(false); closeMenu(); onLogout(); }}
                                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-200"
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default TopMenu;
