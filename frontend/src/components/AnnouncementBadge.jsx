import React, { useState, useEffect } from 'react';
import { announcementAPI } from '../api/announcement';

const PRIORITY_COLORS = {
    CRITICAL: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
    HIGH: { bg: '#FEF3C7', border: '#F59E0B', text: '#F59E0B' },
    MEDIUM: { bg: '#DBEAFE', border: '#3B82F6', text: '#3B82F6' },
    LOW: { bg: '#F3F4F6', border: '#6B7280', text: '#6B7280' }
};

const AnnouncementBadge = ({ user }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [allAnnouncements, setAllAnnouncements] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [expandedIds, setExpandedIds] = useState([]); // Allow multiple expanded

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const res = await announcementAPI.getUnreadCount();
            if (res.success) {
                setUnreadCount(res.data.count);
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const loadAnnouncements = async () => {
        try {
            const res = await announcementAPI.getMyAnnouncements();
            if (res.success && res.data) {
                setAllAnnouncements(res.data);
            }
        } catch (error) {
            console.error('Error loading announcements:', error);
        }
    };

    const handleBadgeClick = () => {
        if (!showPopup) {
            loadAnnouncements();
        }
        setShowPopup(!showPopup);
    };

    const handleItemClick = async (ann) => {
        // Toggle expand
        if (expandedIds.includes(ann.id)) {
            setExpandedIds(prev => prev.filter(id => id !== ann.id));
        } else {
            setExpandedIds(prev => [...prev, ann.id]);
            // Mark as read only if expanding
            try {
                await announcementAPI.markAsRead(ann.id);
                loadUnreadCount();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const visibleList = showAll ? allAnnouncements : allAnnouncements.slice(0, 5);

    return (
        <>
            <div
                onClick={handleBadgeClick}
                style={{
                    position: 'relative',
                    background: unreadCount > 0 ? '#DC2626' : 'rgba(255, 255, 255, 0.2)',
                    color: '#FFF',
                    borderRadius: '20px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: '800',
                    boxShadow: unreadCount > 0 ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
                    animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    height: '32px'
                }}>
                <span style={{ fontSize: '16px' }}>🔔</span>
                {unreadCount > 0 && <span style={{ marginLeft: '4px' }}>{unreadCount}</span>}
            </div>

            {showPopup && (
                <>
                    <div
                        onClick={() => setShowPopup(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9999
                        }}
                    />

                    <div style={{
                        position: 'fixed',
                        top: '60px',
                        right: '10px',
                        width: '320px',
                        maxHeight: '500px',
                        background: '#FFF',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                        zIndex: 10000,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '12px',
                            background: '#004AAD',
                            color: '#FFF',
                            fontSize: '13px',
                            fontWeight: '800',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <span>📢 Thông báo {showAll ? '(Tất cả)' : '(Gần đây)'}</span>
                            <button
                                onClick={() => setShowPopup(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FFF',
                                    fontSize: '18px',
                                    cursor: 'pointer'
                                }}
                            >×</button>
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '8px'
                        }}>
                            {allAnnouncements.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '11px' }}>
                                    Không có thông báo
                                </div>
                            ) : (
                                visibleList.map(ann => {
                                    const color = PRIORITY_COLORS[ann.priority] || PRIORITY_COLORS.LOW;
                                    const isExpanded = expandedIds.includes(ann.id);

                                    return (
                                        <div
                                            key={ann.id}
                                            onClick={() => handleItemClick(ann)}
                                            style={{
                                                padding: '10px',
                                                marginBottom: '8px',
                                                borderRadius: '8px',
                                                border: `2px solid ${color.border}`,
                                                background: color.bg,
                                                cursor: 'pointer',
                                                transition: 'transform 0.1s'
                                            }}
                                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                color: '#000',
                                                marginBottom: '4px',
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}>
                                                <span>{ann.title}</span>
                                                {/* Dot indicator if unread/new? Logic complex, skip for now */}
                                            </div>

                                            <div style={{
                                                fontSize: '10px',
                                                color: '#333',
                                                marginBottom: '6px',
                                                whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                                                overflow: isExpanded ? 'visible' : 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {isExpanded ? ann.content : (ann.content.slice(0, 60) + '...')}
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                gap: '6px',
                                                fontSize: '9px',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: color.text,
                                                    color: '#FFF',
                                                    fontWeight: '600'
                                                }}>
                                                    {ann.priority}
                                                </span>
                                                <span style={{ color: '#666' }}>
                                                    {new Date(ann.start_date).toLocaleDateString('vi-VN')}
                                                </span>
                                                {isExpanded && <span style={{ marginLeft: 'auto', color: '#059669' }}>✓ Đã đọc</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Button */}
                        {allAnnouncements.length > 5 && (
                            <div style={{
                                padding: '8px',
                                borderTop: '1px solid #EEE',
                                textAlign: 'center',
                                background: '#F9FAFB'
                            }}>
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#004AAD',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {showAll ? 'Thu gọn' : `Xem tất cả (${allAnnouncements.length})`}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default AnnouncementBadge;
