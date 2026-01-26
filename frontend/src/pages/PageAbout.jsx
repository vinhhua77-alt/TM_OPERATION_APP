import React from 'react';

const PageAbout = ({ onBack }) => {
    return (
        <div className="fade-in text-center p-6 min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            {/* BRANDING */}
            <div className="mb-8 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="w-20 mx-auto mb-4 drop-shadow-md hover:scale-105 transition-transform" alt="logo" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight">THÁI MẬU GROUP</h2>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Hệ thống Vận hành Toàn diện</p>
            </div>

            {/* CARD INFO */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 w-full max-w-sm border border-slate-100 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="space-y-6 relative z-10">
                    <div>
                        <h3 className="text-[10px] font-black text-blue-600 uppercase mb-1">Phiên Bản Hệ Thống</h3>
                        <p className="text-2xl font-black text-slate-800">v3.2.0</p>
                        <p className="text-[10px] font-bold text-slate-400 bg-slate-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-slate-100">
                            SaaS Career Engine • 27/01/2026
                        </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3">Tính Năng Mới (New Features)</h3>
                        <ul className="text-left space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="bg-emerald-100 text-emerald-600 text-[9px] font-bold px-1.5 rounded mt-0.5">NEW</span>
                                <span className="text-[11px] font-medium text-slate-600">**Career Path SaaS:** Cấu hình lộ trình động.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 text-[9px] font-bold px-1.5 rounded mt-0.5">UI</span>
                                <span className="text-[11px] font-medium text-slate-600">**Micro-UI Grid:** Admin Console tinh gọn.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-purple-100 text-purple-600 text-[9px] font-bold px-1.5 rounded mt-0.5">DEV</span>
                                <span className="text-[11px] font-medium text-slate-600">**Real Database:** Supabase Integrated.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-1">Phát Triển Bởi</h3>
                        <p className="text-sm font-bold text-slate-700">Vinh Gà & IT Team</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">© 2026 Thai Mau Group</p>
                    </div>
                </div>
            </div>

            {/* FOOTER ACTION */}
            <button
                onClick={onBack}
                className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest"
            >
                ← Quay lại Menu
            </button>
        </div>
    );
};

export default PageAbout;
