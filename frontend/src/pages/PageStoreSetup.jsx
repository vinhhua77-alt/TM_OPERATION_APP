import React, { useState, useEffect } from 'react';
import { masterDataAPI } from '../api/master-data';
import { staffAPI } from '../api/staff';

const PageStoreSetup = ({ user, onBack }) => {
    const isAuthorized = ['ADMIN', 'IT', 'OPS'].includes(user?.role);
    const [activeTab, setActiveTab] = useState('stores');
    const [selectedStore, setSelectedStore] = useState('ALL');
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    // UNIFIED FILTERS FOR ALL MODULES
    const [activeFilters, setActiveFilters] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [layouts, setLayouts] = useState([]);

    const modules = [
        { id: 'stores', label: 'THIẾT LẬP & CÀI ĐẶT', icon: '⚙️', color: 'bg-blue-600', hasStoreFilter: false },
        { id: 'shifts', label: 'CA TRỰC', icon: '⏱️', color: 'bg-emerald-600', hasStoreFilter: true, filters: ['FT', 'PT', 'GÃY', 'OT'] },
        { id: 'checklist', label: 'CHECKLIST', icon: '✅', color: 'bg-violet-600', hasStoreFilter: true, filters: ['FOH', 'BOH', 'CASH', 'LEAD'] },
        { id: 'positions', label: 'VỊ TRÍ', icon: '📍', color: 'bg-rose-600', hasStoreFilter: true, filters: ['FOH', 'BOH', 'CASH', 'SUPPORT'] },
        { id: 'incidents', label: 'SỰ CỐ', icon: '⚠️', color: 'bg-orange-600', hasStoreFilter: true, filters: ['FOH', 'BOH', 'CASH', 'OTHER'] },
        { id: 'layouts', label: 'LAYOUT', icon: '🏗️', color: 'bg-indigo-600', hasStoreFilter: true },
        { id: 'roles', label: 'VAI TRÒ', icon: '👤', color: 'bg-sky-600', hasStoreFilter: false, filters: ['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'] },
        { id: 'audit', label: 'NHẬT KÝ', icon: '📜', color: 'bg-slate-600', hasStoreFilter: true },
        { id: 'am_assignments', label: 'QUẢN LÝ VÙNG', icon: '👔', color: 'bg-indigo-900', hasStoreFilter: false },
        { id: 'system', label: 'HỆ THỐNG', icon: '⚙️', color: 'bg-slate-900', hasStoreFilter: false, filters: ['PHÁP NHÂN', 'THƯƠNG HIỆU'] }
    ];

    // Reset filters when switching tabs
    useEffect(() => {
        if (activeTab === 'system') {
            setActiveFilters(['PHÁP NHÂN']); // Default sub-tab for system
        } else {
            setActiveFilters([]);
        }
    }, [activeTab]);

    useEffect(() => {
        loadStores();
        loadTenants();
        loadAllBrands();
        loadLayouts();
        loadAMs();
    }, []);

    const [ams, setAMs] = useState([]);
    const loadAMs = async () => {
        try {
            const res = await staffAPI.getAllStaff({ role: 'AM' });
            if (res.success) setAMs(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (isAuthorized) loadData(); }, [activeTab, selectedStore, activeFilters]);

    const loadTenants = async () => {
        try {
            const res = await masterDataAPI.getAllTenants();
            if (res.success) setTenants(res.data);
        } catch (e) { console.error(e); }
    };

    const loadAllBrands = async () => {
        try {
            const res = await masterDataAPI.getAllBrands();
            if (res.success) setAllBrands(res.data);
        } catch (e) { console.error(e); }
    };

    const loadLayouts = async () => {
        try {
            const res = await masterDataAPI.getAllLayouts();
            if (res.success) setLayouts(res.data);
        } catch (e) { console.error(e); }
    };

    const loadStores = async () => {
        try {
            const res = await masterDataAPI.getAllStores();
            if (res.success) setStores(res.data);
        } catch (e) { console.error(e); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            let res;
            switch (activeTab) {
                case 'stores': res = await masterDataAPI.getAllStores(); break;
                case 'shifts': res = await masterDataAPI.getAllShifts(selectedStore); break;
                case 'checklist': res = await masterDataAPI.getAllChecklists(null, selectedStore); break;
                case 'positions': res = await masterDataAPI.getAllPositions(null, selectedStore); break;
                case 'incidents': res = await masterDataAPI.getAllIncidents(null, selectedStore); break;
                case 'layouts': res = await masterDataAPI.getAllLayouts(false, selectedStore); break;
                case 'roles': res = await masterDataAPI.getAllRoles(selectedStore); break;
                case 'system':
                    if (activeFilters.includes('THƯƠNG HIỆU')) {
                        res = await masterDataAPI.getAllBrands(); // Assuming this API exists
                    } else { // Default to PHÁP NHÂN
                        res = await masterDataAPI.getAllTenants();
                    }
                    break;
                case 'am_assignments':
                    res = await staffAPI.getAllStaff({ role: 'AM' });
                    break;
                default: res = { success: true, data: [] };
            }
            if (res.success) {
                let filtered = res.data;
                const currentMod = modules.find(m => m.id === activeTab);

                // LOGIC PHÂN LOẠI CHUNG
                if (currentMod?.filters && activeTab !== 'system') { // Apply general filters only if not 'system' tab
                    filtered = res.data.map(item => {
                        // Use item.type and item.time_slot directly from the API response
                        const type = item.type || item.layout || item.role_code || 'OTHER';
                        const timeSlot = item.time_slot || ''; // Assuming time_slot is also provided by API for shifts

                        return { ...item, display_type: type, time_slot: timeSlot };
                    });

                    // Lọc theo mảng activeFilters: Chỉ lọc nếu CÓ chọn ít nhất 1 filter và không phải chọn TẤT CẢ
                    if (activeFilters.length > 0 && activeFilters.length < currentMod.filters.length) {
                        filtered = filtered.filter(item => activeFilters.includes(item.display_type));
                    }
                }
                setData(filtered);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const cleanPayload = (item) => {
        const cleaned = { ...item };
        delete cleaned.display_type;
        delete cleaned.time_slot;
        return cleaned;
    };

    const toggleFilter = (type) => {
        if (activeTab === 'system') {
            setActiveFilters([type]); // Only one filter can be active for 'system' tab
            return;
        }
        setActiveFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const handleToggleStatus = async (item) => {
        setLoading(true);
        try {
            const updatedItem = { ...item, active: item.active === false ? true : false };
            const payload = cleanPayload(updatedItem);
            let res;
            const id = item.id;

            switch (activeTab) {
                case 'system':
                    if (activeFilters.includes('THƯƠNG HIỆU')) {
                        res = await masterDataAPI.updateBrand(id, payload);
                    } else {
                        res = await masterDataAPI.updateTenant(id, payload);
                    }
                    break;
                case 'stores': res = await masterDataAPI.updateStore(item.store_code, payload); break;
                case 'shifts': res = await masterDataAPI.updateShift(id, payload); break;
                case 'checklist': res = await masterDataAPI.updateChecklist(id, payload); break;
                case 'positions': res = await masterDataAPI.updatePosition(id, payload); break;
                case 'incidents': res = await masterDataAPI.updateIncident(id, payload); break;
                case 'layouts': res = await masterDataAPI.updateLayout(id, payload); break;
                case 'roles': res = await masterDataAPI.updateRole(id, payload); break;
                default: break;
            }

            if (res?.success) {
                loadData();
            } else {
                alert('Lỗi khi cập nhật trạng thái: ' + (res?.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [editingItem, setEditingItem] = useState(null);

    const handleEdit = (item) => setEditingItem({ ...item });

    const handleFieldChange = (field, value) => {
        setEditingItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const id = editingItem.id;
            const isNew = !id;
            const payload = cleanPayload(editingItem);
            let res;

            // DETERMINING API CALL BASED ON MODULE
            switch (activeTab) {
                case 'tenants': // Since tenants are now in system, we check activeFilters
                case 'system':
                    if (activeFilters.includes('THƯƠNG HIỆU')) {
                        res = isNew ? await masterDataAPI.createBrand(payload) : await masterDataAPI.updateBrand(id, payload);
                    } else {
                        res = isNew ? await masterDataAPI.createTenant(payload) : await masterDataAPI.updateTenant(id, payload);
                    }
                    break;
                case 'stores':
                    res = isNew ? await masterDataAPI.createStore(payload) : await masterDataAPI.updateStore(editingItem.store_code, payload);
                    break;
                case 'shifts':
                    res = isNew ? await masterDataAPI.createShift(payload) : await masterDataAPI.updateShift(id, payload);
                    break;
                case 'checklist':
                    res = isNew ? await masterDataAPI.createChecklist(payload) : await masterDataAPI.updateChecklist(id, payload);
                    break;
                case 'positions':
                    res = isNew ? await masterDataAPI.createPosition(payload) : await masterDataAPI.updatePosition(id, payload);
                    break;
                case 'incidents':
                    res = isNew ? await masterDataAPI.createIncident(payload) : await masterDataAPI.updateIncident(id, payload);
                    break;
                case 'layouts':
                    res = isNew ? await masterDataAPI.createLayout(payload) : await masterDataAPI.updateLayout(id, payload);
                    break;
                case 'roles':
                    res = isNew ? await masterDataAPI.createRole(payload) : await masterDataAPI.updateRole(id, payload);
                    break;
                default: break;
            }

            if (res?.success) {
                setEditingItem(null);
                loadData();
            } else {
                alert('Lỗi khi lưu dữ liệu: ' + (res?.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi hệ thống: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderEditFields = () => {
        if (!editingItem) return null;

        const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-blue-400 transition-all shadow-inner";
        const labelClass = "text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1";

        // Helper function (NOT a component) to avoid focus loss
        const renderInput = (label, name, type = "text") => (
            <div className="mb-3" key={name}>
                <label className={labelClass}>{label}</label>
                <input
                    type={type}
                    value={editingItem[name] || ''}
                    onChange={(e) => handleFieldChange(name, e.target.value)}
                    className={inputClass}
                    autoFocus={name === 'store_name' || name === 'shift_name' || name === 'checklist_text' || name === 'sub_position' || name === 'incident_name' || name === 'role_name' || name === 'tenant_name' || name === 'brand_name'}
                />
            </div>
        );

        const handleToggleStore = (code) => {
            const current = Array.isArray(editingItem.store_code) ? editingItem.store_code : [editingItem.store_code || 'ALL'];
            let updated;
            if (code === 'ALL') {
                updated = ['ALL'];
            } else {
                updated = current.filter(c => c !== 'ALL');
                if (updated.includes(code)) {
                    updated = updated.filter(c => c !== code);
                } else {
                    updated = [...updated, code];
                }
                if (updated.length === 0) updated = ['ALL'];
            }
            handleFieldChange('store_code', updated);
        };

        const renderMultiSelect = (label, name, options) => {
            const selected = Array.isArray(editingItem[name]) ? editingItem[name] : [editingItem[name] || 'ALL'];
            return (
                <div className="mb-4" key={name}>
                    <label className={labelClass}>{label}</label>
                    <div className="flex flex-wrap gap-2 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-inner max-h-32 overflow-y-auto">
                        {options.map(opt => {
                            const isSelected = selected.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleToggleStore(opt.value)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        };

        const renderSelect = (label, name, options) => (
            <div className="mb-3" key={name}>
                <label className={labelClass}>{label}</label>
                <select
                    value={editingItem[name] || (name === 'active' ? true : '')}
                    onChange={(e) => handleFieldChange(name, name === 'active' ? e.target.value === 'true' : e.target.value)}
                    className={inputClass}
                >
                    <option value="">-- Chọn {label} --</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        );

        const activeOptions = [
            { label: 'Đang hoạt động (Active)', value: 'true' },
            { label: 'Ngừng hoạt động (Inactive)', value: 'false' }
        ];

        // HIỂN THỊ CÁC TRƯỜNG THEO MODULE
        switch (activeTab) {
            case 'system':
                if (activeFilters.includes('THƯƠNG HIỆU')) {
                    return (
                        <>
                            {renderInput("Mã Thương Hiệu (Code)", "brand_code")}
                            {renderInput("Tên Thương Hiệu", "brand_name")}
                            {renderSelect("Pháp Nhân (Tenant)", "tenant_id", tenants.map(t => ({ label: t.tenant_name, value: t.tenant_id })))}
                            {renderSelect("Trạng thái", "active", activeOptions)}
                        </>
                    );
                }
                // Default to PHÁP NHÂN
                return (
                    <>
                        {renderInput("Mã Pháp Nhân (ID)", "tenant_id")}
                        {renderInput("Tên Pháp Nhân", "tenant_name")}
                        {renderSelect("Trạng thái", "active", activeOptions)}
                    </>
                );
            case 'stores': return (
                <>
                    {renderInput("Mã Cửa Hàng (Code)", "store_code")}
                    {renderInput("Tên Cửa Hàng", "store_name")}
                    {renderInput("Khu Vực (Region)", "region")}
                    {renderSelect("Thương Hiệu (Brand)", "brand_group_code", allBrands.map(b => ({ label: b.brand_name, value: b.brand_code })))}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            case 'shifts': return (
                <>
                    {renderInput("Mã Ca Trực (Code)", "shift_code")}
                    {renderInput("Tên Ca Trực", "shift_name")}
                    <div className="grid grid-cols-2 gap-3">
                        {renderInput("Giờ Bắt Đầu", "start_hour")}
                        {renderInput("Giờ Kết Thúc", "end_hour")}
                    </div>
                    {renderMultiSelect("Phạm vi áp dụng (Chọn nhiều)", "store_code", [{ label: "🌏 TẤT CẢ", value: "ALL" }, ...stores.map(s => ({ label: s.store_name, value: s.store_code }))])}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            case 'checklist': return (
                <>
                    {renderInput("Mã Định Danh (ID)", "checklist_id")}
                    {renderInput("Nội Dung Checklist", "checklist_text")}
                    <div className="grid grid-cols-2 gap-3">
                        {renderInput("Thứ Tự (Sort)", "sort_order", "number")}
                        {renderSelect("Phân Loại (Layout)", "layout", layouts.map(l => ({ label: l.layout_name, value: l.layout_code })))}
                    </div>
                    {renderMultiSelect("Phạm vi áp dụng (Chọn nhiều)", "store_code", [{ label: "🌏 TẤT CẢ", value: "ALL" }, ...stores.map(s => ({ label: s.store_name, value: s.store_code }))])}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            case 'positions': return (
                <>
                    {renderInput("Mã Vị Trí (Sub ID)", "sub_id")}
                    {renderInput("Tên Vị Trí", "sub_position")}
                    {renderSelect("Phân Loại (Layout)", "layout", layouts.map(l => ({ label: l.layout_name, value: l.layout_code })))}
                    {renderMultiSelect("Phạm vi áp dụng (Chọn nhiều)", "store_code", [{ label: "🌏 TẤT CẢ", value: "ALL" }, ...stores.map(s => ({ label: s.store_name, value: s.store_code }))])}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            case 'incidents': return (
                <>
                    {renderInput("Mã Sự Cố (ID)", "incident_id")}
                    {renderInput("Tên Sự Cố", "incident_name")}
                    {renderSelect("Phân Loại (Layout)", "layout", layouts.map(l => ({ label: l.layout_name, value: l.layout_code })))}
                    {renderMultiSelect("Phạm vi áp dụng (Chọn nhiều)", "store_code", [{ label: "🌏 TẤT CẢ", value: "ALL" }, ...stores.map(s => ({ label: s.store_name, value: s.store_code }))])}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            case 'layouts': return (
                <>
                    {renderInput("Mã Layout (Code)", "layout_code")}
                    {renderInput("Tên Layout", "layout_name")}
                    {renderInput("Mô tả / Note", "note")}
                    {renderMultiSelect("Phạm vi áp dụng (Chọn nhiều)", "store_code", [{ label: "🌏 TẤT CẢ", value: "ALL" }, ...stores.map(s => ({ label: s.store_name, value: s.store_code }))])}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            case 'roles': return (
                <>
                    {renderInput("Mã Vai Trò (Code)", "role_code")}
                    {renderInput("Tên Vai Trò", "role_name")}
                    {renderInput("Cấp Độ (Level)", "level", "number")}
                    {renderMultiSelect("Phạm vi áp dụng (Chọn nhiều)", "store_code", [{ label: "🌏 TẤT CẢ", value: "ALL" }, ...stores.map(s => ({ label: s.store_name, value: s.store_code }))])}
                    {renderSelect("Trạng thái", "active", activeOptions)}
                </>
            );
            default: return <div key="default-field">{renderInput("Nội Dung", "name")}</div>;
        }
    };

    if (!isAuthorized) return null;

    const currentModule = modules.find(m => m.id === activeTab);
    const currentTheme = currentModule.color;

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans pb-24">
            {/* FRAMEWORK HEADER (STANDARD V8) */}
            <div className={`${currentTheme} pt-10 pb-16 px-6 rounded-b-[40px] shadow-lg relative transition-all duration-500 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all border border-white/30"
                    >
                        <span className="text-xl">←</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-0.5">Setup Center</h1>
                        <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase">{currentModule.label}</p>
                    </div>
                </div>

                {/* Floating Icon Standard */}
                <div className="absolute -bottom-6 left-10 w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl border border-slate-50 z-20">
                    {currentModule.icon}
                </div>

                {/* 2. STORE DROPDOWN (UI Standard in Header) */}
                {currentModule.hasStoreFilter && (
                    <div className="absolute top-10 right-6 z-20">
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-[9px] font-black px-3 py-1.5 outline-none text-white focus:bg-white focus:text-slate-900 transition-all uppercase shadow-lg"
                        >
                            <option value="ALL">🌐 All Stores</option>
                            {stores.map(s => <option key={s.store_code} value={s.store_code}>{s.store_code}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* 3. MODULE GRID 5X2 */}
            <div className="px-4 -mt-5 relative z-20">
                <div className="grid grid-cols-5 gap-1.5 min-h-[100px]">
                    {modules.map(m => {
                        const active = activeTab === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setActiveTab(m.id)}
                                className={`
                                    flex flex-col items-center justify-center h-12 rounded-xl transition-all shadow-md active:scale-95 border-2
                                    ${active ? 'bg-white border-blue-500 scale-105 z-10' : 'bg-white/60 border-transparent opacity-60'}
                                `}
                            >
                                <span className="text-base mb-0.5">{m.icon}</span>
                                <span className={`text-[6.5px] font-black text-center leading-none ${active ? 'text-blue-600' : 'text-slate-500'}`}>
                                    {m.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. DYNAMIC CLASSIFICATION BAR (General Filter) */}
            {currentModule.filters && (
                <div className="px-5 mt-6 animate-in fade-in slide-in-from-top-2 duration-400">
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2 px-1">Lọc nhanh theo {currentModule.label}</div>
                    <div className="flex flex-wrap gap-2">
                        {currentModule.filters.map(type => (
                            <div
                                key={type}
                                onClick={() => toggleFilter(type)}
                                className={`
                                    flex-1 flex items-center justify-center h-8 px-2 rounded-lg border-2 text-[8px] font-black transition-all cursor-pointer active:scale-95
                                    ${activeFilters.includes(type) ? `${currentTheme} border-transparent text-white shadow-md` : 'bg-white border-slate-100 text-slate-300'}
                                `}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 5. DATA LIST */}
            <div className="flex-1 px-4 mt-6">
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[380px]">
                    <div className="p-1">
                        {loading ? (
                            <div className="py-24 flex justify-center"><div className={`w-6 h-6 border-2 ${currentTheme.replace('bg-', 'border-')} border-t-transparent rounded-full animate-spin`}></div></div>
                        ) : data.length === 0 ? (
                            <div className="py-24 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No matching {currentModule.label}</div>
                        ) : activeTab === 'am_assignments' ? (
                            <div className="p-4 space-y-6 animate-in fade-in duration-500">
                                <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100 mb-6">
                                    <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1 italic">📌 Area Manager - Assignment Matrix</h4>
                                    <p className="text-[9px] font-medium text-indigo-600/70 uppercase tracking-tight leading-relaxed">Chọn các cửa hàng mà AM này sẽ phụ trách điều hành & xem báo cáo.</p>
                                </div>

                                <div className="space-y-4">
                                    {data.map((am, idx) => (
                                        <div key={`${am.staff_id}-${idx}`} className="bg-white rounded-[28px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-900 flex items-center justify-center text-white shadow-lg text-lg">👔</div>
                                                    <div>
                                                        <div className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{am.staff_name}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 font-mono tracking-widest">{am.staff_id} • {am.gmail}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-1.5">
                                                {stores.map((s, sIdx) => {
                                                    const isAssigned = (am.responsibility || []).includes(s.store_code);
                                                    return (
                                                        <button
                                                            key={`${s.store_code}-${sIdx}`}
                                                            onClick={async () => {
                                                                const newResp = isAssigned ? am.responsibility.filter(c => c !== s.store_code) : [...(am.responsibility || []), s.store_code];
                                                                setLoading(true);
                                                                try {
                                                                    await staffAPI.updateStaff(am.staff_id, { responsibility: newResp });
                                                                    loadData();
                                                                } catch (e) {
                                                                    alert('Lỗi cập nhật: ' + e.message);
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            className={`py-2 rounded-xl text-[8px] font-black transition-all border ${isAssigned ? 'bg-indigo-900 text-white border-indigo-900 shadow-md scale-[1.02]' : 'bg-slate-50 text-slate-300 border-slate-100 hover:border-indigo-200 hover:text-indigo-400'}`}
                                                        >
                                                            {s.store_code}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {data.map((item, idx) => {
                                    const idPart = item.id || item.store_code || item.shift_code || item.checklist_id || item.incident_id || item.sub_id || 'item';
                                    const uniqueKey = `${idPart}-${idx}`;
                                    return (
                                        <div key={uniqueKey} className="flex items-center p-4 hover:bg-slate-50/50 transition-all group">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`text-[12px] font-black text-slate-800 truncate ${item.active === false ? 'opacity-30' : ''}`}>
                                                        {item.store_name || item.shift_name || item.checklist_text || item.role_name || item.sub_position || item.incident_name || item.layout_name || item.tenant_name || item.brand_name}
                                                    </div>
                                                    <span className="text-[7.5px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                                        {item.store_code || item.shift_code || item.checklist_id || item.sub_id || item.incident_id || item.tenant_id || item.brand_code || 'ID-00'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex flex-wrap gap-x-2">
                                                        {activeTab !== 'shifts' && <span>{item.layout || item.region || 'Active'}</span>}
                                                        {activeTab === 'shifts' && (
                                                            <span className="text-blue-500/70 flex gap-2">
                                                                {item.morning_hours > 0 && <span>• Sáng: {item.morning_hours}h</span>}
                                                                {item.afternoon_hours > 0 && <span>• Chiều: {item.afternoon_hours}h</span>}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {item.display_type && <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 rounded">{item.display_type}</span>}
                                                        {item.time_slot && (
                                                            <span className={`text-[8px] font-black px-1.5 rounded ${item.time_slot === 'SÁNG' ? 'text-orange-600 bg-orange-50' : item.time_slot === 'CHIỀU' ? 'text-indigo-600 bg-indigo-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                                                {item.time_slot}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleToggleStatus(item)}
                                                    className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-all ${item.active !== false ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all transform ${item.active !== false ? 'translate-x-4.5' : 'translate-x-0'}`}></div>
                                                </button>
                                                <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-300 flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">⚙️</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MICRO FAB */}
            <div className="fixed bottom-8 right-6">
                <button
                    onClick={() => handleEdit({})}
                    className={`${currentTheme} text-white w-14 h-14 rounded-[22px] shadow-2xl active:scale-95 transition-all flex items-center justify-center border-4 border-white`}
                >
                    <span className="text-2xl font-light">+</span>
                </button>
            </div>

            {/* EDIT MODAL - FULL FIELDS & PREFIX PRESERVED */}
            {editingItem && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[340px] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`${currentTheme} p-7 text-white relative`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{currentModule.icon}</span>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">ID / Prefix</h3>
                                    <p className="text-xl font-black tracking-tighter leading-none">
                                        {editingItem.store_code || editingItem.shift_code || editingItem.checklist_id || editingItem.sub_id || editingItem.incident_id || editingItem.role_code || 'NEW-ID'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-7 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {renderEditFields()}

                            <div className="grid grid-cols-2 gap-3 pt-6">
                                <button type="button" onClick={() => setEditingItem(null)} className="py-3.5 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest active:scale-95 transition-all">Hủy</button>
                                <button type="submit" className={`${currentTheme} text-white py-3.5 rounded-2xl shadow-xl border-2 border-white/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all`}>Cập Nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageStoreSetup;
