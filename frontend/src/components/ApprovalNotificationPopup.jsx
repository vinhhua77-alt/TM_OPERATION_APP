import React from 'react';

const ApprovalNotificationPopup = ({ count, onReview, onClose }) => {
    if (!count || count <= 0) return null;

    return (
        <div className="fixed inset-x-4 top-20 z-[2000] animate-in slide-in-from-top-10 duration-500">
            <div className="bg-white rounded-[28px] shadow-2xl border border-blue-100 p-5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50"></div>

                <div className="relative z-10 flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shrink-0">
                        👥
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-tight mb-1">Duyệt nhân sự mới</h4>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-4">
                            Có <span className="text-blue-600 font-extrabold">{count}</span> nhân viên đang chờ bạn kích hoạt tài khoản.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onReview}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                            >
                                Duyệt ngay
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Để sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalNotificationPopup;
