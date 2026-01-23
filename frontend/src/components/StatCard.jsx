import React from 'react';

const StatCard = ({ label, value, subValue, icon, color, isMoney }) => {
    // Map colors to specific Tailwind classes
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        gray: "bg-gray-50 text-gray-600"
    };

    const theme = colorStyles[color] || colorStyles.gray;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${theme}`}>
                    {/* Render icon as text/string, not component tag */}
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className={`text-2xl font-black leading-none ${isMoney ? 'text-green-600' : 'text-slate-800'}`}>
                        {value}
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
