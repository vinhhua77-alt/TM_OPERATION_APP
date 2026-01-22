import React, { useState } from 'react';

const FeedbackModal = ({ onClose, onSubmit }) => {
    const [mood, setMood] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (mood === 0) return alert("Vui lòng chọn mức độ cảm xúc!");

        setLoading(true);
        await onSubmit({
            feedback_type: 'SHIFT_END',
            mood_score: mood,
            comment
        });
        setLoading(false);
        onClose();
    };

    const emojis = ['😢', '😟', '😐', '🙂', '😄'];

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>
                    Ca làm hôm nay thế nào?
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '0 20px' }}>
                    {emojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => setMood(index + 1)}
                            style={{
                                fontSize: '30px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transform: mood === index + 1 ? 'scale(1.3)' : 'scale(1)',
                                transition: '0.2s',
                                opacity: mood === 0 || mood === index + 1 ? 1 : 0.4
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <textarea
                    placeholder="Chia sẻ thêm nếu bạn muốn (tùy chọn)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={styles.textarea}
                    rows={3}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onClose} style={{ ...styles.btn, background: '#E5E7EB', color: '#374151' }}>Bỏ qua</button>
                    <button onClick={handleSubmit} style={{ ...styles.btn, background: '#10B981', color: 'white' }}>Gửi & Nhận 50 XP</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    },
    modal: {
        background: 'white', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '350px',
        animation: 'slideUp 0.3s'
    },
    textarea: {
        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB',
        marginBottom: '16px', fontSize: '12px', resize: 'none'
    },
    btn: {
        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer'
    }
};

export default FeedbackModal;
