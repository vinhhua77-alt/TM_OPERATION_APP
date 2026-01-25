import { useState } from 'react';

const TopMenu = ({ user, sysConfig, onNavigate, onLogout, showMenu, onClose, notify }) => {
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    // Default open states for sections
    const [expandedSections, setExpandedSections] = useState({
        vận_hành: true,
        dashboard: true,
        quản_trị: true,
        cấu_hình: true,
        lab: false // Default collapsed
    });

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFeatureLabClick = () => {
        closeMenu();
        if (notify) {
            notify('Tính năng đang được triển khai', 'info');
        } else {
            alert('Tính năng đang được triển khai');
        }
    };

    const closeMenu = () => { onClose(); };

    // --- COMPONENTS ---

    const SectionHeader = ({ label, isOpen, onClick }) => (
        <div
            onClick={onClick}
            className="flex items-center justify-between px-3 py-1.5 mt-0.5 cursor-pointer group select-none hover:bg-slate-50 transition-colors"
        >
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-[0.1em] group-hover:text-slate-600">
                {label}
            </span>
            <span className={`text-[8px] text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
            </span>
        </div>
    );

    const MenuItem = ({ icon, label, onClick, active = false, badge = null, special = false }) => (
        <div
            onClick={onClick}
            className={`
                flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all border-l-[3px]
                ${active ? 'bg-blue-50/50 border-blue-600' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}
                ${special ? 'bg-blue-50/20' : ''}
            `}
        >
            <span className="text-base w-4 text-center">{icon}</span>
            <div className="flex-1 flex items-center justify-between">
                <span className={`text-[10.5px] font-bold ${active ? 'text-blue-600' : 'text-slate-700'}`}>
                    {label}
                </span>
                {badge && (
                    <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-1 py-0.5 rounded-full uppercase tracking-tighter">
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );

    const MenuContent = () => (
        <div className={`
            fixed top-0 left-0 h-full w-[230px] max-w-[75vw] bg-white z-[1001] shadow-2xl flex flex-col
            transform transition-transform duration-300 ease-out font-sans
            ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* 1. HEADER */}
            <div className="relative bg-blue-600 flex flex-col justify-end p-3 pt-8 border-b border-blue-700 overflow-hidden shrink-0">
                <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-white rounded-full opacity-10 blur-xl"></div>
                <button
                    onClick={closeMenu}
                    className="absolute top-2 right-2 p-1 bg-black/10 rounded-full text-white/80 hover:bg-black/20 transition backdrop-blur-sm"
                >
                    <span className="text-[10px]">✕</span>
                </button>

                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-base shadow-inner border border-white/30 backdrop-blur-md">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="text-white font-black text-[12px] leading-tight truncate max-w-[130px] uppercase tracking-tighter">
                            {user?.name || 'Guest'}
                        </div>
                        <div className="flex items-center gap-2 mt-0">
                            <span className="px-1 py-0 rounded text-[7px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                                {user?.role || 'Guest'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto py-1.5 custom-scrollbar">

                <MenuItem
                    icon="🏠"
                    label="Trang chủ"
                    onClick={() => { closeMenu(); onNavigate('HOME'); }}
                />

                <div className="my-1.5 border-t border-slate-50 mx-3 opacity-40"></div>

                {/* --- 2. VẬN HÀNH --- */}
                <SectionHeader label="Vận hành" isOpen={expandedSections.vận_hành} onClick={() => toggleSection('vận_hành')} />
                {expandedSections.vận_hành && (
                    <div className="animate-in slide-in-from-left-2 duration-200">
                        <MenuItem icon="🛡️" label="Vận Hành Tuân Thủ" onClick={() => { closeMenu(); onNavigate('QAQC_HUB'); }} />
                        <MenuItem icon="📝" label="Báo Cáo Hàng Ngày" onClick={() => { closeMenu(); onNavigate('DAILY_HUB'); }} />
                        <MenuItem icon="✅" label="HỆ THỐNG QA/QC" onClick={() => { closeMenu(); onNavigate('QAQC_HUB'); }} />
                    </div>
                )}

                {/* --- 3. DASHBOARD --- */}
                <SectionHeader label="Dashboard" isOpen={expandedSections.dashboard} onClick={() => toggleSection('dashboard')} />
                {expandedSections.dashboard && (
                    <div className="animate-in slide-in-from-left-2 duration-200">
                        <MenuItem icon="📊" label="Dashboard Trung Tâm" onClick={() => { closeMenu(); onNavigate('ANALYTICS'); }} />
                        <MenuItem icon="📈" label="Báo Cáo dữ liệu" onClick={() => { closeMenu(); onNavigate('ANALYTICS'); }} />
                    </div>
                )}

                {/* --- 4. QUẢN TRỊ HỆ THỐNG --- */}
                {['ADMIN', 'OPS', 'SM'].includes(user?.role) && (
                    <>
                        <SectionHeader label="QUẢN TRỊ HỆ THỐNG" isOpen={expandedSections.quản_trị} onClick={() => toggleSection('quản_trị')} />
                        {expandedSections.quản_trị && (
                            <div className="animate-in slide-in-from-left-2 duration-200">
                                <MenuItem icon="👥" label="Quản Lý Nhân Sự" onClick={() => { closeMenu(); onNavigate('STAFF_MANAGEMENT'); }} />
                                <MenuItem icon="📢" label="Quản Lý Thông Báo" onClick={() => { closeMenu(); onNavigate('ANNOUNCEMENT_MANAGEMENT'); }} />
                            </div>
                        )}
                    </>
                )}

                {/* --- 5. CẤU HÌNH HỆ THỐNG --- */}
                {['ADMIN', 'OPS'].includes(user?.role) && (
                    <>
                        <SectionHeader label="Cấu hình hệ thống" isOpen={expandedSections.cấu_hình} onClick={() => toggleSection('cấu_hình')} />
                        {expandedSections.cấu_hình && (
                            <div className="animate-in slide-in-from-left-2 duration-200">
                                <MenuItem icon="🏗️" label="Thiết lập cấu hình" onClick={() => { closeMenu(); onNavigate('STORE_SETUP'); }} />
                                <MenuItem icon="⚙️" label="Admin Console" onClick={() => { closeMenu(); onNavigate('ADMIN_CONSOLE'); }} />
                                <MenuItem icon="🧪" label="Tính năng Lab" onClick={handleFeatureLabClick} />
                            </div>
                        )}
                    </>
                )}

                <div className="my-1.5 border-t border-slate-100 mx-3 opacity-50"></div>
                <MenuItem icon="📖" label="Hướng Dẫn Sử DỤng" onClick={() => { closeMenu(); onNavigate('GUIDE'); }} />
                <MenuItem icon="ℹ" label="About" onClick={() => { closeMenu(); onNavigate('ABOUT'); }} />
            </div>

            {/* 3. FOOTER */}
            <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                <div className="text-center mb-2">
                    <p className="text-[6.5px] font-black text-slate-300 uppercase tracking-[0.3em] mb-0.5">TMG OPERATION • v3.0</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest">ENGINE ACTIVE</span>
                    </div>
                </div>
                <button
                    onClick={() => setLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-[8.5px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-95"
                >
                    🚪 Đăng xuất
                </button>
            </div>
        </div>
    );



    return (
        <>
            {showMenu && (
                <div
                    onClick={closeMenu}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] animate-in fade-in duration-200"
                />
            )}
            <MenuContent />

            {logoutConfirm && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-white p-6 rounded-[32px] w-full max-w-[300px] shadow-2xl text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🚪</div>
                        <h3 className="text-lg font-black text-slate-800 mb-1 uppercase tracking-tighter">Đăng xuất?</h3>
                        <p className="text-[11px] font-bold text-slate-400 mb-6 leading-relaxed">Bạn sẽ cần đăng nhập lại để tiếp tục quản lý hệ thống.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setLogoutConfirm(false)} className="flex-1 py-3 rounded-2xl border border-slate-200 font-black text-[10px] text-slate-400 uppercase tracking-widest">Hủy</button>
                            <button onClick={() => { setLogoutConfirm(false); closeMenu(); onLogout(); }} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopMenu;
