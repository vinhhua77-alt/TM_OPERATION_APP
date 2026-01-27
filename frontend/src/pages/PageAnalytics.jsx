import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { dashboardAPI } from '../api/dashboard';
import { masterAPI } from '../api/master'; // [NEW] Import Master API
import Modal from '../components/Modal';

const PageAnalytics = ({ user, viewMode = 'leader', onBack }) => {
    // State
    const [periodMode, setPeriodMode] = useState('day');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [selectedStore, setSelectedStore] = useState('ALL');
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [currentView, setCurrentView] = useState(viewMode); // [NEW] Switchable View

    // Modal State
    const [activeModal, setActiveModal] = useState(null);
    const [moodFilter, setMoodFilter] = useState(null); // [NEW] Filter inside Mood Modal

    // CONFIGURATION: METRICS PER VIEW MODE
    const METRIC_CONFIGS = {
        'leader': [
            { id: 'TOTAL_SHIFTS', label: 'TỔNG CA', icon: '📅', color: 'blue', valKey: 'totalShifts' },
            { id: 'WRONG_SHIFT', label: 'SAI CA', icon: '🚫', color: 'red', valKey: 'wrongShiftsCount' },
            { id: 'HOURS', label: 'TỔNG GIỜ', icon: '⏱️', color: 'indigo', valKey: 'hours.total' },
            { id: 'INCIDENT', label: 'SỰ CỐ', icon: '⚠️', color: 'yellow', valKey: 'incidentsCount' },

            { id: 'HOURS_AM', label: 'GIỜ SÁNG', icon: '☀️', color: 'orange', valKey: 'hours.am' },
            { id: 'HOURS_PM', label: 'GIỜ CHIỀU', icon: '🌙', color: 'purple', valKey: 'hours.pm' },
            { id: 'CHECKLIST', label: 'CHECKLIST', icon: '✅', color: 'green', valKey: 'checklistScore', mock: '100%' },
            { id: 'MOOD', label: 'CẢM XÚC', icon: '😊', color: 'cyan', valKey: 'mood.avg' },
        ],
        'sm': [
            { id: 'HEADCOUNT', label: 'NHÂN SỰ', icon: '👥', color: 'green', valKey: 'headcount.today' },
            { id: 'WRONG_SHIFT', label: 'SAI CA', icon: '🚫', color: 'red', valKey: 'wrongShiftsCount' },
            { id: 'HOURS', label: 'GIỜ LÀM', icon: '⏱️', color: 'indigo', valKey: 'hours.total' },
            { id: 'INCIDENT', label: 'SỰ CỐ', icon: '⚠️', color: 'orange', valKey: 'incidentsCount' },
            { id: 'FEEDBACK', label: 'GÓP Ý', icon: '💡', color: 'cyan', valKey: 'feedbacksCount' },
            { id: 'MOOD', label: 'CẢM XÚC', icon: '😊', color: 'yellow', valKey: 'mood.avg' },
            { id: 'LAYOUT', label: 'LAYOUT', icon: '🗺️', color: 'blue', valKey: 'layoutCoverage', mock: 'View' },
            { id: 'CHECKLIST', label: 'CHECKLIST', icon: '✅', color: 'purple', valKey: 'checklistScore', mock: '100%' },
        ],
        'ops': [
            { id: 'REVENUE', label: 'DOANH THU', icon: '💰', color: 'green', valKey: 'revenue', mock: '1.2B' },
            { id: 'TOTAL_SHIFTS', label: 'TỔNG CA', icon: '📅', color: 'blue', valKey: 'totalShifts' },
            { id: 'HOURS', label: 'TỔNG GIỜ', icon: '⏱️', color: 'purple', valKey: 'hours.total' },
            { id: 'INCIDENT', label: 'SỰ CỐ', icon: '⚠️', color: 'red', valKey: 'incidentsCount' },
            { id: 'AUDIT', label: 'AUDIT', icon: '🛡️', color: 'indigo', valKey: 'auditScore', mock: '95/100' },
            { id: 'CSAT', label: 'CSAT', icon: '❤️', color: 'rose', valKey: 'csat', mock: '4.9' },
            { id: 'COST_LABOR', label: 'LABOR COST', icon: '📉', color: 'orange', valKey: 'laborCost', mock: '18%' },
            { id: 'COST_COGS', label: 'COGS', icon: '📦', color: 'gray', valKey: 'cogs', mock: '32%' },
        ],
        'bod': [
            { id: 'REVENUE_MONTH', label: 'DOANH THU', icon: '💰', color: 'green', valKey: 'revenueMonth', mock: '4.5B' },
            { id: 'PROFIT', label: 'LỢI NHUẬN', icon: '📈', color: 'blue', valKey: 'profit', mock: '850M' },
            { id: 'GROWTH', label: 'TĂNG TRƯỞNG', icon: '🚀', color: 'purple', valKey: 'growth', mock: '+12%' },
            { id: 'ENPS', label: 'eNPS', icon: '😊', color: 'yellow', valKey: 'mood.avg' },
            { id: 'RUNWAY', label: 'RUNWAY', icon: '⏳', color: 'red', valKey: 'runway', mock: '18M' },
            { id: 'CAC', label: 'CAC', icon: '💸', color: 'orange', valKey: 'cac', mock: '$12' },
            { id: 'LTV', label: 'LTV', icon: '💎', color: 'cyan', valKey: 'ltv', mock: '$450' },
            { id: 'BURN', label: 'BURN RATE', icon: '🔥', color: 'rose', valKey: 'burn', mock: '$50k' },
        ]
    };

    // Default active metrics based on currentView
    const activeMetrics = METRIC_CONFIGS[currentView] || METRIC_CONFIGS['sm'];

    // Helper: Deep get value
    const getVal = (path, fallback) => {
        if (!data) return 0;
        return path.split('.').reduce((acc, part) => acc && acc[part], data) || fallback || 0;
    };

    // Helper: Format Date
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Auto-select ALL stores for High-Level views (Only if allowed)
    useEffect(() => {
        if (['ops', 'bod'].includes(currentView)) {
            // Only auto-select ALL if user has access to multiple stores
            if (stores.length > 1) setSelectedStore('ALL');
        }
    }, [currentView, stores]);

    // Sync prop viewMode into state if prop changes
    useEffect(() => {
        setCurrentView(viewMode);
    }, [viewMode]);

    // Load Stores on Mount with PERMISSION CHECK
    useEffect(() => {
        const loadStores = async () => {
            try {
                const res = await masterAPI.getStores();
                if (res.success) {
                    let allStores = res.data || [];

                    // PERMISSION FILTER
                    // Allowed Roles: ADMIN, IT, OPS -> See All
                    // Others (LEADER, SM, STAFF) -> See Assigned Only
                    const allowedRoles = ['ADMIN', 'IT', 'OPS', 'BOD'];
                    const userRole = user?.role || 'STAFF'; // Default to restricted

                    let filteredStores = [];
                    if (allowedRoles.includes(userRole)) {
                        filteredStores = allStores;
                    } else {
                        // User can only see their assigned store
                        // Verify against user.store_code or user.store_id
                        const userStoreCode = user?.store_code || 'TMG'; // Fallback for safety/dev
                        filteredStores = allStores.filter(s => s.store_code === userStoreCode);
                    }

                    setStores(filteredStores);

                    // Auto-select if only 1 option
                    if (filteredStores.length === 1) {
                        setSelectedStore(filteredStores[0].store_code);
                    }
                }
            } catch (e) {
                console.error("Failed to load stores", e);
            }
        };
        loadStores();
    }, [user]); // Re-run if user changes

    useEffect(() => {
        loadData();
    }, [periodMode, anchorDate, selectedStore, currentView]);

    // Helper: Calculate Range
    const getRangeFromMode = () => {
        const start = new Date(anchorDate);
        const end = new Date(anchorDate);

        if (periodMode === 'day') {
            // keep as is
        } else if (periodMode === 'week') {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);

            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else if (periodMode === 'month') {
            start.setDate(1);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
        } else if (periodMode === 'year') {
            start.setMonth(0, 1);
            end.setMonth(11, 31);
        }
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const periodConfig = getRangeFromMode();
            const res = await dashboardAPI.getLeaderAnalytics(user.id, periodConfig, selectedStore);

            if (res.success) {
                setData(res.data);
            } else {
                console.error("Failed to load analytics");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ... (Navigation Helpers kept same) ...
    const getWeekNumber = (d) => {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    };

    const handleNavigateDate = (dir) => {
        const newDate = new Date(anchorDate);
        if (periodMode === 'day') newDate.setDate(newDate.getDate() + dir);
        if (periodMode === 'week') newDate.setDate(newDate.getDate() + (dir * 7));
        if (periodMode === 'month') newDate.setMonth(newDate.getMonth() + dir);
        if (periodMode === 'year') newDate.setFullYear(newDate.getFullYear() + dir);
        setAnchorDate(newDate);
    };

    const getPeriodLabel = () => {
        if (periodMode === 'day') return `${anchorDate.getDate()}/${anchorDate.getMonth() + 1}/${anchorDate.getFullYear()}`;
        if (periodMode === 'week') {
            const { startDate, endDate } = getRangeFromMode();
            const startArr = startDate.split('-');
            const endArr = endDate.split('-');
            return `Tuần ${getWeekNumber(anchorDate)} (${startArr[2]}/${startArr[1]} - ${endArr[2]}/${endArr[1]})`;
        }
        if (periodMode === 'month') return `Tháng ${anchorDate.getMonth() + 1}/${anchorDate.getFullYear()}`;
        return `Năm ${anchorDate.getFullYear()}`;
    };

    // Render Modal Content based on activeModal
    const renderModalContent = () => {
        if (!data) return null;

        const tableClass = "w-full text-left text-sm text-slate-700";
        const thClass = "bg-slate-50 p-2 font-black text-xs uppercase text-slate-500 border-b border-slate-100";
        const tdClass = "p-2 border-b border-slate-50";

        switch (activeModal) {
            case 'WRONG_SHIFT':
                return (
                    <table className={tableClass}>
                        <thead><tr><th className={thClass}>Ngày</th><th className={thClass}>Nhân viên</th><th className={thClass}>Lý do</th></tr></thead>
                        <tbody>
                            {data.wrongShifts?.map((item, i) => (
                                <tr key={i}>
                                    <td className={tdClass}>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                    <td className={tdClass}><div className="font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{item.store}</div></td>
                                    <td className={`font-bold text-red-600 ${tdClass}`}>{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'INCIDENT':
                return (
                    <table className={tableClass}>
                        <thead><tr><th className={thClass}>Ngày</th><th className={thClass}>Nhân viên</th><th className={thClass}>Nội dung</th></tr></thead>
                        <tbody>
                            {data.incidents?.map((item, i) => (
                                <tr key={i}>
                                    <td className={tdClass}>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                    <td className={tdClass}><div className="font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{item.store}</div></td>
                                    <td className={tdClass}>{item.content}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'HOURS':
                return (
                    <div className="p-4 space-y-4">
                        <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center text-orange-700">
                            <span className="font-bold">☀️ Ca Sáng (AM)</span>
                            <span className="text-2xl font-black">{data.hours?.am || 0}h</span>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center text-indigo-700">
                            <span className="font-bold">🌙 Ca Chiều (PM)</span>
                            <span className="text-2xl font-black">{data.hours?.pm || 0}h</span>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center text-green-700">
                            <span className="font-bold">∑ TỔNG CỘNG</span>
                            <span className="text-2xl font-black">{data.hours?.total || 0}h</span>
                        </div>
                    </div>
                );
            case 'MOOD':
                // Filter details if a mood is selected, otherwise show all or none?
                // Default: Show none or show all? Let's show filtered list.
                const filteredMoods = moodFilter
                    ? data.moodDetails?.filter(m => String(m.rating) === String(moodFilter))
                    : [];

                return (
                    <div className="p-4">
                        <div className="flex justify-around mb-6">
                            {Object.entries(data.mood?.distribution || {}).map(([rating, count]) => (
                                <div
                                    key={rating}
                                    className={`text-center cursor-pointer p-2 rounded-xl transition-all ${String(moodFilter) === String(rating) ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-slate-50'}`}
                                    onClick={() => setMoodFilter(String(moodFilter) === String(rating) ? null : rating)} // Toggle filter
                                >
                                    <div className="text-3xl mb-1">{rating >= 5 ? '🔥' : rating >= 4 ? '😄' : '😐'}</div>
                                    <div className="font-black text-slate-700">{count}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Rate {rating}</div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center p-4 bg-slate-50 rounded-xl mb-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-1">Điểm TB Cảm Xúc</h3>
                            <div className="text-4xl font-black text-blue-600">{data.mood?.avg} / 5.0</div>
                        </div>

                        {/* Detail List */}
                        {moodFilter && (
                            <div className="animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                                    Danh sách nhân viên ({filteredMoods?.length})
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {filteredMoods?.length > 0 ? filteredMoods.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                                            <div>
                                                <div className="font-bold text-sm text-slate-700">{item.name}</div>
                                                <div className="text-[10px] text-slate-400">{new Date(item.date).toLocaleTimeString('vi-VN')} - {item.store}</div>
                                            </div>
                                            <div className="text-sm font-bold text-blue-600">{item.rating}/5</div>
                                        </div>
                                    )) : (
                                        <div className="text-center text-slate-400 text-xs py-4">Chưa có dữ liệu chi tiết</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'FEEDBACK':
                return (
                    <table className={tableClass}>
                        <thead><tr><th className={thClass}>Ngày</th><th className={thClass}>NV</th><th className={thClass}>Góp ý</th></tr></thead>
                        <tbody>
                            {data.feedbacks?.map((item, i) => (
                                <tr key={i}>
                                    <td className={tdClass}>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                    <td className={tdClass}><div className="font-bold">{item.name}</div></td>
                                    <td className={`text-blue-600 italic ${tdClass}`}>"{item.content}"</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'HEADCOUNT':
                return (
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div className="bg-slate-100 p-4 rounded-xl text-center">
                            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Sáng</div>
                            <div className="text-3xl font-black text-slate-800">{data.headcount?.am}</div>
                            <div className="text-[10px] text-slate-400">Nhân sự</div>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-xl text-center">
                            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Chiều</div>
                            <div className="text-3xl font-black text-slate-800">{data.headcount?.pm}</div>
                            <div className="text-[10px] text-slate-400">Nhân sự</div>
                        </div>
                    </div>
                );
            case 'LAYOUT':
                return (
                    <div className="space-y-4">
                        {/* Summary Header requested by User */}
                        <div className="grid grid-cols-2 gap-4 pt-2 px-2">
                            <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
                                <span className="block text-xs font-bold text-orange-400 uppercase">Tổng Giờ Sáng</span>
                                <span className="text-xl font-black text-orange-600">{data.hours?.am || 0}h</span>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-xl text-center border border-indigo-100">
                                <span className="block text-xs font-bold text-indigo-400 uppercase">Tổng Giờ Chiều</span>
                                <span className="text-xl font-black text-indigo-600">{data.hours?.pm || 0}h</span>
                            </div>
                        </div>

                        <table className={tableClass}>
                            <thead>
                                <tr>
                                    <th className={thClass}>Vị trí</th>
                                    <th className="bg-orange-50 p-2 font-black text-xs uppercase text-orange-600 border-b border-orange-100 text-center">NV Sáng</th>
                                    <th className="bg-indigo-50 p-2 font-black text-xs uppercase text-indigo-600 border-b border-indigo-100 text-center">NV Chiều</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data.layoutMatrix || {}).map(([layout, counts], i) => (
                                    <tr key={i}>
                                        <td className={`font-bold ${tdClass}`}>{layout}</td>
                                        <td className={`text-center font-mono font-bold text-orange-600 ${tdClass}`}>{counts.AM || 0}</td>
                                        <td className={`text-center font-mono font-bold text-indigo-600 ${tdClass}`}>{counts.PM || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 fade-in">
            {/* HEADER & CONTROLS */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-100 px-3 py-3 space-y-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        {currentView === 'sm' ? 'STORE MANAGER' : currentView} DASHBOARD
                    </h1>
                    <button onClick={onBack} className="text-sm text-slate-500 font-bold">Thoát</button>
                </div>

                {/* VIEW SWITCHER (DEV ONLY - FOR DEMO) */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(() => {
                        // ROLE-BASED VIEW VISIBILITY
                        // Higher roles see their view AND all lower views
                        const role = user?.role || 'STAFF';
                        let availableViews = ['leader']; // Everyone sees Leader view

                        if (['SM', 'OPS', 'BOD', 'ADMIN', 'IT'].includes(role)) {
                            availableViews.push('sm');
                        }
                        if (['OPS', 'BOD', 'ADMIN', 'IT'].includes(role)) {
                            availableViews.push('ops');
                        }
                        if (['BOD', 'ADMIN', 'IT'].includes(role)) {
                            availableViews.push('bod');
                        }

                        // For Demo Purpose (If role is not set correctly in dev, force all)
                        // Remove this in prod if roles are strict
                        if (role === 'STAFF' && !user?.role) availableViews = ['leader', 'sm', 'ops', 'bod'];

                        return availableViews.map(v => (
                            <button
                                key={v}
                                onClick={() => setCurrentView(v)}
                                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition-all ${currentView === v ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {v}
                            </button>
                        ));
                    })()}
                </div>

                {/* FILTERS */}
                <div className="flex gap-2">
                    {/* Period Selector */}
                    <div className="bg-slate-100 p-1 rounded-lg flex text-[10px] font-bold">
                        {['day', 'week', 'month', 'year'].map(m => (
                            <button
                                key={m}
                                onClick={() => setPeriodMode(m)}
                                className={`px-2.5 py-1.5 rounded-md uppercase transition-all ${periodMode === m ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
                            >
                                {m === 'day' ? 'Ngày' : m === 'week' ? 'Tuần' : m === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>

                    {/* Store Selector */}
                    <select
                        className="bg-slate-100 border-none text-[11px] font-bold rounded-lg px-2 py-1 flex-1 text-slate-700 outline-none"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        disabled={['ops', 'bod'].includes(currentView) && selectedStore === 'ALL'} // Optional locking
                    >
                        <option value="ALL">Tất cả nhà hàng</option>
                        {stores && stores.map((store, i) => (
                            <option key={store.id || i} value={store.store_code}>
                                {store.store_code} - {store.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Navigator */}
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <button onClick={() => handleNavigateDate(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-400">◀</button>
                    <span className="font-black text-slate-700">{getPeriodLabel()}</span>
                    <button onClick={() => handleNavigateDate(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-400">▶</button>
                </div>
            </div>

            {/* MAIN GRID - COMPACT 4x2 */}
            <div className="p-2">
                <div className={`grid grid-cols-4 gap-1.5 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {activeMetrics.map((metric, index) => (
                        <div key={metric.id + index} onClick={() => setActiveModal(metric.id)} className={
                            (metric.span ? `col-span-${metric.span}` : '')
                        }>
                            <StatCard
                                label={metric.label}
                                value={metric.mock || getVal(metric.valKey)}
                                icon={metric.icon}
                                color={metric.color}
                                compactClickable
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {activeModal && (
                <Modal title={`${activeModal.replace('_', ' ')} DETAIL`} onClose={() => setActiveModal(null)}>
                    {renderModalContent()}
                </Modal>
            )}
        </div>
    );
};

export default PageAnalytics;
