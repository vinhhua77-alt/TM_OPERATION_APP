import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../api/gamification';
import FeedbackModal from '../components/FeedbackModal';

const PageCareer = ({ user, onBack }) => {
    const [stats, setStats] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Mock data for charts
    const levelProgress = stats ? (stats.total_xp % 1000) / 10 : 0; // % of next level

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await gamificationAPI.getMyStats();
            if (res.success) setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            await gamificationAPI.submitFeedback(data);
            alert("Cảm ơn bạn! Đã cộng 50 XP! 🎉");
            loadData(); // Refresh API to get new XP
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    };

    if (!stats) return <div className="spinner"></div>;

    return (
        <div className="fade-in" style={{ paddingBottom: '80px' }}>
            <div className="header">
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
                    ← Quay lại Dashboard
                </button>
                <h2 className="brand-title" style={{ marginTop: '0' }}>MY CAREER CENTER</h2>
            </div>

            {/* 1. HERO CARD */}
            <div style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                marginBottom: '20px',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800'
                    }}>
                        L{stats.current_level}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Xin chào, {user.name} 👋</h2>
                        <p style={{ fontSize: '12px', opacity: 0.9 }}>{getLevelTitle(stats.current_level)}</p>
                    </div>
                </div>

                {/* XP Bar */}
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span>XP: {stats.total_xp}</span>
                        <span>Next: {stats.current_level * 1000}</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${levelProgress}%`, height: '100%', background: '#FCD34D', transition: 'width 1s ease-out' }}></div>
                    </div>
                </div>

                <div style={{ fontSize: '10px', textAlign: 'right', opacity: 0.8 }}>
                    Cần {1000 - (stats.total_xp % 1000)} XP để lên cấp
                </div>
            </div>

            {/* 2. KEY METRICS */}
            <div className="grid-2" style={{ gap: '12px', marginBottom: '20px' }}>
                <MetricCard icon="⏱️" value="156h" label="Giờ công tháng này" trend="+5%" />
                <MetricCard icon="🛠️" value="5" label="Sự cố đã xử lý" color="#10B981" />
                <MetricCard icon="🔥" value={`${stats.current_streak} ngày`} label="Chuỗi đi làm" />
                <MetricCard icon="😊" value={stats.eNPS_30d || '-'} label="Điểm cảm xúc (TB)" />
            </div>

            {/* 3. BADGES */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: '#111' }}>🏆 Bộ sưu tập huy hiệu</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <Badge icon="⚡" name="Thần Tốc" unlocked={true} />
                    <Badge icon="🛡️" name="Người Hùng" unlocked={stats.total_xp > 500} />
                    <Badge icon="⭐" name="Đa Năng" unlocked={false} />
                    <Badge icon="🎓" name="Học Giả" unlocked={false} />
                </div>
            </div>

            {/* 4. ACTIONS */}
            <button
                onClick={() => setShowFeedback(true)}
                style={{
                    width: '100%', background: '#EC4899', color: 'white', padding: '14px',
                    borderRadius: '12px', fontWeight: '700', border: 'none',
                    boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.39)', cursor: 'pointer'
                }}
            >
                💬 Gửi cảm nghĩ hôm nay (+50 XP)
            </button>

            {/* Feedback Modal */}
            {showFeedback && (
                <FeedbackModal
                    onClose={() => setShowFeedback(false)}
                    onSubmit={handleFeedbackSubmit}
                />
            )}
        </div>
    );
};

// Helper Components
const MetricCard = ({ icon, value, label, trend, color = '#3B82F6' }) => (
    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '20px' }}>{icon}</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#666' }}>{label}</div>
        {trend && <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '700' }}>{trend}</div>}
    </div>
);

const Badge = ({ icon, name, unlocked }) => (
    <div style={{
        minWidth: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(100%)'
    }}>
        <div style={{
            width: '40px', height: '40px', borderRadius: '50%', background: unlocked ? '#FEF3C7' : '#E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            border: unlocked ? '2px solid #F59E0B' : 'none'
        }}>
            {icon}
        </div>
        <span style={{ fontSize: '9px', fontWeight: '600', textAlign: 'center' }}>{name}</span>
    </div>
);

const getLevelTitle = (level) => {
    if (level < 5) return "Nhân viên Tập sự";
    if (level < 10) return "Chiến binh F&B";
    return "Chuyên gia Vận hành";
};

export default PageCareer;
