import { useState } from 'react';
import { authAPI, passwordResetAPI } from '../api/auth';
import Notification from '../components/Notification';

// FEATURE TOGGLES
const ENABLE_FORGOT_PASSWORD = false; // Chỉnh thành false nếu muốn ẩn tính năng quên mật khẩu

const PageLogin = ({ onLogin, onGoToRegister }) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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
        // [SANDBOX AUTO-ENABLE FOR TESTER]
        if (res.user?.role === 'TESTER') {
          localStorage.setItem('sandbox_mode', 'true');
          // Add a temporary welcome alert or let the next page handle it
          setTimeout(() => {
            alert('🧪 CHẾ ĐỘ SANDBOX ĐÃ TỰ ĐỘNG BẬT!\nBạn đang trong môi trường thử nghiệm TM_TEST.\nDữ liệu test được bảo mật và tự xóa sau 24h. Chúc bạn test vui vẻ!');
          }, 500);
        } else {
          // If not a tester, ensure sandbox is off unless they manually enabled it before
          // localStorage.removeItem('sandbox_mode'); // Optional: force off for others
        }

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

  const handleRequestReset = async () => {
    if (!resetEmail) {
      setMsg({ text: 'VUI LÒNG NHẬP EMAIL ĐỂ TIẾP TỤC!', type: 'error' });
      return;
    }
    setResetLoading(true);
    try {
      const res = await passwordResetAPI.requestReset(resetEmail);
      if (res.success) {
        setMsg({ text: 'YÊU CẦU ĐÃ GỬI! VUI LÒNG KIỂM TRA EMAIL CỦA BẠN.', type: 'success' });
        setShowForgotModal(false);
        setResetEmail('');
      } else {
        setMsg({ text: res.message, type: 'error' });
      }
    } catch (error) {
      setMsg({ text: error.message || 'Lỗi gửi yêu cầu', type: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
          {/* Simple inline spinner fallback if BrandLoading not imported here yet, keeping logical flow simple */}
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-blue-100/50 w-full max-w-[400px] border border-white relative overflow-hidden">
        <Notification message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

        {/* Header Branding */}
        <div className="text-center mb-8 relative z-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"></div>
            <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="relative w-24 h-auto mx-auto mb-4 drop-shadow-sm hover:scale-105 transition-transform duration-300" alt="logo" />
          </div>
          <h2 className="text-2xl font-black text-blue-900 tracking-tight">THÁI MẬU GROUP</h2>

          <div className="h-12 flex items-center justify-center mt-2">
            <p className="text-xs text-slate-500 italic px-2 animate-fade-in key={quoteIndex}">
              "{quotes[quoteIndex]}"
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <input
            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-center font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all uppercase"
            placeholder="MÃ NHÂN VIÊN"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value.toUpperCase())}
            onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-center font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="MẬT KHẨU"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {ENABLE_FORGOT_PASSWORD && (
            <div className="flex justify-end pr-1">
              <button
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP NGAY'}
        </button>

        {/* Secondary Action */}
        <div className="text-center mt-6">
          <button
            onClick={onGoToRegister}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
          >
            Đăng ký nhân viên mới
          </button>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 Powered by Vinh Gà</p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] p-6 animate-scale-in">
            <h3 className="text-lg font-black text-blue-900 mb-2 uppercase tracking-tight">Quên mật khẩu?</h3>
            <p className="text-[11px] text-slate-500 mb-6 font-medium">Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi một liên kết để bạn đặt lại mật khẩu mới.</p>

            <input
              type="email"
              placeholder="EMAIL ĐÃ ĐĂNG KÝ"
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm mb-6"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                onClick={() => setShowForgotModal(false)}
              >
                Hủy
              </button>
              <button
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                onClick={handleRequestReset}
                disabled={resetLoading}
              >
                {resetLoading ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageLogin;
