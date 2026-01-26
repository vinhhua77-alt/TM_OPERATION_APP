import React from 'react';

const PageDailyReporting = ({ user, onBack, onNavigate, sysConfig }) => {
    // 1. Define all possible modules with their IT Feature Flags
    const allModules = [
        {
            id: 'ops_report',
            label: 'NHẬT KÝ CA',
            icon: '📝',
            desc: 'Nhật ký ca & Báo cáo quản lý.',
            color: 'blue',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'SHIFT_LOG',
            flag: 'MODULE_SHIFTLOG'
        },
        {
            id: 'sm',
            label: 'CHỐT SỐ (SM)',
            icon: '👑',
            desc: 'Chốt ngày & Doanh thu.',
            color: 'purple',
            submitRoles: ['SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'SM_REPORT',
            flag: 'MODULE_SM_REPORT'
        },
        {
            id: '5s',
            label: 'TUÂN THỦ 5S',
            icon: '🛡️',
            desc: 'Vệ sinh & ATTP & Sẵn sàng.',
            color: 'orange',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'QAQC_HUB',
            flag: 'MODULE_5S'
        },
        {
            id: 'cashier',
            label: 'THU NGÂN',
            icon: '💰',
            desc: 'Đối soát quỹ tiền mặt.',
            color: 'rose',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_CASHIER',
            flag: 'MODULE_CASHIER'
        },
        {
            id: 'inventory',
            label: 'KIỂM KHO',
            icon: '📦',
            desc: 'Báo cáo kho cuối ngày.',
            color: 'emerald',
            submitRoles: ['LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_INVENTORY',
            flag: 'MODULE_INVENTORY'
        },
        {
            id: 'waste',
            label: 'HÀNG HỦY',
            icon: '🗑️',
            desc: 'Báo cáo hàng hủy/hỏng.',
            color: 'slate',
            submitRoles: ['LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_WASTE',
            flag: 'MODULE_WASTE'
        },
        {
            id: 'm5m',
            label: 'CHECK M5M',
            icon: '🌅',
            desc: 'Chuẩn bị đầu ca.',
            color: 'cyan',
            submitRoles: ['STAFF', 'LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'],
            target: 'REPORT_M5M',
            flag: 'MODULE_M5M'
        }
    ];

    // 2. Filter modules based on sysConfig (Feature Flags)
    const enabledFlags = sysConfig?.featureFlags || [];
    const modules = allModules.filter(m => enabledFlags.includes(m.flag));

    const handleAction = (m) => {
        const canSubmit = m.submitRoles.includes(user?.role);
        if (canSubmit) {
            onNavigate(m.target);
        } else {
            alert(`Vai trò ${user?.role} không có quyền thực hiện báo cáo này.`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 fade-in">
            {/* HEADER & CONTROLS */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-100 px-3 py-3 space-y-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        BÁO CÁO NGÀY
                    </h1>
                    <button onClick={onBack} className="text-sm text-slate-500 font-bold">Thoát</button>
                </div>
            </div>

            {/* ROLE INFO */}
            <div className="px-3 pt-3">
                <div className="bg-slate-100 px-3 py-2 rounded-lg flex items-center justify-between border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Vai trò hiện tại:</span>
                    <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm uppercase border border-blue-100">{user?.role}</span>
                </div>
            </div>

            {/* MODULE GRID */}
            <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                    {modules.map(m => {
                        const canSubmit = m.submitRoles.includes(user?.role);
                        return (
                            <div
                                key={m.id}
                                onClick={() => handleAction(m)}
                                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all flex flex-col items-center text-center group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-${m.color}-50 text-${m.color}-600 flex items-center justify-center text-2xl mb-3`}>
                                    {m.icon}
                                </div>
                                <h3 className="text-xs font-black text-slate-700 uppercase tracking-tight mb-1">{m.label}</h3>
                                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${canSubmit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                    {canSubmit ? 'Truy cập' : 'View Only'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {sysConfig?.featureFlags?.includes('MODULE_DECISION_ENGINE') && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-xl text-white shadow-lg text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1 animate-pulse">● Decision Engine Active</p>
                        <p className="text-[9px] text-slate-400">Dữ liệu được phân tích thời gian thực</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageDailyReporting;
