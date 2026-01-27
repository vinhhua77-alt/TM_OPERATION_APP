import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';
import { masterDataAPI } from '../api/master-data';
import { staffAPI } from '../api/staff';
import { careerAPI } from '../api/career';
import PageComplianceConfig from './PageComplianceConfig';
import PageStoreSetup from './PageStoreSetup';
import SandboxToggle from '../components/sandbox/SandboxToggle';

const PageAdminConsole = ({ user, initialTab = 'HUB', onBack }) => {
    const [view, setView] = useState('HUB'); // HUB | OPERATIONS | PEOPLE | PLATFORM | ENTITY
    const [subTab, setSubTab] = useState(null);

    // [NEW] Respect initialTab from Props
    useEffect(() => {
        if (initialTab === 'lab') {
            setView('PLATFORM');
            setSubTab('LAB');
        } else if (initialTab && initialTab !== 'HUB') {
            setView(initialTab.toUpperCase());
        }
    }, [initialTab]);
    const [summary, setSummary] = useState(null);
    const [data, setData] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState('ALL');
    const [loading, setLoading] = useState(true);

    // Entity Master Data States
    const [entityData, setEntityData] = useState({ tenants: [], brands: [], stores: [] });

    useEffect(() => {
        loadData();
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            const res = await adminAPI.getTenants();
            if (res.success) setTenants(res.data || []);
        } catch (e) {
            console.error('Load tenants error:', e);
        }
    };

    const loadData = async (tenantId = selectedTenant) => {
        setLoading(true);
        try {
            const [summaryRes, consoleRes, logsRes] = await Promise.all([
                adminAPI.getSummary(tenantId).catch(() => ({ success: false })),
                adminAPI.getConsoleData(),
                adminAPI.getAuditLogs().catch(() => ({ success: false }))
            ]);
            if (summaryRes.success) setSummary(summaryRes.data);
            if (consoleRes.success) setData(consoleRes.data);
            if (logsRes.success) setAuditLogs(logsRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadEntityMasterData = async () => {
        try {
            const [tRes, bRes, sRes] = await Promise.all([
                masterDataAPI.getAllTenants(),
                masterDataAPI.getAllBrands(),
                masterDataAPI.getAllStores()
            ]);
            setEntityData({
                tenants: tRes.success ? tRes.data : [],
                brands: bRes.success ? bRes.data : [],
                stores: sRes.success ? sRes.data : []
            });
        } catch (e) { console.error(e); }
    };

    // Load entity data when entering ENTITY view
    useEffect(() => {
        if (view === 'ENTITY' && subTab !== 'SUMMARY') {
            loadEntityMasterData();
        }
    }, [view, subTab]);

    const handleTenantChange = (e) => {
        const tId = e.target.value;
        setSelectedTenant(tId);
        loadData(tId);
    };

    const toggleFlag = async (flagKey, currentStatus) => {
        try {
            await adminAPI.updateConfig('FEATURE_FLAG', { key: flagKey, enabled: !currentStatus });
            loadData();
        } catch (error) { alert('Update failed: ' + error.message); }
    };

    const togglePerm = async (roleCode, permKey, currentAccess) => {
        try {
            await adminAPI.updateConfig('PERMISSION', { roleCode, permKey, canAccess: !currentAccess });
            loadData();
        } catch (error) { alert('Update failed: ' + error.message); }
    };

    const updateTargeting = async (flagKey, storesString) => {
        try {
            const targetStores = storesString.split(',').map(s => s.trim()).filter(s => s !== '');
            await adminAPI.updateConfig('TARGETING', { key: flagKey, targetStores });
            loadData();
        } catch (error) { alert('Update failed: ' + error.message); }
    };

    if (loading && !summary) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    // --- 0. HUB VIEW (Modular Grid) ---
    const HubView = () => (
        <div className="space-y-6 animate-fade-in relative z-0">
            {/* 1. SCOPE & STATUS BAR */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-100">
                        <span className="text-sm">🏢</span>
                        <select
                            value={selectedTenant}
                            onChange={handleTenantChange}
                            className="bg-transparent text-[11px] font-black text-slate-700 outline-none uppercase tracking-wide cursor-pointer w-[140px]"
                        >
                            <option value="ALL">All Systems</option>
                            {tenants.map(t => (
                                <option key={t.tenant_id} value={t.tenant_id}>{t.tenant_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Stable</span>
                </div>
            </div>

            {/* 2. METRICS GRIDS */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Active Tenants', val: summary?.tenants || 0, color: 'text-blue-600' },
                    { label: 'Total Brands', val: summary?.brands || 0, color: 'text-indigo-600' },
                    { label: 'Operating Stores', val: summary?.stores || 0, color: 'text-emerald-600' },
                    { label: 'Total Staff', val: summary?.staff || 0, color: 'text-slate-600' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center hover:border-slate-300 transition-colors cursor-default">
                        <span className={`text-3xl font-black ${stat.color} mb-1`}>{stat.val}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* 3. MODULE BLOCKS GRID */}
            <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Management Console</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { key: 'OPERATIONS', icon: '🛡️', label: 'Operations', desc: '5S, HACCP, Shift Config & Standards', bg: 'hover:bg-blue-50/50 hover:border-blue-200', defaultTab: '5S-CONF' },
                        { key: 'PEOPLE', icon: '👥', label: 'People & RBAC', desc: 'Permissions Matrix, Roles & Career', bg: 'hover:bg-orange-50/50 hover:border-orange-200', defaultTab: 'PERMS' },
                        { key: 'PLATFORM', icon: '⚙️', label: 'Platform Engine', desc: 'Feature Flags, Audit Logs & System', bg: 'hover:bg-slate-50 hover:border-slate-300', defaultTab: 'FLAGS' },
                        { key: 'ENTITY', icon: '🏢', label: 'Entity Master', desc: 'Stores, Brands, Structure Management', bg: 'hover:bg-emerald-50/50 hover:border-emerald-200', defaultTab: 'SUMMARY' }
                    ].map(m => (
                        <div
                            key={m.key}
                            onClick={() => { setView(m.key); setSubTab(m.defaultTab); }}
                            className={`bg-white p-5 rounded-xl border border-slate-200 cursor-pointer transition-all group relative overflow-hidden active:scale-[99%] ${m.bg}`}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {m.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-black transition-colors">{m.label}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-500">{m.desc}</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-black transition-all shadow-sm">
                                    <span className="text-[10px] text-slate-300 group-hover:text-black font-bold">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- 1. OPERATIONS PILLAR (Minimalist) ---
    const OperationsView = () => (
        <div className="space-y-4 animate-fade-in">
            {/* Simple Tab Switcher */}
            <div className="flex border-b border-slate-200 mb-2">
                {[
                    { id: '5S-CONF', label: 'Cấu hình 5S' },
                    { id: 'HACCP', label: 'Food Safety (HACCP)' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tight border-b-2 transition-colors ${subTab === tab.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {subTab === '5S-CONF' ? (
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <PageComplianceConfig user={user} storeCode={user?.storeCode || 'STORE01'} />
                </div>
            ) : (
                <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-xl mx-auto mb-2">🚧</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tính năng đang phát triển</div>
                </div>
            )}
        </div>
    );

    // --- 2. PEOPLE PILLAR (Permissions Matrix & Career Logic) ---
    const PeopleView = () => {
        const [careerConfig, setCareerConfig] = useState(null);
        const [pendingRequests, setPendingRequests] = useState([]);
        const [processingReq, setProcessingReq] = useState(null);

        // Config Edit Modal State
        const [showConfigModal, setShowConfigModal] = useState(false);
        const [editConfigForm, setEditConfigForm] = useState({
            position_key: '', label: '', min_hours: 0, required_role: ''
        });
        const [isSavingConfig, setIsSavingConfig] = useState(false);

        useEffect(() => {
            if (subTab === 'CAREER') {
                if (!careerConfig) loadCareerConfig();
                loadPendingRequests();
            }
        }, [subTab]);

        const loadCareerConfig = async () => {
            console.log("Fetching Career Config...");
            try {
                const res = await careerAPI.getConfigs();
                if (res.success) {
                    setCareerConfig(res.data);
                } else {
                    console.error("Failed to load config:", res);
                }
            } catch (err) {
                console.error("Error loading career config:", err);
            }
        };

        const loadPendingRequests = async () => {
            const res = await careerAPI.getPendingRequests();
            if (res.success) setPendingRequests(res.data || []);
        };

        const handleApproval = async (reqId, decision) => {
            setProcessingReq(reqId);
            const res = await careerAPI.approveRequest(reqId, user?.id || 'ADMIN', decision);
            if (res.success) {
                setPendingRequests(prev => prev.filter(r => r.id !== reqId));
                alert(`Successfully ${decision} request!`);
            } else {
                alert('Action failed: ' + res.message);
            }
            setProcessingReq(null);
        };

        // --- Config Management Handlers ---
        const openEditModal = (key, config) => {
            if (config) {
                // Edit Mode
                setEditConfigForm({
                    position_key: key,
                    label: config.label,
                    min_hours: config.min_hours,
                    required_role: config.required_roles[0] || 'STAFF',
                    isEdit: true
                });
            } else {
                // Add Mode
                setEditConfigForm({
                    position_key: '', label: '', min_hours: 100, required_role: 'STAFF', isEdit: false
                });
            }
            setShowConfigModal(true);
        };

        const handleSaveConfig = async () => {
            setIsSavingConfig(true);
            const res = await careerAPI.saveConfig({
                position_key: editConfigForm.position_key,
                label: editConfigForm.label,
                min_hours: parseInt(editConfigForm.min_hours),
                required_role: editConfigForm.required_role
            });

            if (res.success) {
                await loadCareerConfig(); // Reload UI
                setShowConfigModal(false);
                alert('Config saved successfully!');
            } else {
                alert('Error saving config: ' + res.message);
            }
            setIsSavingConfig(false);
        };

        const handleDeleteConfig = async (key) => {
            if (!window.confirm(`Are you sure you want to delete ${key}?`)) return;

            const res = await careerAPI.deleteConfig(key);
            if (res.success) {
                await loadCareerConfig();
            } else {
                alert('Error deleting config: ' + res.message);
            }
        };

        return (
            <div className="space-y-4 animate-fade-in relative">
                {/* Simple Tab Switcher */}
                <div className="flex border-b border-slate-200 mb-4">
                    {[
                        { id: 'PERMS', label: 'Phân quyền (RBAC)' },
                        { id: 'CAREER', label: 'Lộ trình phát triển (Career Path)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tight border-b-2 transition-colors ${subTab === tab.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {subTab === 'PERMS' && (
                    <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                {/* Sticky Header */}
                                <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase min-w-[180px]">Feature / Permission</th>
                                        {['ADMIN', 'IT', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => (
                                            <th key={role} className="w-[50px] px-1 py-2 text-center text-[9px] font-bold text-slate-500 uppercase border-l border-slate-100">{role}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(() => {
                                        if (!data?.permissionMatrix) return null;
                                        const groups = {};
                                        // Group permissions by domain default 'CORE'
                                        data.permissionMatrix.forEach(p => {
                                            const d = p.domain || 'CORE';
                                            if (!groups[d]) groups[d] = [];
                                            groups[d].push(p);
                                        });

                                        const order = ['ADMIN', 'INTELLIGENCE', 'TALENT', 'FINANCIAL', 'CORE'];

                                        return Object.entries(groups)
                                            .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
                                            .map(([domain, items]) => (
                                                <React.Fragment key={domain}>
                                                    {/* Domain Header: Text Only */}
                                                    <tr className="bg-slate-50 border-y border-slate-200">
                                                        <td colSpan={7} className="px-2 py-1 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                                                            {domain}
                                                        </td>
                                                    </tr>
                                                    {/* Permission Rows */}
                                                    {items.map(perm => (
                                                        <tr key={perm.perm_key} className="hover:bg-blue-50/50 transition-colors group">
                                                            <td className="px-2 py-1.5 border-r border-slate-50">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-bold text-slate-700 font-mono leading-none mb-0.5">{perm.perm_key}</span>
                                                                    <span className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]">{perm.description}</span>
                                                                </div>
                                                            </td>
                                                            {['ADMIN', 'IT', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => {
                                                                const access = perm.role_permissions.find(rp => rp.role_code === role)?.can_access;
                                                                return (
                                                                    <td
                                                                        key={role}
                                                                        className="px-0 py-0 text-center border-l border-slate-50 cursor-pointer hover:bg-black/5"
                                                                        onClick={() => togglePerm(role, perm.perm_key, access)}
                                                                    >
                                                                        <div className="h-full w-full flex items-center justify-center py-2">
                                                                            {access ? (
                                                                                <span className="text-blue-600 text-xs font-black">●</span>
                                                                            ) : (
                                                                                <span className="text-slate-200 text-[8px]">•</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {subTab === 'CAREER' && (
                    <div className="space-y-6">
                        {/* 1. PENDING APPROVALS WIDGET */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                    Pending Trainee Approvals ({pendingRequests.length})
                                </h3>
                                <button onClick={loadPendingRequests} className="text-[10px] text-blue-600 font-bold hover:underline">Refresh</button>
                            </div>

                            {pendingRequests.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm font-medium italic">
                                    No pending requests at the moment.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {pendingRequests.map(req => (
                                        <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-slate-800">{req.staffName || 'Unknown Staff'}</span>
                                                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                                        {req.storeId}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    Requesting: <strong className="text-indigo-600">{req.position}</strong> • {new Date(req.timestamp).toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-mono text-slate-400 mt-1">
                                                    Current Hours: {req.currentHours}h
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApproval(req.id, 'REJECTED')}
                                                    disabled={processingReq === req.id}
                                                    className="px-3 py-1.5 text-[9px] font-bold text-rose-600 border border-rose-200 rounded hover:bg-rose-50 transition-colors"
                                                >
                                                    REJECT
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(req.id, 'APPROVED')}
                                                    disabled={processingReq === req.id}
                                                    className="px-3 py-1.5 text-[9px] font-bold text-white bg-emerald-600 border border-emerald-600 rounded hover:bg-emerald-700 transition-colors shadow-sm"
                                                >
                                                    {processingReq === req.id ? '...' : 'APPROVE'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. CAREER CONFIG */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🎓</span>
                                <div>
                                    <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-wide">Career Path Engine Config</h3>
                                    <p className="text-[10px] text-blue-600/70 max-w-2xl">
                                        Hệ thống Dynamic Config. Điều chỉnh Giờ Ấp & Tiêu chí thăng cấp bất cứ lúc nào.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => openEditModal(null, null)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-transform active:scale-95"
                            >
                                + ADD NEW POSITION
                            </button>
                        </div>

                        {careerConfig ? (
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(careerConfig).map(([key, cfg]) => (
                                    <div key={key} className="bg-white border border-slate-200 rounded p-2 flex flex-col hover:border-blue-400 transition-all relative overflow-hidden group h-full">
                                        <div className="flex justify-between items-start mb-1 z-10">
                                            <div className="flex-1 min-w-0 mr-1">
                                                <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate">{key.replace('_TRAINEE', '')}</div>
                                                <h3 className="text-[10px] font-black text-slate-800 uppercase leading-3 line-clamp-2" title={cfg.label}>{cfg.label}</h3>
                                            </div>
                                            <div className="flex -mr-1 -mt-1">
                                                <button onClick={() => openEditModal(key, cfg)} className="text-slate-300 hover:text-blue-600 p-1"><span className="text-[10px]">✎</span></button>
                                                <button onClick={() => handleDeleteConfig(key)} className="text-slate-300 hover:text-rose-500 p-1"><span className="text-[10px]">✕</span></button>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-1 z-10">
                                            <div className="bg-slate-50 px-1.5 py-1 rounded border border-slate-100 flex justify-between items-center">
                                                <span className="text-[7px] font-bold text-slate-500 uppercase">Giờ Ấp</span>
                                                <span className="text-[9px] font-black text-black font-mono">{cfg.min_hours.toLocaleString()}h</span>
                                            </div>
                                            <div className="flex items-center gap-1 overflow-hidden">
                                                <span className="text-[7px] font-bold text-slate-400 uppercase shrink-0">Từ:</span>
                                                <div className="flex gap-0.5 overflow-hidden">
                                                    {cfg.required_roles.map(r => (
                                                        <span key={r} className="text-[7px] font-bold bg-white border border-slate-200 px-1 py-px rounded text-slate-600 truncate">{r}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading Configuration...</div>
                        )}
                    </div>
                )}

                {/* --- CONFIG MODAL --- */}
                {showConfigModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                    {editConfigForm.isEdit ? `Edit: ${editConfigForm.position_key}` : 'Create New Career Path'}
                                </h3>
                                <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-black">✕</button>
                            </div>

                            <div className="p-6 space-y-4">
                                {!editConfigForm.isEdit && (
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Position Key (Unique)</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-slate-200 rounded text-sm font-mono placeholder:text-slate-300 focus:outline-none focus:border-blue-500 uppercase"
                                            placeholder="e.g. MARKETING_TRAINEE"
                                            value={editConfigForm.position_key}
                                            onChange={e => setEditConfigForm({ ...editConfigForm, position_key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Display Label</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Thực tập Marketing"
                                        value={editConfigForm.label}
                                        onChange={e => setEditConfigForm({ ...editConfigForm, label: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Min Hours</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                                            value={editConfigForm.min_hours}
                                            onChange={e => setEditConfigForm({ ...editConfigForm, min_hours: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Required From Role</label>
                                        <select
                                            className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500"
                                            value={editConfigForm.required_role}
                                            onChange={e => setEditConfigForm({ ...editConfigForm, required_role: e.target.value })}
                                        >
                                            <option value="STAFF">STAFF</option>
                                            <option value="CASHIER">CASHIER</option>
                                            <option value="LEADER">LEADER</option>
                                            <option value="SM">SM</option>
                                            <option value="AM">AM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    onClick={() => setShowConfigModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={isSavingConfig}
                                    className="bg-black text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                    {isSavingConfig ? 'Saving...' : 'SAVE CHANGES'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- 3. PLATFORM PILLAR (Minimalist) ---
    const PlatformView = () => (
        <div className="space-y-2 animate-fade-in">
            {/* Simple Tab Switcher */}
            <div className="flex border-b border-slate-200 mb-2">
                {[
                    { id: 'FLAGS', label: 'Tính năng (Flags)' },
                    { id: 'AUDIT', label: 'Nhật ký (Audit)' },
                    { id: 'LAB', label: 'Lab Alpha' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tight border-b-2 transition-colors ${subTab === tab.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {subTab === 'FLAGS' && (
                <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase min-w-[200px]">Feature Key / Config</th>
                                    <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-[150px]">Targeting</th>
                                    <th className="px-3 py-2 text-center text-[9px] font-bold text-slate-500 uppercase w-[60px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(() => {
                                    const groups = {};
                                    (data?.featureFlags || []).filter(f => f.domain !== 'LAB').forEach(f => {
                                        const d = f.domain || 'CORE';
                                        if (!groups[d]) groups[d] = [];
                                        groups[d].push(f);
                                    });

                                    const order = ['ADMIN', 'INTELLIGENCE', 'TALENT', 'FINANCIAL', 'CORE'];
                                    return Object.entries(groups).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])).map(([domain, flags]) => (
                                        <React.Fragment key={domain}>
                                            <tr className="bg-slate-50 border-y border-slate-200">
                                                <td colSpan={3} className="px-3 py-1 text-[9px] font-black text-slate-700 uppercase tracking-widest bg-slate-50">
                                                    {domain}
                                                </td>
                                            </tr>
                                            {flags.map(flag => (
                                                <tr key={flag.flag_key} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-3 py-2">
                                                        <div className="text-[10px] font-bold text-slate-800 font-mono">{flag.flag_key}</div>
                                                        <div className="text-[9px] text-slate-500 truncate max-w-[300px]">{flag.description}</div>
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-dashed border-slate-300 text-[9px] py-1 text-slate-600 focus:outline-none focus:border-blue-500 placeholder-slate-300 font-mono"
                                                            defaultValue={(flag.target_stores || []).join(', ')}
                                                            onBlur={(e) => updateTargeting(flag.flag_key, e.target.value)}
                                                            placeholder="Global (All)"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            onClick={() => toggleFlag(flag.flag_key, flag.is_enabled)}
                                                            className={`w-8 h-4 rounded-full relative transition-all ${flag.is_enabled ? 'bg-black' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${flag.is_enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {subTab === 'AUDIT' && (
                <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md">
                    <table className="w-full text-left text-[9px] border-collapse">
                        <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-500 font-bold uppercase">
                            <tr><th className="px-3 py-2">Time</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Detail</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-3 py-2 font-bold text-slate-700">{log.action}</td>
                                    <td className="px-3 py-2 text-slate-500 truncate max-w-[200px]">{JSON.stringify(log.new_value || log.details)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'LAB' && (
                <div className="space-y-4">
                    {/* SANDBOX TESTER - ADMIN/IT/TESTER ONLY */}
                    {['ADMIN', 'IT', 'TESTER'].includes(user?.role) && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🧪</span>
                                <div>
                                    <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-wide">Sandbox Tester</h3>
                                    <p className="text-[9px] text-amber-600/70">Môi trường test an toàn (Virtual Store: TM_TEST)</p>
                                </div>
                            </div>
                            <SandboxToggle user={user} />
                        </div>
                    )}

                    {/* LAB FEATURES */}
                    <div className="grid grid-cols-2 gap-2">
                        {(data?.featureFlags || []).filter(f => f.domain === 'LAB').map(lab => (
                            <div key={lab.flag_key} onClick={() => toggleFlag(lab.flag_key, lab.is_enabled)} className="bg-white border border-slate-200 p-3 rounded-md cursor-pointer hover:border-black transition-colors flex items-center justify-between group">
                                <div>
                                    <div className="text-[10px] font-bold font-mono text-slate-800">{lab.flag_key.replace('LAB_', '')}</div>
                                    <div className="text-[9px] text-slate-400">{lab.description}</div>
                                </div>
                                <div className={`w-3 h-3 rounded-full border ${lab.is_enabled ? 'bg-black border-black' : 'bg-transparent border-slate-300'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // --- 4. ENTITY PILLAR (Minimalist) ---
    const EntityView = () => (
        <div className="space-y-4 animate-fade-in">
            {/* Simple Tab Switcher */}
            <div className="flex border-b border-slate-200 mb-2">
                {[
                    { id: 'SUMMARY', label: 'Tổng quan (Summary)' },
                    { id: 'SETUP', label: 'Cấu hình (Setup)' },
                    { id: 'STORES', label: 'Cửa hàng (Master Data)' },
                    { id: 'BRANDS', label: 'Nhãn hàng (Brands)' },
                    { id: 'TENANTS', label: 'Pháp nhân (Tenants)' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tight border-b-2 transition-colors ${subTab === tab.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {subTab === 'SUMMARY' && (
                <div className="space-y-6">
                    {/* DATA GRID: ENTITY METRICS */}
                    <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                                <tr>
                                    <th className="px-3 py-2 w-[50px]">Icon</th>
                                    <th className="px-3 py-2">Entity Type</th>
                                    <th className="px-3 py-2 text-right">Count</th>
                                    <th className="px-3 py-2 text-center w-[100px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[10px]">
                                {[
                                    { label: 'Pháp Nhân (Tenants)', val: summary?.tenants || 0, icon: '🏛️' },
                                    { label: 'Nhãn Hàng (Brands)', val: summary?.brands || 0, icon: '🏷️' },
                                    { label: 'Thương Hiệu (Stores)', val: summary?.stores || 0, icon: '🏢' },
                                    { label: 'Nhân Sự (Staff)', val: summary?.staff || 0, icon: '👥' }
                                ].map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                        <td className="px-3 py-2 text-center text-sm">{item.icon}</td>
                                        <td className="px-3 py-2 font-bold text-slate-700 uppercase">{item.label}</td>
                                        <td className="px-3 py-2 text-right font-mono font-black text-slate-900">{item.val}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SYSTEM HEALTH: COMPACT ROW */}
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100/50 text-emerald-600 rounded-lg flex items-center justify-center font-bold animate-pulse">⚡</div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-700 uppercase">System Status</h4>
                                <p className="text-[9px] text-slate-400 font-bold">All services operational</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono font-black text-slate-800 tracking-tighter">99.9%</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">Uptime</div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'SETUP' && (
                <div className="animate-in fade-in duration-500">
                    <PageStoreSetup user={user} onBack={() => setView('HUB')} />
                </div>
            )}

            {/* STORES TABLE */}
            {subTab === 'STORES' && (
                <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md animate-in fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                            <tr>
                                <th className="px-4 py-2">Code</th>
                                <th className="px-4 py-2">Store Name</th>
                                <th className="px-4 py-2">Region</th>
                                <th className="px-4 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px]">
                            {entityData.stores.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No stores data found.</td></tr>
                            )}
                            {entityData.stores.map((store) => (
                                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-2 font-mono font-bold text-slate-700">{store.store_code}</td>
                                    <td className="px-4 py-2 font-bold text-slate-800">{store.store_name}</td>
                                    <td className="px-4 py-2 text-slate-500">{store.region || 'N/A'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black ${store.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {store.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* BRANDS TABLE */}
            {subTab === 'BRANDS' && (
                <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md animate-in fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Brand Name</th>
                                <th className="px-4 py-2 text-center">Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px]">
                            {entityData.brands.length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">No brands data found.</td></tr>
                            )}
                            {entityData.brands.map((brand) => (
                                <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-2 font-mono font-bold text-slate-700">{brand.brand_id}</td>
                                    <td className="px-4 py-2 font-bold text-slate-800">{brand.brand_name}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TENANTS TABLE */}
            {subTab === 'TENANTS' && (
                <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md animate-in fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                            <tr>
                                <th className="px-4 py-2">Tenant ID</th>
                                <th className="px-4 py-2">Tenant Name</th>
                                <th className="px-4 py-2">Domain</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px]">
                            {entityData.tenants.length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">No tenants data found.</td></tr>
                            )}
                            {entityData.tenants.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-2 font-mono font-bold text-slate-700">{t.tenant_id}</td>
                                    <td className="px-4 py-2 font-bold text-slate-800">{t.tenant_name}</td>
                                    <td className="px-4 py-2 text-slate-500 font-mono italic">{t.domain || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans fade-in">
            {/* HEADER & CONTROLS */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-100 px-3 py-3 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {view !== 'HUB' && (
                            <button onClick={() => { setView('HUB'); setSubTab(null); }} className="text-slate-400 hover:text-blue-600 transition-colors">
                                <span className="text-lg">←</span>
                            </button>
                        )}
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            {view === 'HUB' ? 'ADMIN CONSOLE' : view}
                        </h1>
                    </div>
                    <button onClick={onBack} className="text-sm text-slate-500 font-bold">Thoát</button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="p-3 relative z-0">
                {view === 'HUB' && <HubView />}
                {view === 'OPERATIONS' && <OperationsView />}
                {view === 'PEOPLE' && <PeopleView />}
                {view === 'PLATFORM' && <PlatformView />}
                {view === 'ENTITY' && <EntityView />}
            </div>
        </div>
    );
};

export default PageAdminConsole;
