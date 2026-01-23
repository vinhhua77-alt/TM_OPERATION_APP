import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';

const PageAdminConsole = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('flags'); // 'flags' | 'perms'
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await adminAPI.getConsoleData();
            if (res.success) setData(res.data);
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
            // Optimistic update logic for complex nested structure is tricky, re-fetch for simplicity or deep clone
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
            <div className="flex gap-4 mb-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('flags')}
                    className={`pb-2 px-3 text-sm font-semibold ${activeTab === 'flags' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Feature Flags (IT)
                </button>
                <button
                    onClick={() => setActiveTab('perms')}
                    className={`pb-2 px-3 text-sm font-semibold ${activeTab === 'perms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Permission Matrix (Ops)
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
                            {data.featureFlags?.map(flag => (
                                <tr key={flag.flag_key} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-mono text-xs text-purple-700 font-bold">{flag.flag_key}</td>
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
                            ))}
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
        </div>
    );
};

export default PageAdminConsole;
