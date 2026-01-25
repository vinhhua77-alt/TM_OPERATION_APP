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

  // Daily Dashboard State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
      loadDailyData(selectedDate);
    }
  }, [user, selectedDate]);

  // Helper: Get safe user properties
  const getSafeUser = (u) => ({
    ...u,
    storeCode: u?.storeCode || u?.store_code,
    name: u?.name || u?.staff_name || 'User'
  });

  const safeUser = user ? getSafeUser(user) : null;

  // Sync Workload Date with Selected Date
  useEffect(() => {
    setWorkloadDate(selectedDate);
  }, [selectedDate]);

  // Effect to load data when state changes
  useEffect(() => {
    if (user?.id) {
      loadInitialData();
      loadDailyData(selectedDate);
    }
  }, [user, selectedDate]);

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

  const loadDailyData = async (date) => {
    if (!user?.id) return;
    setDailyLoading(true);
    try {
      const res = await dashboardAPI.getDailyDashboard(user.id, date);
      if (res.success) {
        setDailyData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDailyLoading(false);
    }
  };

  const handlePrevPeriod = () => {
    const d = new Date(selectedDate);
    if (workloadPeriod === 'day') d.setDate(d.getDate() - 1);
    else if (workloadPeriod === 'week') d.setDate(d.getDate() - 7);
    else if (workloadPeriod === 'month') d.setMonth(d.getMonth() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextPeriod = () => {
    const d = new Date(selectedDate);
    const today = new Date().toISOString().split('T')[0];

    if (workloadPeriod === 'day') d.setDate(d.getDate() + 1);
    else if (workloadPeriod === 'week') d.setDate(d.getDate() + 7);
    else if (workloadPeriod === 'month') d.setMonth(d.getMonth() + 1);

    if (d.toISOString().split('T')[0] > today) {
      setSelectedDate(today);
    } else {
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const loadWorkload = async () => {
    if (!safeUser?.storeCode) return;
    setWorkloadLoading(true);
    try {
      const res = await dashboardAPI.getWorkload(safeUser.storeCode, workloadPeriod, workloadDate);
      if (res.success) {
        setWorkload(res.data);
      }
    } catch (e) {
      console.error("Workload Error", e);
    } finally {
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
    <div className="min-h-screen bg-slate-50 pb-16 fade-in">
      {/* HEADER */}
      <div className="bg-white px-3 pt-3 pb-1.5 mb-2 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-0.5">
          <div>
            <div className="text-slate-400 text-[9px] font-bold tracking-wider mb-0">DASHBOARD CÁ NHÂN</div>
            <h1 className="text-base font-black text-slate-800">
              Xin chào, <span className="text-blue-600">{safeUser?.name?.split(' ').pop()}!</span> 👋
            </h1>
          </div>
          <div
            onClick={onLogout}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>

        {/* Month Selector for Personal Stats */}
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="w-full mt-0.5 bg-slate-50 border-none text-slate-600 font-bold text-[10px] py-1.5 px-3 rounded-lg focus:ring-0"
        >
          {months.map(m => (
            <option key={m.month} value={m.month}>TỔNG KẾT THÁNG {m.month.split('-')[1]} ({m.completed_shifts}/{m.total_shifts} ca)</option>
          ))}
          {months.length === 0 && <option>Tháng này</option>}
        </select>
      </div>

      <div className="px-2 space-y-2.5">
        {/* === SECTION: TRAINEE WARNING (NEW) === */}
        {user?.is_trainee && (
          <div className={`p-4 rounded-[24px] border-2 flex items-center justify-between mb-2 ${user.trainee_verified ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100 animate-pulse'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user.trainee_verified ? '🎓' : '⏳'}</span>
              <div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${user.trainee_verified ? 'text-blue-700' : 'text-amber-700'}`}>
                  {user.trainee_verified ? 'Chế độ Tập sự: Active' : 'Chờ duyệt Tập sự'}
                </div>
                <p className="text-[9px] font-bold text-slate-500 italic">
                  {user.trainee_verified ? 'Dữ liệu được giám sát bởi SM.' : 'Vui lòng liên hệ SM để xác minh.'}
                </p>
              </div>
            </div>
            {user.trainee_verified && (
              <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Verified</div>
            )}
          </div>
        )}

        {/* === SECTION: GAMIFICATION & CAREER (PREMIUM) === */}
        <div className="bg-slate-900 rounded-[20px] p-4 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl border border-white/10 shadow-inner">
                  🏅
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-0.5">Cấp độ</div>
                  <div className="text-lg font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">LEVEL {data?.gamification?.level || 1}</div>
                </div>
              </div>
              <div className="bg-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                <span className="text-xs">🔥</span>
                <span className="text-[9px] font-black">{data?.gamification?.streak || 0} CA</span>
              </div>
            </div>

            {/* XP progress */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/60">
                <span>Kinh nghiệm (XP)</span>
                <span>{data?.gamification?.xp || 0} / {data?.gamification?.nextLevelXp || 1000}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div style={{ width: `${data?.gamification?.progress || 0}%` }} className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_15px_rgba(96,165,250,0.4)]"></div>
              </div>
            </div>

            {/* FLIGHT HOURS / CAREER PROGRESS */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">✈️</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Giờ bay</span>
                </div>
                <span className="text-[8px] font-black text-indigo-400">MỐC: 300H</span>
              </div>
              <div className="flex items-end gap-2.5">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div style={{ width: `${Math.min(100, (data?.stats?.totalHours || 0) / 300 * 100)}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
                <div className="text-[12px] font-black italic leading-none whitespace-nowrap">{data?.stats?.totalHours || 0}<span className="text-[8px] not-italic opacity-40 ml-1">/300H</span></div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* === SECTION: TẢI CÔNG VIỆC STORE === */}
        {safeUser?.storeCode && (
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Hiệu suất chi nhánh</h2>
              <div className="flex bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                {['day', 'week', 'month'].map(p => (
                  <button
                    key={p}
                    onClick={() => setWorkloadPeriod(p)}
                    className={`px-2 py-0.5 text-[8px] font-black rounded-md transition-all ${workloadPeriod === p ? 'bg-white text-blue-600 shadow-sm border border-slate-100/50' : 'text-slate-400'}`}
                  >
                    {p === 'day' ? 'NGÀY' : p === 'week' ? 'TUẦN' : 'THÁNG'}
                  </button>
                ))}
              </div>
            </div>

            <div className={`transition-all duration-300 ${workloadLoading ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              {workload ? (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="text-2xl font-black text-slate-800 leading-none">{workload.total_hours}<span className="text-[10px] ml-0.5 opacity-30 text-slate-400">h</span></div>
                    <div className="text-[7px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Tổng giờ</div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-50 border border-slate-100/50">
                      <div style={{ width: `${(workload.morning_hours / (workload.total_hours || 1)) * 100}%` }} className="bg-blue-500"></div>
                      <div style={{ width: `${(workload.evening_hours / (workload.total_hours || 1)) * 100}%` }} className="bg-orange-500"></div>
                    </div>
                    <div className="flex justify-between text-[7px] font-black tracking-widest">
                      <div className="text-blue-500 uppercase">☀️ Sáng: {Math.round((workload.morning_hours / (workload.total_hours || 1)) * 100)}%</div>
                      <div className="text-orange-500 uppercase text-right">🌙 Tối: {Math.round((workload.evening_hours / (workload.total_hours || 1)) * 100)}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-amber-50 rounded-xl border border-dashed border-amber-200">
                  <div className="text-amber-600 text-[9px] font-black uppercase tracking-widest">
                    ⚠️ DỮ LIỆU ĐANG TỔNG HỢP (HÔM NAY)
                  </div>
                  <div className="text-slate-400 text-[8px] font-bold mt-1">Đang hiển thị tạm thời dữ liệu ngày hôm qua...</div>
                </div>
              )}
            </div>

            {/* INTEGRATED DATE NAVIGATOR - 1 LINE COMPACT */}
            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
              <button
                onClick={handlePrevPeriod}
                className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 active:scale-90 transition-all text-xs"
              >
                ←
              </button>

              <div className="relative flex items-center justify-center flex-1 mx-2">
                <button
                  onClick={() => document.getElementById('dash-date-picker').showPicker()}
                  className="text-[10px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100/50"
                >
                  <span>📅</span>
                  <span>
                    {workloadPeriod === 'day' ? (
                      selectedDate === new Date().toISOString().split('T')[0] ? 'Hôm nay' :
                        selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Hôm qua' :
                          new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                    ) : workloadPeriod === 'week' ? (
                      `Tuần này (${new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`
                    ) : (
                      `Tháng ${new Date(selectedDate).getMonth() + 1}/${new Date(selectedDate).getFullYear()}`
                    )}
                  </span>
                </button>
                <input
                  id="dash-date-picker"
                  type="date"
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <button
                onClick={handleNextPeriod}
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                className={`w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg transition-all text-xs ${selectedDate >= new Date().toISOString().split('T')[0] ? 'opacity-10 text-slate-200' : 'text-slate-400 active:scale-90'}`}
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* 1. STATS GRID (4 Columns) */}
        <div className={`grid grid-cols-4 gap-1.5 transition-opacity duration-300 ${dailyLoading ? 'opacity-50' : 'opacity-100'}`}>
          <StatCard
            label="CA LÀM"
            value={dailyData?.stats?.shiftCount || 0}
            subValue="Shift"
            icon="📅"
            color="blue"
            compact={true}
          />
          <StatCard
            label="ĐÁNH GIÁ"
            value={dailyData?.stats?.avgRating || "-"}
            subValue="pts"
            icon="⭐"
            color="yellow"
            compact={true}
          />
          <StatCard
            label="CHẤT LƯỢNG"
            value={`${dailyData?.stats?.avgChecklist || 0}%`}
            subValue=""
            icon="✅"
            color="purple"
            compact={true}
          />
          <StatCard
            label="THU NHẬP"
            value={dailyData?.stats?.estimatedSalary ? `${(dailyData.stats.estimatedSalary / 1000).toFixed(0)}k` : "0"}
            subValue={`@${(dailyData?.stats?.hourlyRate || 30000) / 1000}k/h`}
            icon="💰"
            color="green"
            isMoney
            compact={true}
          />
        </div>

        {/* 2. RECENT SHIFTS */}
        <div>
          <h2 className="text-slate-800 font-black text-sm mb-1.5 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-0.5 rounded mr-2 text-[10px]">📋</span>
            Nhật Ký Gần Đây
          </h2>
          {data?.recent_shifts?.length > 0 ? (
            <RecentShifts shifts={data.recent_shifts} compact={true} />
          ) : (
            <div className="text-center py-5 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="text-xl mb-1">📭</div>
              <div className="text-slate-400 text-[10px]">Chưa có nhật ký nào</div>
            </div>
          )}
        </div>

        {/* 3. MOOD CHART */}
        {data?.chart_data?.length > 0 && (
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-slate-800 font-bold flex items-center text-[11px]">
                <span className="bg-rose-100 text-rose-500 p-0.5 rounded mr-2 text-[10px]">❤️</span>
                Biểu Đồ Cảm Xúc
              </h2>
            </div>
            <div className="h-28">
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
