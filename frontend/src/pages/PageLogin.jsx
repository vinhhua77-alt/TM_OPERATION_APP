import { useState } from 'react';
import { authAPI, passwordResetAPI } from '../api/auth';
import Notification from '../components/Notification';

const PageLogin = ({ onLogin, onGoToRegister }) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStaffId, setForgotPasswordStaffId] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

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

  const handleForgotPassword = async () => {
    if (!forgotPasswordStaffId) {
      setMsg({ text: 'VUI LÒNG NHẬP MÃ NHÂN VIÊN!', type: 'error' });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const res = await passwordResetAPI.requestReset(forgotPasswordStaffId.trim().toUpperCase());
      setMsg({ text: res.message, type: res.success ? 'success' : 'error' });
      if (res.success) {
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStaffId('');
        }, 3000);
      }
    } catch (error) {
      setMsg({ text: error.message || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="fade-in">
        <Notification message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
        <div className="header">
          <h2 className="brand-title">QUÊN MẬT KHẨU</h2>
          <p className="sub-title-dev">Nhập mã nhân viên để reset</p>
        </div>

        <div className="mt-10 form-group">
          <input
            className="input-login text-center uppercase"
            placeholder="MÃ NHÂN VIÊN"
            value={forgotPasswordStaffId}
            onChange={(e) => setForgotPasswordStaffId(e.target.value.toUpperCase())}
            onKeyUp={(e) => e.key === 'Enter' && handleForgotPassword()}
          />
        </div>

        <button
          className="btn-login mt-10"
          onClick={handleForgotPassword}
          disabled={forgotPasswordLoading}
          style={{ background: forgotPasswordLoading ? '#ccc' : '#004AAD' }}
        >
          {forgotPasswordLoading ? 'ĐANG GỬI...' : 'GỬI EMAIL RESET'}
        </button>

        <div className="text-center mt-5">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setForgotPasswordStaffId('');
              setMsg({ text: '', type: '' });
            }}
            className="sub-title-dev"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#004AAD' }}
          >
            QUAY LẠI ĐĂNG NHẬP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Notification message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      <div className="header">
        <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" />
        <h2 className="brand-title">THÁI MẬU GROUP</h2>
        <p className="sub-title-dev">HỆ THỐNG VẬN HÀNH v1.0</p>
      </div>

      <div className="form-group mt-10">
        <input
          className="input-login text-center uppercase"
          placeholder="MÃ NHÂN VIÊN"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value.toUpperCase())}
          onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <div className="form-group mt-5" style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          className="input-login text-center"
          placeholder="MẬT KHẨU"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#666' }}
        >
          {showPassword ? 'ẨN' : 'HIỆN'}
        </button>
      </div>

      <button
        className="btn-login mt-10"
        onClick={handleLogin}
        disabled={loading}
        style={{ background: loading ? '#ccc' : '#004AAD' }}
      >
        {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP NGAY'}
      </button>

      <div className="text-center mt-5" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => setShowForgotPassword(true)}
          className="sub-title-dev"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#004AAD' }}
        >
          QUÊN MẬT KHẨU?
        </button>
        <button
          onClick={onGoToRegister}
          className="sub-title-dev"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#004AAD' }}
        >
          ĐĂNG KÝ NHÂN VIÊN MỚI
        </button>
      </div>
    </div>
  );
};

export default PageLogin;
