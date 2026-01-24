import React, { useState, useEffect, useMemo } from 'react';
import { masterAPI } from '../api/master';
import { shiftAPI } from '../api/shift';
import { leaderAPI } from '../api/leader';

const PageShiftLog = ({ user, onBack }) => {
    // 1. Phân quyền và Logic Role
    const isLeader = useMemo(() => ['LEADER', 'SM', 'ADMIN', 'OPS', 'BOD'].includes(user?.role), [user?.role]);

    const [master, setMaster] = useState({
        stores: [], layouts: {}, leaders: [], shifts: [],
        staff: [], areas: [], leaderChecklist: [], leaderIncidents: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showMoodModal, setShowMoodModal] = useState(false);
    const [activePhrase, setActivePhrase] = useState("");

    const MOOD_CONFIG = {
        OK: { icon: '😊', modalBg: 'bg-emerald-900/90', phrases: ["Hết nước chấm", "Đỉnh của chóp", "Mướt mải luôn", "10 điểm không có nhưng", "Hệ chiến", "Out trình"] },
        BUSY: { icon: '💪', modalBg: 'bg-blue-900/90', phrases: ["Vẫn ổn áp", "Trộm vía nha", "Vẫn chiến tốt", "Level up", "Khá là oke", "Mượt mà"] },
        FIXED: { icon: '⚡', modalBg: 'bg-amber-900/90', phrases: ["Tới công chuyện", "Drama quá trời", "Úi giời ơi", "Lật kèo phút chót", "Sóng gió"] },
        OPEN: { icon: '😰', modalBg: 'bg-rose-900/90', phrases: ["Ét ô ét", "Dối lòng quá", "Hơi biến biến", "Cần support gấp", "Muốn gục ngã"] },
        OVER: { icon: '💀', modalBg: 'bg-slate-950/95', phrases: ["Xu cà na", "Ra chuồng gà", "Toang thật sự", "Game over", "Hết ơi rồi"] }
    };

    const REASONS = [
        { id: 'SOP', label: 'QUY TRÌNH', icon: '📋' },
        { id: 'EQUIP', label: 'THIẾT BỊ', icon: '⚙️' },
        { id: 'TEAM', label: 'ĐỒNG ĐỘI', icon: '🤝' },
        { id: 'GUEST', label: 'KHÁCH HÀNG', icon: '👤' },
        { id: 'VIBE', label: 'MÔI TRƯỜNG', icon: '✨' },
        { id: 'STOCK', label: 'HÀNG HÓA', icon: '📦' }
    ];

    const LAYOUT_THEMES = {
        FOH: { main: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        BOH: { main: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
        CASH: { main: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        SUPPORT: { main: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
        DEFAULT: { main: 'bg-slate-800', light: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-100' }
    };

    const [form, setForm] = useState({
        storeId: user?.store_code || user?.storeCode || '',
        lead: '',
        startH: '',
        startM: '00',
        endH: new Date().getHours().toString().padStart(2, '0'),
        endM: '00',
        layout: '',
        subPos: '',
        checks: {},
        incidentType: '',
        incidentNote: '',
        rating: '',
        selectedReasons: [],
        isCommitted: false,
        shiftErrorReason: '',
        confirmWrongShift: false,
        hasPeak: false,
        hasOutOfStock: false,
        hasCustomerIssue: false,
        khenEmp: '', khenTopic: '', nhacEmp: '', nhacTopic: '',
        nextShiftRisk: '', nextShiftNote: '', improvementNote: '',
        // Trainee Mode Fields
        isTraineeMode: false, traineePos: ''
    });

    useEffect(() => { loadMasterData(); }, []);

    const loadMasterData = async () => {
        try {
            const response = await masterAPI.getMasterData();
            if (response.success && response.data) setMaster(response.data);
        } catch (error) { setError('Không thể tải dữ liệu hệ thống'); }
    };

    const filteredLeaders = useMemo(() => {
        const targetStore = (form.storeId || '').toString().trim().toUpperCase();
        if (!targetStore) return [];
        return (master.leaders || []).filter(l => String(l.store_code || '').trim().toUpperCase() === targetStore);
    }, [form.storeId, master.leaders]);

    const filteredStaff = useMemo(() => {
        const targetStore = (form.storeId || '').toString().trim().toUpperCase();
        if (!targetStore) return master.staff || [];
        return (master.staff || []).filter(s => String(s.store || s.store_code || '').trim().toUpperCase() === targetStore);
    }, [form.storeId, master.staff]);

    const shiftInfo = useMemo(() => {
        if (!form.startH || !form.endH) return null;
        const sApp = `${form.startH}:${form.startM}`;
        const eApp = `${form.endH}:${form.endM}`;
        const startTotal = parseInt(form.startH) * 60 + parseInt(form.startM);
        const endTotal = parseInt(form.endH) * 60 + parseInt(form.endM);
        let duration = (endTotal - startTotal) / 60;
        if (duration < 0) duration += 24;
        if (duration === 0) return { error: 'GIỜ RA PHẢI KHÁC GIỜ VÀO' };
        const match = master.shifts?.find(s => s.start === sApp && s.end === eApp);
        return { match, duration: duration.toFixed(1), isCorrect: !!match };
    }, [form.startH, form.startM, form.endH, form.endM, master.shifts]);

    const hasNoCheck = useMemo(() => Object.values(form.checks).includes('no'), [form.checks]);

    const isReadyToSubmit = useMemo(() => {
        const isActingLeader = isLeader || form.isTraineeMode;

        if (!form.storeId || !form.rating || !form.startH || !form.isCommitted) return false;
        if (!form.layout) return false;
        if (isActingLeader && !form.nextShiftRisk) return false;
        if (!isActingLeader && (!form.lead || form.selectedReasons.length === 0)) return false;
        if (!isActingLeader && master.layouts[form.layout]?.subPositions?.length > 0 && !form.subPos) return false;
        if (hasNoCheck && (!form.incidentType || !form.incidentNote || form.incidentNote.trim().length < 5)) return false;
        if (shiftInfo?.error || (shiftInfo && !shiftInfo.isCorrect && (!form.confirmWrongShift || !form.shiftErrorReason))) return false;

        const areaCheckCount = master.layouts[form.layout]?.checklist?.length || 0;
        const leadCheckCount = isActingLeader ? (master.layouts['LEAD']?.checklist?.length || 0) : 0;
        return Object.keys(form.checks).length >= (areaCheckCount + leadCheckCount);
    }, [form, master, hasNoCheck, shiftInfo, isLeader]);

    const executeSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...form,
                startTime: `${form.startH}:${form.startM}`,
                endTime: `${form.endH}:${form.endM}`,
                duration: shiftInfo?.duration,
                staffId: user?.id || user?.staff_id,
                staffName: user?.name || user?.staff_name,
                role: user?.role,
                is_training: form.isTraineeMode,
                training_position: form.traineePos
            };

            const isActingLeader = isLeader || form.isTraineeMode;

            let res;
            if (isActingLeader) {
                res = await leaderAPI.submitReport({
                    ...payload,
                    leaderId: payload.staffId, leaderName: payload.staffName,
                    area_code: form.layout,
                    report_data: {
                        shift_code: shiftInfo?.match?.name || 'CUSTOM',
                        is_training: form.isTraineeMode,
                        training_position: form.traineePos,
                        has_peak: form.hasPeak, has_out_of_stock: form.hasOutOfStock, has_customer_issue: form.hasCustomerIssue,
                        observed_issue_code: form.incidentType, observed_note: form.incidentNote,
                        khen_emp: form.khenEmp, khen_topic: form.khenTopic, nhac_emp: form.nhacEmp, nhac_topic: form.nhacTopic,
                        next_shift_risk: form.nextShiftRisk, next_shift_note: form.nextShiftNote,
                        improvement_initiative: form.improvementNote
                    }
                });
            } else { res = await shiftAPI.submit(payload); }
            if (res.success) setShowSuccess(true);
            else setError("Lỗi: " + res.message);
        } catch (e) { setError("Lỗi kết nối máy chủ"); }
        setLoading(false);
    };

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white p-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mb-6 animate-bounce">✨</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Báo cáo thành công!</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">Dữ liệu đã được nạp vào Decision Engine.</p>
                <button onClick={onBack} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">Quay lại Dashboard</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans pb-10">
            {/* HEADER */}
            <div className={`shrink-0 ${isLeader ? 'bg-emerald-600' : 'bg-blue-600'} p-5 pb-10 text-white relative overflow-hidden shadow-lg`}>
                <div className="relative z-10 flex flex-col gap-4">
                    <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white text-[8px] font-bold px-3 py-1 rounded-full border border-white/5 uppercase tracking-tighter w-fit">← Dashboard</button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl rotate-2">
                            {isLeader ? '👑' : '👷'}
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{isLeader ? 'LEADER LOG' : 'NHẬT KÝ CA'}</h1>
                            <p className="text-[8px] font-black opacity-60 uppercase mt-1 tracking-widest italic">{user?.name} | {user?.role}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            <div className="flex-1 px-3 -mt-6 relative z-20 space-y-3">
                {/* 0. TRAINEE TOGGLE (STAFF, LEADER, ADMIN, OPS) */}
                {['STAFF', 'LEADER', 'ADMIN', 'OPS', 'AM'].includes(user?.role?.toString().toUpperCase().trim()) && (
                    <div className={`p-4 rounded-[28px] border transition-all duration-500 shadow-sm ${form.isTraineeMode ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white text-slate-400 border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${form.isTraineeMode ? 'text-indigo-200' : 'text-slate-400'}`}>Lộ trình thăng tiến</span>
                                <span className={`text-[12px] font-black uppercase tracking-tighter ${form.isTraineeMode ? 'text-white' : 'text-slate-600'}`}>💎 TẬP SỰ QUẢN LÝ</span>
                            </div>
                            <button onClick={() => {
                                const role = user?.role?.toString().toUpperCase().trim();
                                const options = role === 'STAFF' ? ['CASHIER', 'LEADER'] : ['SM', 'AM'];
                                setForm({ ...form, isTraineeMode: !form.isTraineeMode, traineePos: !form.isTraineeMode ? options[0] : '' });
                            }} className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${form.isTraineeMode ? 'bg-indigo-400' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${form.isTraineeMode ? 'left-8' : 'left-1'}`}></div>
                            </button>
                        </div>
                        {form.isTraineeMode && (
                            <div className="mt-3 grid grid-cols-2 gap-2 animate-in zoom-in duration-300">
                                {(user?.role?.toString().toUpperCase().trim() === 'STAFF' ? [
                                    { id: 'CASHIER', label: '💎 TS THU NGÂN' },
                                    { id: 'LEADER', label: '💎 TS LEADER' }
                                ] : [
                                    { id: 'SM', label: '💎 TRỢ LÝ SM' },
                                    { id: 'AM', label: '💎 TS AM' }
                                ]).map(opt => (
                                    <button key={opt.id} onClick={() => setForm({ ...form, traineePos: opt.id })} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${form.traineePos === opt.id ? 'bg-white text-indigo-600 border-white shadow-lg' : 'bg-indigo-500/30 text-indigo-100 border-indigo-400/30'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* 1. STORE & CONTEXT */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <select className={`bg-slate-50 border-none text-[9px] font-black p-3 rounded-xl focus:ring-2 ${form.isTraineeMode ? 'ring-indigo-500/20' : (isLeader ? 'ring-emerald-500/20' : 'ring-blue-500/20')}`} value={form.storeId} onChange={e => setForm({ ...form, storeId: e.target.value, lead: '' })}>
                            <option value="">-- CHI NHÁNH --</option>
                            {master.stores?.map(s => <option key={s.store_code} value={s.store_code}>{s.store_name}</option>)}
                        </select>

                        {!isLeader ? (
                            <select className={`bg-slate-50 border-none text-[9px] font-black p-3 rounded-xl focus:ring-2 ring-blue-500/20 ${form.lead === 'KHÔNG CÓ LEAD CA' ? 'text-rose-500' : ''}`} value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })}>
                                <option value="">-- LEAD CA --</option>
                                <option value="KHÔNG CÓ LEAD CA" className="text-rose-500 font-black italic">⚠ KHÔNG CÓ LEAD</option>
                                {filteredLeaders.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                            </select>
                        ) : (
                            <select className={`bg-slate-50 border-none text-[9px] font-black p-3 rounded-xl focus:ring-2 ${form.isTraineeMode ? 'ring-indigo-500/20' : 'ring-emerald-500/20'}`} value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value, subPos: form.isTraineeMode ? `${form.traineePos}_TRAINEE` : 'LEADER', checks: {} })}>
                                <option value="">-- KHU VỰC CẮM CHỐT --</option>
                                {Object.keys(master.layouts || {}).filter(k => k !== 'LEAD').map(k => <option key={k} value={k}>{master.layouts[k].name || k}</option>)}
                            </select>
                        )}
                    </div>

                    {(!isLeader && form.isTraineeMode) && (
                        <select className="bg-white border-2 border-indigo-100 text-[9px] font-black p-3 rounded-xl focus:ring-2 ring-indigo-500/20" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value, subPos: `${form.traineePos}_TRAINEE`, checks: {} })}>
                            <option value="">-- KHU VỰC CẮM CHỐT --</option>
                            {Object.keys(master.layouts || {}).filter(k => k !== 'LEAD').map(k => <option key={k} value={k}>{master.layouts[k].name || k}</option>)}
                        </select>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${(isLeader || form.isTraineeMode) ? 'bg-emerald-50/5 border-emerald-100' : 'bg-blue-50/5 border-blue-100'}`}>
                            <span className={`text-[8px] font-black uppercase ${(isLeader || form.isTraineeMode) ? 'text-emerald-600' : 'text-blue-600'}`}>VÀO</span>
                            <div className="flex items-center gap-1">
                                <select className="bg-transparent border-none text-[12px] font-black p-0 focus:ring-0" value={form.startH} onChange={e => setForm({ ...form, startH: e.target.value })}>
                                    <option value="">HH</option>
                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="font-black opacity-20">:</span>
                                <select className="bg-transparent border-none text-[12px] font-black p-0 focus:ring-0" value={form.startM} onChange={e => setForm({ ...form, startM: e.target.value })}>
                                    <option value="00">00</option><option value="30">30</option>
                                </select>
                            </div>
                        </div>
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${(isLeader || form.isTraineeMode) ? 'bg-emerald-50/5 border-emerald-100' : 'bg-blue-50/5 border-blue-100'}`}>
                            <span className={`text-[8px] font-black uppercase ${(isLeader || form.isTraineeMode) ? 'text-emerald-600' : 'text-blue-600'}`}>RA</span>
                            <div className="flex items-center gap-1">
                                <select className="bg-transparent border-none text-[12px] font-black p-0 focus:ring-0" value={form.endH} onChange={e => setForm({ ...form, endH: e.target.value })}>
                                    <option value="">HH</option>
                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="font-black opacity-20">:</span>
                                <select className="bg-transparent border-none text-[12px] font-black p-0 focus:ring-0" value={form.endM} onChange={e => setForm({ ...form, endM: e.target.value })}>
                                    <option value="00">00</option><option value="30">30</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {shiftInfo && (
                        <div className={`p-2.5 rounded-xl text-[9px] font-black text-center ${shiftInfo.error ? 'bg-rose-50 text-rose-500' : (shiftInfo.isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}`}>
                            {shiftInfo.error || (shiftInfo.isCorrect ? `✔️ KHỚP CA: ${shiftInfo.match.name}` : `⚠️ CA KHÔNG KHỚP (${shiftInfo.duration}H)`)}
                            {shiftInfo && !shiftInfo.isCorrect && !shiftInfo.error && (
                                <div className="mt-2 pt-2 border-t border-amber-100 flex flex-col gap-2">
                                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded-sm" checked={form.confirmWrongShift} onChange={e => setForm({ ...form, confirmWrongShift: e.target.checked })} />
                                        <span>XÁC NHẬN GIỜ THỰC TẾ</span>
                                    </label>
                                    {form.confirmWrongShift && (
                                        <select className="bg-white border-none p-1.5 rounded-lg text-[8px]" value={form.shiftErrorReason} onChange={e => setForm({ ...form, shiftErrorReason: e.target.value })}>
                                            <option value="">-- LÝ DO SAI CA --</option>
                                            <option value="ĐỔI CA">ĐỔI CA</option><option value="ĐI TRỄ">ĐI TRỄ</option><option value="VỀ SỚM">VỀ SỚM</option><option value="TĂNG CA">TĂNG CA</option>
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. LEADER STATUS */}
                {(isLeader || form.isTraineeMode) && (
                    <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vận hành sảnh & khu vực</span>
                        </div>
                        <div className="flex gap-2">
                            {[{ id: 'hasPeak', l: 'CA ĐÔNG', icon: '🔥' }, { id: 'hasOutOfStock', l: 'HẾT MÓN', icon: '📦' }, { id: 'hasCustomerIssue', l: 'PHÀN NÀN', icon: '👤' }].map(b => (
                                <button key={b.id} onClick={() => setForm({ ...form, [b.id]: !form[b.id] })} className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all border shadow-sm ${form[b.id] ? (form.isTraineeMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-emerald-600 text-white border-emerald-600') : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    <div className="text-sm mb-0.5">{b.icon}</div>{b.l}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-2 rounded-2xl border border-emerald-100">
                                <span className="text-[8px] font-black text-emerald-600 flex items-center justify-center bg-white rounded-lg">👍 KHEN</span>
                                <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={form.khenEmp} onChange={e => setForm({ ...form, khenEmp: e.target.value })}>
                                    <option value="">Nhân viên</option>
                                    {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name || s.staff_name}</option>)}
                                </select>
                                <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={form.khenTopic} onChange={e => setForm({ ...form, khenTopic: e.target.value })}>
                                    <option value="">Chủ đề</option><option>Thái độ</option><option>Tốc độ</option><option>Vệ sinh</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-2 bg-rose-50/50 p-2 rounded-2xl border border-rose-100">
                                <span className="text-[8px] font-black text-rose-500 flex items-center justify-center bg-white rounded-lg">⚠️ NHẮC</span>
                                <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={form.nhacEmp} onChange={e => setForm({ ...form, nhacEmp: e.target.value })}>
                                    <option value="">Nhân viên</option>
                                    {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name || s.staff_name}</option>)}
                                </select>
                                <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={form.nhacTopic} onChange={e => setForm({ ...form, nhacTopic: e.target.value })}>
                                    <option value="">Chủ đề</option><option>Sai SOP</option><option>Vệ sinh</option><option>Thái độ</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. LAYOUT & CHECKLIST - STAFF UI ONLY */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-3">
                    {!(isLeader || form.isTraineeMode) ? (
                        <>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block text-left">KHU VỰC LÀM VIỆC</span>
                            <div className="grid grid-cols-4 gap-1.5">
                                {Object.keys(master.layouts || {}).filter(k => k !== 'LEAD').map(key => {
                                    const active = form.layout === key;
                                    const theme = LAYOUT_THEMES[key] || LAYOUT_THEMES.DEFAULT;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setForm({ ...form, layout: key, subPos: '', checks: {} })}
                                            className={`py-2.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm active:scale-95 ${active ? `${theme.main} text-white` : 'bg-slate-50 text-slate-400'}`}
                                        >
                                            {master.layouts[key].name || key}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className={`${form.isTraineeMode ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} p-3 rounded-xl border flex items-center justify-between mb-2`}>
                            <span className={`text-[10px] font-black uppercase ${form.isTraineeMode ? 'text-indigo-600' : 'text-emerald-600'}`}>Vai trò {form.isTraineeMode ? 'TẬP SỰ' : 'BÁO CÁO'}:</span>
                            <span className={`text-[10px] font-black text-white px-3 py-1 rounded-lg ${form.isTraineeMode ? 'bg-indigo-600' : 'bg-emerald-600'}`}>{form.isTraineeMode ? form.traineePos : 'LEADER'} {form.layout && `• ${master.layouts[form.layout]?.name || form.layout}`}</span>
                        </div>
                    )}

                    {/* SUB-POSITION LOGIC */}
                    {form.layout && (
                        <div className="animate-in fade-in duration-300 space-y-3">
                            {(isLeader || form.isTraineeMode) ? (
                                <div className={`${form.isTraineeMode ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} p-3 rounded-xl border flex items-center justify-between`}>
                                    <span className={`text-[10px] font-black uppercase ${form.isTraineeMode ? 'text-indigo-600' : 'text-emerald-600'}`}>Vị trí mặc định:</span>
                                    <span className={`text-[10px] font-black text-white px-3 py-1 rounded-lg ${form.isTraineeMode ? 'bg-indigo-600' : 'bg-emerald-600'}`}>{form.isTraineeMode ? `${form.traineePos}_TRAINEE` : 'LEADER'}</span>
                                </div>
                            ) : (
                                master.layouts[form.layout]?.subPositions?.length > 0 && (
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {master.layouts[form.layout].subPositions.map(sp => {
                                            const active = form.subPos === sp;
                                            const theme = LAYOUT_THEMES[form.layout] || LAYOUT_THEMES.DEFAULT;
                                            return (
                                                <button
                                                    key={sp}
                                                    onClick={() => setForm({ ...form, subPos: sp })}
                                                    className={`py-2 rounded-xl text-[9px] font-black transition-all border ${active ? `${theme.main} text-white shadow-md scale-105 z-10` : `${theme.light} ${theme.text} ${theme.border} border-dashed opacity-80`}`}
                                                >
                                                    {sp}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )
                            )}

                            {/* CHECKLISTS COMPOSITE */}
                            <div className="space-y-4 pt-2">
                                {/* AREA SPECIFIC */}
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Checklist: {master.layouts[form.layout]?.name || form.layout}</div>
                                    {master.layouts[form.layout]?.checklist?.map((item, idx) => {
                                        const itemId = item.id || `cl_${idx}`;
                                        const itemText = item.text || item;
                                        return (
                                            <div key={itemId} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 text-left">
                                                <span className="text-[11px] font-bold text-slate-600 pr-4 leading-tight">{itemText}</span>
                                                <div className="flex bg-slate-50 p-1 rounded-xl gap-1 border border-slate-100 shadow-inner shrink-0">
                                                    <button onClick={() => setForm({ ...form, checks: { ...form.checks, [itemId]: 'yes' } })} className={`px-4 py-1 rounded-lg text-[10px] font-black transition-all ${form.checks[itemId] === 'yes' ? ((isLeader || form.isTraineeMode) ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white') : 'text-slate-300'}`}>CÓ</button>
                                                    <button onClick={() => setForm({ ...form, checks: { ...form.checks, [itemId]: 'no' } })} className={`px-4 py-1 rounded-lg text-[10px] font-black transition-all ${form.checks[itemId] === 'no' ? 'bg-rose-500 text-white' : 'text-slate-300'}`}>KHO</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* LEAD GLOBAL (Always show for leaders and trainees) */}
                                {(isLeader || form.isTraineeMode) && master.layouts['LEAD']?.checklist?.length > 0 && (
                                    <div className={`space-y-1 pt-3 border-t-2 border-dashed ${form.isTraineeMode ? 'border-indigo-100' : 'border-emerald-100'}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 flex items-center gap-2 ${form.isTraineeMode ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${form.isTraineeMode ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>Checklist Quản Lý (V8)
                                        </div>
                                        {master.layouts['LEAD'].checklist.map((item, idx) => {
                                            const itemId = item.id || `lead_${idx}`;
                                            const itemText = item.text || item;
                                            return (
                                                <div key={itemId} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 text-left">
                                                    <span className="text-[11px] font-bold text-slate-600 pr-4 leading-tight">{itemText}</span>
                                                    <div className="flex bg-slate-50 p-0.5 rounded-lg gap-0.5 border border-slate-100 shadow-inner shrink-0">
                                                        <button onClick={() => setForm({ ...form, checks: { ...form.checks, [itemId]: 'yes' } })} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs transition-all ${form.checks[itemId] === 'yes' ? (form.isTraineeMode ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white') : 'text-slate-200'}`}>
                                                            {form.checks[itemId] === 'yes' ? '✅' : '✔'}
                                                        </button>
                                                        <button onClick={() => setForm({ ...form, checks: { ...form.checks, [itemId]: 'no' } })} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs transition-all ${form.checks[itemId] === 'no' ? 'bg-rose-500 text-white' : 'text-slate-200'}`}>
                                                            {form.checks[itemId] === 'no' ? '❌' : '✖'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. INCIDENT & MOOD */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-4">
                    {hasNoCheck && (
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 space-y-2">
                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">🔒 BẮT BUỘC: CHI TIẾT SỰ CỐ</div>
                            <select className="w-full bg-white border-none text-[10px] font-bold p-2 rounded-xl shadow-sm" value={form.incidentType} onChange={e => setForm({ ...form, incidentType: e.target.value })}>
                                <option value="">-- LOẠI SỰ CỐ --</option>
                                {(isLeader || form.isTraineeMode ? master.leaderIncidents : master.layouts[form.layout]?.incidents)?.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                            </select>
                            <textarea className="w-full bg-white border-none text-[11px] p-3 rounded-xl shadow-sm min-h-[60px] focus:ring-0" placeholder="Mô tả & hướng giải quyết..." value={form.incidentNote} onChange={e => setForm({ ...form, incidentNote: e.target.value })} />
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ca làm hôm nay thế nào?</span>
                    </div>
                    <div className="flex justify-between px-2 bg-slate-50 py-3 rounded-2xl border border-slate-100 mb-3">
                        {Object.keys(MOOD_CONFIG).map(mood => (
                            <span key={mood} onClick={() => { setForm({ ...form, rating: mood }); setActivePhrase(MOOD_CONFIG[mood].phrases[Math.floor(Math.random() * MOOD_CONFIG[mood].phrases.length)]); setShowMoodModal(true); }} className={`text-2xl cursor-pointer transition-all active:scale-125 ${form.rating === mood ? 'opacity-100 scale-125 drop-shadow-lg' : 'opacity-20 grayscale'}`}>
                                {MOOD_CONFIG[mood].icon}
                            </span>
                        ))}
                    </div>

                    {form.selectedReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-500">
                            {form.selectedReasons.map(rid => {
                                const r = REASONS.find(i => i.id === rid);
                                return (
                                    <div key={rid} onClick={() => setShowMoodModal(true)} className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all">
                                        <span>{r?.icon}</span>
                                        <span>{r?.label}</span>
                                    </div>
                                );
                            })}
                            <button onClick={() => setShowMoodModal(true)} className="px-2.5 py-1 text-slate-300 border border-slate-100 border-dashed rounded-lg text-[9px] font-black uppercase">
                                ✎ Sửa
                            </button>
                        </div>
                    )}


                    {(isLeader || form.isTraineeMode) && (
                        <div className="grid grid-cols-2 gap-2">
                            <select className={`bg-slate-50 border-none text-[10px] font-black p-2.5 rounded-xl text-slate-700 font-sans focus:ring-2 ${form.isTraineeMode ? 'ring-indigo-500/20' : 'ring-emerald-500/20'}`} value={form.nextShiftRisk} onChange={e => setForm({ ...form, nextShiftRisk: e.target.value })}>
                                <option value="">-- MỨC ĐỘ RỦI RO --</option><option value="NONE">RỦI RO: KHÔNG</option><option value="LOW">RỦI RO: THẤP</option><option value="ATTENTION">RỦI RO: CHÚ Ý</option>
                            </select>
                            <textarea className="bg-slate-50 border-none text-[10px] p-2.5 rounded-xl min-h-[40px] focus:ring-0" placeholder="Dặn dò ca sau..." value={form.nextShiftNote} onChange={e => setForm({ ...form, nextShiftNote: e.target.value })} />
                            <div className="col-span-2 space-y-2 mt-1">
                                <div className={`text-[9px] font-black uppercase tracking-widest ml-1 ${form.isTraineeMode ? 'text-indigo-600' : 'text-emerald-600'}`}>💡 Sáng kiến & Cải tiến hôm nay?</div>
                                <textarea className={`w-full border-none text-[10px] p-3 rounded-xl min-h-[60px] focus:ring-2 font-medium italic ${form.isTraineeMode ? 'bg-indigo-50/30 ring-indigo-500/20' : 'bg-emerald-50/30 ring-emerald-500/20'}`} placeholder="Góp ý hoặc sáng kiến để Team mình xịn hơn... (Gamification reward 🎁)" value={form.improvementNote} onChange={e => setForm({ ...form, improvementNote: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-slate-100/50 rounded-2xl border border-slate-100 cursor-pointer active:bg-slate-200 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded-sm border-2 border-slate-300 transition-all checked:bg-blue-600" checked={form.isCommitted} onChange={e => setForm({ ...form, isCommitted: e.target.checked })} />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter leading-tight">Mình nỗ lực hết mình, chia sẻ thật lòng rồi nè ✨</span>
                    </label>
                    {error && <p className="text-rose-500 text-[8px] font-black text-center animate-bounce uppercase">{error}</p>}
                    <button onClick={executeSubmit} disabled={!isReadyToSubmit || loading} className={`w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.1em] shadow-xl transition-all active:scale-95 ${!isReadyToSubmit ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}>
                        {loading ? 'ĐANG XỬ LÝ...' : `XÁC NHẬN BÁO CÁO 🚀`}
                    </button>
                    <button onClick={onBack} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] py-2">HUỶ BỎ</button>
                </div>
            </div>

            {/* MOOD MODAL */}
            {showMoodModal && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${MOOD_CONFIG[form.rating]?.modalBg} backdrop-blur-md animate-in fade-in duration-300`}>
                    <div className="text-center animate-in zoom-in duration-500 max-w-sm w-full">
                        <div className="text-8xl mb-6 drop-shadow-2xl">{MOOD_CONFIG[form.rating]?.icon}</div>
                        <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">{activePhrase}</h3>
                        <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-8">Điều gì khiến ca làm của bạn như vậy?</p>

                        <div className="grid grid-cols-3 gap-2 mb-10">
                            {REASONS.map(r => {
                                const active = form.selectedReasons.includes(r.id);
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => {
                                            if (active) {
                                                setForm({ ...form, selectedReasons: form.selectedReasons.filter(i => i !== r.id) });
                                            } else if (form.selectedReasons.length < 2) {
                                                setForm({ ...form, selectedReasons: [...form.selectedReasons, r.id] });
                                            }
                                        }}
                                        className={`py-3 rounded-2xl text-[9px] font-black flex flex-col items-center gap-1 transition-all border-2 ${active ? 'bg-white text-slate-900 border-white shadow-xl scale-105' : 'bg-white/10 text-white border-white/10'}`}
                                    >
                                        <span className="text-lg">{r.icon}</span><span>{r.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setShowMoodModal(false)}
                            className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                        >
                            Xác nhận & Tiếp tục
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageShiftLog;
