import React from 'react';

const Breadcrumbs = ({ currentPage, onNavigate }) => {
    // Breadcrumb Logic Configuration
    const breadcrumbMap = {
        'HOME': [],
        'DASHBOARD': [],
        'SHIFT_LOG': [{ label: 'Home', page: 'DASHBOARD' }, { label: 'Nhật ký ca', active: true }],
        'LEADER_REPORT': [{ label: 'Home', page: 'DASHBOARD' }, { label: 'Leader Report', active: true }],
        'STAFF_MANAGEMENT': [
            { label: 'Home', page: 'DASHBOARD' },
            { label: 'Quản lý nhân sự', active: true }
        ],
        'STORE_MANAGEMENT': [
            { label: 'Home', page: 'DASHBOARD' },
            { label: 'Quản lý cửa hàng', active: true }
        ],
        'ANNOUNCEMENT_MANAGEMENT': [
            { label: 'Home', page: 'DASHBOARD' },
            { label: 'Quản lý thông báo', active: true }
        ],
        'INCIDENT_MANAGEMENT': [
            { label: 'Home', page: 'DASHBOARD' },
            { label: 'Quản lý sự cố', active: true }
        ],
        'CAREER': [{ label: 'Home', page: 'DASHBOARD' }, { label: 'Hồ sơ năng lực', active: true }],
        'GAMIFICATION': [{ label: 'Home', page: 'DASHBOARD' }, { label: 'Thành tích', active: true }],
    };

    const items = breadcrumbMap[currentPage] || [];

    if (items.length === 0) return null;

    return (
        <div className="breadcrumb-container fade-in">
            {items.map((item, index) => (
                <span key={index} className="breadcrumb-item">
                    {index > 0 && <span className="separator">›</span>}
                    {item.active ? (
                        <span className="current">{item.label}</span>
                    ) : (
                        <span
                            className="link"
                            onClick={() => onNavigate(item.page)}
                        >
                            {item.label}
                        </span>
                    )}
                </span>
            ))}

            <style>{`
                .breadcrumb-container {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                    color: #6B7280;
                    margin-bottom: 12px;
                    padding-left: 4px;
                }
                .breadcrumb-item {
                    display: flex;
                    align-items: center;
                }
                .separator {
                    margin: 0 6px;
                    color: #9CA3AF;
                }
                .link {
                    cursor: pointer;
                    color: #6B7280;
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .link:hover {
                    color: #004AAD;
                    text-decoration: underline;
                }
                .current {
                    color: #004AAD;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default Breadcrumbs;
