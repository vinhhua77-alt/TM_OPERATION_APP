import React, { useState, useEffect, useMemo } from 'react';
import { masterAPI } from '../api/master';
import { leaderAPI } from '../api/leader';

const PageLeaderReport = ({ user, onBack, onNavigate }) => {
    // 1. MASTER DATA STATE
    const [master, setMaster] = useState({
        checklist: [], incidents: [], staff: [], areas: [], shifts: [], stores: [],
        leaderChecklist: [], leaderIncidents: []
    });

    // 2. FORM STATE
    // 2. FORM STATE
    const [formData, setFormData] = useState({
        store_id: user?.storeCode || user?.store_code || '',
        area_code: '',
        startH: '',
        startM: '00',
        endH: '',
        endM: '00',
        has_peak: false,
        has_out_of_stock: false,
        has_customer_issue: false,
        checklist: {},
        mood: 0,
        observed_issue_code: '',
        observed_note: '',
        khen_emp: '',
        khen_topic: '',
        nhac_emp: '',
        nhac_topic: '',
        next_shift_risk: '',
        next_shift_note: '',
        confirm_all: false,
        shiftErrorReason: '',
        confirmWrongShift: false,
        isOvernightShift: false
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 3. INITIALIZE
    useEffect(() => {
        const now = new Date();
        setFormData(prev => ({
            ...prev,
            endH: now.getHours().toString().padStart(2, '0'),
            endM: '00'
        }));

        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            const response = await masterAPI.getMasterData();
            if (response.success && response.data) {
                setMaster(response.data);

                // Initialize checklist
                const initialChecklist = {};
                (response.data.leaderChecklist || []).forEach(item => {
                    initialChecklist[item] = null;
                });
                setFormData(prev => ({ ...prev, checklist: initialChecklist }));
            }
        } catch (error) {
            console.error('Error loading master data:', error);
            setError('Không thể tải dữ liệu hệ thống');
        }
    };

    const filteredStaff = useMemo(() => {
        if (!formData.store_id) return master.staff || [];
        const targetStore = String(formData.store_id).trim().toUpperCase();
        return (master.staff || []).filter(s => {
            const sCode = String(s.store || s.store_code || '').trim().toUpperCase();
            return sCode === targetStore;
        });
    }, [formData.store_id, master.staff]);

    const shiftStatus = useMemo(() => {
        if (!master.shifts || !formData.startH || !formData.endH) return { type: 'loading', text: '---' };

        const startTotal = parseInt(formData.startH) * 60 + parseInt(formData.startM || 0);
        const endTotal = parseInt(formData.endH) * 60 + parseInt(formData.endM || 0);

        if (endTotal === startTotal) return { type: 'error', text: '⚠️ GIỜ RA PHẢI KHÁC GIỜ VÀO' };

        let duration = (endTotal - startTotal) / 60;
        if (duration < 0) duration += 24;

        const sApp = `${formData.startH}:${formData.startM}`;
        const eApp = `${formData.endH}:${formData.endM}`;

        const match = master.shifts.find(s => s.start === sApp && s.end === eApp);

        if (match) return { type: 'ok', text: `✔️ KHỚP CA: ${match.name}` };

        return { type: 'warning', text: `⚠️ CA KHÔNG CÓ TRONG HỆ THỐNG (${duration.toFixed(1)}H).`, showConfirm: true };
    }, [formData.startH, formData.startM, formData.endH, formData.endM, master.shifts]);

    const hasIncidentTrigger = useMemo(() => {
        return Object.values(formData.checklist).includes(false);
    }, [formData.checklist]);

    const isReadyToSubmit = useMemo(() => {
        const coreOk = formData.store_id && formData.area_code && formData.confirm_all;
        const checklistDone = master.leaderChecklist?.length > 0 &&
            master.leaderChecklist.every(item => formData.checklist[item] !== null && formData.checklist[item] !== undefined);

        let shiftOk = false;
        if (shiftStatus.type === 'ok') shiftOk = true;
        if (shiftStatus.type === 'warning' && formData.confirmWrongShift && formData.shiftErrorReason) shiftOk = true;
        const incidentOk = !hasIncidentTrigger || (formData.observed_issue_code && formData.observed_note && formData.observed_note.trim().length >= 5);
        const moodOk = formData.mood > 0; // Require mood selection
        const riskOk = formData.next_shift_risk !== ''; // Require risk selection

        return coreOk && checklistDone && shiftOk && incidentOk && moodOk && riskOk;
    }, [formData, shiftStatus, hasIncidentTrigger, master.leaderChecklist]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const toggleChecklist = (item, value) => {
        setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [item]: value } }));
    };

    const handleSubmit = async () => {
        if (!isReadyToSubmit) {
            setError("VUI LÒNG HOÀN TẤT CHECKLIST VÀ CÁC MỤC BẮT BUỘC!");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                leaderId: user?.id,
                leaderName: user?.name
            };

            const res = await leaderAPI.submitReport(payload);

            if (res.success) {
                // GenZ motivational messages
                const messages = [
                    "🎉 XONG RỒI! Anh/chị là LEADER xuất sắc nhất hôm nay! 💪",
                    "🔥 CHỐT ĐƠN! Báo cáo của anh/chị quá đỉnh! Keep it up! 🚀",
                    "✨ PERFECT! Team đang tự hào về anh/chị đấy! 🌟",
                    "💯 DONE! Anh/chị vừa level up kỹ năng quản lý! 📈",
                    "🎯 HOÀN THÀNH! Anh/chị là role model của team! 👑",
                    "⚡ NHANH NHƯ CHỚP! Báo cáo đã được ghi nhận! 💪",
                    "🌈 TUYỆT VỜI! Anh/chị làm việc quá chuyên nghiệp! 🎊",
                    "🚀 BOOM! Một ngày làm việc thành công nữa! Let's go! 🔥"
                ];
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                alert(randomMessage);
                onBack();
            } else {
                setError("❌ LỖI: " + (res.message || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            setError("Lỗi kết nối server");
        } finally {
            setSubmitting(false);
        }
    };

    // REMOVED BLOCKING LOADING SCREEN
    // if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans pb-10">
            {/* LEADER HEADER */}
            <div className={`shrink-0 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 pb-10 text-white relative overflow-hidden shadow-lg transition-all duration-1000`}>
                <div className="relative z-10">
                    <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white text-[8px] font-bold px-3 py-1 rounded-full transition-all backdrop-blur-md border border-white/5 uppercase tracking-tighter mb-4 active:scale-95">
                        ← Báo cáo ngày
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl rotate-2 leading-none">
                            📋
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight leading-none mb-0.5">LEADER LOG</h1>
                            <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                                {user?.name} - {user?.role}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/5 rounded-full blur-[60px]"></div>
            </div>

            {/* FORM AREA */}
            <div className="flex-1 px-4 -mt-6 relative z-20 space-y-4">

                {/* 1. STORE & AREA CARD */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi nhánh & Khu vực</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="bg-slate-50 border-none text-[11px] font-black text-slate-700 p-2.5 rounded-xl focus:ring-2 ring-emerald-500/20"
                            value={formData.store_id}
                            onChange={(e) => handleInputChange('store_id', e.target.value)}
                        >
                            <option value="">-- CHI NHÁNH --</option>
                            {master.stores?.map(s => <option key={s.store_code || s.id} value={s.store_code || s.id}>{s.name || s.store_name}</option>)}
                        </select>

                        <select
                            className="bg-slate-50 border-none text-[11px] font-black text-slate-700 p-2.5 rounded-xl focus:ring-2 ring-emerald-500/20"
                            value={formData.area_code}
                            onChange={(e) => handleInputChange('area_code', e.target.value)}
                        >
                            <option value="">-- KHU VỰC --</option>
                            {master.areas?.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. TIME CARD */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian ca làm</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black text-slate-400 ml-1">GIỜ VÀO</label>
                            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200/50">
                                <select className="flex-1 bg-transparent border-none text-[12px] font-black text-slate-700 p-0 focus:ring-0 text-center" value={formData.startH} onChange={(e) => handleInputChange('startH', e.target.value)}>
                                    <option value="">HH</option>
                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="font-black text-slate-300">:</span>
                                <select className="flex-1 bg-transparent border-none text-[12px] font-black text-slate-700 p-0 focus:ring-0 text-center" value={formData.startM || '00'} onChange={(e) => handleInputChange('startM', e.target.value)}>
                                    <option value="00">00</option>
                                    <option value="30">30</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black text-slate-400 ml-1">GIỜ RA</label>
                            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200/50">
                                <select className="flex-1 bg-transparent border-none text-[12px] font-black text-slate-700 p-0 focus:ring-0 text-center" value={formData.endH} onChange={(e) => handleInputChange('endH', e.target.value)}>
                                    <option value="">HH</option>
                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="font-black text-slate-300">:</span>
                                <select className="flex-1 bg-transparent border-none text-[12px] font-black text-slate-700 p-0 focus:ring-0 text-center" value={formData.endM || '00'} onChange={(e) => handleInputChange('endM', e.target.value)}>
                                    <option value="00">00</option>
                                    <option value="30">30</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {shiftStatus && (
                        <div className={`mt-3 p-2 rounded-xl text-[9px] font-black text-center ${shiftStatus.type === 'ok' ? 'bg-emerald-50 text-emerald-600' : (shiftStatus.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600')}`}>
                            {shiftStatus.text}
                            {shiftStatus.type === 'warning' && (
                                <div className="mt-2 space-y-2">
                                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded-md border-amber-300" checked={formData.confirmWrongShift} onChange={(e) => handleInputChange('confirmWrongShift', e.target.checked)} />
                                        <span>XÁC NHẬN GIỜ THỰC TẾ</span>
                                    </label>
                                    {formData.confirmWrongShift && (
                                        <select className="w-full bg-white border-none text-[9px] p-1.5 rounded-lg shadow-inner mt-1" value={formData.shiftErrorReason} onChange={(e) => handleInputChange('shiftErrorReason', e.target.value)}>
                                            <option value="">-- CHỌN LÝ DO --</option>
                                            <option value="ĐỔI CA">ĐỔI CA</option><option value="ĐI TRỄ">ĐI TRỄ</option><option value="VỀ SỚM">VỀ SỚM</option><option value="TĂNG CA">TĂNG CA</option>
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. OPERATIONAL STATUS */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái vận hành</span>
                    </div>
                    <div className="flex gap-2">
                        {[{ id: 'has_peak', l: 'CA ĐÔNG', icon: '🔥' }, { id: 'has_out_of_stock', l: 'HẾT MÓN', icon: '📦' }, { id: 'has_customer_issue', l: 'PHÀN NÀN', icon: '👤' }].map(b => (
                            <button
                                key={b.id}
                                onClick={() => handleInputChange(b.id, !formData[b.id])}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black transition-all active:scale-90 border shadow-sm ${formData[b.id] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                            >
                                <div className="text-xs mb-0.5">{b.icon}</div>
                                {b.l}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 space-y-1">
                        {master.leaderChecklist?.map(item => (
                            <div key={item} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                <span className="text-[11px] font-bold text-slate-600 pr-4 leading-tight">{item}</span>
                                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-100 shadow-inner shrink-0">
                                    <button onClick={() => toggleChecklist(item, true)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${formData.checklist[item] === true ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400 opacity-40'}`}>CÓ</button>
                                    <button onClick={() => toggleChecklist(item, false)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${formData.checklist[item] === false ? 'bg-white text-rose-500 shadow-lg' : 'text-slate-400 opacity-40'}`}>KHÔNG</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasIncidentTrigger && (
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 space-y-2 animate-in zoom-in-95">
                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">🔒 BẮT BUỘC: CHI TIẾT SỰ CỐ</div>
                            <select className="w-full bg-white border-none text-[10px] font-bold p-2 rounded-xl shadow-sm" value={formData.observed_issue_code} onChange={(e) => handleInputChange('observed_issue_code', e.target.value)}>
                                <option value="">-- LOẠI SỰ CỐ --</option>
                                {master.leaderIncidents?.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                            </select>
                            <textarea className="w-full bg-white border-none text-[11px] p-3 rounded-xl shadow-sm min-h-[50px] focus:ring-0" placeholder="Mô tả & hướng giải quyết..." value={formData.observed_note} onChange={(e) => handleInputChange('observed_note', e.target.value)} />
                        </div>
                    )}
                </div>

                {/* 4. MOOD & STAFF FEEDBACK */}
                <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ca làm hôm nay thế nào?</span>
                    </div>
                    <div className="flex justify-between px-2 bg-slate-50 py-3 rounded-2xl border border-slate-100">
                        {['😫', '😐', '😊', '🔥', '🚀'].map((m, i) => (
                            <span
                                key={i}
                                onClick={() => handleInputChange('mood', i + 1)}
                                className={`text-2xl cursor-pointer transition-all active:scale-125 ${formData.mood === (i + 1) ? 'opacity-100 scale-125 drop-shadow-lg' : 'opacity-20 grayscale'}`}
                            >
                                {m}
                            </span>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi nhận nhân sự</span>
                        </div>
                        {/* KHEN */}
                        <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-2 rounded-2xl border border-emerald-100">
                            <div className="text-[8px] font-black text-emerald-600 flex items-center justify-center bg-white rounded-lg shadow-sm">👍 KHEN</div>
                            <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={formData.khen_emp} onChange={(e) => handleInputChange('khen_emp', e.target.value)}>
                                <option value="">Nhân viên</option>
                                {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={formData.khen_topic} onChange={(e) => handleInputChange('khen_topic', e.target.value)}>
                                <option value="">Chủ đề</option><option>Thái độ</option><option>Tốc độ</option>
                            </select>
                        </div>
                        {/* NHẮC */}
                        <div className="grid grid-cols-3 gap-2 bg-rose-50/50 p-2 rounded-2xl border border-rose-100">
                            <div className="text-[8px] font-black text-rose-500 flex items-center justify-center bg-white rounded-lg shadow-sm">⚠️ NHẮC</div>
                            <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={formData.nhac_emp} onChange={(e) => handleInputChange('nhac_emp', e.target.value)}>
                                <option value="">Nhân viên</option>
                                {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select className="bg-white border-none text-[9px] font-bold p-1.5 rounded-lg shadow-sm" value={formData.nhac_topic} onChange={(e) => handleInputChange('nhac_topic', e.target.value)}>
                                <option value="">Chủ đề</option><option>Sai SOP</option><option>Vệ sinh</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 5. HANDOVER & SUBMIT */}
                <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-slate-50 border-none text-[10px] font-black p-2.5 rounded-xl text-slate-700" value={formData.next_shift_risk} onChange={(e) => handleInputChange('next_shift_risk', e.target.value)}>
                            <option value="">-- MỨC ĐỘ RỦI RO --</option><option value="NONE">RỦI RO: KHÔNG</option><option value="LOW">RỦI RO: THẤP</option><option value="ATTENTION">RỦI RO: CHÚ Ý</option>
                        </select>
                        <textarea className="bg-slate-50 border-none text-[10px] p-2.5 rounded-xl min-h-[40px] focus:ring-0" placeholder="Dặn dò ca sau..." value={formData.next_shift_note} onChange={(e) => handleInputChange('next_shift_note', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-100/50 rounded-2xl border border-slate-100">
                        <input type="checkbox" className="rounded-md border-slate-300 w-5 h-5 text-emerald-600 focus:ring-emerald-500" checked={formData.confirm_all} onChange={(e) => handleInputChange('confirm_all', e.target.checked)} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-tight">Cam kết các dữ liệu trên là đúng.</span>
                    </div>

                    {error && <p className="text-rose-500 text-[9px] font-black text-center animate-bounce">{error}</p>}

                    <button
                        className={`w-full py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${!isReadyToSubmit ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:shadow-emerald-200'}`}
                        onClick={handleSubmit}
                        disabled={submitting || !isReadyToSubmit}
                    >
                        {submitting ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO VẬN HÀNH 🏆'}
                    </button>

                    <button onClick={onBack} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors">
                        QUAY LẠI TRUNG TÂM BÁO CÁO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageLeaderReport;
