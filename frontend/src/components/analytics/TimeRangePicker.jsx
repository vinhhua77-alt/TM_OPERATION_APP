import React from 'react';

const TimeRangePicker = ({ mode, setMode, date, setDate }) => {
    const dateInputRef = React.useRef(null);

    const adjustDate = (amount) => {
        const newDate = new Date(date);
        if (mode === 'day') newDate.setDate(newDate.getDate() + amount);
        if (mode === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
        if (mode === 'month') newDate.setMonth(newDate.getMonth() + amount);
        setDate(newDate);
    };

    const formatDateDisplay = () => {
        const d = new Date(date);
        if (mode === 'day') return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (mode === 'week') {
            const day = d.getDay() || 7;
            const monday = new Date(d);
            monday.setDate(d.getDate() - day + 1);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
        }
        if (mode === 'month') return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
        return '';
    };

    const handleDateClick = () => {
        if (dateInputRef.current) {
            if (dateInputRef.current.showPicker) {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.click();
            }
        }
    };

    return (
        <div className="space-y-3">
            {/* CHUYỂN CHẾ ĐỘ: NGÀY | TUẦN | THÁNG */}
            <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
                {['day', 'week', 'month'].map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                            }`}
                    >
                        {m === 'day' ? 'Ngày' : m === 'week' ? 'Tuần' : 'Tháng'}
                    </button>
                ))}
            </div>

            {/* ĐIỀU HƯỚNG THỜI GIAN */}
            <div className="flex items-center justify-between px-1">
                <button
                    onClick={() => adjustDate(-1)}
                    className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-600 active:scale-90 transition-transform shadow-sm"
                >
                    ←
                </button>

                <div
                    onClick={handleDateClick}
                    className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all relative"
                >
                    <span className="text-[14px] font-black text-slate-800 tracking-tight group-hover:text-blue-600">{formatDateDisplay()}</span>
                    <input
                        ref={dateInputRef}
                        type="date"
                        value={date.toISOString().split('T')[0]}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-none"
                    />
                </div>

                <button
                    onClick={() => adjustDate(1)}
                    className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-600 active:scale-90 transition-transform shadow-sm"
                >
                    →
                </button>
            </div>
        </div>
    );
};

export default TimeRangePicker;
