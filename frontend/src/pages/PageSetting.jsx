import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../api/admin';

/**
 * PAGE_SYSTEMCONFIG - Node.js Version
 */
const PageSetting = ({ user, onBack, onNavigate }) => {
    const [subView, setSubView] = useState('menu');
    const [data, setData] = useState({ staff: [], stores: [] });
    const [filterStore, setFilterStore] = useState('ALL');
    const [onlyPending, setOnlyPending] = useState(false);
    const [editModal, setEditModal] = useState(null); // Keep for future use
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (subView !== 'menu') loadData();
    }, [subView]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAdminData();
            if (res) setData(res);
        } catch (error) {
            console.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (staffId, currentStatus) => {
        const newStatus = !(currentStatus === true || String(currentStatus).toUpperCase() === 'TRUE');
        if (confirm(`Đổi trạng thái nhân viên ${staffId}?`)) {
            await adminAPI.updateStaffStatus(staffId, newStatus);
            loadData(); // Reload to refresh list
        }
    };

    // LOGIC LỌC AN TOÀN
    const filteredList = useMemo(() => {
        return (data.staff || []).filter(s => {
            const matchStore = filterStore === 'ALL' || s.store_code === filterStore;
            const isPending = (!s.active || s.active === '' || String(s.active).toUpperCase() === 'PENDING' || String(s.active).toUpperCase() === 'FALSE');
            return onlyPending ? (matchStore && isPending) : matchStore;
        });
    }, [data.staff, filterStore, onlyPending]);

    const StaffView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="grid-2">
                <select className="input-login" style={{ fontSize: '11px' }} value={filterStore} onChange={e => setFilterStore(e.target.value)}>
                    <option value="ALL">TẤT CẢ STORE</option>
                    {(data.stores || []).map(st => <option key={st.store_code || st.id} value={st.store_code}>{st.store_name}</option>)}
                </select>
                <button className="btn-login" style={{ fontSize: '10px', background: onlyPending ? '#EF4444' : '#666' }} onClick={() => setOnlyPending(!onlyPending)}>
                    {onlyPending ? 'XEM TẤT CẢ' : 'PENDING'}
                </button>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #DDD', borderRadius: '8px' }}>
                {filteredList.length === 0 ? <p style={{ textAlign: 'center', padding: '20px' }}>{loading ? 'Đang tải...' : 'Không có dữ liệu'}</p> :
                    filteredList.map(s => (
                        <div key={s.id || s.staff_id} className="checklist-item" style={{ padding: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: '800' }}>{s.staff_name}</div>
                                <div style={{ fontSize: '10px', color: '#666' }}>{s.staff_id} | {s.role}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div onClick={() => handleUpdateStatus(s.staff_id, s.active)}
                                    style={{ width: '36px', height: '18px', borderRadius: '10px', background: (s.active === true || String(s.active).toUpperCase() === 'TRUE') ? '#10B981' : '#DDD', position: 'relative', cursor: 'pointer' }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#FFF', position: 'absolute', top: '2px', left: (s.active === true || String(s.active).toUpperCase() === 'TRUE') ? '20px' : '2px', transition: '0.2s' }}></div>
                                </div>
                                <div onClick={() => alert("Tính năng chỉnh sửa chi tiết đang cập nhật")} style={{ cursor: 'pointer', fontSize: '18px' }}>📝</div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );

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
                    <button onClick={() => setSubView('menu')} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>← QUAY LẠI MENU</button>
                    {loading ? <p className="text-center" style={{ padding: '20px' }}>⌛ Đang tải dữ liệu...</p> : subView === 'staff' && <StaffView />}
                </>
            )}
        </div>
    );
};

export default PageSetting;
