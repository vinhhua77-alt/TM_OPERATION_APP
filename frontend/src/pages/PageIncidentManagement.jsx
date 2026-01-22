import React, { useState, useEffect } from 'react';
import { masterDataAPI } from '../api/master-data';

const PageIncidentManagement = ({ user, onBack }) => {
    const [incidents, setIncidents] = useState([]);
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterLayout, setFilterLayout] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ACTIVE');
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form State
    const [form, setForm] = useState({
        incident_id: '',
        incident_name: '',
        layout: '',
        active: true
    });

    useEffect(() => {
        loadLayouts();
        loadData();
    }, []);

    useEffect(() => {
        loadData();
    }, [filterLayout]);

    const loadLayouts = async () => {
        try {
            const res = await masterDataAPI.getAllLayouts(true); // Only active layouts
            if (res.success) {
                const layoutCodes = res.data.map(l => l.layout_code);
                setLayouts(layoutCodes);

                // Set default form layout if not set
                if (!form.layout && layoutCodes.length > 0) {
                    setForm(prev => ({ ...prev, layout: layoutCodes[0] }));
                }
            }
        } catch (error) {
            console.error('Failed to load layouts:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const layoutParam = filterLayout === 'ALL' ? null : filterLayout;
            const res = await masterDataAPI.getAllIncidents(layoutParam);
            if (res.success) {
                setIncidents(res.data);
            }
        } catch (error) {
            showMessage('Lỗi tải dữ liệu: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async () => {
        if (!form.incident_name) return showMessage('Vui lòng nhập tên sự cố', 'error');
        if (!form.incident_id) return showMessage('Vui lòng nhập mã sự cố', 'error');

        try {
            if (editingItem) {
                await masterDataAPI.updateIncident(editingItem.id, form);
                showMessage('Cập nhật thành công');
            } else {
                await masterDataAPI.createIncident(form);
                showMessage('Tạo mới thành công');
            }
            resetForm();
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn chắc chắn muốn xóa?')) return;
        try {
            await masterDataAPI.deleteIncident(id);
            showMessage('Đã xóa');
            loadData();
        } catch (error) {
            showMessage('Lỗi xóa: ' + error.message, 'error');
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            const newActive = !item.active;
            setIncidents(prev => prev.map(i => i.id === item.id ? { ...i, active: newActive } : i));
            await masterDataAPI.updateIncident(item.id, { active: newActive });
        } catch (error) {
            showMessage('Lỗi cập nhật: ' + error.message, 'error');
            loadData();
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setForm({
            incident_id: item.incident_id,
            incident_name: item.incident_name,
            layout: item.layout || (layouts[0] || ''),
            active: item.active
        });
    };

    const resetForm = () => {
        setEditingItem(null);
        setForm({ incident_id: '', incident_name: '', layout: layouts[0] || '', active: true });
    };

    // Auto-generate ID suffix when layout changes if adding new
    useEffect(() => {
        if (!editingItem && form.layout && !form.incident_id) {
            setForm(prev => ({
                ...prev,
                incident_id: `IC_${prev.layout}_`
            }));
        }
    }, [form.layout, editingItem]);

    // Filtering logic
    const filteredIncidents = incidents.filter(item => {
        if (filterStatus === 'ACTIVE' && !item.active) return false;
        if (filterStatus === 'INACTIVE' && item.active) return false;
        return true;
    });

    return (
        <div className="fade-in">
            {/* Header with Logo */}
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">QUẢN LÝ DANH MỤC SỰ CỐ</h2>
                <p className="sub-title-dev">Admin: {user?.name}</p>
            </div>

            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
                ← QUAY LẠI CẤU HÌNH
            </button>

            {message.text && (
                <div style={{ padding: '8px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '11px', fontWeight: '700', textAlign: 'center', marginBottom: '12px' }}>
                    {message.text}
                </div>
            )}

            {/* FORM CARD */}
            <div style={{ background: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: '#374151' }}>
                    {editingItem ? '✏️ Sửa sự cố' : '➕ Thêm mới'}
                </h3>

                <div className="grid-2" style={{ gap: '10px', marginBottom: '10px' }}>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>MÃ SỰ CỐ</label>
                        <input className="input-login" value={form.incident_id} onChange={e => setForm({ ...form, incident_id: e.target.value })} placeholder="IC_..."
                            style={{ width: '100%', padding: '8px', fontSize: '12px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>LAYOUT</label>
                        <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}
                            style={{ width: '100%', padding: '8px', fontSize: '12px' }}>
                            {layouts.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>TÊN SỰ CỐ</label>
                    <input className="input-login" value={form.incident_name} onChange={e => setForm({ ...form, incident_name: e.target.value })} placeholder="Nhập tên..."
                        style={{ width: '100%', padding: '8px', fontSize: '12px' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                        onClick={() => setForm({ ...form, active: !form.active })}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                        <div style={{
                            width: '32px', height: '18px',
                            background: form.active ? '#10B981' : '#D1D5DB',
                            borderRadius: '9px', padding: '2px', transition: 'background 0.2s',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '14px', height: '14px', background: 'white', borderRadius: '50%',
                                transform: form.active ? 'translateX(14px)' : 'translateX(0)',
                                transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: form.active ? '#10B981' : '#6B7280' }}>
                            {form.active ? 'Bật' : 'Tắt'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                        {editingItem && (
                            <button className="btn-login" style={{ background: '#F3F4F6', color: '#6B7280', padding: '6px 12px', fontSize: '11px', borderRadius: '6px', border: 'none' }} onClick={resetForm}>Hủy</button>
                        )}
                        <button className="btn-login" style={{ background: '#10B981', color: 'white', padding: '6px 16px', fontSize: '11px', borderRadius: '6px', border: 'none', fontWeight: '700' }} onClick={handleSubmit}>
                            {editingItem ? 'LƯU' : 'THÊM'}
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>DANH SÁCH ({filteredIncidents.length})</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <select style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '10px' }} value={filterLayout} onChange={e => setFilterLayout(e.target.value)}>
                        <option value="ALL">Tất cả</option>
                        {layouts.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '10px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Off</option>
                        <option value="ALL">Tất cả</option>
                    </select>
                </div>
            </div>

            {/* LIST ITEMS - SCROLLABLE */}
            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                {loading ? <div style={{ textAlign: 'center', padding: '20px' }}>⌛</div> : filteredIncidents.map(item => (
                    <div key={item.id} style={{
                        background: 'white', padding: '10px', borderRadius: '8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1px solid #E5E7EB',
                        opacity: item.active ? 1 : 0.6
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                                <span style={{ fontSize: '9px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '1px 4px', borderRadius: '3px' }}>{item.layout}</span>
                                <span style={{ fontSize: '9px', fontWeight: '700', color: '#3B82F6', background: '#EFF6FF', padding: '1px 4px', borderRadius: '3px' }}>{item.incident_id}</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{item.incident_name}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* TOGGLE */}
                            <div
                                onClick={() => handleToggleStatus(item)}
                                style={{
                                    width: '28px', height: '16px',
                                    background: item.active ? '#10B981' : '#E5E7EB',
                                    borderRadius: '8px', padding: '2px', transition: 'background 0.2s',
                                    position: 'relative', cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '12px', height: '12px', background: 'white', borderRadius: '50%',
                                    transform: item.active ? 'translateX(12px)' : 'translateX(0)',
                                    transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }} />
                            </div>

                            <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}>✏️</button>
                            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px', opacity: 0.5 }}>🗑️</button>
                        </div>
                    </div>
                ))}
                {!loading && filteredIncidents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: '11px' }}>
                        Không có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageIncidentManagement;
