import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';

const PageAdminConsole = () => {
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

    if (loading) return <div className="p-4">Loading Admin Console...</div>;
    if (!data) return <div className="p-4 text-red-500">Error loading data</div>;

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Console 🛡️</h1>

            {/* TABS */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('flags')}
                    className={`pb-2 px-4 font-semibold ${activeTab === 'flags' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Feature Flags (IT)
                </button>
                <button
                    onClick={() => setActiveTab('perms')}
                    className={`pb-2 px-4 font-semibold ${activeTab === 'perms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Permission Matrix (Ops)
                </button>
            </div>

            {/* FEATURE FLAGS TAB */}
            {activeTab === 'flags' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">Feature Key</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.featureFlags?.map(flag => (
                                <tr key={flag.flag_key} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-mono text-sm text-purple-700 font-bold">{flag.flag_key}</td>
                                    <td className="p-4 text-gray-600">{flag.description}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${flag.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {flag.is_enabled ? 'ACTIVE' : 'OFF'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={flag.is_enabled}
                                                onChange={() => toggleFlag(flag.flag_key, flag.is_enabled)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                <div className="bg-white rounded-lg shadow overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 border-b border-r">Permission / Role</th>
                                {['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => (
                                    <th key={role} className="p-4 text-center border-b min-w-[80px]">{role}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.permissionMatrix?.map(perm => (
                                <tr key={perm.perm_key} className="hover:bg-gray-50">
                                    <td className="p-4 border-r border-b">
                                        <div className="font-bold text-gray-800">{perm.perm_key}</div>
                                        <div className="text-xs text-gray-500">{perm.description}</div>
                                    </td>
                                    {['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => {
                                        // Find access status
                                        const access = perm.role_permissions.find(rp => rp.role_code === role)?.can_access || false;
                                        return (
                                            <td key={role} className="p-4 text-center border-b border-l border-gray-100">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                    checked={access}
                                                    onChange={() => togglePerm(role, perm.perm_key, access)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PageAdminConsole;
