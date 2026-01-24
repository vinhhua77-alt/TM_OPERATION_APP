import React from 'react';

const PageDailyReporting = ({ user, onBack, onNavigate }) => {
    const modules = [
        {
            id: 'ops_report',
            label: 'Shift & Management',
            icon: '📝',
            desc: 'Nhật ký ca & Báo cáo quản lý.',
            color: 'from-blue-600 to-indigo-700',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'SHIFT_LOG'
        },
        {
            id: 'sm',
            label: 'SM Report',
            icon: '👑',
            desc: 'Chốt ngày & Doanh thu.',
            color: 'from-violet-500 to-violet-600',
            submitRoles: ['SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'SM_REPORT'
        },
        {
            id: '5s',
            label: 'Báo cáo 5S',
            icon: '🧹',
            desc: 'Vệ sinh & Sắp xếp.',
            color: 'from-amber-500 to-amber-600',
            submitRoles: ['LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_5S'
        },
        {
            id: 'cashier',
            label: 'Thu ngân',
            icon: '💰',
            desc: 'Đối soát quỹ tiền mặt.',
            color: 'from-rose-500 to-rose-600',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_CASHIER'
        },
        {
            id: 'm5m',
            label: 'Báo cáo M5M',
            icon: '🌅',
            desc: 'Chuẩn bị đầu ca.',
            color: 'from-sky-500 to-sky-600',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_M5M'
        }
    ];

    const handleAction = (m) => {
        const canSubmit = m.submitRoles.includes(user?.role);

        if (canSubmit) {
            // Since we merged ShiftLog and Leader Report, both now point to SHIFT_LOG/LEADER_REPORT
            // which both render PageShiftLog in App.jsx.
            onNavigate(m.target);
        } else {
            alert(`Vai trò ${user?.role} không có quyền thực hiện báo cáo này.`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans">
            {/* HEADER */}
            <div className="shrink-0 bg-blue-600 p-6 pb-12 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 flex flex-col items-start gap-4">
                    <button
                        onClick={onBack}
                        className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-4 py-1.5 rounded-full transition-all backdrop-blur-md border border-white/20 uppercase tracking-tighter active:scale-95"
                    >
                        ← Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl rotate-3">
                            📊
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-black leading-none mb-1 uppercase tracking-tight">BÁO CÁO NGÀY</h1>
                            <p className="text-[11px] font-bold opacity-80 leading-tight">Trung tâm tổng hợp báo cáo vận hành.</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* ROLE BADGE */}
            <div className="px-5 -mt-5 relative z-20">
                <div className="bg-white px-4 py-2 rounded-2xl shadow-md border border-black/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vai trò:</span>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{user?.role}</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-5 mt-2">
                <div className="grid grid-cols-3 gap-3">
                    {modules.map(m => {
                        const canSubmit = m.submitRoles.includes(user?.role);
                        return (
                            <div
                                key={m.id}
                                onClick={() => handleAction(m)}
                                className="bg-white rounded-[28px] p-3 border border-black/5 shadow-sm active:scale-[0.96] transition-all flex flex-col items-center text-center group cursor-pointer hover:shadow-md"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center text-xl shadow-lg mb-3 group-hover:rotate-6 transition-transform`}>
                                    {m.icon}
                                </div>
                                <h3 className="text-[11px] font-black text-slate-800 leading-tight mb-1">{m.label}</h3>
                                <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${canSubmit ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                                    {canSubmit ? 'Submit' : 'View'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Quy trình V3</span>
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed opacity-90">
                        Mọi báo cáo đều được quét bởi Decision Engine để tối ưu hóa vận hành thời gian thực.
                    </p>
                </div>
            </div>

            <div className="p-8 text-center opacity-30">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    TMG OPERATION v3.0
                </p>
            </div>
        </div>
    );
};

export default PageDailyReporting;
