import React from 'react';

const RecentShifts = ({ shifts }) => {
    if (!shifts || shifts.length === 0) return null;

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        } catch { return dateStr; }
    };

    const getMoodEmoji = (mood) => {
        const m = parseInt(mood);
        if (m >= 5) return '🔥';
        if (m >= 4) return '😄';
        if (m >= 3) return '😐';
        if (m >= 2) return '😞';
        return '😭';
    };

    // Convert seconds to H:M
    const formatDuration = (hours) => {
        if (!hours) return '0h';
        return `${parseFloat(hours).toFixed(1)}h`;
    };

    return (
        <div className="space-y-3">
            {shifts.map((shift, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Icon/Avatar Placeholder or Mood */}
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                            {shift.mood_level ? getMoodEmoji(shift.mood_level) : '📅'}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-700">
                                {formatDate(shift.date)}
                            </div>
                            <div className="text-xs text-slate-400">
                                {shift.start_time} - {shift.end_time}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm font-black text-blue-600">
                            {formatDuration(shift.duration)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                            {shift.store_code || 'STORE'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentShifts;
