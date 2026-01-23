import React from 'react';

const MoodChart = ({ data }) => {
    // data expected: [ { date: 'DD/MM', mood: 3 }, ... ]
    // Use simple flex bars

    if (!data || data.length === 0) return <div className="text-center text-xs text-slate-300">Không có dữ liệu</div>;

    const maxVal = 5; // Max mood 5

    return (
        <div className="flex items-end justify-between h-full pt-4 space-x-2">
            {data.map((item, index) => {
                const heightPct = (item.mood / maxVal) * 100;
                let colorClass = 'bg-slate-300';
                if (item.mood >= 4.5) colorClass = 'bg-green-500';
                else if (item.mood >= 3.5) colorClass = 'bg-blue-400';
                else if (item.mood >= 2.5) colorClass = 'bg-yellow-400';
                else colorClass = 'bg-red-400';

                return (
                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="relative w-full flex justify-center items-end h-[80%]">
                            <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-2 md:w-4 rounded-t-sm ${colorClass} transition-all duration-500 hover:opacity-80`}
                            ></div>

                            {/* Tooltip */}
                            <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.mood}/5
                            </div>
                        </div>
                        <div className="mt-2 text-[9px] text-slate-400 font-bold border-t border-slate-100 w-full text-center pt-1">
                            {item.date}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MoodChart;
