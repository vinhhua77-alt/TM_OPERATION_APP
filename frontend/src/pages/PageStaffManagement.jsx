import React, { useState, useEffect } from 'react';
import { staffAPI } from '../api/staff';
import FAB from '../components/FAB';

/**
 * PAGE STAFF MANAGEMENT
 * Admin-only page for managing staff (separate from PageSetting)
 */
const PageStaffManagement = ({ user, onBack }) => {
    const [staffList, setStaffList] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [filters, setFilters] = useState({ store_code: 'ALL', status: 'PENDING', role: 'ALL' });
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [editModal, setEditModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        loadStaffData();
    }, [filters]);

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
            const res = await staffAPI.updateStaff(staffId, { active: false, status: 'INACTIVE' });
            if (res.success) {
                showMessage('Đã vô hiệu hóa nhân viên', 'success');
                loadStaffData();
            }
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleActivate = async (staffId) => {
        try {
            const res = await staffAPI.updateStaff(staffId, { active: true, status: 'ACTIVE' });
            if (res.success) {
                showMessage('Đã kích hoạt nhân viên', 'success');
                // Force a full data reload to refresh stats and move the item
                loadStaffData();
                setSelectedStaff(prev => prev.filter(id => id !== staffId));
            }
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const handleSyncStatus = async () => {
        setLoading(true);
        try {
            const res = await staffAPI.syncStatus();
            if (res.success) {
                showMessage(`Đã đồng bộ ${res.data.updated} nhân viên`, 'success');
                loadStaffData();
            }
        } catch (error) {
            showMessage('Lỗi đồng bộ: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (staffId) => {
        if (!confirm(`Từ chối yêu cầu của nhân viên ${staffId}?`)) return;
        // For now, we just deactivate specific logic can vary
        handleDeactivate(staffId);
    };

    const toggleSelectStaff = (staffId) => {
        setSelectedStaff(prev =>
            prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
        );
    };

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

                        <input
                            className="input-login"
                            type="password"
                            placeholder="Mật khẩu mới (Để trống nếu không đổi)"
                            value={formData.password || ''}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
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
            {/* Header Removed for cleaner UI */}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
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
                {/* Statistics Cards - Clickable Filters */}
                {statistics && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        <StatCard
                            label="Tổng"
                            value={statistics.total}
                            color="#3B82F6"
                            onClick={() => setFilters({ ...filters, status: 'ALL' })}
                            isActive={filters.status === 'ALL'}
                        />
                        <StatCard
                            label="Active"
                            value={statistics.active}
                            color="#10B981"
                            onClick={() => setFilters({ ...filters, status: 'ACTIVE' })}
                            isActive={filters.status === 'ACTIVE'}
                        />
                        <StatCard
                            label="Pending"
                            value={statistics.pending}
                            color="#F59E0B"
                            onClick={() => setFilters({ ...filters, status: 'PENDING' })}
                            isActive={filters.status === 'PENDING'}
                        />
                        <StatCard
                            label="Inactive"
                            value={statistics.inactive}
                            color="#EF4444"
                            onClick={() => setFilters({ ...filters, status: 'INACTIVE' })}
                            isActive={filters.status === 'INACTIVE'}
                        />
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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

                    <button
                        className="btn-login"
                        style={{ fontSize: '11px', background: '#3B82F6', height: '100%', padding: '0' }}
                        onClick={loadStaffData}
                    >
                        🔄 Làm mới
                    </button>
                    <button
                        className="btn-login"
                        style={{ fontSize: '11px', background: '#6B7280', height: '100%', padding: '0' }}
                        onClick={handleSyncStatus}
                        title="Đồng bộ trạng thái (Fix lỗi hiển thị)"
                    >
                        ⚙️ Sync
                    </button>
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

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap' // Mobile responsive: wrap content 
                                }}>
                                    {/* Left Side: Checkbox + Staff Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                                        {/* Checkbox for pending staff */}
                                        {!staff.active && (
                                            <input
                                                type="checkbox"
                                                checked={selectedStaff.includes(staff.staff_id)}
                                                onChange={() => toggleSelectStaff(staff.staff_id)}
                                                style={{ width: '16px', height: '16px', flexShrink: 0 }}
                                            />
                                        )}

                                        {/* Staff Info */}
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span className="text-truncate">{staff.staff_name}</span>
                                                <span style={{
                                                    fontSize: '9px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: staff.active ? '#D1FAE5' : '#FEE2E2',
                                                    color: staff.active ? '#059669' : '#DC2626',
                                                    flexShrink: 0
                                                }}>
                                                    {staff.active ? 'ACTIVE' : (staff.status || 'INACTIVE')}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }} className="text-truncate">
                                                {staff.staff_id} | {staff.role} | {staff.store_code}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions - Right Aligned */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {/* Pending Actions: Approve / Reject */}
                                        {!staff.active && filters.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleActivate(staff.staff_id)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: '#10B981',
                                                        color: 'white',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                    title="Duyệt"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => handleReject(staff.staff_id)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: '#FEF2F2',
                                                        color: '#EF4444',
                                                        border: '1px solid #FECACA',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                    title="Từ chối"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            /* Active/Inactive Toggle Switch */
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '10px', color: staff.active ? '#10B981' : '#6B7280', fontWeight: 'bold' }}>
                                                    {staff.active ? 'ON' : 'OFF'}
                                                </span>
                                                <div
                                                    onClick={() => staff.active ? handleDeactivate(staff.staff_id) : handleActivate(staff.staff_id)}
                                                    style={{
                                                        width: '36px',
                                                        height: '20px',
                                                        background: staff.active ? '#10B981' : '#E5E7EB',
                                                        borderRadius: '20px',
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.3s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        background: 'white',
                                                        borderRadius: '50%',
                                                        position: 'absolute',
                                                        top: '2px',
                                                        left: staff.active ? '18px' : '2px',
                                                        transition: 'left 0.3s',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => setEditModal(staff)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                marginLeft: '8px',
                                                opacity: 0.7
                                            }}
                                            title="Chỉnh sửa"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {editModal && <EditModal />}

            {/* FAB: Add New Staff */}
            <FAB
                icon="➕"
                onClick={() => setEditModal({})}
                label="Thêm nhân viên"
            />
        </div>
    );
};

// Statistics Card Component
const StatCard = ({ label, value, color, onClick, isActive }) => (
    <div
        onClick={onClick}
        style={{
            padding: '12px',
            borderRadius: '8px',
            background: isActive ? color : color + '15', // Solid color if active
            color: isActive ? 'white' : 'inherit',
            border: `2px solid ${color}`,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isActive ? `0 4px 6px -1px ${color}66` : 'none'
        }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: isActive ? 'white' : color }}>{value}</div>
        <div style={{ fontSize: '10px', color: isActive ? 'white' : '#666', marginTop: '4px' }}>{label}</div>
    </div>
);

export default PageStaffManagement;
