import React from 'react';

const StatCard = ({ label, value, subValue, icon, color, isMoney, compact, compactClickable }) => {
    // Map colors to specific Tailwind classes
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600", // Added Orange
        cyan: "bg-cyan-50 text-cyan-600",       // Added Cyan
        indigo: "bg-indigo-50 text-indigo-600", // Added Indigo
        gray: "bg-gray-50 text-gray-600"
    };

    const theme = colorStyles[color] || colorStyles.gray;

    const formatValue = (val) => {
        if (isMoney) {
            const num = parseFloat(val) || 0;
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
            return num.toLocaleString('vi-VN');
        }
        return val;
    };

    const formattedValue = formatValue(value);

    // COMPACT GRID MODE: Ultra-dense (4x2 Mobile Optimized)
    // Used when compact or compactClickable is true
    if (compact || compactClickable) {
        return (
            <div className={`bg-white px-1 py-1.5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[85px] h-full text-center active:scale-95 transition-transform cursor-pointer`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg mb-1 ${theme}`}>
                    {icon}
                </div>

                <div className="flex flex-col items-center leading-tight w-full">
                    {/* Value */}
                    <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                        <span className={`text-lg font-black tracking-tight ${isMoney ? 'text-green-600' : 'text-slate-800'}`}>
                            {formattedValue}
                        </span>
                        {subValue && (
                            <span className="text-[8px] text-slate-400 font-bold">
                                {subValue}
                            </span>
                        )}
                    </div>

                    {/* Label - Below Value for better visual flow in small grids */}
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 line-clamp-1">
                        {label}
                    </span>
                </div>
            </div>
        );
    }


    // STANDARD CARD LAYOUT
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${theme}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className={`text-2xl font-black leading-none ${isMoney ? 'text-green-600' : 'text-slate-800'}`}>
                        {formattedValue}
                    </h3>
                    {subValue && (
                        <span className="text-xs font-bold text-slate-400 uppercase">
                            {subValue}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
