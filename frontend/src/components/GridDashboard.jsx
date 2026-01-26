import React from 'react';

const GridDashboard = ({ config, onEdit, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
                ))}
            </div>
        );
    }

    const layout = config?.grid_layout || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Decision Board 3x3</h2>
                <button onClick={onEdit} className="text-[10px] font-black text-blue-600 uppercase border-b border-blue-200">
                    Tùy chỉnh
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {layout.map((item, idx) => (
                    <div
                        key={item.id || idx}
                        className="group aspect-square bg-white rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-center justify-center p-3 text-center active:scale-95 transition-all relative overflow-hidden active:bg-slate-50"
                    >
                        <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform">{getIcon(item.metric_key)}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 tracking-tighter truncate w-full">
                            {item.label}
                        </div>
                        <div className={`text-xs font-black italic tracking-tighter ${getValueColor(item.value)}`}>
                            {item.value || '---'}
                        </div>

                        {/* Status Pulse for high-stakes metrics */}
                        {item.metric_key === 'health' && item.value === 'GREEN' && (
                            <div className="absolute top-2 right-2 flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const getIcon = (key) => {
    const icons = {
        health: '🌡️',
        compliance: '🛡️',
        haccp: '🧊',
        peak_hours: '📈',
        manpower: '👥',
        quick_check: '📋',
        store_status: '📡',
        revenue: '💰',
        system_pulse: '⚡'
    };
    return icons[key] || '📊';
};

const getValueColor = (val) => {
    if (!val) return 'text-slate-300';
    if (val === 'GREEN' || val === 'OK' || val === 'FULL') return 'text-emerald-500';
    if (val === 'RED' || val === 'CRITICAL' || val === 'FAIL') return 'text-rose-500';
    if (val === 'AMBER' || val === 'LOW') return 'text-amber-500';
    return 'text-slate-800';
};

export default GridDashboard;
