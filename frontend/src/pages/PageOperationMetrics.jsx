import React, { useState, useEffect } from 'react';
import { metricsAPI } from '../api/metrics.api';

const PageOperationMetrics = ({ user, onBack }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(user?.store_code || '');

    useEffect(() => {
        if (selectedStore) {
            fetchMetrics();
        }
    }, [selectedStore]);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const startDate = lastWeek.toISOString().split('T')[0];

            const res = await metricsAPI.getStoreMetrics(selectedStore, startDate, today);
            if (res.success) {
                setMetrics(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ score }) => {
        const color = score >= 80 ? 'bg-emerald-500' : (score >= 50 ? 'bg-amber-500' : 'bg-rose-500');
        const label = score >= 80 ? 'EXCELLENT' : (score >= 50 ? 'STABLE' : 'RISK');
        return (
            <div className={`px-2 py-0.5 rounded-full text-[7px] font-black text-white uppercase tracking-widest ${color}`}>
                {label}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-20">
            {/* V3 PREMIUM HEADER */}
            <div className="bg-slate-900 pt-10 pb-20 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                <div className="relative z-10">
                    <button onClick={onBack} className="bg-white/10 text-white/80 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-6 border border-white/5 active:scale-95 transition-all">
                        ← Dashboard
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-900/40 -rotate-3 border-2 border-slate-100">
                                📊
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Operation Metrics</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">Decision Engine v3.0 Pulse</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Real-time Pulse</div>
                            <div className="flex items-center gap-1 justify-end">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-white italic">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20 space-y-5">
                {/* GLOBAL PERFORMANCE CARD */}
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Efficiency Index</h3>
                        <StatusBadge score={metrics?.avg_score || 0} />
                    </div>

                    <div className="flex items-end gap-1 px-2">
                        <div className="text-5xl font-black text-slate-900 leading-none tracking-tighter">
                            {Math.round(metrics?.avg_score || 0)}
                        </div>
                        <div className="text-base font-black text-slate-300 pb-1.5">%</div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                        <div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Compliance</div>
                            <div className="text-sm font-black text-slate-700">{Math.round(metrics?.compliance_rate || 0)}%</div>
                        </div>
                        <div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Incidents</div>
                            <div className="text-sm font-black text-rose-600">{metrics?.total_incidents || 0}</div>
                        </div>
                    </div>
                </div>

                {/* DOMAIN SCORES */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Attendance', icon: '⏰', score: metrics?.avg_score || 0, color: 'text-blue-500' },
                        { label: 'Execution', icon: '🎯', score: metrics?.compliance_rate || 0, color: 'text-indigo-500' },
                        { label: 'Hygiene/5S', icon: '✨', score: 85, color: 'text-emerald-500' },
                        { label: 'Equipment', icon: '⚙️', score: 92, color: 'text-amber-500' }
                    ].map((domain, i) => (
                        <div key={i} className="bg-white p-4 rounded-[28px] shadow-lg border border-slate-100">
                            <div className="text-lg mb-2">{domain.icon}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{domain.label}</div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-black ${domain.color}`}>{domain.score}%</span>
                                <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${domain.color.replace('text', 'bg')}`} style={{ width: `${domain.score}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DAILY TREND MOCKUP */}
                <div className="bg-slate-900 p-6 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-60">7-Day Performance Trend</h3>
                    <div className="flex items-end justify-between h-32 gap-3">
                        {[45, 78, 92, 85, 95, 88, 72].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125 shadow-lg ${h > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ height: `${h}%` }}
                                ></div>
                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTION REQUIRED LIST */}
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Urgent Actions (Signals)</h3>
                    <div className="space-y-3">
                        {[
                            { title: 'Late Start Pattern', severity: 'HIGH', time: 'Shift 1' },
                            { title: 'Critical Task Miss', severity: 'CRITICAL', time: 'Shift 2' }
                        ].map((action, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${action.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`}></div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-800 uppercase">{action.title}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase">{action.time}</div>
                                    </div>
                                </div>
                                <button className="bg-white px-3 py-1.5 rounded-xl text-[8px] font-black text-blue-600 border border-slate-200 uppercase tracking-widest shadow-sm">View</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageOperationMetrics;
