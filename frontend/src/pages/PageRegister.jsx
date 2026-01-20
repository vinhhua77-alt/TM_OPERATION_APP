import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { supabase } from '../lib/supabase';
import Notification from '../components/Notification';

const PageRegister = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeId: ''
  });
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase.from('store_list').select('store_code, store_name').order('store_name');
        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        setMsg({ text: 'Không thể tải danh sách cửa hàng', type: 'error' });
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.email || !formData.password || !formData.storeId) {
      setMsg({ text: 'VUI LÒNG ĐIỀN ĐẦY ĐỦ THÔNG TIN!', type: 'error' }); return;
    }
    if (formData.password.length < 6) {
      setMsg({ text: 'Mật khẩu phải > 6 ký tự!', type: 'error' }); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMsg({ text: 'Mật khẩu xác nhận không khớp!', type: 'error' }); return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const res = await authAPI.register(submitData);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        setTimeout(() => onNavigate('LOGIN'), 2000);
      } else {
        setMsg({ text: res.message, type: 'error' });
      }
    } catch (error) {
      setMsg({ text: error.message || 'Đăng ký thất bại', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <Notification message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      <div className="header">
        <h2 className="brand-title">ĐĂNG KÝ MỚI</h2>
        <p className="sub-title-dev">Dành cho nhân viên chưa có tài khoản</p>
      </div>

      <div className="mt-10 form-group">
        <input className="input-login text-center uppercase" placeholder="MÃ NHÂN VIÊN (Vd: TM001)" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} />
      </div>

      <div className="form-group mt-5">
        <input className="input-login" placeholder="Họ và tên" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      </div>

      <div className="form-group mt-5">
        <input type="email" className="input-login" placeholder="Email nhận thông báo" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })} />
      </div>

      <div className="form-group mt-5">
        <select className="input-login" value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} disabled={loadingStores}>
          <option value="">-- CHỌN CỬA HÀNG --</option>
          {stores.map((store) => (
            <option key={store.store_code} value={store.store_code}>
              {store.store_code} - {store.store_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid-2 mt-5">
        <input type="password" className="input-login" placeholder="Mật khẩu" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        <input type="password" className="input-login" placeholder="Nhập lại MK" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
      </div>

      <button className="btn-login mt-10" onClick={handleSubmit} disabled={loading || loadingStores} style={{ background: loading ? '#ccc' : '#004AAD' }}>
        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
      </button>

      <div className="text-center mt-5">
        <button onClick={() => onNavigate('LOGIN')} className="sub-title-dev" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#004AAD' }}>
          QUAY LẠI ĐĂNG NHẬP
        </button>
      </div>
    </div>
  );
};

export default PageRegister;
