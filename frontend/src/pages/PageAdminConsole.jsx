import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';

const PageAdminConsole = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'flags' | 'perms' | 'audit'
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
            // alert('Failed to load Admin Console');
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    const tabs = [
        { id: 'summary', label: 'TỔNG QUAN', icon: '📊' },
        { id: 'flags', label: 'KĨ THUẬT (IT)', icon: '🛠️' },
        { id: 'perms', label: 'VẬN HÀNH (OPS)', icon: '🛡️' },
        { id: 'audit', label: 'TRUY VẾT', icon: '📜' }
    ];

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
                {/* TAB SELECTOR (Modern Glass) */}
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
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-2xl font-black text-slate-800 lining-nums">{stat.val}</div>
                                </div>
                            ))}

                            {/* Health Card Standard */}
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
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Uptime</div>
                                            <div className="text-white font-mono text-2xl font-black">99.99%</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</div>
                                            <div className="text-emerald-400 font-mono text-2xl font-black">28ms</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. FEATURE FLAGS (IT) */}
                    {activeTab === 'flags' && (
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-slate-800 text-sm font-black uppercase tracking-tight">Cấu hình Tính năng (Feature Flags)</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bật/Tắt module hệ thống theo thời gian thực</p>
                                </div>
                                <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-full uppercase">Total: {data?.featureFlags?.length || 0}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {(() => {
                                    const getGroup = (f) => {
                                        if (f.includes('DASHBOARD')) return 'Dashboard & Analytics';
                                        if (['MODULE_CAREER', 'MODULE_GAMIFICATION'].includes(f)) return 'Premium Extensions';
                                        return 'Core Operations';
                                    };
                                    const sortedFlags = [...(data?.featureFlags || [])].sort((a, b) => getGroup(a.flag_key).localeCompare(getGroup(b.flag_key)));

                                    return sortedFlags.map((flag, idx) => {
                                        const group = getGroup(flag.flag_key);
                                        const showGroup = idx === 0 || getGroup(sortedFlags[idx - 1].flag_key) !== group;

                                        return (
                                            <React.Fragment key={flag.flag_key}>
                                                {showGroup && (
                                                    <div className="px-6 py-2 bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                                        {group}
                                                    </div>
                                                )}
                                                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
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
                                            </React.Fragment>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* 3. PERMISSION MATRIX (OPS) - STANDARD IMAGE STYLE */}
                    {activeTab === 'perms' && (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="bg-[#f8f9fa] border-b border-slate-200">
                                        <tr>
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 min-w-[200px]">PERMISSION</th>
                                            {['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => (
                                                <th key={role} className="w-[56px] px-1 py-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-r-0">{role}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(() => {
                                            if (!data?.permissionMatrix) return null;

                                            const groupMapping = {
                                                'SYSTEM': 'HỆ THỐNG (IT ADMIN)',
                                                'MANAGEMENT': 'THIẾT LẬP CỬA HÀNG',
                                                'VIEW': 'TRUY CẬP (DASHBOARD)',
                                                'SUBMIT': 'TÁC VỤ VẬN HÀNH',
                                                'APPROVE': 'PHÊ DUYỆT & KIỂM SOÁT'
                                            };

                                            const groups = {
                                                'SYSTEM': [],
                                                'MANAGEMENT': [],
                                                'VIEW': [],
                                                'SUBMIT': [],
                                                'APPROVE': []
                                            };

                                            data.permissionMatrix.forEach(p => {
                                                const group = p.module || 'OTHER';
                                                if (groups[group]) groups[group].push(p);
                                                else {
                                                    if (!groups['OTHER']) groups['OTHER'] = [];
                                                    groups['OTHER'].push(p);
                                                }
                                            });

                                            return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([groupName, items]) => (
                                                <React.Fragment key={groupName}>
                                                    <tr className="bg-[#f0f2f5] border-y border-slate-200">
                                                        <td colSpan={6} className="px-3 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                            {groupMapping[groupName] || groupName}
                                                        </td>
                                                    </tr>
                                                    {items.map(perm => (
                                                        <tr key={perm.perm_key} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                                                            <td className="px-3 py-1.5 border-r border-slate-50">
                                                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-tight">{perm.perm_key}</div>
                                                                <div className="text-[9px] font-medium text-slate-400 leading-tight mt-0.5">{perm.description}</div>
                                                            </td>
                                                            {['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => {
                                                                const access = perm.role_permissions.find(rp => rp.role_code === role)?.can_access;
                                                                return (
                                                                    <td key={role} className="px-0 py-1.5 text-center border-r border-slate-50 last:border-r-0">
                                                                        <button
                                                                            onClick={() => togglePerm(role, perm.perm_key, access)}
                                                                            className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center mx-auto ${access
                                                                                ? 'bg-[#007bff] border-[#007bff] text-white shadow-sm'
                                                                                : 'bg-white border-slate-300'
                                                                                }`}
                                                                        >
                                                                            {access && <span className="text-[9px] font-bold">✓</span>}
                                                                        </button>
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

                    {/* 4. AUDIT LOGS (Tackking) */}
                    {activeTab === 'audit' && (
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-slate-800 text-sm font-black uppercase tracking-tight">Nhật ký Truy vết hệ thống</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theo dõi hành động của người dùng thời gian thực</p>
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
                                            <th className="px-6 py-3 whitespace-nowrap">Thông tin chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {auditLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <div className="text-slate-300 text-xs font-bold uppercase tracking-widest">Chưa có bản ghi nào</div>
                                                    <div className="text-[10px] text-slate-400 mt-1">Hệ thống sẽ tự động ghi lại các hành động thay đổi cấu hình</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            auditLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-[10px] font-mono font-bold text-slate-500">{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 capitalize">
                                                                {((log.actor_id || 'SYS').charAt(0))}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 font-mono">{(log.actor_id || 'SYSTEM').substring(0, 8)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase ${log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 pr-10">
                                                        <div className="text-[9px] font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono line-clamp-2 max-w-sm">
                                                            {JSON.stringify(log.new_value || log.details || {})}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageAdminConsole;
