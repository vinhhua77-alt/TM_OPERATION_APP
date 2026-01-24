import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/dashboard';
import StatCard from '../components/StatCard';
import RecentShifts from '../components/RecentShifts';
import MoodChart from '../components/MoodChart';

const PageDashboard = ({ user, onNavigate, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Workload State
  const [workload, setWorkload] = useState(null); // { total_hours, morning_hours, ... }
  const [workloadLoading, setWorkloadLoading] = useState(false);
  const [workloadPeriod, setWorkloadPeriod] = useState('day'); // 'day', 'week', 'month'
  // Default Workload Date = Yesterday (since analytics runs at 2AM for previous day)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [workloadDate, setWorkloadDate] = useState(yesterday.toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user]);

  // Helper: Get safe user properties
  const getSafeUser = (u) => ({
    ...u,
    storeCode: u?.storeCode || u?.store_code,
    name: u?.name || u?.staff_name || 'User'
  });

  const safeUser = user ? getSafeUser(user) : null;

  // Effect to load workload when filter changes
  useEffect(() => {
    if (safeUser?.storeCode) {
      loadWorkload();
    }
  }, [safeUser?.storeCode, workloadPeriod, workloadDate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Load Months
      const monthsRes = await dashboardAPI.getAvailableMonths(user.id);
      if (monthsRes.success && monthsRes.data.length > 0) {
        setMonths(monthsRes.data);
        // Default to current month or first available
        const currentMonth = new Date().toISOString().slice(0, 7);
        const hasCurrent = monthsRes.data.find(m => m.month === currentMonth);
        const initialMonth = hasCurrent ? currentMonth : monthsRes.data[0].month;

        setSelectedMonth(initialMonth);
        await loadDashboardData(initialMonth);
      } else {
        // No months, just try loading current
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Init Error", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (month) => {
    try {
      const res = await dashboardAPI.getDashboard(user.id, month);
      if (res.success) {
        setData(res.data);
      }
    } catch (e) { console.error(e); }
  };

  const loadWorkload = async () => {
    if (!safeUser?.storeCode) return;
    setWorkloadLoading(true);
    try {
      const res = await dashboardAPI.getWorkload(safeUser.storeCode, workloadPeriod, workloadDate);
      if (res.success) {
        setWorkload(res.data);
      } else {
        setWorkload(null);
      }
    } catch (e) {
      console.error("Workload Error", e);
    } finally {
      // Add small delay for visual smoothness? No
      setWorkloadLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    loadDashboardData(m);
  };

  // --- SKELETON ---
  if (loading) {
    return (
      <div className="p-4 fade-in">
        <div className="skeleton h-12 w-3/4 mb-6 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
        </div>
        <div className="skeleton h-64 w-full rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 fade-in">
      {/* HEADER */}
      <div className="bg-white px-4 pt-4 pb-2 mb-3 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <div>
            <div className="text-slate-400 text-[10px] font-bold tracking-wider mb-0.5">DASHBOARD CÁ NHÂN</div>
            <h1 className="text-lg font-black text-slate-800">
              Xin chào, <span className="text-blue-600">{safeUser?.name?.split(' ').pop()}!</span> 👋
            </h1>
          </div>
          <div
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>

        {/* Month Selector for Personal Stats */}
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="w-full mt-1 bg-slate-50 border-none text-slate-600 font-bold text-xs py-2 px-3 rounded-lg focus:ring-0"
        >
          {months.map(m => (
            <option key={m.month} value={m.month}>Tháng {m.month} ({m.completed_shifts}/{m.total_shifts} ca)</option>
          ))}
          {months.length === 0 && <option>Tháng này</option>}
        </select>
      </div>

      <div className="px-3 space-y-3">
        {/* === SECTION: GAMIFICATION & CAREER (PREMIUM) === */}
        <div className="bg-slate-900 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                  🏅
                </div>
                <div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Cấp độ hiện tại</div>
                  <div className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">LEVEL {data?.gamification?.level || 1}</div>
                </div>
              </div>
              <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                <span className="text-sm">🔥</span>
                <span className="text-[10px] font-black">{data?.gamification?.streak || 0} CA LIÊN TIẾP</span>
              </div>
            </div>

            {/* XP progress */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/60">
                <span>Kinh nghiệm (XP)</span>
                <span>{data?.gamification?.xp || 0} / {data?.gamification?.nextLevelXp || 1000}</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div style={{ width: `${data?.gamification?.progress || 0}%` }} className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_15px_rgba(96,165,250,0.4)]"></div>
              </div>
            </div>

            {/* FLIGHT HOURS / CAREER PROGRESS */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs">✈️</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Lộ trình "Giờ bay"</span>
                </div>
                <span className="text-[9px] font-black text-indigo-400">MỐC TIẾP: 300H</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div style={{ width: `${Math.min(100, (data?.stats?.totalHours || 0) / 300 * 100)}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
                <div className="text-[14px] font-black italic leading-none whitespace-nowrap">{data?.stats?.totalHours || 0}<span className="text-[9px] not-italic opacity-40 ml-1">/300H</span></div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* === SECTION: TẢI CÔNG VIỆC STORE === */}
        {safeUser?.storeCode && (
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Hiệu suất chi nhánh</h2>
              <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                {['day', 'week', 'month'].map(p => (
                  <button
                    key={p}
                    onClick={() => setWorkloadPeriod(p)}
                    className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${workloadPeriod === p ? 'bg-white text-blue-600 shadow-sm border border-slate-100/50' : 'text-slate-400'}`}
                  >
                    {p === 'day' ? 'NGÀY' : p === 'week' ? 'TUẦN' : 'THÁNG'}
                  </button>
                ))}
              </div>
            </div>

            {workloadLoading ? (
              <div className="animate-pulse flex gap-4 items-center h-16">
                <div className="h-10 bg-slate-100 w-20 rounded-2xl"></div>
                <div className="h-5 bg-slate-100 flex-1 rounded-full"></div>
              </div>
            ) : workload ? (
              <div className="flex items-center gap-5">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="text-3xl font-black text-slate-800 leading-none">{workload.total_hours}<span className="text-xs ml-0.5 opacity-30 text-slate-400">h</span></div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-1">Tổng giờ</div>
                </div>

                <div className="flex-1 space-y-2.5">
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-50 border border-slate-100/50">
                    <div style={{ width: `${(workload.morning_hours / (workload.total_hours || 1)) * 100}%` }} className="bg-blue-500"></div>
                    <div style={{ width: `${(workload.evening_hours / (workload.total_hours || 1)) * 100}%` }} className="bg-orange-500"></div>
                  </div>
                  <div className="flex justify-between text-[8px] font-black tracking-widest">
                    <div className="text-blue-500 uppercase">☀️ Sáng: {Math.round((workload.morning_hours / (workload.total_hours || 1)) * 100)}%</div>
                    <div className="text-orange-500 uppercase text-right">🌙 Tối: {Math.round((workload.evening_hours / (workload.total_hours || 1)) * 100)}%</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-slate-300 text-[10px] font-black uppercase tracking-widest italic border border-dashed border-slate-100 rounded-2xl">
                ☕ Dữ liệu đang được tổng hợp
              </div>
            )}
          </div>
        )}

        {/* 1. STATS GRID (4 Columns) */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard
            label="TỔNG CA"
            value={data?.stats?.shiftCount || 0}
            subValue=""
            icon="📅"
            color="blue"
            compact={true}
          />
          <StatCard
            label="ĐÁNH GIÁ"
            value={data?.stats?.avgRating || "-"}
            subValue="pts"
            icon="⭐"
            color="yellow"
            compact={true}
          />
          <StatCard
            label="CHẤT LƯỢNG"
            value={`${data?.stats?.avgChecklist || 0}%`}
            subValue=""
            icon="✅"
            color="purple"
            compact={true}
          />
          <StatCard
            label="THU NHẬP"
            value={data?.stats?.estimatedSalary ? `${(data.stats.estimatedSalary / 1000).toFixed(0)}k` : "0"}
            subValue=""
            icon="💰"
            color="green"
            isMoney
            compact={true}
          />
        </div>

        {/* 2. RECENT SHIFTS */}
        <div>
          <h2 className="text-slate-800 font-bold text-base mb-2 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 text-xs">📋</span>
            Nhật Ký Gần Đây
          </h2>
          {data?.recent_shifts?.length > 0 ? (
            <RecentShifts shifts={data.recent_shifts} compact={true} />
          ) : (
            <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="text-2xl mb-1">📭</div>
              <div className="text-slate-400 text-xs">Chưa có nhật ký nào trong tháng này</div>
            </div>
          )}
        </div>

        {/* 3. MOOD CHART */}
        {data?.chart_data?.length > 0 && (
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-slate-800 font-bold flex items-center text-sm">
                <span className="bg-rose-100 text-rose-500 p-1 rounded mr-2 text-xs">❤️</span>
                Biểu Đồ Cảm Xúc
              </h2>
            </div>
            <div className="h-32">
              <MoodChart data={data.chart_data} />
            </div>
          </div>
        )}

      </div>

      {/* FLOATING ACTION BUTTON FOR REPORTING */}
      <button
        onClick={() => onNavigate('SHIFT_LOG')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center text-2xl active:scale-95 transition-all z-[100] border border-white/20"
      >
        📝
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </button>
    </div>
  );
};

export default PageDashboard;
