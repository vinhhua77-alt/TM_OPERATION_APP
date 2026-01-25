import React, { useState, useEffect } from 'react';
import { decisionAPI } from '../api/decision.api';
import { staffAPI } from '../api/staff';

const PageDecisionConsole = ({ user, onBack }) => {
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(user?.role === 'ADMIN' ? null : user);
    const [promotionStatus, setPromotionStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OPS';

    useEffect(() => {
        if (isAdmin) {
            fetchStaff();
        }
        if (selectedStaff) {
            fetchPromotionStatus(selectedStaff.staff_id);
        }
    }, [selectedStaff]);

    const fetchStaff = async () => {
        try {
            const res = await staffAPI.getAllStaff();
            if (res.success) setStaffList(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPromotionStatus = async (staffId) => {
        setLoading(true);
        try {
            const res = await decisionAPI.getPromotionStatus(staffId);
            if (res.success) {
                setPromotionStatus(res.data);
            } else {
                console.error('Promotion status fetch failed:', res.message);
                alert('Database Error: ' + (res.message || 'Check terminal logs'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!selectedStaff || !promotionStatus?.eligible) return;

        if (!window.confirm(`Xác nhận thăng tiến nhân viên lên ${promotionStatus.next_level}?`)) return;

        setLoading(true);
        try {
            const res = await decisionAPI.promoteStaff(selectedStaff.staff_id, user.staff_id);
            if (res.success) {
                alert('Thăng tiến thành công! ✅');
                fetchPromotionStatus(selectedStaff.staff_id);
            }
        } catch (error) {
            alert('Lỗi thăng tiến: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const MetricRow = ({ label, current, required, unit = '%' }) => {
        const pass = current >= required;
        return (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${pass ? 'text-slate-900' : 'text-rose-600'}`}>
                            {current}{unit}
                        </span>
                        <span className="text-[10px] text-slate-400">/ Target {required}{unit}</span>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${pass ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    {pass ? '✅' : '⏳'}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
            {/* V3 PREMIUM HEADER */}
            <div className="bg-slate-900 pt-10 pb-20 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <button onClick={onBack} className="bg-white/10 text-white/80 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-6 border border-white/5 active:scale-95 transition-all">
                        ← Back
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-900/40 -rotate-3 border-2 border-white/20">
                                🚀
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Decision Engine</h1>
                                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] opacity-80">Career & Promotion Hub v3.0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20 space-y-6">
                {/* STAFF SELECTOR (ADMIN ONLY) */}
                {isAdmin && (
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Select Personnel</div>
                        <select
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 ring-indigo-500 transition-all outline-none"
                            onChange={(e) => setSelectedStaff(staffList.find(s => s.staff_id === e.target.value))}
                            value={selectedStaff?.staff_id || ''}
                        >
                            <option value="">-- Choose Staff --</option>
                            {staffList.map(s => (
                                <option key={s.staff_id} value={s.staff_id}>{s.staff_name} ({s.current_level || 'L0'})</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* CAREER STATUS CARD */}
                {selectedStaff && promotionStatus && (
                    <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden">
                        {promotionStatus.eligible && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-6 py-2 rotate-45 transform translate-x-4 -translate-y-1 shadow-lg uppercase tracking-widest">
                                Eligible ✅
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Level</span>
                                <span className="text-2xl font-black text-indigo-600 leading-none">{promotionStatus.current_level}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 leading-none mb-1">{selectedStaff.staff_name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active State</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <MetricRow
                                label="Trust Score"
                                current={Math.round(promotionStatus.current_stats.trust_score)}
                                required={promotionStatus.requirements.min_trust_score}
                            />
                            <MetricRow
                                label="Ops Contribution"
                                current={Math.round(promotionStatus.current_stats.ops_score)}
                                required={promotionStatus.requirements.min_ops_score}
                            />
                            <MetricRow
                                label="Time in Level"
                                current={promotionStatus.current_stats.days_in_level}
                                required={promotionStatus.requirements.min_days_in_level}
                                unit=" Days"
                            />
                        </div>

                        {/* PROMOTION ACTION */}
                        <div className="mt-8">
                            {promotionStatus.eligible ? (
                                <button
                                    onClick={handlePromote}
                                    disabled={loading || !isAdmin}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : `Promote to ${promotionStatus.next_level} ➔`}
                                </button>
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-[24px] text-center">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-xs font-black text-slate-600 uppercase">Collecting Operational Signals... 📡</div>
                                    <p className="text-[9px] text-slate-400 mt-2">Finish your goals to unlock the next level.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DECISION SIGNALS (LOG) */}
                <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Decision Intelligence Feed</h3>
                        <div className="space-y-5">
                            {!selectedStaff ? (
                                <div className="text-center py-10 opacity-30">
                                    <div className="text-4xl mb-4">🛸</div>
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Waiting for selection</div>
                                </div>
                            ) : (
                                [
                                    { msg: 'Consistency confirmed: 5 consecutive shifts with 100% checklist.', icon: '💎', type: 'POS' },
                                    { msg: 'Reliability Warning: 2 late check-ins detected in rolling 7-day window.', icon: '⚠️', type: 'NEG' },
                                    { msg: 'System Suggestion: Eligible for Skill Specialist training module.', icon: '📚', type: 'INFO' }
                                ].map((msg, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="text-xl">{msg.icon}</div>
                                        <div>
                                            <p className={`text-[10px] leading-relaxed font-bold ${msg.type === 'NEG' ? 'text-rose-400' : 'text-slate-200'}`}>{msg.msg}</p>
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Just now • Rule Engine</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* HELP / USER MANUAL LINK */}
                <div className="p-4 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Data-Driven Career Framework v3.1
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PageDecisionConsole;
