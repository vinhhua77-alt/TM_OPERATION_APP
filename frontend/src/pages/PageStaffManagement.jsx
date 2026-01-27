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
    const [filters, setFilters] = useState({ store_code: 'ALL', status: 'ACTIVE', role: 'ALL' });
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [editModal, setEditModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [searchTerm, setSearchTerm] = useState('');

    const filteredStaffList = staffList.filter(staff => {
        const term = searchTerm.toLowerCase();
        return (
            (staff.staff_name || '').toLowerCase().includes(term) ||
            (staff.staff_id || '').toLowerCase().includes(term) ||
            (staff.gmail || '').toLowerCase().includes(term)
        );
    });

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
            // Check if this is CREATE or UPDATE mode
            const isCreateMode = !editModal.staff_id;

            if (isCreateMode) {
                // CREATE: Call createStaff API
                const res = await staffAPI.createStaff(updates);
                if (res.success) {
                    showMessage('Tạo nhân viên thành công!', 'success');
                    setEditModal(null);
                    loadStaffData();
                }
            } else {
                // UPDATE: Call updateStaff API
                const res = await staffAPI.updateStaff(editModal.staff_id, updates);
                if (res.success) {
                    showMessage('Cập nhật thành công', 'success');
                    setEditModal(null);
                    loadStaffData();
                }
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

    const handleApproveTrainee = async (staffId) => {
        try {
            const res = await staffAPI.updateStaff(staffId, { is_trainee: true, trainee_verified: true });
            if (res.success) {
                showMessage('Đã xác minh tập sự thành công!', 'success');
                loadStaffData();
            }
        } catch (error) {
            showMessage('Lỗi xác minh: ' + error.message, 'error');
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
        const isCreateMode = !editModal.staff_id;

        const [formData, setFormData] = useState({
            staff_id: editModal.staff_id || '', // [NEW] Added staff_id
            staff_name: editModal.staff_name || '',
            gmail: editModal.gmail || '',
            password: '', // Always empty for security
            role: editModal.role || 'STAFF',
            store_code: editModal.store_code || (statistics?.byStore ? Object.keys(statistics.byStore)[0] : 'TMG'),
            active: editModal.active !== undefined ? editModal.active : true,
            is_trainee: editModal.is_trainee || false,
            trainee_verified: editModal.trainee_verified || false,
            responsibility: editModal.responsibility || [] // [NEW] Area Responsibility
        });

        const toggleStore = (store) => {
            const current = formData.responsibility || [];
            if (current.includes(store)) {
                setFormData({ ...formData, responsibility: current.filter(s => s !== store) });
            } else {
                setFormData({ ...formData, responsibility: [...current, store] });
            }
        };

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
                    padding: '15px',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '400px'
                }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '12px' }}>
                        {isCreateMode ? '➕ Tạo nhân viên mới' : `Chỉnh sửa: ${editModal.staff_id}`}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* [NEW] Staff ID Field */}
                        <input
                            className="input-login"
                            placeholder="Mã nhân viên (VD: TM0088)"
                            value={formData.staff_id}
                            onChange={e => setFormData({ ...formData, staff_id: e.target.value.toUpperCase() })}
                            disabled={!isCreateMode} // Disable when editing
                            style={{
                                padding: '8px',
                                fontSize: '11px',
                                background: !isCreateMode ? '#F1F5F9' : 'white',
                                fontWeight: 'bold'
                            }}
                        />

                        <input
                            className="input-login"
                            placeholder="Tên nhân viên"
                            value={formData.staff_name}
                            onChange={e => setFormData({ ...formData, staff_name: e.target.value })}
                            style={{ padding: '8px', fontSize: '11px' }}
                        />

                        <input
                            className="input-login"
                            placeholder="Email"
                            value={formData.gmail}
                            onChange={e => setFormData({ ...formData, gmail: e.target.value })}
                            style={{ padding: '8px', fontSize: '11px' }}
                        />

                        <input
                            className="input-login"
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={formData.password || ''}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{ padding: '8px', fontSize: '11px' }}
                        />

                        <select
                            className="input-login"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{ padding: '8px', fontSize: '11px' }}
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="IT">IT</option>
                            <option value="OPS">OPS</option>
                            <option value="SM">SM</option>
                            <option value="LEADER">LEADER</option>
                            <option value="STAFF">STAFF</option>
                        </select>

                        <select
                            className="input-login"
                            value={formData.store_code}
                            onChange={e => setFormData({ ...formData, store_code: e.target.value })}
                            style={{ padding: '8px', fontSize: '11px' }}
                        >
                            {statistics?.byStore && Object.keys(statistics.byStore).map(store => (
                                <option key={store} value={store}>{store}</option>
                            ))}
                        </select>

                        {/* [NEW] Area Responsibility Selector */}
                        <div style={{ marginTop: '4px' }}>
                            <label style={{ fontSize: '10px', fontBlack: '900', color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                🌏 Phân quyền Area (Quản lý nhiều Store)
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '4px',
                                padding: '8px',
                                background: '#F8FAFC',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                maxHeight: '100px',
                                overflowY: 'auto'
                            }}>
                                {statistics?.byStore && Object.keys(statistics.byStore).map(store => (
                                    <label key={store} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '9px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        color: (formData.responsibility || []).includes(store) ? '#2563EB' : '#64748B'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={(formData.responsibility || []).includes(store)}
                                            onChange={() => toggleStore(store)}
                                            style={{ width: '12px', height: '12px' }}
                                        />
                                        {store}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                style={{ width: '14px', height: '14px' }}
                            />
                            Active
                        </label>

                        <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }}></div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#B45309' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_trainee}
                                onChange={e => setFormData({ ...formData, is_trainee: e.target.checked, trainee_verified: false })}
                                style={{ width: '14px', height: '14px' }}
                            />
                            <b>Bật Chế độ Tập sự (Trainee)</b>
                        </label>

                        {formData.is_trainee && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1E40AF', paddingLeft: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.trainee_verified}
                                    onChange={e => setFormData({ ...formData, trainee_verified: e.target.checked })}
                                    style={{ width: '14px', height: '14px' }}
                                />
                                SM Approved (Xác minh tập sự)
                            </label>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <button
                                className="btn-login"
                                style={{ background: '#10B981', padding: '10px', fontSize: '11px' }}
                                onClick={() => handleUpdateStaff(formData)}
                            >
                                Lưu
                            </button>
                            <button
                                className="btn-login"
                                style={{ background: '#6B7280', padding: '10px', fontSize: '11px' }}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {/* Message Notification */}
                {message.text && (
                    <div style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5',
                        color: message.type === 'error' ? '#DC2626' : '#059669',
                        fontSize: '10px',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Statistics Cards */}
                {statistics && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
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
                            label="Duyệt TS"
                            value={statistics.traineePending || 0}
                            color="#6366F1"
                            onClick={() => setFilters({ ...filters, status: 'TRAINEE_PENDING' })}
                            isActive={filters.status === 'TRAINEE_PENDING'}
                        />
                        <StatCard
                            label="Mới"
                            value={statistics.pending}
                            color="#F59E0B"
                            onClick={() => setFilters({ ...filters, status: 'PENDING' })}
                            isActive={filters.status === 'PENDING'}
                        />
                        <StatCard
                            label="OFF"
                            value={statistics.inactive}
                            color="#EF4444"
                            onClick={() => setFilters({ ...filters, status: 'INACTIVE' })}
                            isActive={filters.status === 'INACTIVE'}
                        />
                    </div>
                )}

                {/* Search & Filters */}
                <div style={{ marginBottom: '6px' }}>
                    <input
                        className="input-login"
                        placeholder="🔍 Tìm kiếm nhân viên..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: '11px' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <select
                        className="input-login"
                        style={{ fontSize: '10px', padding: '6px' }}
                        value={filters.store_code}
                        onChange={e => setFilters({ ...filters, store_code: e.target.value })}
                    >
                        <option value="ALL">Stores</option>
                        {statistics?.byStore && Object.keys(statistics.byStore).map(store => (
                            <option key={store} value={store}>{store} ({statistics.byStore[store]})</option>
                        ))}
                    </select>

                    <select
                        className="input-login"
                        style={{ fontSize: '10px', padding: '6px' }}
                        value={filters.role}
                        onChange={e => setFilters({ ...filters, role: e.target.value })}
                    >
                        <option value="ALL">Roles</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="IT">IT</option>
                        <option value="OPS">OPS</option>
                        <option value="SM">SM</option>
                        <option value="LEADER">LEADER</option>
                        <option value="STAFF">STAFF</option>
                    </select>

                    <button
                        className="btn-login"
                        style={{ fontSize: '10px', background: '#3B82F6', height: '100%', padding: '0' }}
                        onClick={loadStaffData}
                    >
                        🔄
                    </button>
                    <button
                        className="btn-login"
                        style={{ fontSize: '10px', background: '#6B7280', height: '100%', padding: '0' }}
                        onClick={handleSyncStatus}
                        title="Sync"
                    >
                        ⚙️
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
                <div style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px', background: 'white' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '15px', fontSize: '10px' }}>⌛ Đang tải...</p>
                    ) : filteredStaffList.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '15px', fontSize: '10px' }}>
                            {searchTerm ? 'Không tìm thấy' : 'Không có dữ liệu'}
                        </p>
                    ) : (
                        filteredStaffList.map(staff => (
                            <div
                                key={staff.staff_id}
                                className="checklist-item"
                                style={{
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #F8FAFC',
                                    background: selectedStaff.includes(staff.staff_id) ? '#F1F7FF' : 'white'
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
                                        {/* Checkbox for pending staff */}
                                        {!staff.active && (
                                            <input
                                                type="checkbox"
                                                checked={selectedStaff.includes(staff.staff_id)}
                                                onChange={() => toggleSelectStaff(staff.staff_id)}
                                                style={{ width: '14px', height: '14px', flexShrink: 0 }}
                                            />
                                        )}

                                        {/* Staff Info */}
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span className="text-truncate">{staff.staff_name}</span>
                                                <span style={{
                                                    fontSize: '8px',
                                                    padding: '1px 5px',
                                                    borderRadius: '4px',
                                                    background: staff.active ? '#D1FAE5' : '#FEE2E2',
                                                    color: staff.active ? '#059669' : '#DC2626',
                                                    flexShrink: 0
                                                }}>
                                                    {staff.active ? 'ACTIVE' : (staff.status || 'INACTIVE')}
                                                </span>
                                                {staff.is_trainee && (
                                                    <span style={{
                                                        fontSize: '8px',
                                                        padding: '1px 5px',
                                                        borderRadius: '4px',
                                                        background: staff.trainee_verified ? '#DBEAFE' : '#FEF3C7',
                                                        color: staff.trainee_verified ? '#1E40AF' : '#92400E',
                                                        fontWeight: '900',
                                                        flexShrink: 0
                                                    }}>
                                                        {staff.trainee_verified ? '🎓 TRAINEE' : '⌛ PENDING TRAINEE'}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }} className="text-truncate">
                                                {staff.staff_id} | {staff.role} | {staff.store_code}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions - Right Aligned */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {/* Trainee Pending Approval (Specific Case) */}
                                        {staff.is_trainee && !staff.trainee_verified && (
                                            <button
                                                onClick={() => handleApproveTrainee(staff.staff_id)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    background: '#6366F1',
                                                    color: 'white',
                                                    border: 'none',
                                                    fontSize: '9px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    boxShadow: '0 2px 4px rgba(99,102,241,0.2)'
                                                }}
                                            >
                                                Duyệt TS
                                            </button>
                                        )}

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
            padding: '8px',
            borderRadius: '10px',
            background: isActive ? color : color + '10', // Solid color if active
            color: isActive ? 'white' : 'inherit',
            border: `1.5px solid ${isActive ? color : color + '30'}`,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: isActive ? 'scale(1.02)' : 'scale(1)',
            boxShadow: isActive ? `0 4px 10px -2px ${color}44` : 'none'
        }}>
        <div style={{ fontSize: '18px', fontWeight: '900', color: isActive ? 'white' : color }}>{value}</div>
        <div style={{ fontSize: '9px', color: isActive ? 'white' : '#94A3B8', marginTop: '2px', fontWeight: '800', textTransform: 'uppercase' }}>{label}</div>
    </div>
);

export default PageStaffManagement;
