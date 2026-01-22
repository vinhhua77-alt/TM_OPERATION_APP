import React, { useState, useEffect } from 'react';
import { staffAPI } from '../api/staff';

/**
 * PAGE SETTING - Staff Management
 * Admin-only page for managing staff
 */
const PageSetting = ({ user, onBack, onNavigate }) => {
    const [subView, setSubView] = useState('menu');
    const [staffList, setStaffList] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [filters, setFilters] = useState({ store_code: 'ALL', status: 'ALL', role: 'ALL' });
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [editModal, setEditModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (subView === 'staff') {
            loadStaffData();
        }
    }, [subView, filters]);

    const loadStaffData = async () => {
        setLoading(true);
        try {
            const [staffRes, statsRes] = await Promise.all([
                staffAPI.getAllStaff(filters),
                staffAPI.getStatistics()
            ]);

            if (staffRes.success) setStaffList(staffRes.data);
            if (statsRes.success) setStatistics(statsRes.data);
        } catch (error) {
            showMessage('Lỗi tải dữ liệu: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleBulkActivate = async () => {
        if (selectedStaff.length === 0) {
            showMessage('Vui lòng chọn nhân viên cần kích hoạt', 'error');
            return;
        }

        if (!confirm(`Kích hoạt ${selectedStaff.length} nhân viên?`)) return;

        try {
            const res = await staffAPI.bulkActivate(selectedStaff);
            if (res.success) {
                showMessage(`Đã kích hoạt ${res.data.activated} nhân viên`, 'success');
                setSelectedStaff([]);
                loadStaffData();
            }
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleUpdateStaff = async (updates) => {
        try {
            const res = await staffAPI.updateStaff(editModal.staff_id, updates);
            if (res.success) {
                showMessage('Cập nhật thành công', 'success');
                setEditModal(null);
                loadStaffData();
            }
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleDeactivate = async (staffId) => {
        if (!confirm(`Vô hiệu hóa nhân viên ${staffId}?`)) return;

        try {
            const res = await staffAPI.deactivateStaff(staffId);
            if (res.success) {
                showMessage('Đã vô hiệu hóa nhân viên', 'success');
                loadStaffData();
            }
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const toggleSelectStaff = (staffId) => {
        setSelectedStaff(prev =>
            prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
        );
    };

    const StaffView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Message Notification */}
            {message.text && (
                <div style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5',
                    color: message.type === 'error' ? '#DC2626' : '#059669',
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center'
                }}>
                    {message.text}
                </div>
            )}

            {/* Statistics Cards */}
            {statistics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <StatCard label="Tổng" value={statistics.total} color="#3B82F6" />
                    <StatCard label="Active" value={statistics.active} color="#10B981" />
                    <StatCard label="Pending" value={statistics.pending} color="#F59E0B" />
                    <StatCard label="Inactive" value={statistics.inactive} color="#EF4444" />
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <select
                    className="input-login"
                    style={{ fontSize: '11px' }}
                    value={filters.store_code}
                    onChange={e => setFilters({ ...filters, store_code: e.target.value })}
                >
                    <option value="ALL">Tất cả store</option>
                    {statistics?.byStore && Object.keys(statistics.byStore).map(store => (
                        <option key={store} value={store}>{store} ({statistics.byStore[store]})</option>
                    ))}
                </select>

                <select
                    className="input-login"
                    style={{ fontSize: '11px' }}
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

                <select
                    className="input-login"
                    style={{ fontSize: '11px' }}
                    value={filters.role}
                    onChange={e => setFilters({ ...filters, role: e.target.value })}
                >
                    <option value="ALL">Tất cả role</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPS">OPS</option>
                    <option value="SM">SM</option>
                    <option value="LEADER">LEADER</option>
                    <option value="STAFF">STAFF</option>
                </select>
            </div>

            {/* Bulk Actions */}
            {selectedStaff.length > 0 && (
                <button
                    className="btn-login"
                    style={{ fontSize: '11px', background: '#10B981' }}
                    onClick={handleBulkActivate}
                >
                    ✅ Kích hoạt {selectedStaff.length} nhân viên
                </button>
            )}

            {/* Staff List */}
            <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px', fontSize: '11px' }}>⌛ Đang tải...</p>
                ) : staffList.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', fontSize: '11px' }}>Không có dữ liệu</p>
                ) : (
                    staffList.map(staff => (
                        <div
                            key={staff.staff_id}
                            className="checklist-item"
                            style={{
                                padding: '10px',
                                background: selectedStaff.includes(staff.staff_id) ? '#EFF6FF' : 'white'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Checkbox for pending staff */}
                                {!staff.active && (
                                    <input
                                        type="checkbox"
                                        checked={selectedStaff.includes(staff.staff_id)}
                                        onChange={() => toggleSelectStaff(staff.staff_id)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                )}

                                {/* Staff Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: '800' }}>
                                        {staff.staff_name}
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '9px',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: staff.active ? '#D1FAE5' : '#FEE2E2',
                                            color: staff.active ? '#059669' : '#DC2626'
                                        }}>
                                            {staff.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>
                                        {staff.staff_id} | {staff.role} | {staff.store_code}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setEditModal(staff)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '18px'
                                        }}
                                        title="Chỉnh sửa"
                                    >
                                        ✏️
                                    </button>
                                    {staff.active && (
                                        <button
                                            onClick={() => handleDeactivate(staff.staff_id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '18px'
                                            }}
                                            title="Vô hiệu hóa"
                                        >
                                            🚫
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const EditModal = () => {
        const [formData, setFormData] = useState({
            staff_name: editModal.staff_name,
            gmail: editModal.gmail,
            role: editModal.role,
            store_code: editModal.store_code,
            active: editModal.active
        });

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '400px'
                }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>
                        Chỉnh sửa: {editModal.staff_id}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            className="input-login"
                            placeholder="Tên nhân viên"
                            value={formData.staff_name}
                            onChange={e => setFormData({ ...formData, staff_name: e.target.value })}
                        />

                        <input
                            className="input-login"
                            placeholder="Email"
                            value={formData.gmail}
                            onChange={e => setFormData({ ...formData, gmail: e.target.value })}
                        />

                        <select
                            className="input-login"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="OPS">OPS</option>
                            <option value="SM">SM</option>
                            <option value="LEADER">LEADER</option>
                            <option value="STAFF">STAFF</option>
                        </select>

                        <select
                            className="input-login"
                            value={formData.store_code}
                            onChange={e => setFormData({ ...formData, store_code: e.target.value })}
                        >
                            {statistics?.byStore && Object.keys(statistics.byStore).map(store => (
                                <option key={store} value={store}>{store}</option>
                            ))}
                        </select>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            />
                            Active
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                            <button
                                className="btn-login"
                                style={{ background: '#10B981' }}
                                onClick={() => handleUpdateStaff(formData)}
                            >
                                Lưu
                            </button>
                            <button
                                className="btn-login"
                                style={{ background: '#6B7280' }}
                                onClick={() => setEditModal(null)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fade-in">
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">HỆ THỐNG CẤU HÌNH</h2>
                <p className="sub-title-dev">Admin: {user?.name}</p>
            </div>

            {subView === 'menu' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <button className="btn-login btn-outline" onClick={() => onNavigate('STAFF_MANAGEMENT')}>👥 1. Quản lý nhân sự</button>
                    <button className="btn-login btn-outline" onClick={() => onNavigate('STORE_MANAGEMENT')}>🏪 2. Quản lý nhà hàng</button>
                    <button className="btn-login btn-outline" onClick={() => onNavigate('INCIDENT_MANAGEMENT')}>⚠️ 3. Quản lý danh mục sự cố</button>
                    <button className="btn-login btn-outline" onClick={() => alert("Tính năng đang phát triển")}>📋 4. Layout & Checklist</button>
                    <button className="btn-login btn-outline" onClick={() => onNavigate('ANNOUNCEMENT_MANAGEMENT')}>📢 5. Quản lý thông báo</button>
                    <div className="grid-2 mt-10"><button className="btn-login btn-outline" onClick={() => onNavigate('HOME')}>QUAY LẠI TRANG CHỦ</button></div>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => setSubView('menu')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#004AAD',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        ← QUAY LẠI MENU
                    </button>
                    {subView === 'staff' && <StaffView />}
                </>
            )}

            {editModal && <EditModal />}
        </div>
    );
};

// Statistics Card Component
const StatCard = ({ label, value, color }) => (
    <div style={{
        padding: '12px',
        borderRadius: '8px',
        background: color + '15',
        border: `2px solid ${color}`,
        textAlign: 'center'
    }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
);

export default PageSetting;
