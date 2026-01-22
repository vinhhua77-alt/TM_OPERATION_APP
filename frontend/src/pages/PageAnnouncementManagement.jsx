import React, { useState, useEffect } from 'react';
import { announcementAPI } from '../api/announcement';
import { masterDataAPI } from '../api/master-data';
import { staffAPI } from '../api/staff';

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const CATEGORIES = ['SYSTEM', 'POLICY', 'EVENT', 'EMERGENCY', 'PROMOTION'];
const PRIORITY_COLORS = {
    CRITICAL: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
    HIGH: { bg: '#FEF3C7', border: '#F59E0B', text: '#F59E0B' },
    MEDIUM: { bg: '#DBEAFE', border: '#3B82F6', text: '#3B82F6' },
    LOW: { bg: '#F3F4F6', border: '#6B7280', text: '#6B7280' }
};

const PageAnnouncementManagement = ({ user, onBack }) => {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [announcements, setAnnouncements] = useState([]);
    const [stores, setStores] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    // Helper to get Local ISO String for datetime-local input
    const toLocalISOString = (date) => {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    // Form state
    const [form, setForm] = useState({
        title: '',
        content: '',
        priority: 'MEDIUM',
        category: 'SYSTEM',
        target_type: 'ALL',
        target_stores: [],
        target_staff: [],
        start_date: toLocalISOString(new Date()),
        end_date: '',
        active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [announcementsRes, storesRes, staffRes] = await Promise.all([
                announcementAPI.getAll(),
                masterDataAPI.getAllStores(),
                staffAPI.getAllStaff()
            ]);

            if (announcementsRes.success) setAnnouncements(announcementsRes.data);
            if (storesRes.success) setStores(storesRes.data);
            if (staffRes.success) setStaffList(staffRes.data);
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.content) {
            showMessage('Vui lòng nhập tiêu đề và nội dung', 'error');
            return;
        }

        try {
            // Convert to UTC before sending to API
            const payload = {
                ...form,
                start_date: new Date(form.start_date).toISOString(),
                end_date: form.end_date ? new Date(form.end_date).toISOString() : null
            };

            if (editingAnnouncement) {
                await announcementAPI.update(editingAnnouncement.id, payload);
                showMessage('Cập nhật thành công', 'success');
            } else {
                await announcementAPI.create(payload);
                showMessage('Tạo thành công', 'success');
            }

            setView('list');
            setEditingAnnouncement(null);
            resetForm();
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);

        // Convert UTC to Local for input
        const startLocal = toLocalISOString(new Date(announcement.start_date));
        const endLocal = announcement.end_date ? toLocalISOString(new Date(announcement.end_date)) : '';

        setForm({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            category: announcement.category,
            target_type: announcement.target_type,
            target_stores: announcement.target_stores || [],
            target_staff: announcement.target_staff || [],
            start_date: startLocal,
            end_date: endLocal,
            active: announcement.active
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa thông báo này?')) return;
        try {
            await announcementAPI.delete(id);
            showMessage('Đã xóa', 'success');
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            content: '',
            priority: 'MEDIUM',
            category: 'SYSTEM',
            target_type: 'ALL',
            target_stores: [],
            target_staff: [],
            start_date: toLocalISOString(new Date()),
            end_date: '',
            active: true
        });
    };

    const renderList = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-login" style={{ background: '#10B981' }} onClick={() => { resetForm(); setEditingAnnouncement(null); setView('form'); }}>
                ➕ Tạo Thông Báo Mới
            </button>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {announcements.map(ann => {
                    const color = PRIORITY_COLORS[ann.priority];
                    return (
                        <div key={ann.id} style={{ padding: '12px', marginBottom: '8px', borderRadius: '8px', border: `2px solid ${color.border}`, background: color.bg }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#000', marginBottom: '4px' }}>{ann.title}</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>{ann.content.slice(0, 100)}...</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleEdit(ann)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                                    <button onClick={() => handleDelete(ann.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '10px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: color.text, color: '#FFF', fontWeight: '600' }}>{ann.priority}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#6B7280', color: '#FFF' }}>{ann.category}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#3B82F6', color: '#FFF' }}>{ann.target_type}</span>
                                <span style={{ color: '#666' }}>📅 {new Date(ann.start_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderForm = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800' }}>{editingAnnouncement ? 'Sửa Thông Báo' : 'Tạo Thông Báo Mới'}</h3>

            <input className="input-login" placeholder="Tiêu đề" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: '0' }} />

            <textarea className="input-login" placeholder="Nội dung" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} style={{ marginBottom: '0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select className="input-login" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ marginBottom: '0' }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="input-login" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ marginBottom: '0' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div style={{ background: '#F9FAFB', padding: '8px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', marginBottom: '4px', display: 'block', color: '#374151' }}>Gửi đến:</label>
                <select className="input-login" value={form.target_type} onChange={e => setForm({ ...form, target_type: e.target.value, target_stores: [], target_staff: [] })} style={{ marginBottom: '8px' }}>
                    <option value="ALL">Tất cả nhân viên</option>
                    <option value="STORES">Chọn nhà hàng</option>
                    <option value="STAFF">Chọn nhân viên</option>
                </select>

                {form.target_type === 'STORES' && (
                    <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '4px', padding: '4px', background: '#FFF' }}>
                        {stores.map(store => (
                            <label key={store.store_code} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', marginBottom: '2px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.target_stores.includes(store.store_code)} onChange={e => {
                                    if (e.target.checked) setForm({ ...form, target_stores: [...form.target_stores, store.store_code] });
                                    else setForm({ ...form, target_stores: form.target_stores.filter(s => s !== store.store_code) });
                                }} />
                                {store.store_name}
                            </label>
                        ))}
                    </div>
                )}

                {form.target_type === 'STAFF' && (
                    <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '4px', padding: '4px', background: '#FFF' }}>
                        {staffList.map(staff => (
                            <label key={staff.staff_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', marginBottom: '2px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.target_staff.includes(staff.staff_id)} onChange={e => {
                                    if (e.target.checked) setForm({ ...form, target_staff: [...form.target_staff, staff.staff_id] });
                                    else setForm({ ...form, target_staff: form.target_staff.filter(s => s !== staff.staff_id) });
                                }} />
                                {staff.staff_name}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', marginBottom: '2px', display: 'block', color: '#374151' }}>Bắt đầu:</label>
                    <input className="input-login" type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} style={{ fontSize: '10px', padding: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', marginBottom: '2px', display: 'block', color: '#374151' }}>Kết thúc (tùy chọn):</label>
                    <input className="input-login" type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} style={{ fontSize: '10px', padding: '4px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button className="btn-login" style={{ background: '#10B981', marginTop: '0' }} onClick={handleSubmit}>
                    {editingAnnouncement ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
                <button className="btn-login" style={{ background: '#6B7280', marginTop: '0' }} onClick={() => { setView('list'); setEditingAnnouncement(null); }}>
                    Hủy
                </button>
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">QUẢN LÝ THÔNG BÁO</h2>
                <p className="sub-title-dev">Admin: {user?.name}</p>
            </div>

            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
                ← QUAY LẠI MENU CẤU HÌNH
            </button>

            {message.text && (
                <div style={{ padding: '10px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '11px', fontWeight: '600', textAlign: 'center', marginBottom: '10px' }}>
                    {message.text}
                </div>
            )}

            {loading ? <p style={{ textAlign: 'center', padding: '20px', fontSize: '11px' }}>⌛ Đang tải...</p> : (
                <>
                    {view === 'list' && renderList()}
                    {view === 'form' && renderForm()}
                </>
            )}
        </div>
    );
};

export default PageAnnouncementManagement;
