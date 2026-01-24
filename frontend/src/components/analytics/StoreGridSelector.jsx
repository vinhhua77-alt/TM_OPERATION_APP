import React from 'react';

const StoreGridSelector = ({ stores, selectedStore, onSelect, showAll = true }) => {
    // Bảng màu nhận diện chuẩn cho các Store
    const colorMap = {
        'ALL': 'from-blue-600 to-indigo-700',
        'TMG01': 'from-blue-400 to-blue-600',
        'TMG02': 'from-emerald-400 to-emerald-600',
        'TMG03': 'from-violet-400 to-violet-600',
        'TMG04': 'from-amber-400 to-orange-500',
        'TMG05': 'from-rose-400 to-rose-600',
        'TMG06': 'from-sky-400 to-sky-600',
        'TMG07': 'from-indigo-400 to-indigo-600',
        'TMG08': 'from-orange-400 to-red-500',
        'TMG09': 'from-teal-400 to-teal-600',
        'TMG10': 'from-pink-400 to-pink-600',
    };

    const getStoreColor = (code) => colorMap[code] || 'from-slate-400 to-slate-600';

    // Chuẩn bị danh sách hiển thị (Thêm "TẤT CẢ" nếu cần)
    const displayStores = showAll ? [{ store_code: 'ALL', store_name: 'TẤT CẢ' }, ...stores] : stores;

    return (
        <div className="grid grid-cols-5 gap-2 p-1">
            {displayStores.map(s => {
                const isActive = selectedStore === s.store_code;
                return (
                    <div
                        key={s.store_code}
                        onClick={() => onSelect(s.store_code)}
                        className={`
                            h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 border-2
                            ${isActive ? 'border-white ring-2 ring-white/30 shadow-xl -translate-y-1 scale-110 z-10' : 'border-transparent opacity-90 scale-100'}
                            bg-gradient-to-br ${getStoreColor(s.store_code)}
                        `}
                    >
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">{s.store_code}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default StoreGridSelector;
