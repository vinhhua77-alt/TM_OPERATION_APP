import React, { useState, useEffect } from 'react';
import StoreGridSelector from '../components/analytics/StoreGridSelector';
import TimeRangePicker from '../components/analytics/TimeRangePicker';
import { masterDataAPI } from '../api/master-data';
import { analyticsAPI } from '../api/analytics.api';

const PageAnalytics = ({ user, onBack }) => {
    // 1. PHÂN QUYỀN MẶC ĐỊNH
    const isSM = user?.role === 'SM' || user?.role === 'LEADER';
    const userStore = user?.storeCode || 'ALL';

    const [activeTab, setActiveTab] = useState('leader');
    const [selectedStore, setSelectedStore] = useState(isSM ? userStore : 'ALL');
    const [mode, setMode] = useState('day');
    const [date, setDate] = useState(new Date());
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    // Hệ màu thương hiệu nâng cấp (Sáng, Nhẹ, Sang trọng)
    const colorMap = {
        'ALL': 'from-blue-600 to-indigo-700',
        'TMG01': 'from-blue-400 to-blue-600',
        'TMG02': 'from-emerald-400 to-emerald-600',
        'TMG03': 'from-violet-400 to-violet-600',
        'TMG04': 'from-amber-400 to-orange-500',
        'TMG05': 'from-rose-400 to-rose-600',
        'TMG06': 'from-sky-400 to-sky-600',
        'TMG07': 'from-indigo-400 to-indigo-600',
        'TMG08': 'from-orange-400 to-red-500',
        'TMG09': 'from-teal-400 to-teal-600',
        'TMG10': 'from-pink-400 to-pink-600',
    };

    const currentTheme = colorMap[selectedStore] || 'from-slate-400 to-slate-600';
    const textColor = currentTheme.replace('bg-', 'text-');

    const availableTabs = [
        { id: 'leader', label: 'Điều Hành', icon: '⚡', role: ['LEADER', 'SM', 'OPS', 'ADMIN', 'BOD'] },
        { id: 'sm', label: 'Cửa Hàng', icon: '🏢', role: ['SM', 'OPS', 'ADMIN', 'BOD'] },
        { id: 'ops', label: 'Hệ Thống', icon: '📊', role: ['OPS', 'ADMIN', 'BOD'] },
        { id: 'bod', label: 'Tầm Nhìn', icon: '💎', role: ['ADMIN', 'BOD'] }
    ].filter(t => t.role.includes(user?.role));

    useEffect(() => {
        if (!isSM) loadStores();
    }, [user]);

    useEffect(() => { loadData(); }, [selectedStore, mode, date, activeTab]);

    const loadStores = async () => {
        try {
            const res = await masterDataAPI.getAllStores();
            if (res.success) setStores(res.data.slice(0, 10));
        } catch (e) { console.error(e); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Tính toán Range Date (Dựa trên mode & date hiện tại)
            let start, end;
            const d = new Date(date);
            if (mode === 'day') {
                start = end = d.toISOString().split('T')[0];
            } else if (mode === 'week') {
                const day = d.getDay() || 7;
                const Monday = new Date(d);
                Monday.setDate(d.getDate() - day + 1);
                const Sunday = new Date(Monday);
                Sunday.setDate(Monday.getDate() + 6);
                start = Monday.toISOString().split('T')[0];
                end = Sunday.toISOString().split('T')[0];
            } else {
                start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
            }

            // 2. Gọi API
            const res = await analyticsAPI.getStoreMetrics(selectedStore, start, end);

            if (res.success && res.data) {
                const rawData = res.data;
                const count = rawData.length || 1;

                // Aggregator
                const sums = rawData.reduce((acc, curr) => {
                    const ext = curr.extended_metrics || {};
                    return {
                        health: acc.health + (curr.health_score || 0),
                        incidents: acc.incidents + (curr.incident_count || 0),
                        checklist: acc.checklist + (curr.avg_checklist_score || 0),
                        mood: acc.mood + (curr.avg_mood_score || 0),
                        late: acc.late + (ext.late_count || 0),
                        headcount: acc.headcount + (ext.headcount || 0),
                        cagay: acc.cagay + (ext.split_shift_count || 0),
                        uniform: acc.uniform + (ext.uniform_violations || 0),
                        training: acc.training + (ext.training_hours || 0)
                    };
                }, { health: 0, incidents: 0, checklist: 0, mood: 0, late: 0, headcount: 0, cagay: 0, uniform: 0, training: 0 });

                const avg = {
                    health: Math.round(sums.health / count),
                    incidents: sums.incidents,
                    checklist: Math.round(sums.checklist / count),
                    mood: (sums.mood / count).toFixed(1),
                    late: sums.late,
                    headcount: Math.round(sums.headcount / count), // Average headcount per day
                    cagay: sums.cagay,
                    uniform: sums.uniform,
                    training: Math.round(sums.training)
                };

                const isAll = selectedStore === 'ALL';
                const formattedData = {
                    leader: [
                        { n: 'Checklist', v: `${avg.checklist}%`, i: '✅' },
                        { n: 'Mood', v: avg.mood, i: '😊' },
                        { n: 'Sự cố', v: avg.incidents.toString(), i: '⚠️' },
                        { n: 'Đi muộn', v: avg.late.toString(), i: '⏰' },
                        { n: 'Sức khỏe', v: `${avg.health}%`, i: '🌡️' },
                        { n: 'Headcount', v: avg.headcount.toString(), i: '👥' },
                        { n: 'Ca gãy', v: avg.cagay.toString(), i: '📉' },
                        { n: 'Đồng phục', v: avg.uniform.toString(), i: '👔' },
                        { n: 'Training', v: `${avg.training}h`, i: '📖' }
                    ],
                    sm: [
                        { n: 'Hiệu suất', v: avg.health > 80 ? 'Cao' : 'Khá', i: '⚡' },
                        { n: 'Giờ công', v: `${Math.round(sums.training + (avg.headcount * 8))}h`, i: '⏱️' },
                        { n: 'Checklist', v: `${avg.checklist}%`, i: '📋' },
                        { n: 'Mood', v: avg.mood, i: '🌟' },
                        { n: 'Sự cố', v: avg.incidents.toString(), i: '🎯' },
                        { n: 'Vệ sinh', v: 'Ổn', i: '🧹' },
                        { n: 'Nhân sự', v: avg.headcount.toString(), i: '👥' },
                        { n: 'OT', v: '0h', i: '🔥' },
                        { n: 'Late/Fail', v: avg.late.toString(), i: '🚫' }
                    ],
                    ops: [
                        { n: 'Năng suất', v: (avg.health / 80).toFixed(1), i: '⚡' },
                        { n: 'Tuân thủ', v: `${avg.checklist}%`, i: '🛡️' },
                        { n: 'Rủi ro', v: avg.incidents > 5 ? 'Cao' : 'Thấp', i: '🛡️' },
                        { n: 'Lỗi quy trình', v: (avg.late + avg.uniform).toString(), i: '🚫' },
                        { n: 'Health', v: avg.health >= 80 ? 'A+' : 'B', i: '🌡️' },
                        { n: 'Top Store', v: isAll ? 'TMG01' : selectedStore, i: '🏆' },
                        { n: 'Đào tạo', v: `${avg.checklist}%`, i: '🎓' },
                        { n: 'QA/QC', v: (avg.checklist / 10).toFixed(1), i: '🔍' },
                        { n: 'Tăng trưởng', v: '+2%', i: '📈' }
                    ],
                    bod: [
                        { n: 'EBITDA', v: '18%', i: '💎' },
                        { n: 'ROI', v: '15%', i: '🏦' },
                        { n: 'Tăng trưởng', v: '+12%', i: '🚀' },
                        { n: 'Sức khỏe', v: avg.health >= 80 ? 'Ổn định' : 'Cần chú ý', i: '🌈' },
                        { n: 'Thương hiệu', v: avg.mood, i: '⭐' },
                        { n: 'Mở rộng', v: 'TMG11', i: '🏗️' },
                        { n: 'Công suất', v: `${avg.health}%`, i: '⚡' },
                        { n: 'Thị phần', v: '11%', i: '🌍' },
                        { n: 'Ổn định', v: avg.incidents === 0 ? 'Cao' : 'Vừa', i: '⚓' }
                    ]
                };
                setData(formattedData);
            }
        } catch (e) {
            console.error("Analytics load error:", e);
        } finally {
            setLoading(false);
        }
    };

    const currentTabInfo = availableTabs.find(t => t.id === activeTab);
    const activeStats = data ? data[activeTab] : [];

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans pb-10">
            {/* FRAMEWORK HEADER - DYNAMIC GRADIENT */}
            <div className={`shrink-0 bg-gradient-to-br ${currentTheme} p-4 pb-8 text-white relative overflow-hidden shadow-lg transition-all duration-1000`}>
                <div className="relative z-10">
                    <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white text-[8px] font-bold px-3 py-1 rounded-full transition-all backdrop-blur-md border border-white/5 uppercase tracking-tighter mb-3 active:scale-95">
                        ← Dashboard
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-2xl shadow-xl rotate-2 leading-none animate-in zoom-in duration-500">
                            {currentTabInfo?.icon || '📈'}
                        </div>
                        <div>
                            <h1 className="text-lg font-black uppercase tracking-tight leading-none mb-0.5">TM ANALYTICS</h1>
                            <p className="text-[8px] font-bold opacity-80 uppercase tracking-widest">
                                {selectedStore === 'ALL' ? 'Chain Overview' : `Branch: ${selectedStore}`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-[70px]"></div>
                <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-black/5 rounded-full blur-[50px]"></div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 px-4 -mt-6 relative z-20 space-y-4">

                {/* ROLE TABS */}
                <div className="flex bg-white p-1 rounded-[20px] shadow-xl flex gap-1 border border-slate-100/50">
                    {availableTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2.5 rounded-xl text-[8.5px] font-black uppercase tracking-tighter transition-all duration-500 ${activeTab === tab.id ? `bg-gradient-to-r ${currentTheme} text-white shadow-lg scale-[1.02]` : 'text-slate-400'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* LƯỚI CHỈ SỐ SIÊU TINH GỌN (4 CỘT) */}
                <div className="grid grid-cols-4 gap-1.5 relative min-h-[140px]">
                    {loading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/40 backdrop-blur-[2px] rounded-[24px]">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {activeStats.map((s, i) => {
                        return (
                            <div
                                key={i}
                                className={`
                                    py-1.5 px-0.5 rounded-xl shadow-sm flex flex-col items-center text-center active:scale-95 transition-all duration-500
                                    bg-gradient-to-br ${currentTheme} border border-white/5
                                `}
                                style={{ animationDelay: `${i * 15}ms` }}
                            >
                                <span className={`text-[13px] mb-0`}>{s.i}</span>
                                <div className={`text-[9.5px] font-black leading-none mb-0.5 text-white`}>{s.v}</div>
                                <div className={`text-[5px] font-extrabold uppercase tracking-tighter text-white/80`}>{s.n}</div>
                            </div>
                        );
                    })}
                </div>

                {/* SELECTORS (Only for OPS+) */}
                {!isSM && (
                    <div className="bg-white p-4 rounded-[28px] shadow-xl border border-slate-100/80 space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className={`w-1 h-3.5 rounded-full bg-gradient-to-b ${currentTheme}`}></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hệ Thống Chi Nhánh</span>
                        </div>
                        <StoreGridSelector stores={stores} selectedStore={selectedStore} onSelect={setSelectedStore} />
                    </div>
                )}

                {/* TIME PICKER */}
                <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
                    <TimeRangePicker mode={mode} setMode={setMode} date={date} setDate={setDate} />
                </div>

                {/* INSIGHT CARD */}
                <div className="bg-slate-900 rounded-[24px] p-5 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`w-1.5 h-1.5 rounded-full ${currentTheme} animate-pulse`}></span>
                            <h3 className="text-[9px] font-black uppercase tracking-widest opacity-40">Insight Hệ Thống</h3>
                        </div>
                        <p className="text-[11px] font-bold leading-relaxed opacity-90 italic">
                            "{selectedStore === 'ALL'
                                ? `Toàn chuỗi đang vận hành ổn định. Chú ý điểm nóng trung tâm.`
                                : `Chi nhánh ${selectedStore} đang ${activeTab === 'leader' ? 'thực thi tốt' : 'tăng trưởng ổn định'}. Duy trì phong độ.`}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 text-center opacity-20">
                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-[0.2em]">TMG Decision Engine v3.0</p>
            </div>
        </div>
    );
};

export default PageAnalytics;
