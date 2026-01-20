import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  
  const bg = type === 'error' 
    ? 'bg-red-600' 
    : (type === 'success' ? 'bg-green-600' : 'bg-blue-600');
  
  const Icon = type === 'error' ? AlertTriangle : CheckCircle;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[600] w-[92%] max-w-md ${bg} text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between fade-in`}>
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="text-sm font-bold tracking-tight leading-tight">{message}</span>
      </div>
      <button onClick={onClose} className="opacity-70">
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
