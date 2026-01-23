import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';

const PageAdminConsole = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('flags'); // 'flags' | 'perms' | 'audit'
    const [data, setData] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await adminAPI.getConsoleData();
            if (res.success) setData(res.data);

            // Allow failing audit logs without breaking the page
            try {
                const logsRes = await adminAPI.getAuditLogs();
                if (logsRes.success) setAuditLogs(logsRes.data || []);
            } catch (err) {
                console.warn('Failed to load audit logs', err);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to load Admin Console');
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (flagKey, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await adminAPI.updateConfig('FEATURE_FLAG', { key: flagKey, enabled: newStatus });
            // Optimistic update
            setData(prev => ({
                ...prev,
                featureFlags: prev.featureFlags.map(f =>
                    f.flag_key === flagKey ? { ...f, is_enabled: newStatus } : f
                )
            }));
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    const togglePerm = async (roleCode, permKey, currentAccess) => {
        try {
            const newAccess = !currentAccess;
            await adminAPI.updateConfig('PERMISSION', { roleCode, permKey, canAccess: newAccess });
            // Re-fetch entire matrix to ensure consistency or implement complex optimistic update
            loadData();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    if (loading) return <div className="p-4 text-sm">Loading Admin Console...</div>;
    if (!data) return <div className="p-4 text-red-500 text-sm">Error loading data</div>;

    return (
        <div className="p-2 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm">
                    ← Back
                </button>
                <h1 className="text-lg font-bold text-gray-800">Admin Console 🛡️</h1>
            </div>

            {/* TABS */}
            <div className="flex w-full border-b border-gray-200 mb-4">
                <button
                    onClick={() => setActiveTab('flags')}
                    className={`flex-1 pb-2 pt-1 px-2 text-sm font-semibold text-center ${activeTab === 'flags' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Feature Flags (IT)
                </button>
                <button
                    onClick={() => setActiveTab('perms')}
                    className={`flex-1 pb-2 pt-1 px-2 text-sm font-semibold text-center ${activeTab === 'perms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Permission Matrix (Ops)
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex-1 pb-2 pt-1 px-2 text-sm font-semibold text-center ${activeTab === 'audit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Audit Logs 📜
                </button>
            </div>

            {/* FEATURE FLAGS TAB */}
            {activeTab === 'flags' && (
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Feature Key</th>
                                <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Description</th>
                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(() => {
                                // 1. Define Grouping Logic
                                const getGroup = (flagKey) => {
                                    if (flagKey.includes('DASHBOARD')) return 'Dashboard & Analytics';
                                    if (['MODULE_CAREER', 'MODULE_GAMIFICATION'].includes(flagKey)) return 'Advanced Features (Gamification & Career)';
                                    if (flagKey.startsWith('MODULE_')) return 'Daily Operations (Functional)';
                                    if (flagKey.startsWith('ADMIN_')) return 'System Administration';
                                    if (flagKey.startsWith('OPS_')) return 'Store Operations';
                                    return 'Other Features';
                                };

                                // 2. Define Group Order Priority
                                const groupOrder = {
                                    'System Administration': 1,
                                    'Dashboard & Analytics': 2,
                                    'Daily Operations (Functional)': 3,
                                    'Store Operations': 4,
                                    'Advanced Features (Gamification & Career)': 5,
                                    'Other Features': 99
                                };

                                // 3. Sort flags by Group Priority -> then by Key
                                const sortedFlags = [...(data.featureFlags || [])].sort((a, b) => {
                                    const groupA = getGroup(a.flag_key);
                                    const groupB = getGroup(b.flag_key);

                                    // Compare Groups First
                                    if (groupOrder[groupA] !== groupOrder[groupB]) {
                                        return groupOrder[groupA] - groupOrder[groupB];
                                    }
                                    // Compare Keys Second
                                    return a.flag_key.localeCompare(b.flag_key);
                                });

                                const rows = [];
                                sortedFlags.forEach((flag, index) => {
                                    const groupName = getGroup(flag.flag_key);
                                    const prevFlag = index > 0 ? sortedFlags[index - 1] : null;
                                    const prevGroup = prevFlag ? getGroup(prevFlag.flag_key) : null;

                                    // Render Group Header if changed
                                    if (groupName !== prevGroup) {
                                        let groupColorClass = "bg-gray-100 text-gray-600";
                                        if (groupName.includes('Dashboard')) groupColorClass = "bg-blue-50 text-blue-700";
                                        if (groupName.includes('Advanced')) groupColorClass = "bg-purple-50 text-purple-700";
                                        if (groupName.includes('Daily')) groupColorClass = "bg-green-50 text-green-700";

                                        rows.push(
                                            <tr key={`header-${groupName}`} className={`border-y border-gray-200 ${groupColorClass}`}>
                                                <td colSpan={4} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                                                    {groupName}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    rows.push(
                                        <tr key={flag.flag_key} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-mono text-xs text-gray-800 font-bold">{flag.flag_key}</td>
                                            <td className="px-3 py-2 text-xs text-gray-600">{flag.description}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${flag.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {flag.is_enabled ? 'ACTIVE' : 'OFF'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={flag.is_enabled}
                                                        onChange={() => toggleFlag(flag.flag_key, flag.is_enabled)}
                                                    />
                                                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                });
                                return rows;
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PERMISSIONS MATRIX TAB */}
            {activeTab === 'perms' && (
                <div className="bg-white rounded-lg shadow overflow-auto border border-gray-200 max-h-[70vh]">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                            <tr>
                                <th className="px-2 py-2 border-b border-r text-[10px] font-bold text-gray-500 uppercase sticky left-0 bg-gray-50 z-30 min-w-[120px]">
                                    Permission
                                </th>
                                {['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => (
                                    <th key={role} className="px-1 py-2 text-center border-b min-w-[50px] text-[10px] font-bold text-gray-500 uppercase">
                                        {role}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Visual Grouping Helper */}
                            {(() => {
                                const rows = [];
                                data.permissionMatrix?.forEach((perm, index) => {
                                    // Simple grouper based on key prefix
                                    const groupMap = {
                                        'VIEW': 'System Access',
                                        'SUBMIT': 'Submission Actions',
                                        'APPROVE': 'Approval Actions',
                                        'MANAGE': 'Management',
                                        'MODULE': 'Module Access'
                                    };
                                    const prefix = perm.perm_key.split('_')[0];
                                    const groupName = groupMap[prefix] || 'Other Permissions';

                                    const prevPerm = index > 0 ? data.permissionMatrix[index - 1] : null;
                                    const prevPrefix = prevPerm ? prevPerm.perm_key.split('_')[0] : null;
                                    const prevGroup = prevPrefix ? (groupMap[prevPrefix] || 'Other Permissions') : null;

                                    if (groupName !== prevGroup) {
                                        rows.push(
                                            <tr key={`header-${groupName}`} className="bg-gray-100 border-y border-gray-200">
                                                <td colSpan={6} className="px-3 py-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider sticky left-0 z-10 bg-gray-100">
                                                    {groupName}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    rows.push(
                                        <tr key={perm.perm_key} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5 border-r sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                <div className="font-bold text-[11px] text-gray-800 leading-tight">{perm.perm_key}</div>
                                                <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">{perm.description}</div>
                                            </td>
                                            {['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => {
                                                const access = perm.role_permissions.find(rp => rp.role_code === role)?.can_access || false;
                                                return (
                                                    <td key={role} className="px-1 py-1.5 text-center border-l border-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                            checked={access}
                                                            onChange={() => togglePerm(role, perm.perm_key, access)}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                });
                                return rows;
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'audit' && (
                <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col max-h-[75vh]">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Recent System Activities</h3>
                        <span className="text-[10px] text-gray-400">Last 100 records</span>
                    </div>
                    <div className="overflow-auto flex-1 relative">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap sticky left-0 z-40 bg-gray-50 border-r border-gray-200 min-w-[140px]">
                                        Time
                                    </th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Actor</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Action</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Target</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase min-w-[200px]">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap font-mono sticky left-0 bg-white border-r border-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                {new Date(log.created_at).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-4 py-2 text-xs text-gray-700 font-medium whitespace-nowrap">
                                                {log.actor_id ? (log.actor_id.substring(0, 8) + '...') : 'SYSTEM'}
                                            </td>
                                            <td className="px-4 py-2 text-xs">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold border border-gray-200">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                                                <div className="font-bold">{log.resource_type}</div>
                                                <div className="text-[10px] text-gray-400">{log.resource_id}</div>
                                            </td>
                                            <td className="px-4 py-2 text-[10px] text-gray-500 font-mono break-all leading-tight">
                                                {log.new_value ? (
                                                    <div className="max-h-[60px] overflow-auto">
                                                        {JSON.stringify(log.new_value)}
                                                    </div>
                                                ) : '-'}
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
    );
};

export default PageAdminConsole;
