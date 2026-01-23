import React, { useState, useEffect } from 'react';
import { masterDataAPI } from '../api/master-data';
import FAB from '../components/FAB';

const PageIncidentManagement = ({ user, onBack }) => {
    const [incidents, setIncidents] = useState([]);
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Filters
    const [filters, setFilters] = useState({
        layout: 'ALL',
        active: 'ALL',
        search: ''
    });

    // Modal State
    const [editingItem, setEditingItem] = useState(null); // If null, means Adding. If set, means Editing.
    const [showModal, setShowModal] = useState(false);

    // Initial Load
    useEffect(() => {
        loadLayouts();
        loadData();
    }, []);

    // Filter Trigger
    useEffect(() => {
        loadData();
    }, [filters.layout, filters.active]); // Search is client-side filtered usually, or api-side? Previous code did client side for search.

    const loadLayouts = async () => {
        try {
            const res = await masterDataAPI.getAllLayouts(true);
            if (res.success) {
                setLayouts(res.data.map(l => l.layout_code)); // Just keep codes for simplicity
            }
        } catch (error) {
            console.error('Failed to load layouts:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const layoutParam = filters.layout === 'ALL' ? null : filters.layout;
            const res = await masterDataAPI.getAllIncidents(layoutParam);
            if (res.success) {
                let data = res.data;
                // Status Filter
                if (filters.active !== 'ALL') {
                    const isActive = filters.active === 'ACTIVE';
                    data = data.filter(i => i.active === isActive);
                }
                setIncidents(data);
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

    const handleSave = async (form) => {
        if (!form.incident_name || !form.incident_id) {
            return showMessage('Vui lòng nhập đầy đủ thông tin', 'error');
        }
        try {
            if (editingItem && editingItem.id) {
                await masterDataAPI.updateIncident(editingItem.id, form);
                showMessage('Cập nhật thành công');
            } else {
                await masterDataAPI.createIncident(form);
                showMessage('Tạo mới thành công');
            }
            setShowModal(false);
            setEditingItem(null);
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

    const handleToggleActive = async (item) => {
        try {
            const newActive = !item.active;
            // Optimistic update
            setIncidents(prev => prev.map(i => i.id === item.id ? { ...i, active: newActive } : i));
            await masterDataAPI.updateIncident(item.id, { active: newActive });
        } catch (error) {
            showMessage('Lỗi cập nhật: ' + error.message, 'error');
            loadData();
        }
    };

    // Client-side Search
    const getFilteredIncidents = () => {
        if (!filters.search) return incidents;
        const lowerTerm = filters.search.toLowerCase();
        return incidents.filter(item =>
            item.incident_name?.toLowerCase().includes(lowerTerm) ||
            item.incident_id?.toLowerCase().includes(lowerTerm)
        );
    };

    const groupedIncidents = (() => {
        const filtered = getFilteredIncidents();
        const grouped = filtered.reduce((acc, item) => {
            const key = item.layout || 'OTHER';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        // Sort keys: FOH, BOH, then others
        const priority = ['FOH', 'BOH', 'COUNTER', 'CAT'];
        const keys = Object.keys(grouped).sort((a, b) => {
            const idxA = priority.indexOf(a);
            const idxB = priority.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        return { keys, grouped };
    })();

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">QUẢN LÝ SỰ CỐ</h2>
            </div>

            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
                ← QUAY LẠI CẤU HÌNH
            </button>

            {message.text && (
                <div style={{ padding: '10px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '11px', fontWeight: '600', textAlign: 'center', marginBottom: '10px' }}>
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '10px' }}>
                <select
                    className="input-login"
                    style={{ fontSize: '11px' }}
                    value={filters.layout}
                    onChange={e => setFilters({ ...filters, layout: e.target.value })}
                >
                    <option value="ALL">Tất cả Layout</option>
                    {layouts.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <select
                    className="input-login"
                    style={{ fontSize: '11px' }}
                    value={filters.active}
                    onChange={e => setFilters({ ...filters, active: e.target.value })}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

                <input
                    className="input-login"
                    placeholder="🔍 Tìm kiếm..."
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                    style={{ width: '100px', fontSize: '11px', marginBottom: 0 }}
                />
            </div>

            {/* List */}
            <div className="list-container" style={{ paddingBottom: '80px' }}>
                {loading ? <div className="text-center p-4">⌛ Loading...</div> : (
                    groupedIncidents.keys.length === 0 ? (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', padding: '20px' }}>Chưa có dữ liệu</div>
                    ) : (
                        groupedIncidents.keys.map(layout => (
                            <div key={layout} style={{ marginBottom: '20px' }}>
                                <div style={{ background: '#DBEAFE', padding: '8px 12px', borderRadius: '8px', color: '#1E40AF', fontWeight: '800', fontSize: '12px', marginBottom: '8px', borderLeft: '4px solid #1E40AF' }}>
                                    📂 {layout}
                                </div>
                                {groupedIncidents.grouped[layout].map(item => (
                                    <ListItem
                                        key={item.id}
                                        item={item}
                                        title={item.incident_name}
                                        subtitle={`${item.incident_id} | ${item.store_code || 'ALL'}`}
                                        onEdit={() => { setEditingItem(item); setShowModal(true); }}
                                        onDelete={() => handleDelete(item.id)}
                                        onToggle={() => handleToggleActive(item)}
                                    />
                                ))}
                            </div>
                        ))
                    )
                )}
            </div>

            <FAB onClick={() => { setEditingItem(null); setShowModal(true); }} />

            {showModal && (
                <IncidentModal
                    data={editingItem || {}}
                    layouts={layouts}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

// ==================== COMPONENTS ====================

const ListItem = ({ item, title, subtitle, onEdit, onDelete, onToggle }) => (
    <div className="checklist-item" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#374151' }}>{title}</div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{subtitle}</div>
        </div>
        <ToggleSwitch active={item.active} onChange={onToggle} />
        <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.5 }}>🗑️</button>
    </div>
);

const ToggleSwitch = ({ active, onChange }) => (
    <div onClick={onChange} style={{ width: '40px', height: '22px', borderRadius: '11px', background: active ? '#10B981' : '#E5E7EB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#FFF', position: 'absolute', top: '2px', left: active ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}></div>
    </div>
);

const ModalWrapper = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '5px', color: '#111827' }}>{title}</h3>
            {children}
            <button className="btn-login" style={{ background: '#F3F4F6', color: '#374151', marginTop: '5px', border: 'none' }} onClick={onClose}>Hủy</button>
        </div>
    </div>
);

const IncidentModal = ({ data, layouts, onSave, onClose }) => {
    const [form, setForm] = useState({
        incident_name: data.incident_name || '',
        layout: data.layout || (layouts[0] || 'FOH'),
        incident_id: data.incident_id || '',
        store_code: data.store_code || 'ALL',
        active: data.active !== false
    });

    // Auto-generate ID logic (Optional, simpler here)
    useEffect(() => {
        if (!data.id && form.layout && !form.incident_id) {
            setForm(prev => ({ ...prev, incident_id: `IC_${prev.layout}_` }));
        }
    }, [form.layout]);

    return (
        <ModalWrapper title={data.id ? '✏️ Sửa sự cố' : '➕ Thêm sự cố mới'} onClose={onClose}>
            <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Mã sự cố</label>
                <input className="input-login" placeholder="IC_..." value={form.incident_id} onChange={e => setForm({ ...form, incident_id: e.target.value })} />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Tên sự cố</label>
                <input className="input-login" placeholder="Tên sự cố..." value={form.incident_name} onChange={e => setForm({ ...form, incident_name: e.target.value })} />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Khu vực (Layout)</label>
                <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                    {layouts.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>

            <div className="btn-group">
                <button className="btn-login btn-save" onClick={() => onSave(form)}>
                    {data.id ? 'CẬP NHẬT' : 'THÊM MỚI'}
                </button>
            </div>
        </ModalWrapper>
    );
};

export default PageIncidentManagement;
