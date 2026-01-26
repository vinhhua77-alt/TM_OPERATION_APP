import React, { useState, useEffect } from 'react';
import { masterDataAPI } from '../api/master-data';

const PageStoreSetup = ({ user, onBack, initialView = 'menu' }) => {
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
        if (initialView && initialView !== currentView) {
            setCurrentView(initialView);
        }
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
            } else {
                await api.create(data);
            }
            setModals({ ...modals, [type]: null });
            loadData();
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Are you sure?')) return;
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
            loadData();
        } catch (e) { showMessage(e.message, 'error'); }
    };

    // --- Minimalist Data Grid Components ---

    const MinimalTable = ({ columns, data, onEdit, onDelete, onToggle, groupBy }) => {
        if (!data || data.length === 0) return <div className="p-8 text-center text-xs text-slate-400 font-mono italic">No Data Available</div>;

        const renderRows = (items) => (
            items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 group border-b border-slate-50 last:border-b-0 transition-colors">
                    {columns.map(col => (
                        <td key={col.key} className="px-4 py-2.5 whitespace-nowrap">
                            {col.render ? col.render(item) : (
                                <span className={`text-[10px] ${col.bold ? 'font-bold text-slate-700' : 'text-slate-500 font-medium'}`}>
                                    {item[col.key]}
                                </span>
                            )}
                        </td>
                    ))}
                    <td className="px-4 py-2 text-right flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onToggle && onToggle(item)} className={`w-6 h-3 rounded-full relative transition-all ${item.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all shadow-sm ${item.active ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                        <button onClick={() => onEdit && onEdit(item)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase">Edit</button>
                        <button onClick={() => onDelete && onDelete(item)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Del</button>
                    </td>
                </tr>
            ))
        );

        return (
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                        <tr>
                            {columns.map(col => <th key={col.key} className="px-4 py-3 min-w-[100px]">{col.title}</th>)}
                            <th className="px-4 py-3 text-right w-[120px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                        {groupBy ? (
                            Object.keys(groupBy(data)).map(group => (
                                <React.Fragment key={group}>
                                    <tr className="bg-slate-50/80 border-y border-slate-100">
                                        <td colSpan={columns.length + 1} className="px-4 py-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            {group}
                                        </td>
                                    </tr>
                                    {renderRows(groupBy(data)[group])}
                                </React.Fragment>
                            ))
                        ) : renderRows(data)}
                    </tbody>
                </table>
            </div>
        );
    };

    const MinimalFilters = () => (
        <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg border border-slate-200 w-fit">
            <select
                value={filters.store}
                onChange={e => setFilters({ ...filters, store: e.target.value })}
                className="text-[10px] font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer hover:bg-slate-50 rounded px-2 py-1"
            >
                <option value="ALL">🏢 All Stores</option>
                {dropdownStores.map(s => <option key={s.store_code} value={s.store_code}>{s.store_name}</option>)}
            </select>
            <div className="h-4 w-px bg-slate-200"></div>
            {(['checklist', 'positions', 'incidents'].includes(currentView)) && (
                <>
                    <select
                        value={filters.layout}
                        onChange={e => setFilters({ ...filters, layout: e.target.value })}
                        className="text-[10px] font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer hover:bg-slate-50 rounded px-2 py-1"
                    >
                        <option value="ALL">📂 All Layouts</option>
                        {dropdownLayouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}
                    </select>
                    <div className="h-4 w-px bg-slate-200"></div>
                </>
            )}
            <select
                value={filters.active}
                onChange={e => setFilters({ ...filters, active: e.target.value })}
                className="text-[10px] font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer hover:bg-slate-50 rounded px-2 py-1"
            >
                <option value="ALL">👁️ All Status</option>
                <option value="ACTIVE">✅ Active</option>
                <option value="INACTIVE">🚫 Inactive</option>
            </select>
        </div>
    );

    const MenuButton = ({ label, count, active, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-colors border-b border-slate-50 ${active ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
        >
            <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-blue-700' : 'text-slate-600'}`}>{label}</span>
            </div>
            {count !== undefined && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{count}</span>}
        </button>
    );

    // ==================== MAIN RENDER ====================
    return (
        <div className="flex h-[calc(100vh-140px)] border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm animate-fade-in">
            {/* SIDEBAR NAVIGATION */}
            <div className="w-[180px] bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Setup Center</h3>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {[
                        { id: 'info', label: 'Cửa hàng (Stores)', count: stores.length },
                        { id: 'checklist', label: 'Checklists', count: checklists.length },
                        { id: 'positions', label: 'Positions', count: positions.length },
                        { id: 'roles', label: 'Roles', count: roles.length },
                        { id: 'shifts', label: 'Shifts', count: shifts.length },
                        { id: 'incidents', label: 'Incidents', count: incidents.length },
                        { id: 'layouts', label: 'Layouts', count: layouts.length },
                    ].map(menu => (
                        <MenuButton
                            key={menu.id}
                            label={menu.label}
                            count={menu.count}
                            active={currentView === menu.id}
                            onClick={() => setCurrentView(menu.id)}
                        />
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                {/* TOOLBAR */}
                <div className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4">
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                        {currentView.toUpperCase()} MANAGEMENT
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handleAdd} className="bg-black text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm">
                            + Add New
                        </button>
                    </div>
                </div>

                {/* FILTERS & CONTENT */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {currentView !== 'menu' && <MinimalFilters />}

                    {currentView === 'info' && (
                        <MinimalTable
                            data={stores}
                            columns={[
                                { title: 'Code', key: 'store_code', bold: true },
                                { title: 'Name', key: 'store_name' },
                                { title: 'Region', key: 'region' }
                            ]}
                            onEdit={(item) => setModals({ ...modals, store: item })}
                            onDelete={(item) => handleDelete('store', item.store_code)}
                            onToggle={(item) => handleToggleActive('store', item.store_code, item.active)}
                        />
                    )}

                    {currentView === 'checklist' && (
                        <MinimalTable
                            data={checklists}
                            columns={[
                                { title: 'Content', key: 'checklist_text', bold: true },
                                { title: 'Layout', key: 'layout' },
                                { title: 'Order', key: 'sort_order' }
                            ]}
                            groupBy={(data) => data.reduce((acc, item) => {
                                (acc[item.layout || 'OTHERS'] = acc[item.layout || 'OTHERS'] || []).push(item);
                                return acc;
                            }, {})}
                            onEdit={(item) => setModals({ ...modals, checklist: item })}
                            onDelete={(item) => handleDelete('checklist', item.id)}
                            onToggle={(item) => handleToggleActive('checklist', item.id, item.active)}
                        />
                    )}

                    {currentView === 'positions' && (
                        <MinimalTable
                            data={positions}
                            columns={[
                                { title: 'Position', key: 'sub_position', bold: true },
                                { title: 'Code', key: 'sub_id' },
                                { title: 'Layout', key: 'layout' }
                            ]}
                            groupBy={(data) => data.reduce((acc, item) => {
                                (acc[item.layout || 'OTHERS'] = acc[item.layout || 'OTHERS'] || []).push(item);
                                return acc;
                            }, {})}
                            onEdit={(item) => setModals({ ...modals, position: item })}
                            onDelete={(item) => handleDelete('position', item.id)}
                            onToggle={(item) => handleToggleActive('position', item.id, item.active)}
                        />
                    )}

                    {currentView === 'roles' && (
                        <MinimalTable
                            data={roles}
                            columns={[
                                { title: 'Code', key: 'role_code', bold: true },
                                { title: 'Name', key: 'role_name' },
                                { title: 'Description', key: 'description' }
                            ]}
                            onEdit={(item) => setModals({ ...modals, role: item })}
                            onDelete={(item) => handleDelete('role', item.id)}
                            onToggle={(item) => handleToggleActive('role', item.id, item.active)}
                        />
                    )}

                    {currentView === 'shifts' && (
                        <MinimalTable
                            data={shifts}
                            columns={[
                                { title: 'Shift', key: 'shift_name', bold: true },
                                { title: 'Code', key: 'shift_code' },
                                { title: 'Time', key: 'start_time', render: (i) => `${i.start_time?.slice(0, 5)} - ${i.end_time?.slice(0, 5)}` }
                            ]}
                            groupBy={(data) => data.reduce((acc, item) => {
                                let g = 'OTHER';
                                if (item.shift_code?.startsWith('S') || item.shift_code?.startsWith('C')) g = 'FULL-TIME';
                                else if (item.shift_code?.startsWith('P')) g = 'PART-TIME';
                                (acc[g] = acc[g] || []).push(item);
                                return acc;
                            }, {})}
                            onEdit={(item) => setModals({ ...modals, shift: item })}
                            onDelete={(item) => handleDelete('shift', item.id)}
                            onToggle={(item) => handleToggleActive('shift', item.id, item.active)}
                        />
                    )}

                    {currentView === 'incidents' && (
                        <MinimalTable
                            data={incidents}
                            columns={[
                                { title: 'Incident', key: 'incident_name', bold: true },
                                { title: 'Code', key: 'incident_id' },
                                { title: 'Layout', key: 'layout' }
                            ]}
                            groupBy={(data) => data.reduce((acc, item) => {
                                (acc[item.layout || 'OTHERS'] = acc[item.layout || 'OTHERS'] || []).push(item);
                                return acc;
                            }, {})}
                            onEdit={(item) => setModals({ ...modals, incident: item })}
                            onDelete={(item) => handleDelete('incident', item.id)}
                            onToggle={(item) => handleToggleActive('incident', item.id, item.active)}
                        />
                    )}

                    {currentView === 'layouts' && (
                        <MinimalTable
                            data={layouts}
                            columns={[
                                { title: 'Code', key: 'layout_code', bold: true },
                                { title: 'Name', key: 'layout_name' },
                                { title: 'Store', key: 'store_code' }
                            ]}
                            onEdit={(item) => setModals({ ...modals, layout: item })}
                            onDelete={(item) => handleDelete('layout', item.id)}
                            onToggle={(item) => handleToggleActive('layout', item.id, item.active)}
                        />
                    )}
                </div>
            </div>

            {/* Modals Injection */}
            {modals.store && <StoreModal data={modals.store} onSave={d => handleSave('store', d)} onClose={() => setModals({ ...modals, store: null })} />}
            {modals.checklist && <ChecklistModal data={modals.checklist} layouts={dropdownLayouts} stores={dropdownStores} onSave={d => handleSave('checklist', d)} onClose={() => setModals({ ...modals, checklist: null })} />}
            {modals.position && <PositionModal data={modals.position} layouts={dropdownLayouts} stores={dropdownStores} onSave={d => handleSave('position', d)} onClose={() => setModals({ ...modals, position: null })} />}
            {modals.incident && <IncidentModal data={modals.incident} layouts={dropdownLayouts} stores={dropdownStores} onSave={d => handleSave('incident', d)} onClose={() => setModals({ ...modals, incident: null })} />}
            {modals.layout && <LayoutModal data={modals.layout} stores={dropdownStores} onSave={d => handleSave('layout', d)} onClose={() => setModals({ ...modals, layout: null })} />}
            {modals.role && <RoleModal data={modals.role} stores={dropdownStores} onSave={d => handleSave('role', d)} onClose={() => setModals({ ...modals, role: null })} />}
            {modals.shift && <ShiftModal data={modals.shift} stores={dropdownStores} onSave={d => handleSave('shift', d)} onClose={() => setModals({ ...modals, shift: null })} />}
        </div>
    );
};

// ==================== MINIMAL MODAL COMPONENTS (Inline for now) ====================
// Reusing logic but with minimalist Tailwind classes

const ModalWrapper = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white p-5 rounded-lg shadow-xl w-[320px] border border-slate-200 flex flex-col gap-3">
            <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-wide mb-1">{title}</h3>
            {children}
            <div className="flex gap-2 mt-2">
                <button onClick={onClose} className="flex-1 py-2 rounded bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-200 uppercase">Cancel</button>
            </div>
        </div>
    </div>
);

const MinimalInput = (props) => (
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-blue-500 placeholder-slate-400" />
);
const MinimalSelect = ({ children, ...props }) => (
    <select {...props} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-blue-500">
        {children}
    </select>
);
const PrimaryButton = ({ onClick, children }) => (
    <button onClick={onClick} className="w-full py-2 bg-black text-white rounded text-[10px] font-black uppercase hover:bg-slate-800 transition-colors shadow-sm">{children}</button>
);

const StoreSelector = ({ value, onChange, stores }) => (
    <MinimalSelect value={value || 'ALL'} onChange={e => onChange(e.target.value)}>
        <option value="ALL">🏢 All Systems</option>
        {stores.map(s => <option key={s.store_code} value={s.store_code}>{s.store_name}</option>)}
    </MinimalSelect>
);

// --- Form Modals ---
const StoreModal = ({ data, onSave, onClose }) => {
    const [form, setForm] = useState({ store_code: data.store_code || '', store_name: data.store_name || '', region: data.region || '' });
    return <ModalWrapper title="Store Config" onClose={onClose}><MinimalInput placeholder="Code" value={form.store_code} onChange={e => setForm({ ...form, store_code: e.target.value })} /><MinimalInput placeholder="Name" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} /><MinimalInput placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};
const RoleModal = ({ data, stores, onSave, onClose }) => {
    const [form, setForm] = useState({ role_code: data.role_code || '', role_name: data.role_name || '', description: data.description || '', store_code: data.store_code || 'ALL' });
    return <ModalWrapper title="Role Config" onClose={onClose}><MinimalInput placeholder="Role Code" value={form.role_code} onChange={e => setForm({ ...form, role_code: e.target.value.toUpperCase() })} /><MinimalInput placeholder="Role Name" value={form.role_name} onChange={e => setForm({ ...form, role_name: e.target.value })} /><StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};
const ChecklistModal = ({ data, layouts, stores, onSave, onClose }) => {
    const [form, setForm] = useState({ checklist_text: data.checklist_text || '', layout: data.layout || 'FOH', store_code: data.store_code || 'ALL', sort_order: data.sort_order || 0 });
    return <ModalWrapper title="Checklist" onClose={onClose}><MinimalInput placeholder="Task Content" value={form.checklist_text} onChange={e => setForm({ ...form, checklist_text: e.target.value })} /><MinimalSelect value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>{layouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}</MinimalSelect><StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} /><MinimalInput type="number" placeholder="Order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};
const PositionModal = ({ data, layouts, stores, onSave, onClose }) => {
    const [form, setForm] = useState({ sub_position: data.sub_position || '', layout: data.layout || 'FOH', store_code: data.store_code || 'ALL', sub_id: data.sub_id || '' });
    return <ModalWrapper title="Position" onClose={onClose}><MinimalInput placeholder="Position Name" value={form.sub_position} onChange={e => setForm({ ...form, sub_position: e.target.value })} /><MinimalInput placeholder="Sub ID" value={form.sub_id} onChange={e => setForm({ ...form, sub_id: e.target.value })} /><MinimalSelect value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>{layouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}</MinimalSelect><StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};
const ShiftModal = ({ data, stores, onSave, onClose }) => {
    const [form, setForm] = useState({ shift_code: data.shift_code || '', shift_name: data.shift_name || '', start_time: data.start_time || '06:00', end_time: data.end_time || '14:00', store_code: data.store_code || 'ALL' });
    return <ModalWrapper title="Shift Config" onClose={onClose}><MinimalInput placeholder="Code" value={form.shift_code} onChange={e => setForm({ ...form, shift_code: e.target.value })} /><MinimalInput placeholder="Name" value={form.shift_name} onChange={e => setForm({ ...form, shift_name: e.target.value })} /><div className="flex gap-2"><MinimalInput type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /><MinimalInput type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} /></div><StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};
const IncidentModal = ({ data, layouts, stores, onSave, onClose }) => {
    const [form, setForm] = useState({ incident_name: data.incident_name || '', layout: data.layout || 'FOH', store_code: data.store_code || 'ALL', incident_id: data.incident_id || '' });
    return <ModalWrapper title="Incident Type" onClose={onClose}><MinimalInput placeholder="Name" value={form.incident_name} onChange={e => setForm({ ...form, incident_name: e.target.value })} /><MinimalInput placeholder="Code ID" value={form.incident_id} onChange={e => setForm({ ...form, incident_id: e.target.value })} /><MinimalSelect value={form.layout} onChange={e => setForm({ ...form, layout: e.target.value })}>{layouts.map(l => <option key={l.layout_code} value={l.layout_code}>{l.layout_name}</option>)}</MinimalSelect><StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};
const LayoutModal = ({ data, stores, onSave, onClose }) => {
    const [form, setForm] = useState({ layout_code: data.layout_code || '', layout_name: data.layout_name || '', store_code: data.store_code || 'ALL' });
    return <ModalWrapper title="Layout Master" onClose={onClose}><MinimalInput placeholder="Code" value={form.layout_code} onChange={e => setForm({ ...form, layout_code: e.target.value.toUpperCase() })} /><MinimalInput placeholder="Name" value={form.layout_name} onChange={e => setForm({ ...form, layout_name: e.target.value })} /><StoreSelector value={form.store_code} onChange={v => setForm({ ...form, store_code: v })} stores={stores} /><PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton></ModalWrapper>;
};

export default PageStoreSetup;
