import React, { useState, useEffect, useMemo } from 'react';
import { masterAPI } from '../api/master';
import { leaderAPI } from '../api/leader';

const PageLeaderReport = ({ user, onNavigate }) => {
    // 1. MASTER DATA STATE
    const [master, setMaster] = useState({
        checklist: [], incidents: [], staff: [], areas: [], shifts: [], stores: [],
        leaderChecklist: [], leaderIncidents: []
    });

    // 2. FORM STATE
    const [formData, setFormData] = useState({
        store_id: user?.storeCode || '',
        area_code: '',
        startH: '08',
        startM: '00',
        endH: '',
        endM: '',
        has_peak: false,
        has_out_of_stock: false,
        has_customer_issue: false,
        checklist: {},
        mood: 3,
        observed_issue_code: '',
        observed_note: '',
        khen_emp: '',
        khen_topic: '',
        nhac_emp: '',
        nhac_topic: '',
        next_shift_risk: 'NONE',
        next_shift_note: '',
        confirm_all: false,
        confirm_shift: false
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 3. INITIALIZE
    useEffect(() => {
        const now = new Date();
        setFormData(prev => ({
            ...prev,
            endH: now.getHours().toString().padStart(2, '0'),
            endM: now.getMinutes() < 30 ? "00" : "30"
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
                (response.data.leaderChecklist || []).forEach(item => initialChecklist[item] = null);
                setFormData(prev => ({ ...prev, checklist: initialChecklist }));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading master data:', error);
            setError('Không thể tải dữ liệu hệ thống');
            setLoading(false);
        }
    };

    const filteredStaff = useMemo(() => {
        // Filter staff by store if store is selected, else show all or empty
        return master.staff?.filter(s => !formData.store_id || s.store === formData.store_id || s.store_code === formData.store_id) || [];
    }, [formData.store_id, master.staff]);

    const shiftStatus = useMemo(() => {
        if (!master.shifts) return { type: 'loading', text: '...' };
        const startTotal = parseInt(formData.startH) * 60 + parseInt(formData.startM);
        const endTotal = parseInt(formData.endH) * 60 + parseInt(formData.endM);

        if (endTotal === startTotal) return { type: 'error', text: '⚠️ GIỜ RA PHẢI KHÁC GIỜ VÀO' };

        let duration = (endTotal - startTotal) / 60;
        if (duration < 0) duration += 24;

        const sApp = `${formData.startH}:${formData.startM}`;
        const eApp = `${formData.endH}:${formData.endM}`;

        const match = master.shifts.find(s => s.start === sApp && s.end === eApp);

        if (match) return { type: 'ok', text: `✔️ KHỚP CA: ${match.name}` };
        return { type: 'warning', text: `⚠️ SAI CA (${duration.toFixed(1)}H)`, showConfirm: true };
    }, [formData.startH, formData.startM, formData.endH, formData.endM, master.shifts]);

    const hasIncidentTrigger = useMemo(() => {
        return formData.has_peak || formData.has_out_of_stock || formData.has_customer_issue ||
            Object.values(formData.checklist).includes(false);
    }, [formData]);

    const isReadyToSubmit = useMemo(() => {
        const coreOk = formData.store_id && formData.area_code && formData.confirm_all;
        // Check if all checklist items are answered (not null)
        const checklistDone = master.leaderChecklist?.length > 0 &&
            master.leaderChecklist.every(item => formData.checklist[item] !== null && formData.checklist[item] !== undefined);

        const shiftOk = shiftStatus.type === 'ok' || (shiftStatus.showConfirm && formData.confirm_shift);
        const incidentOk = !hasIncidentTrigger || (formData.observed_issue_code && formData.observed_note && formData.observed_note.trim().length >= 5);

        return coreOk && checklistDone && shiftOk && incidentOk;
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
                alert("✅ GỬI BÁO CÁO THÀNH CÔNG!");
                onNavigate('HOME');
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

    if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;

    return (
        <div style={{ position: 'relative' }}>
            {/* Header matches PageShiftLog */}
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">BÁO CÁO LEAD CA</h2>
                <div className="sub-title-dev">{user?.name} - {user?.role}</div>
            </div>

            {master.announcement && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '6px 10px', borderRadius: '6px', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px' }}>📢</span><div style={{ fontSize: '10px', color: '#B45309', fontWeight: '600' }}>{master.announcement}</div>
                </div>
            )}

            {/* CHI NHÁNH & KHU VỰC */}
            <div className="grid-2 mt-10">
                <select className="input-login" value={formData.store_id} onChange={(e) => handleInputChange('store_id', e.target.value)}>
                    <option value="">-- CHI NHÁNH --</option>
                    {master.stores?.map(s => <option key={s.id} value={s.id}>{s.name || s.store_name}</option>)}
                </select>
                <select className="input-login" value={formData.area_code} onChange={(e) => handleInputChange('area_code', e.target.value)}>
                    <option value="">-- KHU VỰC --</option>
                    {master.areas?.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            {/* THỜI GIAN VÀO/RA */}
            <div className="grid-2 mt-5">
                <div className="grid-2" style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8' }}>VÀO</span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px' }} value={formData.startH} onChange={(e) => handleInputChange('startH', e.target.value)}>
                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                    </select>
                    <span style={{ fontWeight: 900 }}>:</span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px' }} value={formData.startM} onChange={(e) => handleInputChange('startM', e.target.value)}>
                        <option value="00">00</option><option value="30">30</option>
                    </select>
                </div>
                <div className="grid-2" style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8' }}>RA</span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px' }} value={formData.endH} onChange={(e) => handleInputChange('endH', e.target.value)}>
                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                    </select>
                    <span style={{ fontWeight: 900 }}>:</span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px' }} value={formData.endM} onChange={(e) => handleInputChange('endM', e.target.value)}>
                        <option value="00">00</option><option value="30">30</option>
                    </select>
                </div>
            </div>

            <div style={{ padding: '5px', fontSize: '10px', borderRadius: '6px', margin: '6px 0', textAlign: 'center', border: '1px solid', borderColor: shiftStatus.type === 'ok' ? '#86EFAC' : '#FCA5A5', background: shiftStatus.type === 'ok' ? '#F0FDF4' : '#FEF2F2', color: shiftStatus.type === 'ok' ? '#166534' : '#B91C1C' }}>
                {shiftStatus.text}
                {shiftStatus.showConfirm && <input type="checkbox" style={{ marginLeft: '5px' }} checked={formData.confirm_shift} onChange={(e) => handleInputChange('confirm_shift', e.target.checked)} />}
            </div>

            {/* TRẠNG THÁI VẬN HÀNH */}
            <div className="section-title">TRẠNG THÁI VẬN HÀNH</div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                {[{ id: 'has_peak', l: 'CA ĐÔNG' }, { id: 'has_out_of_stock', l: 'HẾT MÓN' }, { id: 'has_customer_issue', l: 'PHÀN NÀN' }].map(b => (
                    <button key={b.id} className={`btn-login ${formData[b.id] ? '' : 'btn-outline'}`}
                        style={{ flex: 1, padding: '8px 2px', fontSize: '10px', background: formData[b.id] ? '#004AAD' : '' }}
                        onClick={() => handleInputChange(b.id, !formData[b.id])}>{b.l}</button>
                ))}
            </div>

            {/* CHECKLIST */}
            <div style={{ marginBottom: '10px' }}>
                {master.leaderChecklist?.map(item => (
                    <div key={item} className="checklist-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}>{item}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className={`btn-login ${formData.checklist[item] === true ? '' : 'btn-outline'}`}
                                style={{ padding: '4px 10px', fontSize: '10px', width: 'auto', background: formData.checklist[item] === true ? '#10B981' : '' }}
                                onClick={() => toggleChecklist(item, true)}>OK</button>
                            <button className={`btn-login ${formData.checklist[item] === false ? '' : 'btn-outline'}`}
                                style={{ padding: '4px 10px', fontSize: '10px', width: 'auto', background: formData.checklist[item] === false ? '#EF4444' : '' }}
                                onClick={() => toggleChecklist(item, false)}>KO</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* TRUY VẾT SỰ CỐ */}
            {hasIncidentTrigger && (
                <div style={{ padding: '8px', background: '#FFF1F2', borderRadius: '8px', border: '1px solid #FECACA', margin: '8px 0' }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626', marginBottom: '4px' }}>CHI TIẾT SỰ CỐ *</div>
                    <select className="input-login" style={{ borderColor: '#FCA5A5', marginBottom: '4px', fontSize: '11px' }} value={formData.observed_issue_code} onChange={(e) => handleInputChange('observed_issue_code', e.target.value)}>
                        <option value="">-- CHỌN LOẠI SỰ CỐ --</option>
                        {master.leaderIncidents?.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                    </select>
                    <textarea className="input-login" style={{ height: '40px', borderColor: '#FCA5A5', marginBottom: 0, fontSize: '11px' }} placeholder="Mô tả & hướng giải quyết (min 5 ký tự)..." value={formData.observed_note} onChange={(e) => handleInputChange('observed_note', e.target.value)}></textarea>
                </div>
            )}

            {/* CẢM NHẬN NHÂN SỰ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#F8FAFC', borderRadius: '10px', marginTop: '8px', border: '1px solid #E2E8F0' }}>
                {['😫', '😐', '😊', '🔥', '🚀'].map((m, i) => (
                    <span key={i} style={{ fontSize: '24px', cursor: 'pointer', opacity: formData.mood === (i + 1) ? 1 : 0.3, transition: '0.2s' }} onClick={() => handleInputChange('mood', i + 1)}>{m}</span>
                ))}
            </div>

            {/* GHI NHẬN NHÂN SỰ */}
            <div className="section-title">GHI NHẬN NHÂN SỰ</div>

            <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr', gap: '4px', marginBottom: '4px' }}>
                <div style={{ fontSize: '8px', fontWeight: 900, color: '#10B981', border: '1px solid #BBF7D0', padding: '6px', borderRadius: '6px', textAlign: 'center', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👍 KHEN</div>
                <select className="input-login" style={{ marginBottom: 0, fontSize: '10px', padding: '4px', height: '32px' }} value={formData.khen_emp} onChange={(e) => handleInputChange('khen_emp', e.target.value)}>
                    <option value="">Nhân viên</option>
                    {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="input-login" style={{ marginBottom: 0, fontSize: '10px', padding: '4px', height: '32px' }} value={formData.khen_topic} onChange={(e) => handleInputChange('khen_topic', e.target.value)}>
                    <option value="">Chủ đề</option><option>Thái độ tốt</option><option>Tốc độ nhanh</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr', gap: '4px', marginBottom: '6px' }}>
                <div style={{ fontSize: '8px', fontWeight: 900, color: '#EF4444', border: '1px solid #FCA5A5', padding: '6px', borderRadius: '6px', textAlign: 'center', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️ NHẮC</div>
                <select className="input-login" style={{ marginBottom: 0, fontSize: '10px', padding: '4px', height: '32px' }} value={formData.nhac_emp} onChange={(e) => handleInputChange('nhac_emp', e.target.value)}>
                    <option value="">Nhân viên</option>
                    {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="input-login" style={{ marginBottom: 0, fontSize: '10px', padding: '4px', height: '32px' }} value={formData.nhac_topic} onChange={(e) => handleInputChange('nhac_topic', e.target.value)}>
                    <option value="">Chủ đề</option><option>Sai SOP</option><option>Vệ sinh kém</option>
                </select>
            </div>

            {/* BÀN GIAO & RỦI RO */}
            <div className="grid-2 mt-5">
                <select className="input-login" style={{ fontWeight: 800, color: '#004AAD', fontSize: '10px' }} value={formData.next_shift_risk} onChange={(e) => handleInputChange('next_shift_risk', e.target.value)}>
                    <option value="NONE">RỦI RO: KHÔNG</option><option value="LOW">RỦI RO: THẤP</option><option value="ATTENTION">RỦI RO: CHÚ Ý</option>
                </select>
                <textarea className="input-login" style={{ height: '38px', marginBottom: 0, fontSize: '10px' }} placeholder="Dặn dò ca sau..." value={formData.next_shift_note} onChange={(e) => handleInputChange('next_shift_note', e.target.value)}></textarea>
            </div>

            {/* CAM KẾT & GỬI */}
            <div className="mt-10" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <input type="checkbox" checked={formData.confirm_all} style={{ width: '18px', height: '18px', cursor: 'pointer' }} onChange={(e) => handleInputChange('confirm_all', e.target.checked)} />
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#004AAD' }}>TÔI CAM KẾT CÁC DỮ LIỆU TRÊN LÀ ĐÚNG</span>
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: '10px', fontWeight: '800', textAlign: 'center', margin: '8px 0' }}>{error}</p>}

            <button
                className="btn-login mt-10"
                style={{ height: '50px', background: !isReadyToSubmit ? '#CBD5E1' : (submitting ? '#CCC' : '#004AAD'), cursor: isReadyToSubmit ? 'pointer' : 'not-allowed' }}
                onClick={handleSubmit}
                disabled={submitting || !isReadyToSubmit}
            >
                {submitting ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO VẬN HÀNH'}
            </button>

            <div className="text-center mt-5">
                <button onClick={() => onNavigate('HOME')} className="sub-title-dev" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#004AAD' }}>
                    QUAY LẠI TRANG CHỦ
                </button>
            </div>
        </div>
    );
};

export default PageLeaderReport;
