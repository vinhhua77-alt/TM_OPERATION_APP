import React, { useEffect } from 'react';

const Modal = ({ title, onClose, children }) => {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-red-500 flex items-center justify-center font-bold transition-all active:scale-95 text-lg"
                    >
                        ×
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-0 overflow-y-auto flex-1 bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
