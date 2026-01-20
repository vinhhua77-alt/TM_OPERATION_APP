import React, { useState, useEffect, useMemo } from 'react';
import { masterAPI } from '../api/master';
import { shiftAPI } from '../api/shift';
// REMOVED: import BottomNav from '../components/BottomNav';

const PageShiftLog = ({ user, onNavigate, onLogout }) => {
    const [master, setMaster] = useState({ stores: [], layouts: {}, leaders: [], shifts: [] });
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const FEELINGS = [
        { id: 'OK', label: '🔥 CHÁY HẾT MÌNH - NĂNG LƯỢNG FULL', icon: '🟢', color: '#10B981' },
        { id: 'BUSY', label: '💪 HƠI RUSH NHƯNG VẪN CHIẾN', icon: '🟡', color: '#EAB308' },
        { id: 'FIXED', label: '⚡ CÓ DRAMA NHƯNG ĐÃ XONG', icon: '🟠', color: '#F97316' },
        { id: 'OPEN', label: '😰 CÓ VẤN ĐỀ - CẦN SUPPORT', icon: '🔴', color: '#EF4444' },
        { id: 'OVER', label: '🆘 QUÁ TẢI - KHÔNG HANDLE NỔI', icon: '⚫', color: '#333' }
    ];
    const REASONS = ["NHÂN SỰ", "KHÁCH HÀNG", "THIẾT BỊ", "QUY TRÌNH", "DỊCH VỤ", "KHÁC"];

    const [form, setForm] = useState({
        storeId: user?.storeCode || '',
        lead: user?.name || '', // Default to current user name if available
        startH: '',
        startM: '00',
        endH: new Date().getHours().toString().padStart(2, '0'),
        endM: new Date().getMinutes() < 30 ? '00' : '30',
        layout: '',
        subPos: '',
        checks: {},
        incidentType: '',
        incidentNote: '',
        rating: '',
        selectedReasons: [],
        isCommitted: false,
        confirmShiftError: false
    });

    useEffect(() => {
        loadMasterData();
    }, []);

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
        if (!form.startH) return null;
        const sApp = `${form.startH}:${form.startM}`;
        const eApp = `${form.endH}:${form.endM}`;
        const duration = (parseInt(form.endH) + parseInt(form.endM) / 60) - (parseInt(form.startH) + parseInt(form.startM) / 60);
        const finalDuration = duration <= 0 ? duration + 24 : duration;
        const match = master.shifts?.find(s => s.start === sApp && s.end === eApp);
        return { match, duration: finalDuration.toFixed(1), isCorrect: !!match };
    }, [form.startH, form.startM, form.endH, form.endM, master.shifts]);

    const hasNoCheck = Object.values(form.checks).includes('no');

    const handleCheckBeforeSubmit = () => {
        if (!form.storeId || !form.layout || !form.rating || !form.startH || !form.lead || (!hasNoCheck && form.rating !== 'OK' && form.selectedReasons.length === 0) || !form.isCommitted) {
            setError("BẮT BUỘC: ĐIỀN ĐỦ THÔNG TIN VÀ CAM KẾT!"); return;
        }
        if (hasNoCheck) {
            if (!form.incidentType || !form.incidentNote || form.incidentNote.trim().length < 5) {
                setError("BẮT BUỘC TRUY VẾT: CHỌN SỰ CỐ VÀ MÔ TẢ > 5 KÝ TỰ!"); return;
            }
        }
        if (shiftInfo && !shiftInfo.isCorrect && !form.confirmShiftError) {
            setError("PHẢI XÁC NHẬN KHI SAI CA!"); return;
        }
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
                alert("✅ THÀNH CÔNG");
                onNavigate('HOME');
            } else {
                setError("❌ LỖI: " + (res.message || "Unknown error"));
            }
        } catch (e) {
            setLoading(false);
            setError("Lỗi kết nối máy chủ");
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">NHẬT KÝ CA LÀM VIỆC V7.3</h2>
                <p className="sub-title-dev">{user?.name} - {user?.role}</p>
            </div>

            {/* STORE & LEAD */}
            <div className="grid-2 mt-10" style={{ alignItems: 'end' }}>
                <div>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '2px' }}>NHÀ HÀNG</label>
                    <select className="input-login" style={{ marginBottom: 0 }} value={form.storeId} onChange={e => setForm({ ...form, storeId: e.target.value, lead: '' })}>
                        <option value="">-- CHỌN --</option>
                        {master.stores?.map(s => <option key={s.store_code || s.id} value={s.store_code || s.id}>{s.store_name || s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '2px' }}>LEAD CA</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '4px' }}>
                        {/* Simplified Leader selection/display */}
                        {filteredLeaders.length > 0 ? (
                            <select className="input-login" style={{ marginBottom: 0, padding: '0 5px' }} value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })}>
                                <option value="">-- LEAD --</option>
                                {filteredLeaders.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                            </select>
                        ) : (
                            <div className="input-login" style={{ marginBottom: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', padding: '0 8px', color: '#004AAD', fontWeight: '700' }}>
                                {user?.name || '...'}
                            </div>
                        )}
                        <div style={{ border: '1px solid #004AAD', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#004AAD' }}>
                            {user?.role || 'OPS'}
                        </div>
                    </div>
                </div>
            </div>

            {/* TIME */}
            <div className="grid-2 mt-5">
                <div>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '2px' }}>GIỜ VÀO *</label>
                    <div className="grid-2">
                        <select className="input-login" style={{ marginBottom: 0 }} value={form.startH} onChange={e => setForm({ ...form, startH: e.target.value })}>
                            <option value="">H</option>
                            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select className="input-login" style={{ marginBottom: 0 }} value={form.startM} onChange={e => setForm({ ...form, startM: e.target.value })}><option value="00">00</option><option value="30">30</option></select>
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '2px' }}>GIỜ RA</label>
                    <div className="grid-2">
                        <select className="input-login" style={{ marginBottom: 0 }} value={form.endH} onChange={e => setForm({ ...form, endH: e.target.value })}>
                            <option value="">H</option>
                            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select className="input-login" style={{ marginBottom: 0 }} value={form.endM} onChange={e => setForm({ ...form, endM: e.target.value })}><option value="00">00</option><option value="30">30</option></select>
                    </div>
                </div>
            </div>

            {shiftInfo && (
                <div style={{ padding: '6px', borderRadius: '6px', marginTop: '5px', fontSize: '10px', textAlign: 'center', background: shiftInfo.isCorrect ? '#F0FDF4' : '#FEF2F2', border: shiftInfo.isCorrect ? '1px solid #86EFAC' : '1px solid #FCA5A5' }}>
                    <b>{shiftInfo.isCorrect ? `✔️ KHỚP CA: ${shiftInfo.match.name}` : `⚠️ SAI CA (${shiftInfo.duration}h)`}</b>
                    {!shiftInfo.isCorrect && <input type="checkbox" style={{ marginLeft: '5px' }} checked={form.confirmShiftError} onChange={e => setForm({ ...form, confirmShiftError: e.target.checked })} />}
                </div>
            )}

            <div className="section-title">| KHU VỰC & VỊ TRÍ PHỤ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {Object.keys(master.layouts || {}).map(key => (
                    <button key={key} className={`btn-login ${form.layout === key ? '' : 'btn-outline'}`}
                        style={{ padding: '8px 1px', fontSize: '9px', fontWeight: '800', background: form.layout === key ? '#004AAD' : 'white', color: form.layout === key ? 'white' : '#004AAD' }}
                        onClick={() => setForm({ ...form, layout: key, subPos: '', checks: {}, incidentType: '' })}>
                        {master.layouts[key].name}
                    </button>
                ))}
            </div>

            {form.layout && master.layouts[form.layout]?.subPositions?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '4px' }}>
                    {master.layouts[form.layout].subPositions.map(sp => (
                        <button key={sp} className={`btn-login ${form.subPos === sp ? '' : 'btn-outline'}`}
                            style={{ padding: '6px 1px', fontSize: '9px', borderRadius: '8px', backgroundColor: form.subPos === sp ? '#E2E8F0' : '#fff', color: '#333', border: '1px solid #CBD5E1' }}
                            onClick={() => setForm({ ...form, subPos: sp })}>
                            {sp}
                        </button>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '10px' }}>
                {form.layout && master.layouts[form.layout]?.checklist?.map(item => (
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

            {/* ERROR HANDLING / INCIDENTS */}
            {hasNoCheck && (
                <div style={{ marginTop: '8px' }}>
                    <label style={{ color: '#B91C1C', fontWeight: '800', fontSize: '9px', display: 'block', marginBottom: '4px' }}>PHÂN LOẠI SỰ CỐ</label>
                    <select className="input-login" style={{ borderColor: '#FCA5A5', fontSize: '11px' }} value={form.incidentType} onChange={e => setForm({ ...form, incidentType: e.target.value })}>
                        <option value="">-- BẮT BUỘC CHỌN --</option>
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
                            padding: '10px 15px',
                            fontSize: '11px',
                            textAlign: 'left',
                            background: form.rating === f.id ? '#004AAD' : 'white',
                            color: form.rating === f.id ? 'white' : '#004AAD',
                            border: '1px solid #004AAD',
                            borderRadius: '25px', // Rounded pill style
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '700'
                        }}
                        onClick={() => setForm({ ...form, rating: f.id })}>
                        <span style={{ fontSize: '12px' }}>{f.icon}</span> {f.label}
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

            <div className="mt-5" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input type="checkbox" checked={form.isCommitted} onChange={e => setForm({ ...form, isCommitted: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B' }}>TÔI CAM KẾT THÔNG TIN BÁO CÁO LÀ CHÍNH XÁC.</span>
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: '10px', fontWeight: '800', textAlign: 'center', margin: '8px 0' }}>{error}</p>}

            <button className="btn-login mt-2" style={{ height: '50px', background: '#004AAD' }} onClick={handleCheckBeforeSubmit} disabled={loading}>
                {isUploading ? '📤 ĐANG TẢI ẢNH...' : (loading ? '⌛ ĐANG XỬ LÝ...' : 'XÁC NHẬN GỬI BÁO CÁO')}
            </button>
        </div>
    );
};

export default PageShiftLog;
