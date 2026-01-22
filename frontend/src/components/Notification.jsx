import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bg = type === 'error'
    ? 'bg-red-600'
    : (type === 'success' ? 'bg-green-600' : 'bg-blue-600');

  const Icon = type === 'error' ? AlertTriangle : CheckCircle;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: '90%',
      maxWidth: '400px',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: type === 'error' ? '#DC2626' : (type === 'success' ? '#166534' : '#2563EB'),
      color: 'white',
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon size={20} />
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{message}</span>
      </div>
      <button onClick={onClose} style={{ opacity: 0.8, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
