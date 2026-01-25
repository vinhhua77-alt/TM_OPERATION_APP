import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';

const PageAdminConsole = ({ user, initialTab = 'summary', onBack }) => {
    const [activeTab, setActiveTab] = useState(initialTab); // 'summary' | 'flags' | 'perms' | 'audit' | 'lab'
    const [summary, setSummary] = useState(null);
    const [data, setData] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, consoleRes, logsRes] = await Promise.all([
                adminAPI.getSummary().catch(() => ({ success: false })),
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

    const toggleFlag = async (flagKey, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await adminAPI.updateConfig('FEATURE_FLAG', { key: flagKey, enabled: newStatus });
            loadData();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    const togglePerm = async (roleCode, permKey, currentAccess) => {
        try {
            const newAccess = !currentAccess;
            await adminAPI.updateConfig('PERMISSION', { roleCode, permKey, canAccess: newAccess });
            loadData();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    const updateTargeting = async (flagKey, storesString) => {
        try {
            const targetStores = storesString.split(',').map(s => s.trim()).filter(s => s !== '');
            await adminAPI.updateConfig('TARGETING', { key: flagKey, targetStores });
            loadData();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    const allTabs = [
        { id: 'summary', label: 'TỔNG QUAN', icon: '📊' },
        { id: 'flags', label: 'KĨ THUẬT (IT)', icon: '🛠️' },
        { id: 'perms', label: 'PHÂN QUYỀN (RBAC)', icon: '🛡️' },
        { id: 'audit', label: 'TRUY VẾT', icon: '📜' },
        { id: 'lab', label: 'LAB FEATURES', icon: '🧬', roles: ['ADMIN', 'IT'] }
    ];

    const tabs = allTabs.filter(t => !t.roles || t.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* FRAMEWORK HEADER (STANDARD V8) */}
            <div className="bg-blue-600 pt-10 pb-16 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all border border-white/30"
                    >
                        <span className="text-xl">←</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Trung Tâm Quản Trị</h1>
                        <p className="text-[10px] font-bold text-blue-100 tracking-widest uppercase opacity-80">Admin Management Console</p>
                    </div>
                </div>

                {/* Floating Icon Standard */}
                <div className="absolute -bottom-6 left-10 w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl border border-slate-50 z-20">
                    🛡️
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-30 space-y-6">
                {/* TAB SELECTOR */}
                <div className="flex bg-white/80 backdrop-blur-xl p-1.5 rounded-3xl border border-white shadow-xl gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-500 ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            <span className="text-lg mb-1">{tab.icon}</span>
                            <span className="text-[8px] font-black tracking-widest uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* CONTENT SECTIONS */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* 1. SUMMARY TAB */}
                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Pháp Nhân', val: summary?.tenants || 0, icon: '🏛️', color: 'from-blue-600 to-indigo-600' },
                                { label: 'Thương Hiệu', val: summary?.brands || 0, icon: '🏷️', color: 'from-rose-600 to-pink-600' },
                                { label: 'Chi Nhánh', val: summary?.stores || 0, icon: '🏢', color: 'from-emerald-600 to-teal-600' },
                                { label: 'Nhân Sự', val: summary?.staff || 0, icon: '👥', color: 'from-amber-600 to-orange-600' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                                        <span className="text-lg">{stat.icon}</span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-2xl font-black text-slate-800 lining-nums">{stat.val}</div>
                                </div>
                            ))}

                            <div className="col-span-2 bg-slate-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div className="relative z-10">
                                    <h3 className="text-white text-base font-black tracking-tight mb-2 uppercase flex items-center gap-2">
                                        Trạng thái hệ thống
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </h3>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed mb-6">Real-time Infrastructure Monitoring</p>
                                    <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uptime Status</div>
                                            <div className="text-white font-mono text-2xl font-black">99.99%</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Latency</div>
                                            <div className="text-emerald-400 font-mono text-2xl font-black">28ms</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. FEATURE FLAGS */}
                    {activeTab === 'flags' && (
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-slate-900 text-[13px] font-black uppercase tracking-tight">Cấu hình Tính năng (Feature Flags)</h3>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bật/Tắt module hệ thống Realtime</p>
                                </div>
                                <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full uppercase">Total: {data?.featureFlags?.length || 0}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {(() => {
                                    const domainConfigs = {
                                        'CORE': { name: 'Vận hành Cốt lõi (Core)', color: 'from-blue-600 to-blue-700', border: 'border-blue-800', icon: '⚡' },
                                        'INTELLIGENCE': { name: 'Hệ thống Thông minh (Engine V3)', color: 'from-indigo-600 to-purple-700', border: 'border-indigo-800', icon: '🧠' },
                                        'FINANCIAL': { name: 'Tài chính & Kết quả (Outcome)', color: 'from-emerald-600 to-teal-700', border: 'border-emerald-800', icon: '💰' },
                                        'TALENT': { name: 'Con người & Phát triển', color: 'from-orange-500 to-amber-600', border: 'border-orange-700', icon: '🔥' },
                                        'ADMIN': { name: 'Quản trị & Bảo mật', color: 'from-slate-800 to-slate-900', border: 'border-slate-950', icon: '🛡️' },
                                        'LAB': { name: 'Thử nghiệm (Lab)', color: 'from-rose-500 to-pink-600', border: 'border-rose-700', icon: '🧬' }
                                    };

                                    const allFlags = (data?.featureFlags || []).filter(f => f.domain !== 'LAB');
                                    const sortedFlags = [...allFlags].sort((a, b) => {
                                        const order = ['ADMIN', 'INTELLIGENCE', 'TALENT', 'FINANCIAL', 'CORE'];
                                        return order.indexOf(a.domain) - order.indexOf(b.domain);
                                    });

                                    return sortedFlags.map((flag, idx) => {
                                        const domain = flag.domain || 'CORE';
                                        const config = domainConfigs[domain] || domainConfigs['CORE'];
                                        const showGroup = idx === 0 || sortedFlags[idx - 1].domain !== domain;

                                        return (
                                            <React.Fragment key={flag.flag_key}>
                                                {showGroup && (
                                                    <div className={`px-6 py-3 bg-gradient-to-r ${config.color} text-[10px] font-black text-white uppercase tracking-[0.15em] border-b ${config.border} flex items-center gap-2 shadow-inner`}>
                                                        <span className="text-sm">{config.icon}</span>
                                                        {config.name}
                                                    </div>
                                                )}
                                                <div className="px-6 py-4 space-y-3 hover:bg-slate-50/50 transition-all group border-l-4 border-transparent hover:border-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="text-[11px] font-black text-slate-800 mb-1 flex items-center gap-2">
                                                                {flag.flag_key}
                                                                {flag.is_enabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                                            </div>
                                                            <div className="text-[10px] font-medium text-slate-400 leading-snug">{flag.description}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleFlag(flag.flag_key, flag.is_enabled)}
                                                            className={`relative w-11 h-6 transition-all duration-300 rounded-full border-2 ${flag.is_enabled ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-200'
                                                                }`}
                                                        >
                                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${flag.is_enabled ? 'left-[22px]' : 'left-0.5'
                                                                }`}></div>
                                                        </button>
                                                    </div>

                                                    {/* [CANARY ROLLOUT] STORE TARGETING */}
                                                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-3">
                                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter w-20">🎯 Targeting:</div>
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-700 focus:outline-none focus:border-blue-400"
                                                            placeholder="ALL (Leave empty) or 'TH, VN, ...'"
                                                            defaultValue={(flag.target_stores || []).join(', ')}
                                                            onBlur={(e) => updateTargeting(flag.flag_key, e.target.value)}
                                                        />
                                                        {(flag.target_stores || []).length > 0 && (
                                                            <span className="text-[7px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase">Canary</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* 3. PERMISSION MATRIX */}
                    {activeTab === 'perms' && (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-1.5 text-[8.5px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 min-w-[140px] bg-[#f8f9fa]">PERMISSION</th>
                                            {['ADMIN', 'IT', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => (
                                                <th key={role} className="w-[48px] px-0.5 py-1.5 text-center text-[8.5px] font-black text-slate-400 uppercase tracking-tighter border-r border-slate-100 last:border-r-0">{role}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(() => {
                                            if (!data?.permissionMatrix) return null;
                                            const domainConfigs = {
                                                'CORE': { name: 'Vận hành Cốt lõi (Core)', color: 'from-blue-600 to-blue-700', border: 'border-blue-800', icon: '⚡' },
                                                'INTELLIGENCE': { name: 'Hệ thống Thông minh (Engine V3)', color: 'from-indigo-600 to-purple-700', border: 'border-indigo-800', icon: '🧠' },
                                                'FINANCIAL': { name: 'Tài chính & Kết quả (Outcome)', color: 'from-emerald-600 to-teal-700', border: 'border-emerald-800', icon: '💰' },
                                                'TALENT': { name: 'Con người & Phát triển', color: 'from-orange-500 to-amber-600', border: 'border-orange-700', icon: '🔥' },
                                                'ADMIN': { name: 'Quản trị & Bảo mật', color: 'from-slate-800 to-slate-900', border: 'border-slate-950', icon: '🛡️' },
                                                'LAB': { name: 'Thử nghiệm (Lab)', color: 'from-rose-500 to-pink-600', border: 'border-rose-700', icon: '🧬' }
                                            };

                                            const groups = {};
                                            data.permissionMatrix.forEach(p => {
                                                const d = p.domain || 'CORE';
                                                if (!groups[d]) groups[d] = [];
                                                groups[d].push(p);
                                            });

                                            const order = ['ADMIN', 'INTELLIGENCE', 'TALENT', 'FINANCIAL', 'CORE'];
                                            const sortedGroups = Object.entries(groups).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));

                                            return sortedGroups.map(([domain, items]) => {
                                                const config = domainConfigs[domain] || domainConfigs['CORE'];
                                                return (
                                                    <React.Fragment key={domain}>
                                                        <tr className={`bg-gradient-to-r ${config.color} border-y ${config.border} shadow-inner`}>
                                                            <td colSpan={7} className="px-3 py-2 text-[9px] font-black text-white uppercase tracking-[0.15em] leading-none flex items-center gap-2">
                                                                <span>{config.icon}</span>
                                                                {config.name}
                                                            </td>
                                                        </tr>
                                                        {items.map(perm => (
                                                            <tr key={perm.perm_key} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                                                                <td className="px-3 py-2 border-r border-slate-50">
                                                                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight">{perm.perm_key}</div>
                                                                    <div className="text-[8px] font-bold text-slate-400 leading-tight mt-0.5">{perm.description}</div>
                                                                </td>
                                                                {['ADMIN', 'IT', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => {
                                                                    const access = perm.role_permissions.find(rp => rp.role_code === role)?.can_access;
                                                                    return (
                                                                        <td key={role} className="px-0 py-2 text-center border-r border-slate-50 last:border-r-0">
                                                                            <button
                                                                                onClick={() => togglePerm(role, perm.perm_key, access)}
                                                                                className={`w-3.5 h-3.5 rounded-[4px] border transition-all flex items-center justify-center mx-auto ${access ? 'bg-[#007bff] border-[#007bff] text-white shadow-sm shadow-blue-200' : 'bg-white border-slate-200'}`}
                                                                            >
                                                                                {access && <span className="text-[8px] font-black">✓</span>}
                                                                            </button>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 4. AUDIT LOGS */}
                    {activeTab === 'audit' && (
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animte-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-slate-900 text-base font-black uppercase tracking-tighter">Nhật ký Truy vết hệ thống</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Theo dõi hành động của người dùng thời gian thực</p>
                                </div>
                                <button onClick={loadData} className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl uppercase transition-all">Làm mới</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-6 py-3 whitespace-nowrap">Thời Gian</th>
                                            <th className="px-6 py-3 whitespace-nowrap">Người dùng</th>
                                            <th className="px-6 py-3 whitespace-nowrap">Hành động</th>
                                            <th className="px-6 py-3 whitespace-nowrap">Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {auditLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 uppercase text-[10px] font-bold">Chưa có bản ghi nào</td>
                                            </tr>
                                        ) : (
                                            auditLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                                                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono font-bold text-slate-500">
                                                        {new Date(log.created_at).toLocaleString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-700 font-mono">
                                                        {(log.actor_id || 'SYSTEM').substring(0, 8)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase ${log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 pr-10 text-[9px] font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono line-clamp-2 max-w-sm">
                                                        {JSON.stringify(log.new_value || log.details || {})}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 5. LAB FEATURES */}
                    {activeTab === 'lab' && ['ADMIN', 'IT'].includes(user?.role) && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-white/10">
                                <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl border border-indigo-400/30">🧬</div>
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight uppercase">TM Lab (V3)</h2>
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.3em]">Experimental Sandbox</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-md">
                                        Chào mừng đến với không gian thử nghiệm. Các tính năng dưới đây đang trong quá trình phát triển (Alpha). Vui lòng không kích hoạt diện rộng nếu chưa test kỹ.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {(data?.featureFlags || []).filter(f => f.domain === 'LAB').map(lab => (
                                    <div
                                        key={lab.flag_key}
                                        onClick={() => toggleFlag(lab.flag_key, lab.is_enabled)}
                                        className={`bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all ${!lab.is_enabled ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-indigo-100 rounded-3xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                                                {lab.flag_key.includes('SIMULATOR') ? '🧠' : lab.flag_key.includes('RISK') ? '📡' : lab.flag_key.includes('PREDICTIVE') ? '📈' : '🧪'}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{lab.flag_key.replace('LAB_', '')}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lab.description}</p>
                                            </div>
                                        </div>
                                        <div className={`relative w-11 h-6 transition-all duration-300 rounded-full border-2 ${lab.is_enabled ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${lab.is_enabled ? 'left-[22px]' : 'left-0.5'}`}></div>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-slate-100/50 p-6 rounded-[32px] border border-dashed border-slate-200 flex items-center justify-center opacity-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More experimental features in roadmap...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageAdminConsole;
