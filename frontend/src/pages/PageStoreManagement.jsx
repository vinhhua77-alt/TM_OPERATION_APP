import React, { useState, useEffect } from 'react';
import { masterDataAPI } from '../api/master-data';
import FAB from '../components/FAB';

const PageStoreManagement = ({ user, onBack, initialView = 'menu' }) => {
    const [currentView, setCurrentView] = useState(initialView);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Metadata for dropdowns
    const [dropdownLayouts, setDropdownLayouts] = useState([]);
    const [dropdownStores, setDropdownStores] = useState([]);

    // Data Lists
    const [stores, setStores] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [positions, setPositions] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [layouts, setLayouts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [shifts, setShifts] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        store: 'ALL',
        layout: 'ALL',
        active: 'ALL'
    });

    // Modals
    const [modals, setModals] = useState({
        store: null, checklist: null, position: null,
        incident: null, layout: null, role: null, shift: null
    });

    // Load Metadata on Mount
    useEffect(() => {
        loadMetadata();
    }, []);

    // Load Data on View/Filter Change
    useEffect(() => {
        if (currentView !== 'menu') loadData();
    }, [currentView, filters]);

    // Update view if prop changes
    useEffect(() => {
        setCurrentView(initialView);
    }, [initialView]);

    const loadMetadata = async () => {
        try {
            const [lRes, sRes] = await Promise.all([
                masterDataAPI.getAllLayouts(true),
                masterDataAPI.getAllStores()
            ]);
            if (lRes.success) setDropdownLayouts(lRes.data);
            if (sRes.success) setDropdownStores(sRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            switch (currentView) {
                case 'info': await loadStores(); break;
                case 'checklist': await loadChecklists(); break;
                case 'positions': await loadPositions(); break;
                case 'incidents': await loadIncidents(); break;
                case 'layouts': await loadLayouts(); break;
                case 'roles': await loadRoles(); break;
                case 'shifts': await loadShifts(); break;
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


    const loadStores = async () => {
        const res = await masterDataAPI.getAllStores();
        if (res.success) filterAndSet(res.data, setStores);
    };
    const loadChecklists = async () => {
        const res = await masterDataAPI.getAllChecklists(filters.layout, filters.store);
        if (res.success) filterAndSet(res.data, setChecklists);
    };
    const loadPositions = async () => {
        const res = await masterDataAPI.getAllPositions(filters.layout, filters.store);
        if (res.success) filterAndSet(res.data, setPositions);
    };
    const loadIncidents = async () => {
        const res = await masterDataAPI.getAllIncidents(filters.layout, filters.store);
        if (res.success) filterAndSet(res.data, setIncidents);
    };
    const loadLayouts = async () => {
        const res = await masterDataAPI.getAllLayouts(false, filters.store);
        if (res.success) filterAndSet(res.data, setLayouts);
    };
    const loadRoles = async () => {
        const res = await masterDataAPI.getAllRoles(filters.store);
        if (res.success) setRoles(res.data);
    };
    const loadShifts = async () => {
        const res = await masterDataAPI.getAllShifts(filters.store);
        if (res.success) setShifts(res.data);
    };

    const filterAndSet = (data, setter) => {
        const f = filters.active;
        if (f === 'ALL') setter(data);
        else setter(data.filter(i => f === 'ACTIVE' ? i.active : !i.active));
    };

    // Actions
    const handleAdd = () => {
        const mapping = {
            'info': 'store',
            'checklist': 'checklist',
            'positions': 'position',
            'incidents': 'incident',
            'layouts': 'layout',
            'roles': 'role',
            'shifts': 'shift'
        };
        const key = mapping[currentView];
        if (key) setModals({ ...modals, [key]: {} });
    };

    const handleSave = async (type, data) => {
        try {
            const id = data.id || (type === 'store' ? data.store_code : null);
            const isUpdate = !!modals[type]?.id || (type === 'store' && !!modals[type]?.store_code);

            const apiMap = {
                store: { create: masterDataAPI.createStore, update: masterDataAPI.updateStore },
                checklist: { create: masterDataAPI.createChecklist, update: masterDataAPI.updateChecklist },
                position: { create: masterDataAPI.createPosition, update: masterDataAPI.updatePosition },
                incident: { create: masterDataAPI.createIncident, update: masterDataAPI.updateIncident },
                layout: { create: masterDataAPI.createLayout, update: masterDataAPI.updateLayout },
                role: { create: masterDataAPI.createRole, update: masterDataAPI.updateRole },
                shift: { create: masterDataAPI.createShift, update: masterDataAPI.updateShift }
            };

            const api = apiMap[type];
            if (isUpdate) {
                const updateId = type === 'store' ? modals[type].store_code : modals[type].id;
                await api.update(updateId, data);
                showMessage('Cập nhật thành công', 'success');
            } else {
                await api.create(data);
                showMessage('Tạo mới thành công', 'success');
            }

            setModals({ ...modals, [type]: null });
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Xóa item này?')) return;
        try {
            const apiMap = {
                store: masterDataAPI.deleteStore,
                checklist: masterDataAPI.deleteChecklist,
                position: masterDataAPI.deletePosition,
                incident: masterDataAPI.deleteIncident,
                layout: masterDataAPI.deleteLayout,
                role: masterDataAPI.deleteRole,
                shift: masterDataAPI.deleteShift
            };
            await apiMap[type](id);
            showMessage('Đã xóa', 'success');
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleToggleActive = async (type, id, current) => {
        try {
            const apiMap = {
                store: masterDataAPI.updateStore,
                checklist: masterDataAPI.updateChecklist,
                position: masterDataAPI.updatePosition,
                incident: masterDataAPI.updateIncident,
                layout: masterDataAPI.updateLayout,
                role: masterDataAPI.updateRole,
                shift: masterDataAPI.updateShift
            };
            await apiMap[type](id, { active: !current });
            showMessage('Đã cập nhật', 'success');
            loadData();
        } catch (e) { showMessage(e.message, 'error'); }
    };

    // ==================== RENDERS ====================

    // Header & Filter Bar
    const renderFilters = (showLayout = false) => (
        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 mb-3 flex flex-col gap-2">
            <div className="flex gap-2">
                {/* Store Filter */}
                <select
                    className="input-login flex-1"
                    style={{ fontSize: '11px', padding: '8px' }}
                    value={filters.store}
                    onChange={e => setFilters({ ...filters, store: e.target.value })}
                >
                    <option value="ALL">🏢 Stores (ALL)</option>
                    {dropdownStores.map(s => (
                        <option key={s.store_code} value={s.store_code}>{s.store_name}</option>
                    ))}
                </select>

                {/* Active Filter */}
                <select
                    className="input-login w-[110px]"
                    style={{ fontSize: '11px', padding: '8px' }}
                    value={filters.active}
                    onChange={e => setFilters({ ...filters, active: e.target.value })}
                >
                    <option value="ALL">👁️ Tất cả</option>
                    <option value="ACTIVE">✅ Active</option>
                    <option value="INACTIVE">🚫 Inactive</option>
                </select>
            </div>

            {/* Layout Filter */}
            {showLayout && (
                <select
                    className="input-login w-full"
                    style={{ fontSize: '11px', padding: '8px' }}
                    value={filters.layout}
                    onChange={e => setFilters({ ...filters, layout: e.target.value })}
                >
                    <option value="ALL">📂 Tất cả Layout</option>
                    {dropdownLayouts.map(l => (
                        <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>
                    ))}
                </select>
            )}
        </div>
    );

    // Specific Views
    const RolesView = () => (
        <div>
            {renderFilters(false)}
            <div className="list-container">
                {roles.map(item => (
                    <ListItem
                        key={item.id}
                        item={item}
                        title={item.role_name}
                        subtitle={`${item.role_code} | Store: ${item.store_code}`}
                        onEdit={() => setModals({ ...modals, role: item })}
                        onDelete={() => handleDelete('role', item.id)}
                        onToggle={() => handleToggleActive('role', item.id, item.active)}
                    />
                ))}
            </div>
            {modals.role && <RoleModal data={modals.role} stores={dropdownStores} onSave={d => handleSave('role', d)} onClose={() => setModals({ ...modals, role: null })} />}
        </div>
    );

    const ShiftsView = () => (
        <div>
            {renderFilters(false)}
            <div className="list-container">
                {(() => {
                    // Helper to determine group
                    const getShiftGroup = (code) => {
                        const prefix = code?.charAt(0).toUpperCase();
                        if (prefix === 'P') return 'PART-TIME (Bán thời gian)';
                        if (prefix === 'G') return 'CA GÃY / LINH HOẠT';
                        if (['S', 'C', 'M', 'N', 'A'].includes(prefix)) return 'FULL-TIME (Ca Tiêu chuẩn)';
                        return 'CA KHÁC';
                    };

                    // Grouping Logic
                    const grouped = shifts.reduce((acc, item) => {
                        const key = getShiftGroup(item.shift_code);
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(item);
                        return acc;
                    }, {});

                    // Sorting Order for Groups
                    const groupOrder = ['FULL-TIME (Ca Tiêu chuẩn)', 'PART-TIME (Bán thời gian)', 'CA GÃY / LINH HOẠT', 'CA KHÁC'];
                    const sortedKeys = groupOrder.filter(k => grouped[k]);

                    // Add any keys not in predefined order
                    Object.keys(grouped).forEach(k => { if (!sortedKeys.includes(k)) sortedKeys.push(k); });

                    if (sortedKeys.length === 0 && shifts.length === 0) return <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', padding: '20px' }}>Chưa có dữ liệu</div>;

                    return sortedKeys.map(groupName => (
                        <div key={groupName} style={{ marginBottom: '15px' }}>
                            <div style={{ background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', color: '#475569', fontWeight: '900', fontSize: '10px', marginBottom: '6px', borderLeft: '3px solid #64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {groupName === 'FULL-TIME (Ca Tiêu chuẩn)' ? '👔 ' : (groupName.includes('PART') ? '⏳ ' : '🧩 ')}
                                {groupName}
                            </div>
                            {grouped[groupName]
                                .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')) // Sort by time inside group
                                .map(item => {
                                    // Fix time display (slice to HH:MM)
                                    const sTime = item.start_time ? item.start_time.slice(0, 5) : '??:??';
                                    const eTime = item.end_time ? item.end_time.slice(0, 5) : '??:??';
                                    return (
                                        <ListItem
                                            key={item.id}
                                            item={item}
                                            title={`${item.shift_name} (${sTime} - ${eTime})`}
                                            subtitle={`${item.shift_code} | Store: ${item.store_code}`}
                                            onEdit={() => setModals({ ...modals, shift: item })}
                                            onDelete={() => handleDelete('shift', item.id)}
                                            onToggle={() => handleToggleActive('shift', item.id, item.active)}
                                        />
                                    );
                                })}
                        </div>
                    ));
                })()}
            </div>
            {modals.shift && <ShiftModal data={modals.shift} stores={dropdownStores} onSave={d => handleSave('shift', d)} onClose={() => setModals({ ...modals, shift: null })} />}
        </div>
    );

    return (
        <div className="fade-in">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-3.5">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                    <span className="text-base">←</span> BACK
                </button>
                <div className="text-right">
                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">
                        {currentView === 'info' && 'DANH SÁCH CỬA HÀNG'}
                        {currentView === 'checklist' && 'CHECKLIST MẪU'}
                        {currentView === 'positions' && 'VỊ TRÍ (POSITIONS)'}
                        {currentView === 'roles' && 'VAI TRÒ (ROLES)'}
                        {currentView === 'shifts' && 'CA LÀM VIỆC'}
                        {currentView === 'incidents' && 'LOẠI SỰ CỐ'}
                        {currentView === 'layouts' && 'LAYOUT KHU VỰC'}
                    </h2>
                </div>
            </div>

            {message.text && (
                <div style={{ padding: '8px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '10px', fontWeight: '700', textAlign: 'center', marginBottom: '10px' }}>
                    {message.text}
                </div>
            )}

            {/* Views */}
            {currentView === 'roles' && <RolesView />}
            {currentView === 'shifts' && <ShiftsView />}

            {currentView === 'checklist' && (
                <div>
                    {renderFilters(true)}
                    <div className="list-container">
                        {(() => {
                            const grouped = checklists.reduce((acc, item) => {
                                const key = item.layout || 'OTHER';
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(item);
                                return acc;
                            }, {});

                            const sortedKeys = dropdownLayouts.map(l => l.layout_code).filter(k => grouped[k]);
                            Object.keys(grouped).forEach(k => { if (!sortedKeys.includes(k)) sortedKeys.push(k); });

                            if (sortedKeys.length === 0 && checklists.length === 0) return <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', padding: '20px' }}>Chưa có dữ liệu</div>;

                            return sortedKeys.map(layoutCode => {
                                const layoutName = dropdownLayouts.find(l => l.layout_code === layoutCode)?.layout_name || layoutCode;
                                return (
                                    <div key={layoutCode} style={{ marginBottom: '15px' }}>
                                        <div style={{ background: '#EFF6FF', padding: '6px 10px', borderRadius: '8px', color: '#2563EB', fontWeight: '900', fontSize: '10px', marginBottom: '6px', borderLeft: '3px solid #3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            📂 {layoutName}
                                        </div>
                                        {grouped[layoutCode].map(c => (
                                            <ListItem
                                                key={c.id}
                                                item={c}
                                                title={c.checklist_text}
                                                subtitle={`#${c.sort_order} | Store: ${c.store_code}`}
                                                onEdit={() => setModals({ ...modals, checklist: c })}
                                                onDelete={() => handleDelete('checklist', c.id)}
                                                onToggle={() => handleToggleActive('checklist', c.id, c.active)}
                                            />
                                        ))}
                                    </div>
                                )
                            })
                        })()}
                    </div>
                    {modals.checklist && <ChecklistModal data={modals.checklist} layouts={dropdownLayouts} stores={dropdownStores} onSave={d => handleSave('checklist', d)} onClose={() => setModals({ ...modals, checklist: null })} />}
                </div>
            )}

            {currentView === 'positions' && (
                <div>
                    {renderFilters(true)}
                    <div className="list-container">
                        {(() => {
                            const grouped = positions.reduce((acc, item) => {
                                const key = item.layout || 'OTHER';
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(item);
                                return acc;
                            }, {});

                            const sortedKeys = dropdownLayouts.map(l => l.layout_code).filter(k => grouped[k]);
                            Object.keys(grouped).forEach(k => { if (!sortedKeys.includes(k)) sortedKeys.push(k); });

                            if (sortedKeys.length === 0 && positions.length === 0) return <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', padding: '20px' }}>Chưa có dữ liệu</div>;

                            return sortedKeys.map(layoutCode => {
                                const layoutName = dropdownLayouts.find(l => l.layout_code === layoutCode)?.layout_name || layoutCode;
                                return (
                                    <div key={layoutCode} style={{ marginBottom: '15px' }}>
                                        <div style={{ background: '#EFF6FF', padding: '6px 10px', borderRadius: '8px', color: '#2563EB', fontWeight: '900', fontSize: '10px', marginBottom: '6px', borderLeft: '3px solid #3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            📂 {layoutName}
                                        </div>
                                        {grouped[layoutCode].map(p => (
                                            <ListItem key={p.id} item={p} title={p.sub_position} subtitle={`${p.layout} | ${p.sub_id} | ${p.store_code}`}
                                                onEdit={() => setModals({ ...modals, position: p })}
                                                onDelete={() => handleDelete('position', p.id)}
                                                onToggle={() => handleToggleActive('position', p.id, p.active)}
                                            />
                                        ))}
                                    </div>
                                )
                            })
                        })()}
                    </div>
                    {modals.position && <PositionModal data={modals.position} layouts={dropdownLayouts} stores={dropdownStores} onSave={d => handleSave('position', d)} onClose={() => setModals({ ...modals, position: null })} />}
                </div>
            )}

            {currentView === 'incidents' && (
                <div>
                    {renderFilters(true)}
                    <div className="list-container">
                        {(() => {
                            const grouped = incidents.reduce((acc, item) => {
                                const key = item.layout || 'OTHER';
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(item);
                                return acc;
                            }, {});

                            const sortedKeys = dropdownLayouts.map(l => l.layout_code).filter(k => grouped[k]);
                            Object.keys(grouped).forEach(k => { if (!sortedKeys.includes(k)) sortedKeys.push(k); });

                            if (sortedKeys.length === 0 && incidents.length === 0) return <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', padding: '20px' }}>Chưa có dữ liệu</div>;

                            return sortedKeys.map(layoutCode => {
                                const layoutName = dropdownLayouts.find(l => l.layout_code === layoutCode)?.layout_name || layoutCode;
                                return (
                                    <div key={layoutCode} style={{ marginBottom: '15px' }}>
                                        <div style={{ background: '#EFF6FF', padding: '6px 10px', borderRadius: '8px', color: '#2563EB', fontWeight: '900', fontSize: '10px', marginBottom: '6px', borderLeft: '3px solid #3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            📂 {layoutName}
                                        </div>
                                        {grouped[layoutCode].map(i => (
                                            <ListItem key={i.id} item={i} title={i.incident_name} subtitle={`${i.layout} | ${i.incident_id} | ${i.store_code}`}
                                                onEdit={() => setModals({ ...modals, incident: i })}
                                                onDelete={() => handleDelete('incident', i.id)}
                                                onToggle={() => handleToggleActive('incident', i.id, i.active)}
                                            />
                                        ))}
                                    </div>
                                )
                            })
                        })()}
                    </div>
                    {modals.incident && <IncidentModal data={modals.incident} layouts={dropdownLayouts} stores={dropdownStores} onSave={d => handleSave('incident', d)} onClose={() => setModals({ ...modals, incident: null })} />}
                </div>
            )}

            {currentView === 'layouts' && (
                <div>
                    {renderFilters(false)}
                    <div className="list-container">
                        {layouts.map(l => (
                            <ListItem key={l.id} item={l} title={l.layout_name} subtitle={`${l.layout_code} | ${l.store_code}`}
                                onEdit={() => setModals({ ...modals, layout: l })}
                                onDelete={() => handleDelete('layout', l.id)}
                                onToggle={() => handleToggleActive('layout', l.id, l.active)}
                            />
                        ))}
                    </div>
                    {modals.layout && <LayoutModal data={modals.layout} stores={dropdownStores} onSave={d => handleSave('layout', d)} onClose={() => setModals({ ...modals, layout: null })} />}
                </div>
            )}

            {currentView === 'info' && (
                <div>
                    <div className="list-container" style={{ marginTop: '10px' }}>
                        {/* BUTTON REMOVED for FAB */}
                        {stores.map(s => (
                            <ListItem key={s.id} item={s} title={s.store_name} subtitle={`${s.store_code} | ${s.region}`}
                                onEdit={() => setModals({ ...modals, store: s })}
                                onDelete={() => handleDelete('store', s.store_code)}
                                onToggle={() => handleToggleActive('store', s.store_code, s.active)}
                            />
                        ))}
                    </div>
                    {modals.store && <StoreModal data={modals.store} onSave={d => handleSave('store', d)} onClose={() => setModals({ ...modals, store: null })} />}
                </div>
            )}



            {['info', 'checklist', 'positions', 'roles', 'shifts', 'incidents', 'layouts'].includes(currentView) && (
                <FAB onClick={handleAdd} />
            )}
        </div>
    );
};

// ==================== HELPERS ====================
const MenuCard = ({ icon, title, onClick }) => (
    <div onClick={onClick} style={{ padding: '20px', borderRadius: '12px', border: '2px solid #004AAD', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', cursor: 'pointer', textAlign: 'center', transition: '0.2s' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#004AAD' }}>{title}</div>
    </div>
);

const ListItem = ({ item, title, subtitle, onEdit, onDelete, onToggle }) => (
    <div className="checklist-item" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', border: '1px solid #F1F5F9' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: '900', color: '#1E293B' }} className="text-truncate">{title}</div>
            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '700' }} className="text-truncate">{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToggleSwitch active={item.active} onChange={onToggle} />
            <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.7 }}>✏️</button>
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.7 }}>🗑️</button>
        </div>
    </div>
);

const ToggleSwitch = ({ active, onChange }) => (
    <div onClick={onChange} style={{ width: '32px', height: '18px', borderRadius: '10px', background: active ? '#10B981' : '#E2E8F0', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#FFF', position: 'absolute', top: '2px', left: active ? '16px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
    </div>
);



// ==================== MODALS ====================

const StoreSelector = ({ value, onChange, stores }) => (
    <select className="input-login" value={value || 'ALL'} onChange={e => onChange(e.target.value)}>
        <option value="ALL">🏢 Toàn hệ thống (ALL)</option>
        {stores.map(s => <option key={s.store_code} value={s.store_code}>{s.store_name}</option>)}
    </select>
);

const RoleModal = ({ data, stores, onSave, onClose }) => {
    const [form, setForm] = useState({
        role_code: data.role_code || '', role_name: data.role_name || '',
        description: data.description || '', store_code: data.store_code || 'ALL',
        active: data.active !== false
    });
    return (
        <ModalWrapper title={data.id ? 'Sửa Role' : 'Thêm Role'} onClose={onClose}>
            <input className="input-login" placeholder="Role Code (e.g. CHEF)" value={form.role_code} onChange={e => setForm({ ...form, role_code: e.target.value.toUpperCase() })} />
            <input className="input-login" placeholder="Role Name (e.g. Đầu Bếp)" value={form.role_name} onChange={e => setForm({ ...form, role_name: e.target.value })} />
            <StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
};

const ShiftModal = ({ data, stores, onSave, onClose }) => {
    const [form, setForm] = useState({
        shift_code: data.shift_code || '', shift_name: data.shift_name || '',
        start_time: data.start_time || '06:00', end_time: data.end_time || '14:00',
        store_code: data.store_code || 'ALL', active: data.active !== false
    });
    return (
        <ModalWrapper title={data.id ? 'Sửa Ca' : 'Thêm Ca'} onClose={onClose}>
            <input className="input-login" placeholder="Shift Code" value={form.shift_code} onChange={e => setForm({ ...form, shift_code: e.target.value })} />
            <input className="input-login" placeholder="Shift Name" value={form.shift_name} onChange={e => setForm({ ...form, shift_name: e.target.value })} />
            <div style={{ display: 'flex', gap: '5px' }}>
                <input className="input-login" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                <input className="input-login" type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
};

const ChecklistModal = ({ data, layouts, stores, onSave, onClose }) => {
    const [form, setForm] = useState({
        checklist_text: data.checklist_text || '', layout: data.layout || 'FOH',
        store_code: data.store_code || 'ALL', sort_order: data.sort_order || 0
    });
    return (
        <ModalWrapper title="Checklist" onClose={onClose}>
            <input className="input-login" placeholder="Text" value={form.checklist_text} onChange={e => setForm({ ...form, checklist_text: e.target.value })} />
            <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                {layouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
            </select>
            <StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} />
            <input className="input-login" type="number" placeholder="Order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
};

const LayoutModal = ({ data, stores, onSave, onClose }) => {
    const [form, setForm] = useState({
        layout_code: data.layout_code || '', layout_name: data.layout_name || '',
        store_code: data.store_code || 'ALL', sort_order: data.sort_order || 0
    });
    return (
        <ModalWrapper title="Layout" onClose={onClose}>
            <input className="input-login" placeholder="Code" value={form.layout_code} onChange={e => setForm({ ...form, layout_code: e.target.value.toUpperCase() })} />
            <input className="input-login" placeholder="Name" value={form.layout_name} onChange={e => setForm({ ...form, layout_name: e.target.value })} />
            <StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
}

const PositionModal = ({ data, layouts, stores, onSave, onClose }) => {
    const [form, setForm] = useState({
        sub_position: data.sub_position || '', layout: data.layout || 'FOH',
        store_code: data.store_code || 'ALL', sub_id: data.sub_id || ''
    });
    return (
        <ModalWrapper title="Position" onClose={onClose}>
            <input className="input-login" placeholder="Position Name" value={form.sub_position} onChange={e => setForm({ ...form, sub_position: e.target.value })} />
            <input className="input-login" placeholder="Sub ID" value={form.sub_id} onChange={e => setForm({ ...form, sub_id: e.target.value })} />
            <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                {layouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
            </select>
            <StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
}

const IncidentModal = ({ data, layouts, stores, onSave, onClose }) => {
    const [form, setForm] = useState({
        incident_name: data.incident_name || '', layout: data.layout || 'FOH',
        store_code: data.store_code || 'ALL', incident_id: data.incident_id || ''
    });
    return (
        <ModalWrapper title="Incident" onClose={onClose}>
            <input className="input-login" placeholder="Name" value={form.incident_name} onChange={e => setForm({ ...form, incident_name: e.target.value })} />
            <input className="input-login" placeholder="ID" value={form.incident_id} onChange={e => setForm({ ...form, incident_id: e.target.value })} />
            <select className="input-login" value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>
                {layouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
            </select>
            <StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
}

const StoreModal = ({ data, onSave, onClose }) => {
    const [form, setForm] = useState({
        store_code: data.store_code || '', store_name: data.store_name || '', region: data.region || ''
    });
    return (
        <ModalWrapper title="Store" onClose={onClose}>
            <input className="input-login" placeholder="Code" value={form.store_code} onChange={e => setForm({ ...form, store_code: e.target.value })} />
            <input className="input-login" placeholder="Name" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} />
            <input className="input-login" placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
            <div className="btn-group"><button className="btn-login btn-save" onClick={() => onSave(form)}>Lưu</button></div>
        </ModalWrapper>
    );
}


const ModalWrapper = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '16px', width: '85%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '2px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
            {children}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', marginTop: '4px' }}>
                <button className="btn-login" style={{ background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: '11px', padding: '10px', borderRadius: '12px' }} onClick={onClose}>Hủy Bỏ</button>
            </div>
        </div>
    </div>
);

export default PageStoreManagement;
