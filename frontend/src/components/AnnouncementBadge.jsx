import React, { useState, useEffect } from 'react';
import { announcementAPI } from '../api/announcement';

const AnnouncementBadge = ({ user }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadUnreadCount();
        // Refresh every 30 seconds
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

    if (unreadCount === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#DC2626',
            color: '#FFF',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: '800',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
            zIndex: 1000,
            animation: 'pulse 2s infinite'
        }}>
            📢 {unreadCount} thông báo mới
        </div>
    );
};

export default AnnouncementBadge;
