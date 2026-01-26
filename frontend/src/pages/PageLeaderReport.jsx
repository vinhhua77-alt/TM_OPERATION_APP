import React, { useState, useEffect, useMemo } from 'react';
import { masterAPI } from '../api/master';
import { leaderAPI } from '../api/leader';
import { careerAPI } from '../api/career';

const PageLeaderReport = ({ user, onBack, onNavigate }) => {
    // 0. SAFE USER DATA (NORMALIZED)
    const safeUser = useMemo(() => ({
        id: user?.id || user?.sub,
        name: user?.name || user?.staff_name || 'N/A',
        storeCode: user?.storeCode || user?.store_code || '',
        role: user?.role || 'LEADER'
    }), [user]);

    // 1. MASTER DATA STATE
    const [master, setMaster] = useState({
        checklist: [], incidents: [], staff: [], areas: [], shifts: [], stores: [],
        leaderChecklist: [], leaderIncidents: []
    });

    // 2. FORM STATE
    const [formData, setFormData] = useState({
        store_id: safeUser.storeCode,
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
        feedback_content: '', // New field for user feedback
        confirm_all: false,
        shiftErrorReason: '',
        confirmWrongShift: false,
        isOvernightShift: false
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // --- APPROVAL NOTIFICATION STATE ---
    const [pendingTrainees, setPendingTrainees] = useState([]);
    const [showApprovalModal, setShowApprovalModal] = useState(false);

    // 3. INITIALIZE
    useEffect(() => {
        const now = new Date();
        setFormData(prev => ({
            ...prev,
            endH: now.getHours().toString().padStart(2, '0'),
            endM: '00'
        }));

        loadMasterData();
        loadPendingTrainees();
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
            console.error(error);
        }
    };

    const loadPendingTrainees = async () => {
        // Only load if SM or Admin or Leader (in some cases)
        // Hardcode storeId filter for now
        if (safeUser.storeCode) {
            const res = await careerAPI.getPendingRequests(safeUser.storeCode);
            if (res.success) setPendingTrainees(res.data || []);
        }
    };

    const handleApproval = async (reqId, decision) => {
        const res = await careerAPI.approveRequest(reqId, safeUser.id, decision);
        if (res.success) {
            setPendingTrainees(prev => prev.filter(r => r.id !== reqId));
            // Show toast or slight visual feedback?
        } else {
            alert('Error: ' + res.message);
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

        if (endTotal === startTotal) return { type: 'error', text: 'INVALID TIME' };

        let duration = (endTotal - startTotal) / 60;
        if (duration < 0) duration += 24;

        const sApp = `${formData.startH}:${formData.startM}`;
        const eApp = `${formData.endH}:${formData.endM}`;

        const match = master.shifts.find(s => s.start === sApp && s.end === eApp);

        if (match) return { type: 'ok', text: `SHIFT: ${match.name}` };

        return { type: 'warning', text: `CUSTOM SHIFT (${duration.toFixed(1)}H)`, showConfirm: true };
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
            setError("MISSING REQUIRED FIELDS");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                leaderId: safeUser.id,
                leaderName: safeUser.name
            };

            const res = await leaderAPI.submitReport(payload);

            if (res.success) {
                alert("REPORT SUBMITTED SUCCESSFULLY");
                onBack();
            } else {
                setError("SUBMIT ERROR: " + (res.message || "Unknown error"));
            }
        } catch (e) {
            console.error("Submit Error:", e);
            const msg = e.message || "Server Error";
            setError(`ERROR: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // --- MINIMALIST COMPONENTS ---
    const SectionHeader = ({ title }) => (
        <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
            <div className="h-px bg-slate-100 flex-1"></div>
        </div>
    );

    const MinimalSelect = ({ value, onChange, options, placeholder, className = "" }) => (
        <select
            className={`w-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 p-2 rounded outline-none focus:border-black transition-colors ${className}`}
            value={value}
            onChange={onChange}
        >
            <option value="">{placeholder}</option>
            {options}
        </select>
    );

    const MinimalInput = ({ value, onChange, placeholder }) => (
        <input
            className="w-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 p-2 rounded outline-none focus:border-black transition-colors placeholder-slate-300"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans pb-10 animate-fade-in relative">
            {/* MINIMAL HEADER */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="text-xl text-slate-400 hover:text-black transition-colors">←</button>
                    <div>
                        <h1 className="text-[11px] font-black uppercase tracking-tighter text-slate-800 leading-none">Leader Report</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{safeUser.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* NOTIFICATION BELL */}
                    <button
                        onClick={() => setShowApprovalModal(true)}
                        className="relative p-1.5 rounded-full hover:bg-slate-50 transition-colors"
                    >
                        <span className="text-xl">🔔</span>
                        {pendingTrainees.length > 0 && (
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full animate-bounce">
                                {pendingTrainees.length}
                            </span>
                        )}
                    </button>
                    <div className="text-[9px] font-mono font-bold text-slate-300 hidden sm:block">{new Date().toLocaleDateString('vi-VN')}</div>
                </div>
            </div>

            {/* FORM AREA */}
            <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-5">

                {/* 1. LOCATION & TIME */}
                <div className="space-y-4">
                    <SectionHeader title="Location & Time" />
                    <div className="grid grid-cols-2 gap-3">
                        <MinimalSelect
                            value={formData.store_id}
                            onChange={(e) => handleInputChange('store_id', e.target.value)}
                            placeholder="SELECT STORE"
                            options={master.stores?.map(s => <option key={s.store_code || s.id} value={s.store_code || s.id}>{s.name || s.store_name}</option>)}
                        />
                        <MinimalSelect
                            value={formData.area_code}
                            onChange={(e) => handleInputChange('area_code', e.target.value)}
                            placeholder="SELECT AREA"
                            options={master.areas?.map(a => <option key={a} value={a}>{a}</option>)}
                        />
                    </div>

                    <div className="bg-white border border-slate-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Start Time</label>
                                <div className="flex gap-1">
                                    <MinimalSelect value={formData.startH} onChange={(e) => handleInputChange('startH', e.target.value)} placeholder="HH" options={Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)} />
                                    <MinimalSelect value={formData.startM || '00'} onChange={(e) => handleInputChange('startM', e.target.value)} placeholder="MM" options={<><option value="00">00</option><option value="30">30</option></>} />
                                </div>
                            </div>
                            <div className="text-slate-300 font-black">→</div>
                            <div className="flex-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">End Time</label>
                                <div className="flex gap-1">
                                    <MinimalSelect value={formData.endH} onChange={(e) => handleInputChange('endH', e.target.value)} placeholder="HH" options={Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)} />
                                    <MinimalSelect value={formData.endM || '00'} onChange={(e) => handleInputChange('endM', e.target.value)} placeholder="MM" options={<><option value="00">00</option><option value="30">30</option></>} />
                                </div>
                            </div>
                        </div>

                        {(shiftStatus.type === 'ok' || shiftStatus.type === 'warning') && (
                            <div className={`text-[10px] font-mono font-bold uppercase p-2 bg-slate-50 border border-slate-100 rounded text-center ${shiftStatus.type === 'warning' ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {shiftStatus.text}
                            </div>
                        )}

                        {shiftStatus.type === 'warning' && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input type="checkbox" className="accent-black w-3 h-3" checked={formData.confirmWrongShift} onChange={(e) => handleInputChange('confirmWrongShift', e.target.checked)} />
                                    <span className="text-[9px] font-bold text-amber-600 uppercase">Confirm Custom Shift</span>
                                </label>
                                {formData.confirmWrongShift && (
                                    <MinimalSelect
                                        value={formData.shiftErrorReason}
                                        onChange={(e) => handleInputChange('shiftErrorReason', e.target.value)}
                                        placeholder="REASON FOR MISMATCH"
                                        options={<><option value="DOI_CA">Swapped Shift</option><option value="TANG_CA">Overtime</option><option value="COVER">Cover Shift</option></>}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. OPS HEALTH */}
                <div>
                    <SectionHeader title="Operational Health" />
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {[{ id: 'has_peak', l: 'PEAK HOUR' }, { id: 'has_out_of_stock', l: 'OUT OF STOCK' }, { id: 'has_customer_issue', l: 'USER ISSUE' }].map(b => (
                            <button
                                key={b.id}
                                onClick={() => handleInputChange(b.id, !formData[b.id])}
                                className={`py-2 px-1 rounded border text-[9px] font-black uppercase transition-all ${formData[b.id] ? 'bg-black text-white border-black' : 'bg-white text-slate-300 border-slate-200 hover:border-slate-300'}`}
                            >
                                {b.l}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white border border-slate-200 rounded divide-y divide-slate-100">
                        {master.leaderChecklist?.map(item => (
                            <div key={item} className="p-3 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-700 uppercase">{item}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleChecklist(item, true)} className={`w-8 h-6 rounded flex items-center justify-center text-[10px] border transition-colors ${formData.checklist[item] === true ? 'bg-emerald-50 border-emerald-500 text-emerald-600 font-bold' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>OK</button>
                                    <button onClick={() => toggleChecklist(item, false)} className={`w-8 h-6 rounded flex items-center justify-center text-[10px] border transition-colors ${formData.checklist[item] === false ? 'bg-rose-50 border-rose-500 text-rose-600 font-bold' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>NO</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasIncidentTrigger && (
                        <div className="mt-3 p-3 bg-rose-50 border border-dash border-rose-200 rounded animate-in fade-in">
                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-wide mb-2">Issue Required *</div>
                            <div className="space-y-2">
                                <MinimalSelect
                                    className="border-rose-200 focus:border-rose-500"
                                    value={formData.observed_issue_code}
                                    onChange={(e) => handleInputChange('observed_issue_code', e.target.value)}
                                    placeholder="ISSUE TYPE"
                                    options={master.leaderIncidents?.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                                />
                                <textarea
                                    className="w-full bg-white border border-rose-200 text-[10px] font-mono text-slate-700 p-2 rounded outline-none focus:border-rose-500 min-h-[60px]"
                                    placeholder="Describe the issue and resolution..."
                                    value={formData.observed_note}
                                    onChange={(e) => handleInputChange('observed_note', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. PEOPLE & MOOD */}
                <div>
                    <SectionHeader title="Team & Mood" />
                    <div className="bg-white border border-slate-200 rounded p-4 mb-3">
                        <div className="flex justify-between items-center px-2">
                            {['😫', '😐', '😊', '🔥', '🚀'].map((m, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleInputChange('mood', i + 1)}
                                    className={`text-2xl transition-all hover:scale-110 ${formData.mood === (i + 1) ? 'opacity-100 scale-125' : 'opacity-20 grayscale'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="text-[9px] font-black text-emerald-600 uppercase">Recognize (Kudos)</div>
                            <MinimalSelect value={formData.khen_emp} onChange={(e) => handleInputChange('khen_emp', e.target.value)} placeholder="Staff" options={filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} />
                            <MinimalSelect value={formData.khen_topic} onChange={(e) => handleInputChange('khen_topic', e.target.value)} placeholder="Generic Topic" options={<><option>Attitude</option><option>Speed</option><option>Quality</option></>} />
                        </div>
                        <div className="space-y-2">
                            <div className="text-[9px] font-black text-rose-500 uppercase">Remind (Coaching)</div>
                            <MinimalSelect value={formData.nhac_emp} onChange={(e) => handleInputChange('nhac_emp', e.target.value)} placeholder="Staff" options={filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} />
                            <MinimalSelect value={formData.nhac_topic} onChange={(e) => handleInputChange('nhac_topic', e.target.value)} placeholder="Issue Topic" options={<><option>SOP Violation</option><option>Hygiene</option><option>Lateness</option></>} />
                        </div>
                    </div>
                </div>

                {/* 4. HANDOVER & FEEDBACK */}
                <div>
                    <SectionHeader title="Handover & Feedback" />
                    <div className="space-y-3">
                        <MinimalSelect
                            value={formData.next_shift_risk}
                            onChange={(e) => handleInputChange('next_shift_risk', e.target.value)}
                            placeholder="RISK ASSESSMENT LEVEL"
                            options={<><option value="NONE">Risk: None</option><option value="LOW">Risk: Low</option><option value="ATTENTION">Risk: High Attention</option></>}
                        />
                        <textarea
                            className="w-full bg-white border border-slate-200 text-[10px] font-mono text-slate-700 p-3 rounded outline-none focus:border-black min-h-[60px]"
                            placeholder="Handover notes for next shift leader..."
                            value={formData.next_shift_note}
                            onChange={(e) => handleInputChange('next_shift_note', e.target.value)}
                        />
                        {/* NEW FEEDBACK FIELD */}
                        <div className="pt-2 border-t border-slate-100">
                            <label className="text-[9px] font-black text-blue-600 uppercase mb-1 block">💡 Your Feedback (Optional)</label>
                            <textarea
                                className="w-full bg-blue-50/30 border border-blue-100 text-[10px] font-mono text-slate-700 p-3 rounded outline-none focus:border-blue-300 min-h-[60px] placeholder-blue-200"
                                placeholder="Ideas to improve store operations..."
                                value={formData.feedback_content}
                                onChange={(e) => handleInputChange('feedback_content', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 5. SUBMIT */}
                <div className="pt-4 pb-8 space-y-3">
                    <label className="flex items-center justify-center gap-2 cursor-pointer bg-slate-50 p-3 rounded border border-slate-100 hover:bg-slate-100 transition-colors">
                        <input type="checkbox" className="accent-black w-4 h-4" checked={formData.confirm_all} onChange={(e) => handleInputChange('confirm_all', e.target.checked)} />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">I confirm all data is accurate</span>
                    </label>

                    {error && <div className="text-center text-[9px] font-black text-rose-500 uppercase">{error}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !isReadyToSubmit}
                        className={`w-full py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all ${!isReadyToSubmit ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-800 shadow-lg hover:shadow-xl translate-y-0 active:translate-y-0.5'}`}
                    >
                        {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </div>

            {/* APPROVAL MODAL */}
            {showApprovalModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase text-slate-700 flex items-center gap-2">
                                🔔 Trainee Approvals ({pendingTrainees.length})
                            </h3>
                            <button onClick={() => setShowApprovalModal(false)} className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 font-bold hover:bg-slate-100">✕</button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                            {pendingTrainees.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic text-xs">
                                    No pending approvals for today.
                                </div>
                            ) : (
                                pendingTrainees.map(req => (
                                    <div key={req.id} className="p-4 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{req.staffName}</div>
                                                <div className="text-[10px] text-slate-500 mb-1">Applying for: <strong className="text-indigo-600 uppercase">{req.position}</strong></div>
                                                <div className="text-[9px] font-mono text-slate-400">Hours: {req.currentHours}h • {new Date(req.timestamp).toLocaleTimeString()}</div>
                                            </div>
                                            {req.currentHours > 1000 ? ( // Mock Check
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ELIGIBLE</span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">LOW HOURS</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <button
                                                onClick={() => handleApproval(req.id, 'REJECTED')}
                                                className="py-2 rounded border border-rose-200 text-rose-600 text-[10px] font-black uppercase hover:bg-rose-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApproval(req.id, 'APPROVED')}
                                                className="py-2 rounded bg-black text-white text-[10px] font-black uppercase hover:bg-slate-800"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageLeaderReport;
