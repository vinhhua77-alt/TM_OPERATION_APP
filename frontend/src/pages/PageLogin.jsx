import { useState } from 'react';
import { authAPI, passwordResetAPI } from '../api/auth';
import Notification from '../components/Notification';

const PageLogin = ({ onLogin, onGoToRegister }) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes = [
    "Cách tốt nhất để dự đoán tương lai của bạn là tạo ra nó.",
    "Khi bạn biết giá trị của mình, không ai có thể khiến bạn cảm thấy mình vô dụng.",
    "Mọi sự nỗ lực luôn được thế giới này ghi nhận.",
    "Làm việc có tâm, suy nghĩ có tầm.",
    "Bạn chỉ thất bại khi bạn ngừng cố gắng.",
    "Thành công là niềm yêu thích những gì bạn đang làm."
  ];

  // Rotate quotes every 5 seconds
  useState(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!staffId) {
      setMsg({ text: 'VUI LÒNG NHẬP MÃ NHÂN VIÊN!', type: 'error' });
      return;
    }
    if (!password) {
      setMsg({ text: 'VUI LÒNG NHẬP MẬT KHẨU!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(staffId.trim().toUpperCase(), password);
      // NOTE: res.token is now available from backend
      if (res.success) {
        onLogin(res.user, res.token);
      } else {
        setMsg({ text: res.message, type: 'error' });
      }
    } catch (error) {
      setMsg({ text: error.message || 'Đăng nhập thất bại', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <Notification message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

        <div className="header text-center mb-6">
          <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" style={{ maxHeight: '80px', marginBottom: '1rem' }} />
          <h2 className="brand-title" style={{ color: '#004AAD', fontSize: '1.5rem', fontWeight: 'bold' }}>THÁI MẬU GROUP</h2>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="sub-title-dev fade-in" key={quoteIndex} style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9rem', padding: '0 10px' }}>
              "{quotes[quoteIndex]}"
            </p>
          </div>
        </div>

        <div className="form-group mb-4">
          <input
            className="input-login text-center uppercase w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ width: '100%', boxSizing: 'border-box' }}
            placeholder="MÃ NHÂN VIÊN"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value.toUpperCase())}
            onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className="form-group mb-4" style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-login text-center w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ width: '100%', boxSizing: 'border-box' }}
            placeholder="MẬT KHẨU"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#004AAD', fontWeight: 'bold' }}
          >
            {showPassword ? 'ẨN' : 'HIỆN'}
          </button>
        </div>

        <button
          className="btn-login"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#004AAD',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            marginTop: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP NGAY'}
        </button>

        <div className="text-center mt-6">
          <button
            onClick={onGoToRegister}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#004AAD', fontSize: '13px', textDecoration: 'underline' }}
          >
            Đăng ký nhân viên mới
          </button>
        </div>
      </div>
      <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.8rem' }}>© 2026 Powered by IT Team</p>
    </div>
  );
};

export default PageLogin;
