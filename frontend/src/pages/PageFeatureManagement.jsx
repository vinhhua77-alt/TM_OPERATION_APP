import React, { useState, useEffect } from 'react';
import { featureFlagAPI } from '../api/featureFlags';
import FAB from '../components/FAB';

/**
 * PAGE FEATURE FLAG MANAGEMENT (v3.0)
 * Allows Admins/CEO to toggle system features in real-time.
 */
const PageFeatureManagement = ({ user, onBack }) => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editFlag, setEditFlag] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [confirmProd, setConfirmProd] = useState('');

    useEffect(() => {
        loadFlags();
    }, []);

    const loadFlags = async () => {
        setLoading(true);
        try {
            const res = await featureFlagAPI.getAdminFlags();
            if (res.success) {
                setFlags(res.data);
            }
        } catch (error) {
            showMessage('Lỗi tải dữ liệu: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleUpdate = async (key, updates, reason) => {
        // Safety Guard: Check for PROD confirmation
        const isProdChange = updates.enabled_env?.includes('production') || updates.enabled === true;
        if (isProdChange && confirmProd !== `CONFIRM PROD ${key}`) {
            showMessage('Vui lòng nhập mã xác nhận PROD chính xác', 'error');
            return;
        }

        try {
            const res = await featureFlagAPI.updateFlag(key, { ...updates, reason });
            if (res.success) {
                showMessage(`Đã cập nhật feature ${key}`, 'success');
                setEditFlag(null);
                setConfirmProd('');
                loadFlags();
            }
        } catch (error) {
            showMessage('Lỗi cập nhật: ' + error.message, 'error');
        }
    };

    const EditModal = () => {
        const [formData, setFormData] = useState({ ...editFlag });
        const [reason, setReason] = useState('');

        const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
            }}>
                <div style={{
                    background: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: '#1F2937' }}>
                        Cấu hình: {editFlag.key}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Enabled Toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} />
                            ENABLED
                        </label>

                        {/* Environments */}
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#6B7280' }}>ENVIRONMENTS</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['staging', 'production'].map(env => (
                                    <button
                                        key={env}
                                        onClick={() => setFormData({ ...formData, enabled_env: toggleArray(formData.enabled_env, env) })}
                                        style={{
                                            padding: '6px 12px', fontSize: '11px', borderRadius: '6px', border: '1px solid #DDD',
                                            background: formData.enabled_env.includes(env) ? '#3B82F6' : 'white',
                                            color: formData.enabled_env.includes(env) ? 'white' : '#374151'
                                        }}
                                    >
                                        {env.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Roles */}
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#6B7280' }}>ROLES</p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {['ADMIN', 'CEO', 'OPS', 'SM', 'LEADER', 'STAFF'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setFormData({ ...formData, enabled_roles: toggleArray(formData.enabled_roles, role) })}
                                        style={{
                                            padding: '4px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #DDD',
                                            background: formData.enabled_roles.includes(role) ? '#10B981' : 'white',
                                            color: formData.enabled_roles.includes(role) ? 'white' : '#374151'
                                        }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rollout % */}
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#6B7280' }}>
                                ROLLOUT PERCENTAGE: {formData.rollout_percent}%
                            </p>
                            <input
                                type="range" min="0" max="100" step="10"
                                value={formData.rollout_percent}
                                onChange={e => setFormData({ ...formData, rollout_percent: parseInt(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Reason (v3 Principle: Traceability) */}
                        <textarea
                            placeholder="Lý do thay đổi (bắt buộc)..."
                            className="input-login"
                            style={{ height: '60px', fontSize: '12px' }}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />

                        {/* PROD Confirm */}
                        <input
                            placeholder={`Gõ "CONFIRM PROD ${formData.key}" để lưu`}
                            className="input-login"
                            style={{ border: confirmProd.startsWith('CONFIRM PROD') ? '2px solid #EF4444' : '1px solid #DDD' }}
                            value={confirmProd}
                            onChange={e => setConfirmProd(e.target.value)}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            <button
                                className="btn-login"
                                style={{ background: '#10B981', opacity: (reason.length < 5) ? 0.5 : 1 }}
                                disabled={reason.length < 5}
                                onClick={() => handleUpdate(formData.key, formData, reason)}
                            >
                                LƯU CẤU HÌNH
                            </button>
                            <button
                                className="btn-login"
                                style={{ background: '#6B7280' }}
                                onClick={() => { setEditFlag(null); setConfirmProd(''); }}
                            >
                                HỦY
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const GlobalKillSwitch = () => {
        const killFlag = flags.find(f => f.key === 'GLOBAL_FEATURE_KILL_SWITCH');
        if (!killFlag) return null;

        return (
            <div style={{
                background: killFlag.enabled ? '#FEF2F2' : '#F9FAFB',
                border: `2px solid ${killFlag.enabled ? '#EF4444' : '#E5E7EB'}`,
                padding: '15px', borderRadius: '12px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: killFlag.enabled ? '#B91C1C' : '#374151' }}>
                        🚨 GLOBAL KILL SWITCH
                    </h4>
                    <p style={{ fontSize: '11px', color: '#6B7280' }}>{killFlag.description}</p>
                </div>
                <button
                    className="btn-login"
                    style={{ width: 'auto', padding: '8px 20px', background: killFlag.enabled ? '#EF4444' : '#10B981' }}
                    onClick={() => setEditFlag(killFlag)}
                >
                    {killFlag.enabled ? 'DISARM' : 'ACTIVATE'}
                </button>
            </div>
        );
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>⬅️</button>
                <h2 style={{ fontSize: '18px', fontWeight: '900' }}>HỆ THỐNG FEATURE FLAGS</h2>
            </div>

            {message.text && (
                <div style={{
                    padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px',
                    background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5',
                    color: message.type === 'error' ? '#B91C1C' : '#047857'
                }}>
                    {message.text}
                </div>
            )}

            <GlobalKillSwitch />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>⌛ Đang tải cấu hình...</div>
                ) : flags.filter(f => f.key !== 'GLOBAL_FEATURE_KILL_SWITCH').map(flag => (
                    <div
                        key={flag.key}
                        onClick={() => setEditFlag(flag)}
                        style={{
                            background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E5E7EB',
                            cursor: 'pointer', transition: 'all 0.2s',
                            opacity: flag.enabled ? 1 : 0.6
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>{flag.key}</div>
                                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>{flag.description}</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '9px', background: '#3B82F6', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                                        {flag.enabled_env.join(', ').toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '9px', background: '#10B981', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                                        {flag.rollout_percent}% Rollout
                                    </span>
                                    {flag.is_core && <span style={{ fontSize: '9px', background: '#F59E0B', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>CORE</span>}
                                </div>
                            </div>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: flag.enabled ? '#10B981' : '#D1D5DB',
                                boxShadow: flag.enabled ? '0 0 8px #10B981' : 'none'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {editFlag && <EditModal />}
        </div>
    );
};

export default PageFeatureManagement;
