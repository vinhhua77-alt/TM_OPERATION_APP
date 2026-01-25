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
        <div className="fade-in pb-8">
            {/* Header */}
            <div className="header" style={{ padding: '15px 0 10px 0' }}>
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" style={{ height: '30px' }} />
                <h2 className="brand-title" style={{ fontSize: '14px', margin: '5px 0' }}>TRUNG TÂM THÀNH TÍCH</h2>
                <p className="sub-title-dev" style={{ fontSize: '10px' }}>{user?.name}</p>
            </div>

            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#004AAD', fontSize: '10px', fontWeight: '800', cursor: 'pointer', marginBottom: '8px', padding: '0 15px' }}>
                ← DASHBOARD
            </button>

            <div style={{ padding: '0 15px' }}>
                {message.text && (
                    <div style={{ padding: '8px', borderRadius: '8px', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#059669', fontSize: '10px', fontWeight: '700', textAlign: 'center', marginBottom: '10px' }}>
                        {message.text}
                    </div>
                )}

                {loading ? <div style={{ textAlign: 'center', padding: '15px', fontSize: '11px' }}>⌛ Đang tải...</div> : stats && (
                    <>
                        {/* XP Card */}
                        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', padding: '15px', color: 'white', marginBottom: '15px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '9px', opacity: 0.8, fontWeight: '800', textTransform: 'uppercase', tracking: '0.05em' }}>LEVEL HIỆN TẠI</div>
                                    <div style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1' }}>{stats.level}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '9px', opacity: 0.8, fontWeight: '800', textTransform: 'uppercase', tracking: '0.05em' }}>STREAK</div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', lineHeight: '1' }}>🔥 {stats.streak} ngày</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '800' }}>
                                <span className="opacity-90">{stats.xp} XP</span>
                                <span className="opacity-90">{stats.nextLevelXp} XP</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${stats.progress}% `, background: 'white', borderRadius: '10px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '9px', textAlign: 'center', opacity: 0.8, fontWeight: '700', italic: 'true' }}>
                                Còn {stats.nextLevelXp - stats.xp} XP nữa để lên cấp tiếp theo! 🚀
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ marginBottom: '15px' }}>
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="btn-login"
                                style={{
                                    background: 'white', color: '#004AAD', border: '1.5px solid #004AAD',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontSize: '11px', padding: '12px', borderRadius: '12px', fontWeight: '900',
                                    boxShadow: '0 4px 6px -1px rgba(0, 42, 173, 0.1)'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>📝</span> CHECK-IN CẢM XÚC (+50 XP)
                            </button>
                        </div>

                        {/* Badges */}
                        <div style={{ background: 'white', borderRadius: '15px', padding: '12px', border: '1px solid #F1F5F9', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', marginBottom: '12px', color: '#1E293B', textTransform: 'uppercase', tracking: '0.05em' }}>🏅 HUY HIỆU CỦA BẠN</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {stats.badges_list && stats.badges_list.length > 0 ? (
                                    stats.badges_list.map((badge, idx) => (
                                        <div key={idx} style={{ textAlign: 'center', background: '#F8FAFC', padding: '8px 5px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '20px', marginBottom: '3px' }}>🏆</div>
                                            <div style={{ fontSize: '8px', color: '#64748B', fontWeight: '800', lineHeight: '1.2' }}>{badge}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '10px', color: '#94A3B8', padding: '10px', fontWeight: '600', italic: 'true' }}>
                                        Chưa có huy hiệu nào. Hãy tích cực hoạt động nhé!
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showFeedbackModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} className="fade-in">
                    <div style={{ background: 'white', width: '85%', maxWidth: '320px', borderRadius: '20px', padding: '15px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>Hôm nay bạn thế nào?</h3>
                            <p style={{ fontSize: '10px', color: '#64748B', fontWeight: '600' }}>Chia sẻ để nhận ngay 50 XP nhé!</p>
                        </div>

                        {/* Moods */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                            {FEELINGS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setMood(f.id)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '10px', border: mood === f.id ? `2px solid ${f.color}` : '1.5px solid #F1F5F9',
                                        background: mood === f.id ? `${f.color}10` : '#F8FAFC',
                                        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: mood === f.id ? f.color : '#334155' }}>{f.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tags */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '9px', fontWeight: '900', color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>TAGS (MAX 3)</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        style={{
                                            padding: '4px 8px', borderRadius: '10px', fontSize: '9px', border: 'none', fontWeight: '800',
                                            background: selectedTags.includes(tag) ? '#0F172A' : '#F1F5F9',
                                            color: selectedTags.includes(tag) ? 'white' : '#64748B', cursor: 'pointer'
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
                            style={{ height: '45px', fontSize: '10px', marginBottom: '12px', padding: '8px' }}
                        />

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setShowFeedbackModal(false)} className="btn-login" style={{ background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: '11px', padding: '10px', borderRadius: '12px' }}>Đóng</button>
                            <button onClick={handleSubmitFeedback} className="btn-login" style={{ background: '#0F172A', fontSize: '11px', padding: '10px', borderRadius: '12px', fontWeight: '900' }}>Gửi ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageGamification;
