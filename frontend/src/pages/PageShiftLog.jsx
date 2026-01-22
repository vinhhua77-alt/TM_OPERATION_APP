import React, { useState, useEffect, useMemo } from 'react';
import { masterAPI } from '../api/master';
import { shiftAPI } from '../api/shift';
// REMOVED: import BottomNav from '../components/BottomNav';

const PageShiftLog = ({ user, onNavigate, onLogout }) => {
    const [master, setMaster] = useState({ stores: [], layouts: {}, leaders: [], shifts: [] });
    const [loading, setLoading] = useState(false); // Non-blocking
    const [photo, setPhoto] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false); // New success state

    const FEELINGS = [
        { id: 'OK', label: '🔥 CHÁY HẾT MÌNH - NĂNG LƯỢNG FULL', icon: '🟢', color: '#10B981' },
        { id: 'BUSY', label: '💪 HƠI RUSH NHƯNG VẪN CHIẾN', icon: '🟡', color: '#EAB308' },
        { id: 'FIXED', label: '⚡ CÓ DRAMA NHƯNG ĐÃ XONG', icon: '🟠', color: '#F97316' },
        { id: 'OPEN', label: '😰 CÓ VẤN ĐỀ - CẦN SUPPORT', icon: '🔴', color: '#EF4444' },
        { id: 'OVER', label: '🆘 QUÁ TẢI - KHÔNG HANDLE NỔI', icon: '⚫', color: '#333' }
    ];
    const REASONS = ["NHÂN SỰ", "KHÁCH HÀNG", "THIẾT BỊ", "QUY TRÌNH", "DỊCH VỤ", "KHÁC"];
    const SHIFT_ERROR_REASONS = [
        "ĐỔI CA",
        "ĐI TRỄ",
        "VỀ SỚM",
        "TĂNG CA",
        "CA GÃY",
        "KHẨN CẤP",
        "HỖ TRỢ CHI NHÁNH",
        "ĐIỀU CHỈNH LỊCH"
    ];

    const [form, setForm] = useState({
        storeId: user?.storeCode || '',
        lead: '', // Default empty to force selection or confirmation
        startH: '',
        startM: '00',
        endH: new Date().getHours().toString().padStart(2, '0'),
        endM: '00', // Enforce hourly
        layout: '',
        subPos: '',
        checks: {},
        incidentType: '',
        incidentNote: '',
        rating: '',
        selectedReasons: [],
        isCommitted: false,
        shiftErrorReason: '',
        confirmWrongShift: false, // New confirm for unknown shift
        confirmOvernightShift: false
    });

    useEffect(() => {
        loadMasterData();
    }, []);

    // Auto-select user's store after master data loads
    useEffect(() => {
        if (master.stores?.length > 0 && user?.storeCode && !form.storeId) {
            const userStore = master.stores.find(s => s.store_code === user.storeCode);
            if (userStore) {
                // Keep lead empty when auto-selecting store
                setForm(prev => ({ ...prev, storeId: user.storeCode }));
            }
        }
    }, [master.stores, user?.storeCode]);

    const loadMasterData = async () => {
        try {
            const response = await masterAPI.getMasterData();
            if (response.success && response.data) {
                setMaster(response.data);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
            setError('Không thể tải dữ liệu hệ thống');
        }
    };


    useEffect(() => { if (error) setError(''); }, [form, photo]);

    const filteredLeaders = useMemo(() => {
        if (!form.storeId) return [];
        return (master.leaders || []).filter(l => String(l.store_code).trim().toUpperCase() === String(form.storeId).trim().toUpperCase());
    }, [form.storeId, master.leaders]);

    const shiftInfo = useMemo(() => {
        if (!form.startH || !form.endH) return null;
        const sApp = `${form.startH}:${form.startM}`;
        const eApp = `${form.endH}:${form.endM}`;

        const startTotal = parseInt(form.startH) * 60 + parseInt(form.startM);
        const endTotal = parseInt(form.endH) * 60 + parseInt(form.endM);

        let duration = (endTotal - startTotal) / 60;

        if (duration <= 0) {
            return { match: null, duration: 0, isCorrect: false, error: 'GIỜ RA PHẢI LỚN HƠN GIỜ VÀO' };
        }

        const match = master.shifts?.find(s => s.start === sApp && s.end === eApp);

        return {
            match,
            duration: duration.toFixed(1),
            isCorrect: !!match,
            showConfirm: !match, // Show confirmation controls if no match
        };
    }, [form.startH, form.startM, form.endH, form.endM, master.shifts]);

    const hasNoCheck = Object.values(form.checks).includes('no');

    const isReadyToSubmit = useMemo(() => {
        // Core fields (Lead is now MANDATORY)
        if (!form.storeId || !form.layout || !form.rating || !form.startH || !form.isCommitted || !form.lead) return false;

        // Reason logic: If rating is NOT OK and NO checklist failure, must select reason
        if (!hasNoCheck && form.rating !== 'OK' && form.selectedReasons.length === 0) return false;

        // Incident logic: If checklist has 'no', must have incident type & note
        if (hasNoCheck) {
            if (!form.incidentType || !form.incidentNote || form.incidentNote.trim().length < 5) return false;
        }

        // Shift logic: Must not have time error (Start > End)
        // If "Unknown Shift" (!isCorrect), MUST confirm wrong shift AND select reason.
        if (shiftInfo) {
            if (shiftInfo.error) return false;
            if (!shiftInfo.isCorrect) {
                // Unknown shift: must confirm AND provide reason
                if (!form.confirmWrongShift || !form.shiftErrorReason) return false;
            }
        }

        return true;
    }, [form, hasNoCheck, shiftInfo]);

    const leadSelectRef = React.useRef(null);

    const handleCheckBeforeSubmit = () => {
        // Validation handled by isReadyToSubmit (button disabled if invalid)
        executeSubmit();
    };

    const executeSubmit = async () => {
        setLoading(true);
        let photoUrl = "";
        if (photo) {
            setIsUploading(true);
            setIsUploading(false); // Mock for now
        }

        try {
            const payload = {
                ...form,
                photoUrl,
                startTime: `${form.startH}:${form.startM}`,
                endTime: `${form.endH}:${form.endM}`,
                duration: shiftInfo?.duration,
                staffId: user?.id,
                staffName: user?.name,
                role: user?.role
            };

            const res = await shiftAPI.submit(payload);

            setLoading(false); setIsUploading(false);
            if (res.success) {
                setShowSuccess(true); // Show success popup
            } else {
                setError("❌ LỖI: " + (res.message || "Unknown error"));
            }
        } catch (e) {
            setLoading(false);
            setError("Lỗi kết nối máy chủ");
        }
    };

    // --- SUCCESS MODAL ---
    if (showSuccess) {
        return (
            <div className="fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', width: '90%', maxWidth: '350px', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
                    <h2 style={{ color: '#004AAD', margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900' }}>CẬP NHẬT THÀNH CÔNG!</h2>
                    <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                        Cảm ơn bạn đã vất vả cả ca!<br />
                        Chúc bạn xuống ca vui vẻ, nạp lại năng lượng nhé! 🚀💖
                    </p>
                    <button
                        onClick={() => onNavigate('HOME')}
                        className="btn-login"
                        style={{ background: '#004AAD', width: '100%', height: '45px', fontSize: '14px', borderRadius: '10px' }}
                    >
                        VỀ TRANG CHỦ
                    </button>
                    <div style={{ marginTop: '15px', fontSize: '11px', color: '#94A3B8' }}>Thái Mậu Group Operation App</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }} className="fade-in">
            {/* Header Removed */}
            <div style={{ marginTop: '10px' }} />

            {/* STORE & LEAD */}
            <div className="grid-2 mt-4">
                <select className="input-login" style={{ fontSize: '11px', fontWeight: '700', height: '40px' }} value={form.storeId} onChange={e => setForm({ ...form, storeId: e.target.value, lead: '' })}>
                    <option value="">-- CHỌN NHÀ HÀNG --</option>
                    {master.stores?.map(s => <option key={s.store_code || s.id} value={s.store_code || s.id}>{s.store_name || s.name}</option>)}
                </select>

                <select ref={leadSelectRef} className="input-login" style={{ fontSize: '11px', fontWeight: '700', height: '40px', color: form.lead === 'KHÔNG CÓ LEAD CA' ? '#EF4444' : 'inherit' }} value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })}>
                    <option value="">-- LEAD CA --</option>
                    <option value="KHÔNG CÓ LEAD CA" style={{ color: '#EF4444' }}>⚠️ KHÔNG CÓ LEAD CA</option>
                    {filteredLeaders.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
            </div>

            {/* TIME SELECTION - Compact */}
            <div className="grid-2 mt-3" style={{ background: '#F8FAFC', padding: '8px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '2px', textAlign: 'center' }}>GIỜ VÀO</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <select className="input-login" style={{ width: '60px', textAlign: 'center', padding: '4px', height: '36px' }} value={form.startH} onChange={e => setForm({ ...form, startH: e.target.value })}>
                            <option value="">--</option>
                            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}:00</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    <span style={{ fontSize: '16px', color: '#CBD5E1' }}>➜</span>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '2px', textAlign: 'center' }}>GIỜ RA</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <select className="input-login" style={{ width: '60px', textAlign: 'center', padding: '4px', height: '36px' }} value={form.endH} onChange={e => setForm({ ...form, endH: e.target.value })}>
                            <option value="">--</option>
                            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}:00</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {shiftInfo && (
                <div style={{ padding: '8px', borderRadius: '6px', marginTop: '5px', fontSize: '10px', background: shiftInfo.error ? '#FEF2F2' : (shiftInfo.isCorrect ? '#F0FDF4' : '#FFFBEB'), border: shiftInfo.error ? '1px solid #FCA5A5' : (shiftInfo.isCorrect ? '1px solid #86EFAC' : '1px solid #FCD34D') }}>
                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                        <b>{shiftInfo.error ? `⚠️ ${shiftInfo.error}` : (shiftInfo.isCorrect ? `✔️ KHỚP CA: ${shiftInfo.match.name}` : `⚠️ CA KHÔNG CÓ TRONG HỆ THỐNG (${shiftInfo.duration}h)`)}</b>
                    </div>

                    {!shiftInfo.isCorrect && !shiftInfo.error && (
                        <div style={{ marginTop: '4px', textAlign: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', marginBottom: '4px', fontSize: '9px' }}>
                                <input type="checkbox" checked={form.confirmWrongShift} onChange={e => setForm({ ...form, confirmWrongShift: e.target.checked })} />
                                <span style={{ fontWeight: '700', color: '#B45309' }}>XÁC NHẬN ĐÂY LÀ GIỜ THỰC TẾ</span>
                            </label>

                            {/* Show Dropdown ONLY after confirming */}
                            {form.confirmWrongShift && (
                                <select
                                    className="input-login"
                                    style={{ marginBottom: 0, fontSize: '10px', padding: '4px', borderColor: '#FCA5A5', color: form.shiftErrorReason ? '#B91C1C' : '#999', fontWeight: form.shiftErrorReason ? '700' : 'normal' }}
                                    value={form.shiftErrorReason}
                                    onChange={e => setForm({ ...form, shiftErrorReason: e.target.value })}
                                >
                                    <option value="">-- CHỌN LÝ DO SAI CA --</option>
                                    {SHIFT_ERROR_REASONS.map(reason => (
                                        <option key={reason} value={reason}>{reason}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* KHU VỰC & VỊ TRÍ - ALWAYS VISIBLE LOGIC */}
            <div className="section-title" style={{ marginTop: '16px', marginBottom: '8px' }}>KHU VỰC LÀM VIỆC</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {Object.keys(master.layouts || {}).map(key => (
                    <button key={key} className={`btn-login`}
                        style={{
                            padding: '10px 2px',
                            fontSize: '10px',
                            fontWeight: '800',
                            background: form.layout === key ? '#004AAD' : '#F1F5F9',
                            color: form.layout === key ? 'white' : '#64748B',
                            border: form.layout === key ? 'none' : '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: form.layout === key ? '0 2px 4px rgba(0,74,173,0.3)' : 'none',
                            transform: form.layout === key ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => setForm({ ...form, layout: key, subPos: '', checks: {}, incidentType: '' })}>
                        {master.layouts[key].name}
                    </button>
                ))}
            </div>

            {/* SUB-POSITIONS - VISIBLE IF LAYOUT SELECTED */}
            {form.layout && master.layouts[form.layout]?.subPositions?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
                    {master.layouts[form.layout].subPositions.map(sp => (
                        <button key={sp} className={`btn-login`}
                            style={{
                                padding: '8px 2px',
                                fontSize: '10px',
                                borderRadius: '8px',
                                backgroundColor: form.subPos === sp ? '#475569' : '#fff',
                                color: form.subPos === sp ? 'white' : '#475569',
                                border: form.subPos === sp ? 'none' : '1px dashed #CBD5E1'
                            }}
                            onClick={() => setForm({ ...form, subPos: sp })}>
                            {sp}
                        </button>
                    ))}
                </div>
            )}

            {/* CHECKLIST - VISIBLE IF LAYOUT SELECTED */}
            {form.layout && (
                <div style={{ marginTop: '10px' }}>
                    {master.layouts[form.layout]?.checklist?.map(item => (
                        <div key={item.id} className="checklist-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', padding: '8px 0' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>{item.text}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className={`btn-login`}
                                    style={{ padding: '4px 10px', fontSize: '9px', width: 'auto', background: form.checks[item.id] === 'yes' ? '#004AAD' : 'white', color: form.checks[item.id] === 'yes' ? 'white' : '#004AAD', border: '1px solid #004AAD' }}
                                    onClick={() => setForm({ ...form, checks: { ...form.checks, [item.id]: 'yes' } })}>CÓ</button>
                                <button className={`btn-login`}
                                    style={{ padding: '4px 10px', fontSize: '9px', width: 'auto', background: form.checks[item.id] === 'no' ? '#EF4444' : 'white', color: form.checks[item.id] === 'no' ? 'white' : '#EF4444', border: '1px solid #EF4444' }}
                                    onClick={() => setForm({ ...form, checks: { ...form.checks, [item.id]: 'no' } })}>KHÔNG</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ERROR HANDLING / INCIDENTS - HIDDEN until 'NO' checked */}
            {hasNoCheck && (
                <div style={{ marginTop: '8px', background: '#FFF1F2', padding: '10px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                    <label style={{ color: '#B91C1C', fontWeight: '800', fontSize: '10px', display: 'block', marginBottom: '6px' }}>PHÂN LOẠI SỰ CỐ (BẮT BUỘC)</label>
                    <select className="input-login" style={{ borderColor: '#FCA5A5', fontSize: '11px', marginBottom: '6px' }} value={form.incidentType} onChange={e => setForm({ ...form, incidentType: e.target.value })}>
                        <option value="">-- CHỌN LOẠI SỰ CỐ --</option>
                        {master.layouts[form.layout]?.incidents?.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                    </select>
                    <textarea className="input-login" style={{ height: '60px', borderColor: '#FCA5A5', fontSize: '11px', marginBottom: 0 }} placeholder="Chi tiết lý do checklist chưa đạt..." value={form.incidentNote} onChange={e => setForm({ ...form, incidentNote: e.target.value })} />
                </div>
            )}

            {/* FEELINGS */}
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                | CẢM NHẬN HÔM NAY
                <label style={{ cursor: 'pointer', color: '#004AAD', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📷 GỬI ẢNH (TÙY CHỌN)
                    <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setPhoto(reader.result);
                            reader.readAsDataURL(file);
                        }
                    }} />
                </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '5px' }}>
                {FEELINGS.map(f => (
                    <button key={f.id} className="btn-login"
                        style={{
                            padding: '12px 15px',
                            fontSize: '11px',
                            textAlign: 'left', // LEFT ALIGNMENT
                            background: form.rating === f.id ? '#004AAD' : 'white',
                            color: form.rating === f.id ? 'white' : '#004AAD',
                            border: '1px solid #004AAD',
                            borderRadius: '10px', // Matches standardized rounded corners
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '700',
                            justifyContent: 'flex-start' // Ensure start alignment
                        }}
                        onClick={() => setForm({ ...form, rating: f.id })}>
                        <span style={{ fontSize: '14px' }}>{f.icon}</span> {f.label}
                    </button>
                ))}
            </div>

            {form.rating && form.rating !== 'OK' && (
                <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {REASONS.map(r => (
                            <button key={r} className={`btn-login`}
                                style={{ padding: '8px 1px', fontSize: '9px', background: form.selectedReasons.includes(r) ? '#004AAD' : 'white', color: form.selectedReasons.includes(r) ? 'white' : '#004AAD', border: '1px solid #004AAD', borderRadius: '20px' }}
                                onClick={() => setForm(prev => ({ ...prev, selectedReasons: prev.selectedReasons.includes(r) ? prev.selectedReasons.filter(i => i !== r) : (prev.selectedReasons.length < 2 ? [...prev.selectedReasons, r] : prev.selectedReasons) }))}>{r}</button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-5" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', paddingLeft: '10px' }}>
                <input type="checkbox" checked={form.isCommitted} onChange={e => setForm({ ...form, isCommitted: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#004AAD' }}>TÔI CAM KẾT THÔNG TIN BÁO CÁO LÀ CHÍNH XÁC.</span>
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: '10px', fontWeight: '800', textAlign: 'center', margin: '8px 0' }}>{error}</p>}

            <button
                className="btn-login mt-5"
                style={{
                    height: '50px',
                    background: !isReadyToSubmit ? '#CBD5E1' : (loading ? '#CCC' : '#004AAD'),
                    cursor: isReadyToSubmit && !loading ? 'pointer' : 'not-allowed'
                }}
                onClick={handleCheckBeforeSubmit}
                disabled={!isReadyToSubmit || loading}
            >
                {isUploading ? '📤 ĐANG TẢI ẢNH...' : (loading ? '⌛ ĐANG GỬI...' : 'XÁC NHẬN GỬI BÁO CÁO')}
            </button>
        </div>
    );
};

export default PageShiftLog;
