import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../api/gamification';

const PageGamification = ({ user, onBack }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Feedback Form State
    const [mood, setMood] = useState(''); // OK, BUSY, etc.
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const FEELINGS = [
        { id: 'OK', label: '🔥 CHÁY HẾT MÌNH', icon: '🟢', color: '#10B981' },
        { id: 'BUSY', label: '💪 HƠI RUSH', icon: '🟡', color: '#EAB308' },
        { id: 'FIXED', label: '⚡ CÓ DRAMA', icon: '🟠', color: '#F97316' },
        { id: 'OPEN', label: '😰 CẦN SUPPORT', icon: '🔴', color: '#EF4444' },
        { id: 'OVER', label: '🆘 QUÁ TẢI', icon: '⚫', color: '#333' }
    ];

    const TAGS = ['Vui vẻ', 'Mệt mỏi', 'Học được nhiều', 'Áp lực', 'Đồng đội tốt', 'Khách khó tính'];

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await gamificationAPI.getMyStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmitFeedback = async () => {
        if (!mood) return showMessage('Vui lòng chọn cảm xúc!', 'error');

        try {
            await gamificationAPI.submitFeedback({
                feedback_type: 'DAILY_MOOD',
                mood_score: mood === 'OK' ? 5 : (mood === 'BUSY' ? 4 : (mood === 'FIXED' ? 3 : (mood === 'OPEN' ? 2 : 1))),
                comment,
                categories: selectedTags
            });
            showMessage('🎉 Đã gửi check-in! +50 XP');
            setShowFeedbackModal(false);
            setMood('');
            setComment('');
            setSelectedTags([]);
            loadStats(); // Reload to see new XP
        } catch (error) {
            showMessage('Lỗi: ' + error.message, 'error');
        }
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 3) {
                setSelectedTags([...selectedTags, tag]);
            }
        }
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">TRUNG TÂM THÀNH TÍCH</h2>
                <p className="sub-title-dev">{user?.name}</p>
            </div>

            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
                ← QUAY LẠI DASHBOARD
            </button>

            {message.text && (
                <div style={{ padding: '10px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '11px', fontWeight: '700', textAlign: 'center', marginBottom: '10px' }}>
                    {message.text}
                </div>
            )}

            {loading ? <div style={{ textAlign: 'center', padding: '20px' }}>⌛ Đang tải...</div> : stats && (
                <>
                    {/* XP Card */}
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>LEVEL HIỆN TẠI</div>
                                <div style={{ fontSize: '32px', fontWeight: '800' }}>{stats.level}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>STREAK</div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>🔥 {stats.streak} ngày</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span>{stats.xp} XP</span>
                            <span>{stats.nextLevelXp} XP</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stats.progress}% `, background: 'white', borderRadius: '4px', transition: 'width 0.5s' }} />
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '11px', textAlign: 'center', opacity: 0.9 }}>
                            Còn {stats.nextLevelXp - stats.xp} XP nữa để lên cấp tiếp theo! 🚀
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px' }}>
                        <button
                            onClick={() => setShowFeedbackModal(true)}
                            className="btn-login"
                            style={{
                                background: 'white', color: '#004AAD', border: '2px solid #004AAD',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '13px', padding: '15px'
                            }}
                        >
                            <span>📝</span> CHECK-IN CẢM XÚC (+50 XP)
                        </button>
                    </div>

                    {/* Badges */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #E5E7EB' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '15px', color: '#374151' }}>🏅 HUY HIỆU CỦA BẠN</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                            {/* Mock badges if empty, replace with real data iteration if available in stats.badges array details */}
                            {stats.badges_list && stats.badges_list.length > 0 ? (
                                stats.badges_list.map((badge, idx) => (
                                    <div key={idx} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏆</div>
                                        <div style={{ fontSize: '9px', color: '#4B5563' }}>{badge}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '11px', color: '#9CA3AF', padding: '10px' }}>
                                    Chưa có huy hiệu nào. Hãy tích cực hoạt động nhé!
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            {showFeedbackModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} className="fade-in">
                    <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '15px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>Hôm nay bạn thế nào?</h3>
                            <p style={{ fontSize: '11px', color: '#6B7280' }}>Chia sẻ để nhận ngay 50 XP nhé!</p>
                        </div>

                        {/* Moods */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                            {FEELINGS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setMood(f.id)}
                                    style={{
                                        padding: '10px', borderRadius: '8px', border: mood === f.id ? `2px solid ${f.color}` : '1px solid #E5E7EB',
                                        background: mood === f.id ? `${f.color}15` : 'white',
                                        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>{f.icon}</span>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{f.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tags */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', marginBottom: '8px' }}>TAGS (MAX 3)</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        style={{
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '10px', border: 'none',
                                            background: selectedTags.includes(tag) ? '#004AAD' : '#F3F4F6',
                                            color: selectedTags.includes(tag) ? 'white' : '#4B5563', cursor: 'pointer'
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <textarea
                            className="input-login"
                            placeholder="Chia sẻ thêm điều gì đó..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            style={{ height: '60px', fontSize: '11px', marginBottom: '15px' }}
                        />

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setShowFeedbackModal(false)} className="btn-login" style={{ background: '#F3F4F6', color: '#4B5563', border: 'none' }}>Đóng</button>
                            <button onClick={handleSubmitFeedback} className="btn-login" style={{ background: '#004AAD' }}>Gửi ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageGamification;
