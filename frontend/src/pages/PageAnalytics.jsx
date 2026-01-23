import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/analytics.api';
import WidgetComponents from '../components/analytics/WidgetComponents';

const { HealthScoreCard, MoodTrendCard, TopStaffList, IncidentAlertCard } = WidgetComponents;

// ==========================================
// 1. COMPONENT: LEADER DASHBOARD (Daily Ops)
// ==========================================
const LeaderDashboard = ({ metrics, incidents, dateRange }) => {
    // Get latest day metrics
    const todayStats = metrics.length > 0 ? metrics[metrics.length - 1] : null;
    const ext = todayStats?.extended_metrics || {};

    return (
        <div className="space-y-4 fade-in">
            {/* Header Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatBox
                    label="Nhân sự đi làm"
                    value={ext.headcount || 0}
                    icon="👥"
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatBox
                    label="Tổng số ca"
                    value={ext.total_shifts || 0}
                    icon="📋"
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatBox
                    label="Tổng giờ công"
                    value={`${ext.total_hours || 0}h`}
                    icon="⏱️"
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatBox
                    label="KPI Checklist"
                    value={`${todayStats?.avg_checklist_score || 0}%`}
                    icon="✅"
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            {/* Incident Alert (Red if any) */}
            <div className={`p-4 rounded-xl border ${todayStats?.incident_count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold text-sm ${todayStats?.incident_count > 0 ? 'text-red-800' : 'text-green-800'}`}>
                        {todayStats?.incident_count > 0 ? '⚠️ Cần xử lý' : '✅ Vận hành ổn định'}
                    </h3>
                    <span className="text-xl">{todayStats?.incident_count > 0 ? '🚨' : '🛡️'}</span>
                </div>
                {todayStats?.incident_count > 0 ? (
                    <p className="text-xs text-red-600">Phát hiện {todayStats.incident_count} sự cố trong ngày.</p>
                ) : (
                    <p className="text-xs text-green-600">Không có sự cố nghiêm trọng nào hôm nay.</p>
                )}
            </div>

            {/* Recent Incidents List */}
            {incidents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Sự cố mới nhất</h3>
                    <div className="space-y-3">
                        {incidents.map((inc, idx) => (
                            <div key={idx} className="flex gap-3 items-start border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <div className="mt-1 min-w-[4px] h-[4px] rounded-full bg-red-500"></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800 line-clamp-2">{inc.note}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{inc.staff_master?.fullname || 'Staff'}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(inc.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="text-center text-[10px] text-gray-400 pt-2">
                Dữ liệu ngày: {dateRange.end}
            </div>
        </div>
    );
};

// ==========================================
// 2. COMPONENT: SM DASHBOARD (Weekly/Health)
// ==========================================
const SMDashboard = ({ metrics, topStaff, incidents, dateRange }) => {
    // Calculate averages over the period
    const avgHealth = Math.round(metrics.reduce((acc, m) => acc + (m.health_score || 0), 0) / (metrics.length || 1));

    return (
        <div className="space-y-6 fade-in">
            {/* Health Score Overview */}
            <HealthScoreCard score={avgHealth} status={avgHealth >= 80 ? 'OK' : 'WARNING'} />

            {/* Trend Chart */}
            <MoodTrendCard metrics={metrics} />

            {/* Staff Performance */}
            <TopStaffList staffList={topStaff} />

            {/* Critical Incidents */}
            {incidents.length > 0 && <IncidentAlertCard incidents={incidents} />}

            <div className="text-center text-[10px] text-gray-400 pt-2">
                Báo cáo tuần: {dateRange.start} - {dateRange.end}
            </div>
        </div>
    );
};

// ==========================================
// 3. COMPONENT: OPS DASHBOARD (Chain View)
// ==========================================
const OPSDashboard = ({ metrics, topStaff, incidents, dateRange, onStoreChange, storeList, selectedStoreId }) => {
    const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

    return (
        <div className="space-y-6 fade-in">
            {/* Store Filter */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <label className="text-xs font-bold text-gray-400 block mb-1">Chọn Chi Nhánh / Chuỗi</label>
                <select
                    className="w-full bg-gray-50 border border-gray-200 text-sm font-bold rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedStoreId}
                    onChange={(e) => onStoreChange(e.target.value)}
                >
                    {storeList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* High Level Metrics */}
            {latest && (
                <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Health Score" value={latest.health_score} icon="🏥" color={latest.health_score >= 80 ? 'text-green-600' : 'text-red-500'} bg="bg-white" />
                    <StatBox label="Incidents" value={latest.incident_count} icon="🔥" color="text-red-600" bg="bg-white" />
                    <StatBox label="Checklist" value={`${latest.avg_checklist_score}%`} icon="✅" color="text-blue-600" bg="bg-white" />
                    <StatBox label="Mood" value={latest.avg_mood_score} icon="😊" color="text-yellow-600" bg="bg-white" />
                </div>
            )}

            {/* Trends & Lists */}
            <MoodTrendCard metrics={metrics} />
            <TopStaffList staffList={topStaff} />

            <div className="text-center text-[10px] text-gray-400 pt-2">
                Báo cáo quản trị chuỗi: {dateRange.start} - {dateRange.end}
            </div>
        </div>
    );
};

// Helper: StatBox
const StatBox = ({ label, value, icon, color, bg }) => (
    <div className={`${bg} p-3 rounded-xl flex flex-col justify-between min-h-[80px] border border-black/5`}>
        <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
            <span className="text-lg opacity-80">{icon}</span>
        </div>
        <span className={`text-xl font-extrabold ${color}`}>{value}</span>
    </div>
);

// ==========================================
// MAIN PAGE ANALYTICS
// ==========================================
// ==========================================
// MAIN PAGE ANALYTICS
// ==========================================
const PageAnalytics = ({ user, onBack, viewMode }) => {
    // Roles
    const isHQ = ['OPS', 'ADMIN', 'BOD'].includes(user?.role);

    // Determine Mode & Period
    // If viewMode provided, strict. Else fallback to role (legacy)
    const activeMode = viewMode || (user?.role === 'LEADER' ? 'leader' : user?.role === 'SM' ? 'sm' : 'ops');

    // Map Mode to Period
    const getPeriodForMode = (m) => {
        switch (m) {
            case 'leader': return 'daily';
            case 'sm': return 'weekly';
            case 'ops': return 'monthly';
            default: return 'daily';
        }
    };

    const [period, setPeriod] = useState(getPeriodForMode(activeMode));
    const [loading, setLoading] = useState(true);
    const [storeMetrics, setStoreMetrics] = useState([]);
    const [topStaff, setTopStaff] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Store Selection for HQ
    // Default to 'ALL' if OPS/Chain view, but for Daily/Weekly might want specific store default? 
    // Let's keep 'ALL' default, user can switch.
    const [selectedStoreId, setSelectedStoreId] = useState(isHQ ? 'ALL' : user?.store_id);
    const [storeList, setStoreList] = useState([]);

    // Calculate dates
    const calculateDates = (p) => {
        const end = new Date();
        const start = new Date();

        if (p === 'daily') {
            start.setDate(end.getDate() - 1); // Focus on Yesterday/Today
        } else if (p === 'weekly') {
            start.setDate(end.getDate() - 7);
        } else {
            start.setDate(end.getDate() - 30);
        }
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    // Load Stores (Mock for now)
    useEffect(() => {
        if (isHQ) {
            setStoreList([
                { id: 'ALL', name: '🏢 Toàn bộ hệ thống' },
                { id: 'TM01', name: '🏪 TM01 - Ngô Quyền' },
                { id: 'TM02', name: '🏪 TM02 - Sơn Trà' }
            ]);
        }
    }, [isHQ]);

    // Fetch Data
    const loadData = async () => {
        setLoading(true);
        try {
            const targetStoreId = selectedStoreId || user?.store_id;
            const finalStoreId = targetStoreId || 'ALL';

            // Adjust period based on active mode primarily
            const currentPeriod = getPeriodForMode(activeMode);
            const { start, end } = calculateDates(currentPeriod);

            setDateRange({ start, end });

            const [metricsRes, staffRes, incidentsRes] = await Promise.all([
                analyticsAPI.getStoreMetrics(finalStoreId, start, end),
                analyticsAPI.getTopStaff(finalStoreId, start, end, 5),
                analyticsAPI.getRecentIncidents(finalStoreId, 10)
            ]);

            if (metricsRes.success) setStoreMetrics(metricsRes.data || []);
            if (staffRes.success) setTopStaff(staffRes.data || []);
            if (incidentsRes.success) setIncidents(incidentsRes.data || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeMode, selectedStoreId]);

    // Store Control Component
    const StoreControl = () => (
        isHQ && (
            <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <select
                    className="bg-transparent text-[10px] font-bold outline-none px-1"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                >
                    {storeList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>
        )
    );

    return (
        <div className="p-4 max-w-md mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div onClick={onBack} className="text-xs text-blue-600 font-bold mb-1 cursor-pointer hover:underline">← Quay lại</div>
                    <h1 className="text-xl font-extrabold text-gray-800">
                        {activeMode === 'leader' ? 'Leader Dashboard' : activeMode === 'sm' ? 'SM Dashboard' : 'Báo Cáo Chuỗi'}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">
                        {activeMode === 'leader' ? 'Vận hành hàng ngày (Daily)' : activeMode === 'sm' ? 'Sức khỏe Store (Weekly)' : 'Tổng quan quản trị (Monthly)'}
                    </p>
                </div>
                <StoreControl />
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-40 bg-gray-200 rounded-xl"></div>
                </div>
            ) : (
                <>
                    {/* Render Content Based on Mode */}
                    {activeMode === 'leader' && (
                        <LeaderDashboard
                            metrics={storeMetrics}
                            incidents={incidents}
                            dateRange={dateRange}
                        />
                    )}

                    {activeMode === 'sm' && (
                        <SMDashboard
                            metrics={storeMetrics}
                            topStaff={topStaff}
                            incidents={incidents}
                            dateRange={dateRange}
                        />
                    )}

                    {activeMode === 'ops' && (
                        <OPSDashboard
                            metrics={storeMetrics}
                            topStaff={topStaff}
                            incidents={incidents}
                            dateRange={dateRange}
                            selectedStoreId={selectedStoreId}
                            storeList={storeList}
                            onStoreChange={setSelectedStoreId} // Duplicated control but kept for OPS layout
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default PageAnalytics;
