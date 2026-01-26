import React from 'react';

const StaffInsightCard = ({ insights }) => {
    if (!insights || insights.length === 0) return null;

    // Pick top priority insight (Mood > Quality > Effort)
    const topInsight = insights.find(i => i.type === 'mood') || insights[0];

    const colorStyles = {
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        orange: "bg-amber-50 text-amber-700 border-amber-100",
        rose: "bg-rose-50 text-rose-700 border-rose-100",
        red: "bg-red-50 text-red-700 border-red-100",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100"
    };

    const theme = colorStyles[topInsight.color] || colorStyles.blue;

    return (
        <div className={`mx-0 mb-3 p-3 rounded-2xl border ${theme} flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2`}>
            <div className="text-2xl shrink-0">
                {topInsight.type === 'mood' && '🧘'}
                {topInsight.type === 'quality' && '⭐'}
                {topInsight.type === 'effort' && '🔥'}
            </div>
            <div>
                <div className="text-[9px] font-black uppercase opacity-60 tracking-wider mb-0.5">Staff Insight</div>
                <div className="text-xs font-bold leading-tight">
                    {topInsight.text}
                </div>
            </div>
        </div>
    );
};

export default StaffInsightCard;
