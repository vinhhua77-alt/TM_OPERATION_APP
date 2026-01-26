const RecentShifts = ({ shifts }) => {
    if (!shifts || shifts.length === 0) return (
        <div className="text-center text-slate-400 text-xs py-4 italic">Chưa có dữ liệu ca làm việc</div>
    );

    const getMoodColor = (rating) => {
        const r = parseFloat(rating);
        if (r >= 5) return 'text-green-500';
        if (r >= 4) return 'text-blue-500';
        if (r >= 3) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 bg-slate-50 p-2 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-b border-slate-100">
                <div className="text-left pl-1">Ngày</div>
                <div>Vị trí</div>
                <div>Sự cố</div>
                <div>Giờ làm</div>
                <div>Cảm xúc</div>
            </div>

            {/* Body */}
            <div className="max-h-[300px] overflow-y-auto">
                {shifts.map((shift, index) => (
                    <div key={index} className="grid grid-cols-5 p-2.5 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors items-center text-center">
                        {/* 1. DATE */}
                        <div className="text-left pl-1 font-bold whitespace-nowrap">
                            {shift.date}
                        </div>

                        {/* 2. SUB-POS */}
                        <div className="truncate font-medium text-slate-500" title={shift.subPos}>
                            {shift.subPos || '-'}
                        </div>

                        {/* 3. INCIDENT */}
                        <div className="flex justify-center">
                            {shift.incident ? (
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] bg-red-100 text-red-600 font-bold`} title={shift.incident}>
                                    !
                                </span>
                            ) : (
                                <span className="text-slate-200">-</span>
                            )}
                        </div>

                        {/* 4. DURATION */}
                        <div className="font-mono font-bold text-blue-600 bg-blue-50 rounded px-1 py-0.5 inline-block mx-auto">
                            {shift.duration}h
                        </div>

                        {/* 5. MOOD */}
                        <div className={`font-black ${getMoodColor(shift.rating)}`}>
                            {parseFloat(shift.rating).toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentShifts;
