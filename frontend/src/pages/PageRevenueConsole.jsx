import React, { useState } from 'react';

const PageRevenueConsole = ({ user, onBack }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans">
            <div className="shrink-0 bg-emerald-600 p-6 pb-12 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                    <button onClick={onBack} className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mb-6">← Quay lại</button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl -rotate-3">💰</div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">Revenue Console</h1>
                            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Module 10: Financial & Outcome</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-5 -mt-6 relative z-20 space-y-4">
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-black/5 text-center py-20">
                    <span className="text-5xl mb-4 block">🧪</span>
                    <h2 className="text-lg font-black text-slate-800 uppercase mb-2">Decision Engine Prep</h2>
                    <p className="text-xs text-slate-400 font-bold max-w-[200px] mx-auto leading-relaxed">
                        Module nhập liệu doanh thu đang được tích hợp. Đây là nguồn dữ liệu quan trọng để Decision Engine so sánh hiệu suất vận hành với kết quả tài chính.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PageRevenueConsole;
