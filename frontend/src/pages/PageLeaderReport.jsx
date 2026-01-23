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
        area_code: '',
        startH: '',
        startM: '00',
        startM: '00',
        endH: '',
        endM: '',
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
        confirmWrongShift: false, // New confirm for unknown shift
        isOvernightShift: false
    });

    const [loading, setLoading] = useState(false); // OPTIMIZED: Non-blocking (was true)
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 3. INITIALIZE
    useEffect(() => {
        const now = new Date();
        setFormData(prev => ({
            ...prev,
            endH: now.getHours().toString().padStart(2, '0'),
            endM: '00' // Enforce hourly
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
        } catch (error) {
            console.error('Error loading master data:', error);
            setError('Không thể tải dữ liệu hệ thống');
        }
    };

    const filteredStaff = useMemo(() => {
        // Filter staff by store if store is selected, else show all or empty
        if (!formData.store_id) return master.staff || [];

        const targetStore = String(formData.store_id).trim().toUpperCase();

        return (master.staff || []).filter(s => {
            // Robust check: handle 'store' vs 'store_code' key, casing, and type
            const sCode = String(s.store || s.store_code || '').trim().toUpperCase();
            return sCode === targetStore;
        });
    }, [formData.store_id, master.staff]);

    const shiftStatus = useMemo(() => {
        if (!master.shifts) return { type: 'loading', text: '...' };
        if (!formData.endH) return { type: 'loading', text: '...' };

        const startTotal = parseInt(formData.startH) * 60 + parseInt(formData.startM);
        const endTotal = parseInt(formData.endH) * 60 + parseInt(formData.endM);

        if (endTotal === startTotal) return { type: 'error', text: '⚠️ GIờ RA PHẢI KHÁC GIờ VÀO' };

        let duration = (endTotal - startTotal) / 60;

        if (duration <= 0) {
            return { type: 'error', text: '⚠️ GIỜ RA PHẢI LỚN HƠN GIỜ VÀO' };
        }

        const sApp = `${formData.startH}:${formData.startM}`;
        const eApp = `${formData.endH}:${formData.endM}`;

        const match = master.shifts.find(s => s.start === sApp && s.end === eApp);

        if (match) return { type: 'ok', text: `✔️ KHỚP CA: ${match.name}` };

        // Unknown shift but valid times
        return { type: 'warning', text: `⚠️ CA KHÔNG CÓ TRONG HỆ THỐNG (${duration.toFixed(1)}H).`, showConfirm: true };
    }, [formData.startH, formData.startM, formData.endH, formData.endM, master.shifts]);

    const hasIncidentTrigger = useMemo(() => {
        // LOGIC CHANGE: Top buttons (peak/stock/customer) do NOT trigger incident form automatically
        // Only trigger if a checklist item is marked "false" (Không)
        return Object.values(formData.checklist).includes(false);
    }, [formData.checklist]);

    const isReadyToSubmit = useMemo(() => {
        const coreOk = formData.store_id && formData.area_code && formData.confirm_all;
        // Check if all checklist items are answered (not null)
        const checklistDone = master.leaderChecklist?.length > 0 &&
            master.leaderChecklist.every(item => formData.checklist[item] !== null && formData.checklist[item] !== undefined);

        let shiftOk = false;
        if (shiftStatus.type === 'ok') shiftOk = true;
        if (shiftStatus.type === 'warning') {
            // Require confirmation and reason
            if (formData.confirmWrongShift && formData.shiftErrorReason) shiftOk = true;
        }
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

    // REMOVED BLOCKING LOADING SCREEN
    // if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;

    return (
        <div style={{ position: 'relative' }} className="fade-in">
            {/* Header matches PageShiftLog */}
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">BÁO CÁO LEAD CA</h2>
                <div className="sub-title-dev">{user?.name || user?.username || 'User'} - {user?.role || 'Staff'}</div>
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
                    {master.stores?.map(s => <option key={s.store_code || s.id} value={s.store_code || s.id}>{s.name || s.store_name}</option>)}
                </select>
                <select className="input-login" value={formData.area_code} onChange={(e) => handleInputChange('area_code', e.target.value)}>
                    <option value="">-- KHU VỰC --</option>
                    {master.areas?.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            {/* THỜI GIAN VÀO/RA */}
            <div className="grid-2 mt-5">
                <div className="grid-2" style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: formData.startH ? '#10B981' : '#94A3B8' }}>
                        {formData.startH ? '✅ VÀO' : 'VÀO'}
                    </span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px', width: '200px', textAlign: 'center', borderColor: formData.startH ? '#10B981' : '#DDDDDD' }} value={formData.startH} onChange={(e) => handleInputChange('startH', e.target.value)}>
                        <option value="">-- GIỜ --</option>
                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                    </select>
                    <span style={{ fontWeight: 900 }}>:</span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px', width: '90px', textAlign: 'center', borderColor: formData.startM === '30' ? '#10B981' : '#DDDDDD' }} value={formData.startM || '00'} onChange={(e) => handleInputChange('startM', e.target.value)}>
                        <option value="00">00</option>
                        <option value="30">30</option>
                    </select>
                </div>
                <div className="grid-2" style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: formData.endH ? '#10B981' : '#94A3B8' }}>
                        {formData.endH ? '✅ RA' : 'RA'}
                    </span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px', width: '200px', textAlign: 'center', borderColor: formData.endH ? '#10B981' : '#DDDDDD' }} value={formData.endH} onChange={(e) => handleInputChange('endH', e.target.value)}>
                        <option value="">-- GIỜ --</option>
                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                    </select>
                    <span style={{ fontWeight: 900 }}>:</span>
                    <select className="input-login" style={{ marginBottom: 0, padding: '2px', width: '90px', textAlign: 'center', borderColor: formData.endM === '30' ? '#10B981' : '#DDDDDD' }} value={formData.endM || '00'} onChange={(e) => handleInputChange('endM', e.target.value)}>
                        <option value="00">00</option>
                        <option value="30">30</option>
                    </select>
                </div>
            </div>

            {/* STATUS BOX */}
            <div style={{ padding: '8px', fontSize: '10px', borderRadius: '6px', margin: '6px 0', border: '1px solid', borderColor: shiftStatus.type === 'ok' ? '#86EFAC' : (shiftStatus.type === 'error' ? '#FCA5A5' : '#FCD34D'), background: shiftStatus.type === 'ok' ? '#F0FDF4' : (shiftStatus.type === 'error' ? '#FEF2F2' : '#FFFBEB'), color: shiftStatus.type === 'ok' ? '#166534' : (shiftStatus.type === 'error' ? '#B91C1C' : '#B45309') }}>
                <div style={{ textAlign: 'center' }}>
                    <b>{shiftStatus.text}</b>
                </div>

                {/* Show Confirm & Dropdown ONLY if Warning (Unknown Shift) */}
                {shiftStatus.type === 'warning' && (
                    <div style={{ marginTop: '4px', textAlign: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', marginBottom: '4px', fontSize: '9px' }}>
                            <input type="checkbox" checked={formData.confirmWrongShift} onChange={(e) => handleInputChange('confirmWrongShift', e.target.checked)} />
                            <span style={{ fontWeight: '700', color: '#B45309' }}>XÁC NHẬN ĐÂY LÀ GIỜ THỰC TẾ</span>
                        </label>

                        {/* Show Dropdown ONLY after confirming */}
                        {formData.confirmWrongShift && (
                            <select
                                className="input-login"
                                style={{ marginBottom: 0, fontSize: '10px', padding: '4px', borderColor: '#FCA5A5', color: formData.shiftErrorReason ? '#B91C1C' : '#999', fontWeight: formData.shiftErrorReason ? '700' : 'normal' }}
                                value={formData.shiftErrorReason}
                                onChange={(e) => handleInputChange('shiftErrorReason', e.target.value)}
                            >
                                <option value="">-- CHỌN LÝ DO --</option>
                                <option value="ĐỔI CA">ĐỔI CA</option>
                                <option value="ĐI TRỄ">ĐI TRỄ</option>
                                <option value="VỀ SỚM">VỀ SỚM</option>
                                <option value="TĂNG CA">TĂNG CA</option>
                                <option value="CA GÃY">CA GÃY</option>
                                <option value="KHẨN CẤP">KHẨN CẤP</option>
                                <option value="HỖ TRỢ CHI NHÁNH">HỖ TRỢ CHI NHÁNH</option>
                                <option value="ĐIỀU CHỈNH LỊCH">ĐIỀU CHỈNH LỊCH</option>
                            </select>
                        )}
                    </div>
                )}
            </div>

            {/* TRẠNG THÁI VẬN HÀNH */}
            <div className="section-title" style={{ color: (formData.has_peak || formData.has_out_of_stock || formData.has_customer_issue) ? '#10B981' : '#004AAD' }}>
                {(formData.has_peak || formData.has_out_of_stock || formData.has_customer_issue) ? '✅ TRẠNG THÁI VẬN HÀNH' : 'TRẠNG THÁI VẬN HÀNH'}
            </div>
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
                                onClick={() => toggleChecklist(item, true)}>CÓ</button>
                            <button className={`btn-login ${formData.checklist[item] === false ? '' : 'btn-outline'}`}
                                style={{ padding: '4px 10px', fontSize: '10px', width: 'auto', background: formData.checklist[item] === false ? '#EF4444' : '' }}
                                onClick={() => toggleChecklist(item, false)}>KHÔNG</button>
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
            <div className="section-title" style={{ marginTop: '10px', color: formData.mood > 0 ? '#10B981' : '#004AAD' }}>
                {formData.mood > 0 ? '✅ CA LÀM VIỆC HÔM NAY THẾ NÀO?' : 'CA LÀM VIỆC HÔM NAY THẾ NÀO?'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
                {['😫', '😐', '😊', '🔥', '🚀'].map((m, i) => (
                    <span key={i} style={{ fontSize: '24px', cursor: 'pointer', opacity: formData.mood === (i + 1) ? 1 : 0.3, transform: formData.mood === (i + 1) ? 'scale(1.2)' : 'scale(1)', transition: '0.2s' }} onClick={() => handleInputChange('mood', i + 1)}>{m}</span>
                ))}
            </div>

            {/* GHI NHẬN NHÂN SỰ */}
            <div className="section-title" style={{ color: (formData.khen_emp || formData.nhac_emp) ? '#10B981' : '#004AAD' }}>
                {(formData.khen_emp || formData.nhac_emp) ? '✅ GHI NHẬN NHÂN SỰ' : 'GHI NHẬN NHÂN SỰ'}
            </div>

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
                <select className="input-login" style={{ fontWeight: 800, color: formData.next_shift_risk ? '#004AAD' : '#999', fontSize: '10px' }} value={formData.next_shift_risk} onChange={(e) => handleInputChange('next_shift_risk', e.target.value)}>
                    <option value="">-- MỨC ĐỘ RỦI RO --</option><option value="NONE">RỦI RO: KHÔNG</option><option value="LOW">RỦI RO: THẤP</option><option value="ATTENTION">RỦI RO: CHÚ Ý</option>
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
