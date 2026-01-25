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
            <div className="shrink-0 bg-blue-600 p-4 pb-10 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 flex flex-col items-start gap-3">
                    <button
                        onClick={onBack}
                        className="bg-white/20 hover:bg-white/30 text-white text-[9px] font-bold px-3 py-1 rounded-full transition-all backdrop-blur-md border border-white/20 uppercase tracking-tighter active:scale-95"
                    >
                        ← Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-2xl bg-opacity-100 flex items-center justify-center text-3xl shadow-xl rotate-3">
                            📊
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black leading-none mb-0.5 uppercase tracking-tight">BÁO CÁO NGÀY</h1>
                            <p className="text-[10px] font-bold opacity-80 leading-tight">Trung tâm báo cáo vận hành.</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* ROLE BADGE */}
            <div className="px-4 -mt-4 relative z-20">
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-md border border-black/5 flex items-center justify-between">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Vai trò:</span>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">{user?.role}</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-4 mt-1">
                <div className="grid grid-cols-3 gap-2.5">
                    {modules.map(m => {
                        const canSubmit = m.submitRoles.includes(user?.role);
                        return (
                            <div
                                key={m.id}
                                onClick={() => handleAction(m)}
                                className="bg-white rounded-[20px] p-2.5 border border-black/5 shadow-sm active:scale-[0.96] transition-all flex flex-col items-center text-center group cursor-pointer hover:shadow-md"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center text-lg shadow-lg mb-2 group-hover:rotate-6 transition-transform`}>
                                    {m.icon}
                                </div>
                                <h3 className="text-[10px] font-black text-slate-800 leading-tight mb-0.5">{m.label}</h3>
                                <div className={`text-[7.5px] font-black px-1.5 py-0 rounded-full uppercase tracking-tighter ${canSubmit ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                                    {canSubmit ? 'Submit' : 'View'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 bg-slate-900 rounded-[24px] p-4 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Quy trình V3</span>
                    </div>
                    <p className="text-[10px] font-bold leading-relaxed opacity-90">
                        Báo cáo được quét bởi Decision Engine để tối ưu hóa vận hành thời gian thực.
                    </p>
                </div>
            </div>

            <div className="p-6 text-center opacity-20">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    TMG OPERATION v3.0
                </p>
            </div>
        </div>
    );
};

export default PageDailyReporting;
