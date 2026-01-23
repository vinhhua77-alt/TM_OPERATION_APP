import { useState } from 'react';
import {
    Home, FileEdit, ClipboardList, BarChart3, TrendingUp, Globe,
    Gamepad2, Award, Users, Store, Megaphone, AlertTriangle,
    Settings, BookOpen, Info, LogOut, ChevronDown, ChevronRight, X
} from 'lucide-react';

const TopMenu = ({ user, sysConfig, onNavigate, onLogout, showMenu, onClose }) => {
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    // Default open states for sections
    const [expandedSections, setExpandedSections] = useState({
        reports: true,
        analytics: true,
        management: false,
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
            className="flex items-center justify-between px-6 py-3 mt-2 cursor-pointer group select-none"
        >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                {label}
            </span>
            {isOpen ?
                <ChevronDown size={14} className="text-slate-300 group-hover:text-slate-500" /> :
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
            }
        </div>
    );

    const MenuItem = ({ icon: Icon, label, onClick, active = false, colorClass = "text-slate-600" }) => (
        <div
            onClick={onClick}
            className={`
                flex items-center gap-4 px-6 py-3 cursor-pointer transition-all border-l-4
                ${active ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}
            `}
        >
            <Icon size={20} className={active ? "text-blue-600" : colorClass} strokeWidth={2} />
            <span className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                {label}
            </span>
        </div>
    );

    // --- MENU CONTENT ---
    const MenuContent = () => (
        <div className={`
            fixed top-0 left-0 h-full w-[280px] bg-white z-[1001] shadow-2xl flex flex-col
            transform transition-transform duration-300 ease-out
            ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* 1. HEADER */}
            <div className="relative h-40 bg-slate-900 flex flex-col justify-end p-6 border-b border-slate-100 overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute top-[20px] left-[-10px] w-16 h-16 bg-purple-500 rounded-full opacity-20 blur-xl"></div>

                {/* Close Button (Mobile convenience) */}
                <button
                    onClick={closeMenu}
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
                >
                    <X size={18} />
                </button>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="text-white font-bold text-lg leading-tight">
                            {user?.name || 'Guest'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                                {user?.role || 'Guest'}
                            </span>
                            <span className="text-xs text-slate-300 font-medium">#{user?.store_code || 'TMG'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">

                {/* GLOBAL */}
                <MenuItem
                    icon={Home}
                    label="Trang chủ"
                    onClick={() => { closeMenu(); onNavigate('HOME'); }}
                />

                {/* --- DAILY OPERATIONS --- */}
                <SectionHeader
                    label="Vận Hành Hàng Ngày"
                    isOpen={expandedSections.reports}
                    onClick={() => toggleSection('reports')}
                />

                {expandedSections.reports && (
                    <div className="animate-in slide-in-from-left-2 duration-200">
                        {user?.role !== 'LEADER' && (
                            <MenuItem
                                icon={FileEdit}
                                label="Gửi Báo Cáo Ca"
                                colorClass="text-blue-600"
                                onClick={() => { closeMenu(); onNavigate('SHIFT_LOG'); }}
                            />
                        )}

                        {['LEADER', 'SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                            <MenuItem
                                icon={ClipboardList}
                                label="Báo Cáo Ca Trưởng"
                                colorClass="text-indigo-600"
                                onClick={() => { closeMenu(); onNavigate('LEADER_REPORT'); }}
                            />
                        )}

                        {/* Feature Flags for Task Modules */}
                        {sysConfig?.featureFlags?.includes('MODULE_5S') && (
                            <MenuItem icon={Award} label="Chấm điểm 5S" onClick={() => alert('Đang phát triển')} />
                        )}
                    </div>
                )}

                {/* --- ANALYTICS --- */}
                {['LEADER', 'SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                    <>
                        <SectionHeader
                            label="Báo Cáo Quản Trị"
                            isOpen={expandedSections.analytics}
                            onClick={() => toggleSection('analytics')}
                        />
                        {expandedSections.analytics && (
                            <div className="animate-in slide-in-from-left-2 duration-200">
                                <MenuItem
                                    icon={BarChart3}
                                    label="Leader Dashboard"
                                    onClick={() => { closeMenu(); onNavigate('ANALYTICS_LEADER'); }}
                                />
                                {['SM', 'OPS', 'ADMIN'].includes(user?.role) && (
                                    <MenuItem
                                        icon={TrendingUp}
                                        label="SM Dashboard"
                                        colorClass="text-emerald-600"
                                        onClick={() => { closeMenu(); onNavigate('ANALYTICS_SM'); }}
                                    />
                                )}
                                {['OPS', 'ADMIN', 'BOD'].includes(user?.role) && (
                                    <MenuItem
                                        icon={Globe}
                                        label="OPS Dashboard Chain"
                                        colorClass="text-purple-600"
                                        onClick={() => { closeMenu(); onNavigate('ANALYTICS_OPS'); }}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* --- ADVANCED FEATURES --- */}
                {(sysConfig?.featureFlags?.includes('MODULE_GAMIFICATION') || sysConfig?.featureFlags?.includes('MODULE_CAREER')) && (
                    <>
                        <SectionHeader label="Phát Triển & Game" isOpen={true} onClick={() => { }} />
                        {sysConfig?.featureFlags?.includes('MODULE_GAMIFICATION') && (
                            <MenuItem icon={Gamepad2} label="Thành tích Game" onClick={() => { closeMenu(); onNavigate('GAMIFICATION'); }} />
                        )}
                        {sysConfig?.featureFlags?.includes('MODULE_CAREER') && (
                            <MenuItem icon={Award} label="Hồ sơ năng lực" onClick={() => { closeMenu(); onNavigate('CAREER'); }} />
                        )}
                    </>
                )}


                {/* --- MANAGEMENT (ADMIN ONLY) --- */}
                {['ADMIN', 'MANAGER', 'SM', 'OPS'].includes(user?.role) && (
                    <>
                        {/* 1. STORE MANAGEMENT SUB-SECTION */}
                        <SectionHeader
                            label="Quản Lý Cửa Hàng"
                            isOpen={expandedSections.store}
                            onClick={() => toggleSection('store')}
                        />
                        {expandedSections.store && (
                            <div className="animate-in slide-in-from-left-2 duration-200 border-l-2 border-slate-100 ml-6 my-1">
                                <MenuItem icon={Store} label="Thông tin Tiệm" onClick={() => { closeMenu(); onNavigate('STORE_STORES'); }} />
                                <MenuItem icon={Users} label="Ca Làm Việc" onClick={() => { closeMenu(); onNavigate('STORE_SHIFTS'); }} />
                                <MenuItem icon={ClipboardList} label="Checklist Mẫu" onClick={() => { closeMenu(); onNavigate('STORE_CHECKLIST'); }} />
                                <MenuItem icon={Award} label="Vai Trò (Role)" onClick={() => { closeMenu(); onNavigate('STORE_ROLES'); }} />
                                <MenuItem icon={Users} label="Vị Trí (Position)" onClick={() => { closeMenu(); onNavigate('STORE_POSITIONS'); }} />
                                <MenuItem icon={AlertTriangle} label="Loại Sự Cố" onClick={() => { closeMenu(); onNavigate('STORE_INCIDENTS'); }} />
                                <MenuItem icon={Settings} label="Layout/Khu vưc" onClick={() => { closeMenu(); onNavigate('STORE_LAYOUTS'); }} />
                            </div>
                        )}

                        <SectionHeader
                            label="Quản Lý Hệ Thống"
                            isOpen={expandedSections.management}
                            onClick={() => toggleSection('management')}
                        />
                        {expandedSections.management && (
                            <div className="animate-in slide-in-from-left-2 duration-200">
                                <MenuItem icon={Users} label="Nhân Sự" onClick={() => { closeMenu(); onNavigate('STAFF_MANAGEMENT'); }} />
                                <MenuItem icon={Megaphone} label="Thông Báo" onClick={() => { closeMenu(); onNavigate('ANNOUNCEMENT_MANAGEMENT'); }} />
                                <MenuItem icon={AlertTriangle} label="Sự Cố (Logs)" onClick={() => { closeMenu(); onNavigate('INCIDENT_MANAGEMENT'); }} />
                                {['ADMIN', 'OPS'].includes(user?.role) && (
                                    <MenuItem
                                        icon={Settings}
                                        label="Admin Console"
                                        colorClass="text-rose-600"
                                        onClick={() => { closeMenu(); onNavigate('ADMIN_CONSOLE'); }}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                <div className="my-4 border-t border-slate-100 mx-6"></div>

                <MenuItem icon={BookOpen} label="Hướng Dẫn" onClick={() => { closeMenu(); onNavigate('GUIDE'); }} />
                <MenuItem icon={Info} label="Giới Thiệu" onClick={() => { closeMenu(); onNavigate('ABOUT'); }} />
            </div>

            {/* 3. FOOTER */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                    onClick={() => setLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                </button>
                <div className="text-center mt-2 text-[10px] text-slate-400 font-mono">
                    System v2.0 • Supabase
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
                    <div className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            🚪
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Đăng xuất ngay?</h3>
                        <p className="text-sm text-slate-500 mb-6">Bạn sẽ cần đăng nhập lại để tiếp tục công việc.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setLogoutConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => { setLogoutConfirm(false); closeMenu(); onLogout(); }}
                                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200"
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
