import { useState, useEffect } from 'react';
import { passwordResetAPI } from '../api/auth';
import Notification from '../components/Notification';

const PageResetPassword = ({ token, staffId, onNavigate }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            setMsg({ text: 'VUI LÒNG NHẬP ĐẦY ĐỦ MẬT KHẨU!', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMsg({ text: 'MẬT KHẨU NHẬP LẠI KHÔNG KHỚP!', type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            setMsg({ text: 'MẬT KHẨU PHẢI TỪ 6 KÝ TỰ!', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const res = await passwordResetAPI.resetPassword(staffId, token, newPassword);
            if (res.success) {
                setSuccess(true);
                setMsg({ text: 'ĐỔI MẬT KHẨU THÀNH CÔNG!', type: 'success' });
            } else {
                setMsg({ text: res.message || 'Lỗi không xác định', type: 'error' });
            }
        } catch (error) {
            setMsg({ text: error.message || 'Có lỗi xảy ra', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <Notification message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

            <div className="header">
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
                <h2 className="brand-title">ĐẶT LẠI MẬT KHẨU</h2>
                {staffId && <p className="sub-title-dev">Nhân viên: {staffId}</p>}
            </div>

            {success ? (
                <div className="mt-10 text-center">
                    <p style={{ color: '#10B981', fontWeight: 'bold', marginBottom: '20px' }}>
                        MẬT KHẨU ĐÃ ĐƯỢC CẬP NHẬT!
                    </p>
                    <button
                        className="btn-login"
                        onClick={() => onNavigate('LOGIN')}
                    >
                        VỀ TRANG ĐĂNG NHẬP
                    </button>
                </div>
            ) : (
                <div className="mt-5">
                    <div className="form-group mb-4">
                        <input
                            type="password"
                            className="input-login text-center"
                            placeholder="MẬT KHẨU MỚI"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group mb-4">
                        <input
                            type="password"
                            className="input-login text-center"
                            placeholder="NHẬP LẠI MẬT KHẨU"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-login mt-5"
                        onClick={handleReset}
                        disabled={loading}
                        style={{ background: loading ? '#ccc' : '#004AAD' }}
                    >
                        {loading ? 'ĐANG XỬ LÝ...' : 'LƯU MẬT KHẨU MỚI'}
                    </button>

                    <div className="text-center mt-5">
                        <button
                            onClick={() => onNavigate('LOGIN')}
                            className="sub-title-dev"
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}
                        >
                            HỦY BỎ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageResetPassword;
