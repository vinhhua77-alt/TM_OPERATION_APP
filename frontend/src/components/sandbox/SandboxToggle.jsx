import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import './SandboxToggle.css';

export default function SandboxToggle({ user }) {
    const [isSandboxMode, setIsSandboxMode] = useState(
        user?.role === 'TESTER' || localStorage.getItem('sandbox_mode') === 'true'
    );
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStats();

        // Check localStorage on mount
        const savedMode = localStorage.getItem('sandbox_mode');
        if (savedMode === 'true' || user?.role === 'TESTER') {
            setIsSandboxMode(true);
            if (user?.role === 'TESTER') {
                localStorage.setItem('sandbox_mode', 'true');
            }
        }
    }, [user]);

    const loadStats = async () => {
        try {
            const response = await apiClient.get('/sandbox/stats');
            if (response.success) {
                setStats(response.data);
                // For regular users, sync with backend session. For TESTER, always true.
                if (user?.role === 'TESTER') {
                    setIsSandboxMode(true);
                } else {
                    setIsSandboxMode(response.data.active_session);
                }
            }
        } catch (error) {
            console.error('Failed to load sandbox stats:', error);
        }
    };

    const toggleSandbox = async () => {
        setLoading(true);
        try {
            if (isSandboxMode) {
                // End session
                await apiClient.post(`/sandbox/end/${stats.session_id}`);
                setIsSandboxMode(false);
                localStorage.removeItem('sandbox_mode');
                alert('✅ Đã tắt Sandbox Mode. Dữ liệu mới sẽ là dữ liệu thực.');
            } else {
                // Start session
                const response = await apiClient.post('/sandbox/start');
                if (response.success) {
                    setIsSandboxMode(true);
                    localStorage.setItem('sandbox_mode', 'true');
                    alert('🧪 Đã bật Sandbox Mode. Dữ liệu test sẽ tự động xóa sau 24h.');
                }
            }
            await loadStats();
            // Force refresh to update AppBar and other UI components
            window.location.reload();
        } catch (error) {
            console.error('Failed to toggle sandbox:', error);
            alert('Không thể chuyển đổi Sandbox Mode');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/sandbox/export');

            if (response.success) {
                // Convert to JSON and download
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `[SANDBOX]_export_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                alert('✅ Đã xuất dữ liệu Sandbox thành công!');
            }
        } catch (error) {
            console.error('Failed to export sandbox data:', error);
            alert('Không thể xuất dữ liệu Sandbox');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm('❓ Bạn có chắc muốn XÓA TOÀN BỘ dữ liệu test không? Hành động này không thể hoàn tác!')) {
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/sandbox/clear');
            if (response.success) {
                alert('✅ Đã xóa sạch dữ liệu Sandbox!');
                await loadStats();
            }
        } catch (error) {
            console.error('Failed to clear sandbox data:', error);
            alert('Không thể xóa dữ liệu Sandbox');
        } finally {
            setLoading(false);
        }
    };

    const handleScreenshot = () => {
        alert('💡 Tip: Sử dụng Ctrl+Shift+S (Windows) hoặc Cmd+Shift+4 (Mac) để chụp màn hình!');
    };

    return (
        <div className={`sandbox-toggle ${isSandboxMode ? 'active' : ''}`}>
            <div className="sandbox-header">
                <span className="sandbox-icon">🧪</span>
                <span className="sandbox-label">Sandbox Mode</span>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={isSandboxMode}
                        onChange={toggleSandbox}
                        disabled={loading || user?.role === 'TESTER'}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            {user?.role === 'TESTER' && (
                <p className="sandbox-mandatory-msg">
                    ℹ️ Chế độ Sandbox là bắt buộc đối với tài khoản Tester.
                </p>
            )}

            {isSandboxMode && (stats?.active_session || user?.role === 'TESTER') && (
                <div className="sandbox-info">
                    {stats?.active_session ? (
                        <>
                            <p className="sandbox-warning">
                                ⚠️ Dữ liệu test sẽ tự động xóa sau 24h
                            </p>
                            <div className="sandbox-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Shift Logs:</span>
                                    <span className="stat-value">{stats.records?.shift_logs || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Leader Reports:</span>
                                    <span className="stat-value">{stats.records?.leader_reports || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Events:</span>
                                    <span className="stat-value">{stats.records?.operational_events || 0}</span>
                                </div>
                            </div>
                            <p className="expires-at">
                                Hết hạn: {new Date(stats.expires_at).toLocaleString('vi-VN')}
                            </p>
                        </>
                    ) : (
                        <p className="sandbox-warning">
                            🧪 Sandbox Mode đang hoạt động (Bắt buộc cho Tester)
                        </p>
                    )}
                    <div className="sandbox-actions">
                        <button
                            className="btn-export"
                            onClick={handleExport}
                            disabled={loading}
                        >
                            📊 Export JSON
                        </button>
                        <button
                            className="btn-screenshot"
                            onClick={handleScreenshot}
                            disabled={loading}
                        >
                            📸 Screenshot
                        </button>
                        <button
                            className="btn-clear"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            🗑️ Reset Data
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
