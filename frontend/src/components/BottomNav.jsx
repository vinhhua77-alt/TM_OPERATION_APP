import React from 'react';

const BottomNav = ({ currentPage, onNavigate }) => {
    // Menu items configuration
    const navItems = [
        { id: 'HOME', icon: '🏠', label: 'Home' },
        { id: 'SHIFT_LOG', icon: '📝', label: 'Báo Cáo' },
        { id: 'LEADER_REPORT', icon: '📈', label: 'Leader' },
        { id: 'SETTING', icon: '⚙️', label: 'Cấu hình' },
    ];

    // CSS handled internally for this component
    return (
        <div className="bottom-nav">
            {navItems.map(item => {
                const isActive = currentPage === item.id || (item.id === 'HOME' && currentPage === 'DASHBOARD');
                return (
                    <div
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <div className="nav-label">{item.label}</div>
                    </div>
                );
            })}

            <style>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: white;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                    z-index: 999; /* Below modal/toast but above content */
                    padding-bottom: env(safe-area-inset-bottom); /* iOS support */
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    color: #9CA3AF;
                    cursor: pointer;
                    transition: all 0.2s;
                    -webkit-tap-highlight-color: transparent;
                }

                .nav-item.active {
                    color: #004AAD;
                }

                .nav-icon {
                    font-size: 20px;
                    margin-bottom: 2px;
                    transition: transform 0.2s;
                }

                .nav-item.active .nav-icon {
                    transform: translateY(-2px);
                }

                .nav-label {
                    font-size: 10px;
                    font-weight: 600;
                }

                /* Desktop Hide: This component should be hidden on larger screens usually */
                @media (min-width: 768px) {
                    .bottom-nav {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default BottomNav;
