import React, { useState, useEffect } from 'react';
import { announcementAPI } from '../api/announcement';

const PRIORITY_COLORS = {
    CRITICAL: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
    HIGH: { bg: '#FEF3C7', border: '#F59E0B', text: '#F59E0B' },
    MEDIUM: { bg: '#DBEAFE', border: '#3B82F6', text: '#3B82F6' },
    LOW: { bg: '#F3F4F6', border: '#6B7280', text: '#6B7280' }
};

const AnnouncementPopup = ({ user, onClose }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUnreadAnnouncements();
    }, []);

    const loadUnreadAnnouncements = async () => {
        try {
            const res = await announcementAPI.getMyUnread();
            if (res.success && res.data.length > 0) {
                // Sort by priority (CRITICAL first)
                const sorted = res.data.sort((a, b) => {
                    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });
                setAnnouncements(sorted);
            } else {
                onClose(); // No unread announcements, close popup
            }
        } catch (error) {
            console.error('Error loading announcements:', error);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async () => {
        const currentAnn = announcements[currentIndex];

        try {
            await announcementAPI.markAsRead(currentAnn.id);

            // Move to next announcement or close
            if (currentIndex < announcements.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onClose(); // All read, close popup
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleRemindLater = () => {
        // Just close, will show again on next login
        onClose();
    };

    if (loading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <p style={{ textAlign: 'center', fontSize: '12px' }}>⌛ Đang tải...</p>
                </div>
            </div>
        );
    }

    if (announcements.length === 0) return null;

    const currentAnn = announcements[currentIndex];
    const color = PRIORITY_COLORS[currentAnn.priority];

    return (
        <div style={styles.overlay}>
            <div style={{ ...styles.modal, borderColor: color.border, borderWidth: '3px' }}>
                {/* Header */}
                <div style={{ ...styles.header, background: color.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📢</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: color.text }}>
                            {currentAnn.priority} - {currentAnn.category}
                        </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#666' }}>
                        {currentIndex + 1} / {announcements.length}
                    </span>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px', color: '#000' }}>
                        {currentAnn.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {currentAnn.content}
                    </p>

                    {currentAnn.attachment_url && (
                        <div style={{ marginTop: '12px' }}>
                            <a href={currentAnn.attachment_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3B82F6', textDecoration: 'underline' }}>
                                📎 Xem tài liệu đính kèm
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button onClick={handleRemindLater} style={{ ...styles.button, background: '#6B7280' }}>
                        Nhắc lại sau
                    </button>
                    <button onClick={handleMarkAsRead} style={{ ...styles.button, background: '#10B981' }}>
                        Đã đọc ✓
                    </button>
                </div>

                {/* Date */}
                <p style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: '8px' }}>
                    📅 {new Date(currentAnn.start_date).toLocaleString('vi-VN')}
                </p>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-in'
    },
    modal: {
        background: '#FFF',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '3px solid',
        animation: 'slideUp 0.3s ease-out'
    },
    header: {
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #E5E7EB'
    },
    content: {
        padding: '20px',
        maxHeight: '400px',
        overflowY: 'auto'
    },
    footer: {
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        borderTop: '1px solid #E5E7EB'
    },
    button: {
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        color: '#FFF',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: '0.2s'
    }
};

export default AnnouncementPopup;
