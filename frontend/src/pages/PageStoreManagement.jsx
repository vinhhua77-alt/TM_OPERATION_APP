import React, { useState, useEffect } from 'react';
import { storeAnalyticsAPI } from '../api/store-analytics';
import { masterDataAPI } from '../api/master-data';

// LAYOUTS will be loaded dynamically from the API

const PageStoreManagement = ({ user, onBack }) => {
    const [currentView, setCurrentView] = useState('menu'); // 'menu' or tab name
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Analytics
    const [storesData, setStoresData] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);

    // Store Info
    const [stores, setStores] = useState([]);
    const [storeActiveFilter, setStoreActiveFilter] = useState('ALL');
    const [storeModal, setStoreModal] = useState(null);

    // Checklist
    const [checklists, setChecklists] = useState([]);
    const [checklistLayoutFilter, setChecklistLayoutFilter] = useState('ALL');
    const [checklistActiveFilter, setChecklistActiveFilter] = useState('ALL');
    const [checklistModal, setChecklistModal] = useState(null);

    // Positions
    const [positions, setPositions] = useState([]);
    const [positionLayoutFilter, setPositionLayoutFilter] = useState('ALL');
    const [positionActiveFilter, setPositionActiveFilter] = useState('ALL');
    const [positionModal, setPositionModal] = useState(null);

    // Incidents
    const [incidents, setIncidents] = useState([]);
    const [incidentLayoutFilter, setIncidentLayoutFilter] = useState('ALL');
    const [incidentActiveFilter, setIncidentActiveFilter] = useState('ALL');
    const [incidentModal, setIncidentModal] = useState(null);

    // Layouts
    const [layouts, setLayouts] = useState([]);
    const [layoutActiveFilter, setLayoutActiveFilter] = useState('ALL');
    const [layoutModal, setLayoutModal] = useState(null);

    useEffect(() => {
        if (currentView !== 'menu') loadData();
    }, [currentView, storeActiveFilter, checklistLayoutFilter, checklistActiveFilter, positionLayoutFilter, positionActiveFilter, incidentLayoutFilter, incidentActiveFilter, layoutActiveFilter]);

    // Load layouts on mount for use in dropdowns
    useEffect(() => {
        loadLayoutsForDropdowns();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            switch (currentView) {
                case 'analytics': await loadAnalytics(); break;
                case 'info': await loadStores(); break;
                case 'checklist': await loadChecklists(); break;
                case 'positions': await loadPositions(); break;
                case 'incidents': await loadIncidents(); break;
                case 'layouts': await loadLayouts(); break;
            }
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

    const loadAnalytics = async () => {
        const res = await storeAnalyticsAPI.getAllStoresAnalytics();
        if (res.success) {
            setStoresData(res.data);
            if (res.data.length > 0 && !selectedStore) setSelectedStore(res.data[0].store_code);
        }
    };

    const loadStores = async () => {
        const res = await masterDataAPI.getAllStores();
        if (res.success) setStores(res.data.filter(s => storeActiveFilter === 'ALL' || (storeActiveFilter === 'ACTIVE' ? s.active : !s.active)));
    };

    const loadChecklists = async () => {
        const layout = checklistLayoutFilter === 'ALL' ? null : checklistLayoutFilter;
        const res = await masterDataAPI.getAllChecklists(layout);
        if (res.success) setChecklists(res.data.filter(c => checklistActiveFilter === 'ALL' || (checklistActiveFilter === 'ACTIVE' ? c.active : !c.active)));
    };

    const loadPositions = async () => {
        const layout = positionLayoutFilter === 'ALL' ? null : positionLayoutFilter;
        const res = await masterDataAPI.getAllPositions(layout);
        if (res.success) setPositions(res.data.filter(p => positionActiveFilter === 'ALL' || (positionActiveFilter === 'ACTIVE' ? p.active : !p.active)));
    };

    const loadIncidents = async () => {
        const layout = incidentLayoutFilter === 'ALL' ? null : incidentLayoutFilter;
        const res = await masterDataAPI.getAllIncidents(layout);
        if (res.success) setIncidents(res.data.filter(i => incidentActiveFilter === 'ALL' || (incidentActiveFilter === 'ACTIVE' ? i.active : !i.active)));
    };

    const loadLayouts = async () => {
        const res = await masterDataAPI.getAllLayouts();
        if (res.success) setLayouts(res.data.filter(l => layoutActiveFilter === 'ALL' || (layoutActiveFilter === 'ACTIVE' ? l.active : !l.active)));
    };

    const loadLayoutsForDropdowns = async () => {
        try {
            const res = await masterDataAPI.getAllLayouts(true); // Only active layouts
            if (res.success) setLayouts(res.data);
        } catch (error) {
            console.error('Failed to load layouts:', error);
        }
    };

    const handleToggleActive = async (type, id, currentActive) => {
        try {
            const newActive = !currentActive;
            switch (type) {
                case 'store':
                    await masterDataAPI.updateStore(id, { active: newActive });
                    break;
                case 'checklist':
                    await masterDataAPI.updateChecklist(id, { active: newActive });
                    break;
                case 'position':
                    await masterDataAPI.updatePosition(id, { active: newActive });
                    break;
                case 'incident':
                    await masterDataAPI.updateIncident(id, { active: newActive });
                    break;
                case 'layout':
                    await masterDataAPI.updateLayout(id, { active: newActive });
                    break;
            }
            showMessage('Đã cập nhật', 'success');
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleSave = async (type, data) => {
        try {
            const modal = { store: storeModal, checklist: checklistModal, position: positionModal, incident: incidentModal, layout: layoutModal }[type];
            if (modal.id) {
                switch (type) {
                    case 'store': await masterDataAPI.updateStore(modal.store_code, data); break;
                    case 'checklist': await masterDataAPI.updateChecklist(modal.id, data); break;
                    case 'position': await masterDataAPI.updatePosition(modal.id, data); break;
                    case 'incident': await masterDataAPI.updateIncident(modal.id, data); break;
                    case 'layout': await masterDataAPI.updateLayout(modal.id, data); break;
                }
                showMessage('Cập nhật thành công', 'success');
            } else {
                switch (type) {
                    case 'store': await masterDataAPI.createStore(data); break;
                    case 'checklist': await masterDataAPI.createChecklist(data); break;
                    case 'position': await masterDataAPI.createPosition(data); break;
                    case 'incident': await masterDataAPI.createIncident(data); break;
                    case 'layout': await masterDataAPI.createLayout(data); break;
                }
                showMessage('Tạo mới thành công', 'success');
            }
            setStoreModal(null); setChecklistModal(null); setPositionModal(null); setIncidentModal(null); setLayoutModal(null);
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Xóa item này?')) return;
        try {
            switch (type) {
                case 'store': await masterDataAPI.deleteStore(id); break;
                case 'checklist': await masterDataAPI.deleteChecklist(id); break;
                case 'position': await masterDataAPI.deletePosition(id); break;
                case 'incident': await masterDataAPI.deleteIncident(id); break;
                case 'layout': await masterDataAPI.deleteLayout(id); break;
            }
            showMessage('Đã xóa', 'success');
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    // ==================== MENU GRID ====================
    const MenuGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '10px' }}>
            <MenuCard icon="📊" title="Thống kê" onClick={() => setCurrentView('analytics')} />
            <MenuCard icon="🏪" title="Thông tin" onClick={() => setCurrentView('info')} />
            <MenuCard icon="📋" title="Checklist" onClick={() => setCurrentView('checklist')} />
            <MenuCard icon="👤" title="Positions" onClick={() => setCurrentView('positions')} />
            <MenuCard icon="⚠️" title="Incidents" onClick={() => setCurrentView('incidents')} />
            <MenuCard icon="🏢" title="Layout" onClick={() => setCurrentView('layouts')} />
        </div>
    );

    // ==================== VIEWS ====================
    const AnalyticsView = () => {
        const currentStoreData = storesData.find(s => s.store_code === selectedStore);
        const analytics = currentStoreData?.analytics;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                    <select className="input-login" style={{ fontSize: '11px' }} value={selectedStore || ''} onChange={e => setSelectedStore(e.target.value)}>
                        {storesData.map(s => <option key={s.store_code} value={s.store_code}>{s.store_name}</option>)}
                    </select>
                    <button className="btn-login" style={{ fontSize: '11px', background: '#3B82F6', padding: '0 15px' }} onClick={async () => { await storeAnalyticsAPI.updateAllStoresAnalytics(); showMessage('Đã cập nhật'); loadAnalytics(); }}>🔄</button>
                </div>
                {!analytics ? <p style={{ textAlign: 'center', padding: '20px', fontSize: '11px' }}>Chưa có dữ liệu. Vui lòng chạy SQL migration.</p> : (
                    <>
                        <div><h3 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>👥 Nhân viên</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                <StatCard label="Tổng" value={analytics.total_staff} color="#3B82F6" />
                                <StatCard label="Active" value={analytics.active_staff} color="#10B981" />
                                <StatCard label="Pending" value={analytics.pending_staff} color="#F59E0B" />
                                <StatCard label="Inactive" value={analytics.inactive_staff} color="#EF4444" />
                            </div>
                        </div>
                        <div><h3 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>🕐 Ca làm việc</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                <StatCard label="Hôm nay" value={analytics.shifts_today} color="#8B5CF6" />
                                <StatCard label="Tuần" value={analytics.shifts_this_week} color="#EC4899" />
                                <StatCard label="Tháng" value={analytics.shifts_this_month} color="#F97316" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const StoreInfoView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                <select className="input-login" style={{ fontSize: '11px' }} value={storeActiveFilter} onChange={e => setStoreActiveFilter(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <button className="btn-login" style={{ fontSize: '11px', background: '#10B981' }} onClick={() => setStoreModal({})}>➕ Thêm</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {stores.map(s => (
                    <div key={s.id} className="checklist-item" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '800' }}>{s.store_name}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>{s.store_code} | {s.region}</div>
                        </div>
                        <ToggleSwitch active={s.active} onChange={() => handleToggleActive('store', s.store_code, s.active)} />
                        <button onClick={() => setStoreModal(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete('store', s.store_code)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );

    const ChecklistView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                <select className="input-login" style={{ fontSize: '11px' }} value={checklistLayoutFilter} onChange={e => setChecklistLayoutFilter(e.target.value)}>
                    <option value="ALL">Tất cả Layout</option>
                    {layouts.filter(l => l.active).map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                </select>
                <select className="input-login" style={{ fontSize: '11px' }} value={checklistActiveFilter} onChange={e => setChecklistActiveFilter(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <button className="btn-login" style={{ fontSize: '11px', background: '#10B981' }} onClick={() => setChecklistModal({})}>➕</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {checklists.map(c => (
                    <div key={c.id} className="checklist-item" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', fontWeight: '800' }}>{c.checklist_text}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>{c.layout} | Order: {c.sort_order}</div>
                        </div>
                        <ToggleSwitch active={c.active} onChange={() => handleToggleActive('checklist', c.id, c.active)} />
                        <button onClick={() => setChecklistModal(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete('checklist', c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );

    const PositionsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                <select className="input-login" style={{ fontSize: '11px' }} value={positionLayoutFilter} onChange={e => setPositionLayoutFilter(e.target.value)}>
                    <option value="ALL">Tất cả Layout</option>
                    {layouts.filter(l => l.active).map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                </select>
                <select className="input-login" style={{ fontSize: '11px' }} value={positionActiveFilter} onChange={e => setPositionActiveFilter(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <button className="btn-login" style={{ fontSize: '11px', background: '#10B981' }} onClick={() => setPositionModal({})}>➕</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {positions.map(p => (
                    <div key={p.id} className="checklist-item" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', fontWeight: '800' }}>{p.sub_position}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>{p.layout} | {p.sub_id}</div>
                        </div>
                        <ToggleSwitch active={p.active} onChange={() => handleToggleActive('position', p.id, p.active)} />
                        <button onClick={() => setPositionModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete('position', p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );

    const IncidentsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                <select className="input-login" style={{ fontSize: '11px' }} value={incidentLayoutFilter} onChange={e => setIncidentLayoutFilter(e.target.value)}>
                    <option value="ALL">Tất cả Layout</option>
                    {layouts.filter(l => l.active).map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                </select>
                <select className="input-login" style={{ fontSize: '11px' }} value={incidentActiveFilter} onChange={e => setIncidentActiveFilter(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <button className="btn-login" style={{ fontSize: '11px', background: '#10B981' }} onClick={() => setIncidentModal({})}>➕</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {incidents.map(i => (
                    <div key={i.id} className="checklist-item" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', fontWeight: '800' }}>{i.incident_name}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>{i.layout} | {i.incident_id}</div>
                        </div>
                        <ToggleSwitch active={i.active} onChange={() => handleToggleActive('incident', i.id, i.active)} />
                        <button onClick={() => setIncidentModal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete('incident', i.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );

    const LayoutsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                <select className="input-login" style={{ fontSize: '11px' }} value={layoutActiveFilter} onChange={e => setLayoutActiveFilter(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <button className="btn-login" style={{ fontSize: '11px', background: '#10B981' }} onClick={() => setLayoutModal({})}>➕ Thêm</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {layouts.map(l => (
                    <div key={l.id} className="checklist-item" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '800' }}>{l.layout_name}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>{l.layout_code} | Order: {l.sort_order}</div>
                            {l.description && <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{l.description}</div>}
                        </div>
                        <ToggleSwitch active={l.active} onChange={() => handleToggleActive('layout', l.id, l.active)} />
                        <button onClick={() => setLayoutModal(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete('layout', l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">QUẢN LÝ NHÀ HÀNG</h2>
                <p className="sub-title-dev">Admin: {user?.name}</p>
            </div>

            <button onClick={currentView === 'menu' ? onBack : () => setCurrentView('menu')} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
                ← {currentView === 'menu' ? 'QUAY LẠI MENU CẤU HÌNH' : 'QUAY LẠI MENU'}
            </button>

            {message.text && (
                <div style={{ padding: '10px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '11px', fontWeight: '600', textAlign: 'center', marginBottom: '10px' }}>
                    {message.text}
                </div>
            )}

            {loading ? <p style={{ textAlign: 'center', padding: '20px', fontSize: '11px' }}>⌛ Đang tải...</p> : (
                <>
                    {currentView === 'menu' && <MenuGrid />}
                    {currentView === 'analytics' && <AnalyticsView />}
                    {currentView === 'info' && <StoreInfoView />}
                    {currentView === 'checklist' && <ChecklistView />}
                    {currentView === 'positions' && <PositionsView />}
                    {currentView === 'incidents' && <IncidentsView />}
                    {currentView === 'layouts' && <LayoutsView />}
                </>
            )}

            {storeModal && <StoreModal data={storeModal} onSave={d => handleSave('store', d)} onClose={() => setStoreModal(null)} />}
            {checklistModal && <ChecklistModal data={checklistModal} layouts={layouts} onSave={d => handleSave('checklist', d)} onClose={() => setChecklistModal(null)} />}
            {positionModal && <PositionModal data={positionModal} layouts={layouts} onSave={d => handleSave('position', d)} onClose={() => setPositionModal(null)} />}
            {incidentModal && <IncidentModal data={incidentModal} layouts={layouts} onSave={d => handleSave('incident', d)} onClose={() => setIncidentModal(null)} />}
            {layoutModal && <LayoutModal data={layoutModal} onSave={d => handleSave('layout', d)} onClose={() => setLayoutModal(null)} />}
        </div>
    );
};

// ==================== COMPONENTS ====================
const MenuCard = ({ icon, title, onClick }) => (
    <div onClick={onClick} style={{ padding: '20px', borderRadius: '12px', border: '2px solid #004AAD', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', cursor: 'pointer', textAlign: 'center', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#004AAD' }}>{title}</div>
    </div>
);

const StatCard = ({ label, value, color }) => (
    <div style={{ padding: '12px', borderRadius: '8px', background: color + '15', border: `2px solid ${color}`, textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
);

const ToggleSwitch = ({ active, onChange }) => (
    <div onClick={onChange} style={{ width: '40px', height: '22px', borderRadius: '11px', background: active ? '#10B981' : '#DDD', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#FFF', position: 'absolute', top: '2px', left: active ? '20px' : '2px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
    </div>
);

const StoreModal = ({ data, onSave, onClose }) => {
    const [form, setForm] = useState({ store_code: data.store_code || '', store_name: data.store_name || '', region: data.region || '', brand_group_code: data.brand_group_code || '', active: data.active !== false });
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>{data.id ? 'Sửa Store' : 'Thêm Store'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="input-login" placeholder="Store Code" value={form.store_code} onChange={e => setForm({ ...form, store_code: e.target.value })} disabled={!!data.id} />
                    <input className="input-login" placeholder="Store Name" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} />
                    <input className="input-login" placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
                    <input className="input-login" placeholder="Brand Group" value={form.brand_group_code} onChange={e => setForm({ ...form, brand_group_code: e.target.value })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button className="btn-login" style={{ background: '#10B981' }} onClick={() => onSave(form)}>Lưu</button>
                        <button className="btn-login" style={{ background: '#6B7280' }} onClick={onClose}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChecklistModal = ({ data, layouts, onSave, onClose }) => {
    const [form, setForm] = useState({ checklist_id: data.checklist_id || '', layout: data.layout || (layouts[0]?.layout_code || 'FOH'), checklist_text: data.checklist_text || '', sort_order: data.sort_order || 0, is_required: data.is_required !== false, active: data.active !== false });
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>{data.id ? 'Sửa Checklist' : 'Thêm Checklist'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="input-login" placeholder="Checklist ID" value={form.checklist_id} onChange={e => setForm({ ...form, checklist_id: e.target.value })} />
                    <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                        {layouts.filter(l => l.active).map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                    </select>
                    <textarea className="input-login" placeholder="Text" value={form.checklist_text} onChange={e => setForm({ ...form, checklist_text: e.target.value })} rows={3} />
                    <input className="input-login" type="number" placeholder="Sort Order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <input type="checkbox" checked={form.is_required} onChange={e => setForm({ ...form, is_required: e.target.checked })} />
                        Required
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button className="btn-login" style={{ background: '#10B981' }} onClick={() => onSave(form)}>Lưu</button>
                        <button className="btn-login" style={{ background: '#6B7280' }} onClick={onClose}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PositionModal = ({ data, layouts, onSave, onClose }) => {
    const [form, setForm] = useState({ sub_id: data.sub_id || '', sub_position: data.sub_position || '', layout: data.layout || (layouts[0]?.layout_code || 'FOH'), is_default: data.is_default === true, active: data.active !== false });
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>{data.id ? 'Sửa Position' : 'Thêm Position'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="input-login" placeholder="Sub ID" value={form.sub_id} onChange={e => setForm({ ...form, sub_id: e.target.value })} />
                    <input className="input-login" placeholder="Position Name" value={form.sub_position} onChange={e => setForm({ ...form, sub_position: e.target.value })} />
                    <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                        {layouts.filter(l => l.active).map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
                        Default
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button className="btn-login" style={{ background: '#10B981' }} onClick={() => onSave(form)}>Lưu</button>
                        <button className="btn-login" style={{ background: '#6B7280' }} onClick={onClose}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IncidentModal = ({ data, layouts, onSave, onClose }) => {
    const [form, setForm] = useState({ incident_id: data.incident_id || '', incident_name: data.incident_name || '', layout: data.layout || (layouts[0]?.layout_code || 'FOH'), active: data.active !== false });
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>{data.id ? 'Sửa Incident' : 'Thêm Incident'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="input-login" placeholder="Incident ID" value={form.incident_id} onChange={e => setForm({ ...form, incident_id: e.target.value })} />
                    <input className="input-login" placeholder="Incident Name" value={form.incident_name} onChange={e => setForm({ ...form, incident_name: e.target.value })} />
                    <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                        {layouts.filter(l => l.active).map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button className="btn-login" style={{ background: '#10B981' }} onClick={() => onSave(form)}>Lưu</button>
                        <button className="btn-login" style={{ background: '#6B7280' }} onClick={onClose}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LayoutModal = ({ data, onSave, onClose }) => {
    const [form, setForm] = useState({ layout_code: data.layout_code || '', layout_name: data.layout_name || '', description: data.description || '', sort_order: data.sort_order || 0, active: data.active !== false });
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>{data.id ? 'Sửa Layout' : 'Thêm Layout'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="input-login" placeholder="Layout Code (e.g., FOH, BOH)" value={form.layout_code} onChange={e => setForm({ ...form, layout_code: e.target.value.toUpperCase() })} disabled={!!data.id} />
                    <input className="input-login" placeholder="Layout Name" value={form.layout_name} onChange={e => setForm({ ...form, layout_name: e.target.value })} />
                    <textarea className="input-login" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
                    <input className="input-login" type="number" placeholder="Sort Order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button className="btn-login" style={{ background: '#10B981' }} onClick={() => onSave(form)}>Lưu</button>
                        <button className="btn-login" style={{ background: '#6B7280' }} onClick={onClose}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageStoreManagement;
