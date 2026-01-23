import React from 'react';

// Widget: Thẻ Sức Khỏe (Health Score)
const HealthScoreCard = ({ score, status }) => {
    let color = 'bg-blue-50 text-blue-700 border-blue-200';
    let icon = '🛡️';

    if (status === 'CRITICAL') {
        color = 'bg-red-50 text-red-700 border-red-200';
        icon = '🚨';
    } else if (status === 'WARNING') {
        color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        icon = '⚠️';
    } else if (score >= 90) {
        color = 'bg-green-50 text-green-700 border-green-200';
        icon = '✅';
    }

    return (
        <div className={`p-4 rounded-xl border ${color} flex items-center justify-between shadow-sm`}>
            <div>
                <p className="text-xs font-bold uppercase opacity-80 mb-1">Health Score</p>
                <h3 className="text-3xl font-extrabold">{score}/100</h3>
            </div>
            <div className="text-3xl">{icon}</div>
        </div>
    );
};

// Widget: Biểu đồ đơn giản (Sparkline like) - Ở đây dùng text list cho mood trend đơn giản
const MoodTrendCard = ({ metrics }) => {
    // metrics: [ { report_date, avg_mood_score }... ]
    // Map score 1-5 to Icons
    const getIcon = (s) => {
        if (s >= 4.5) return '😍';
        if (s >= 4) return '😊';
        if (s >= 3) return '😐';
        if (s >= 2) return '😟';
        return '😭';
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Mood Trend (7 Days)</h4>
            <div className="flex justify-between items-end h-16 gap-1">
                {metrics.slice(-7).map((m, idx) => {
                    const h = Math.max(20, (m.avg_mood_score / 5) * 100);
                    return (
                        <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                            <div className="text-[10px]">{getIcon(m.avg_mood_score)}</div>
                            <div
                                style={{ height: `${h}%` }}
                                className={`w-full rounded-t-sm ${m.avg_mood_score >= 4 ? 'bg-green-200' : m.avg_mood_score >= 3 ? 'bg-yellow-200' : 'bg-red-200'}`}
                            ></div>
                            <span className="text-[9px] text-gray-400 font-mono">{m.report_date.split('-')[2]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Widget: Danh sách nhân viên tích cực (Top Staff)
const TopStaffList = ({ staffList }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">🏆 Top Performers</h4>
            <div className="flex flex-col gap-3">
                {staffList.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">{s.fullname}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{s.totalHours}h • {s.code}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-blue-600">{Math.round(s.avgChecklist)}%</div>
                            <div className="text-[9px] text-gray-400">Checklist</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Widget: Incident Alert (Sự cố cần xử lý)
const IncidentAlertCard = ({ incidents }) => {
    if (!incidents || incidents.length === 0) return (
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
                <p className="text-xs font-bold text-green-800">Không có sự cố</p>
                <p className="text-[10px] text-green-600">Vận hành đang ổn định</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
            <h4 className="text-xs font-bold text-red-600 uppercase mb-3 flex items-center gap-2">
                <span>🔥</span> Sự cố nóng hổi ({incidents.length})
            </h4>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                {incidents.map((inc, idx) => (
                    <div key={idx} className="bg-red-50 p-2 rounded text-xs text-gray-700">
                        <div className="font-bold text-red-700 mb-1 flex justify-between">
                            <span>{new Date(inc.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[9px] bg-white px-1 rounded border border-red-200">{inc.shift_type || 'SHIFT'}</span>
                        </div>
                        {inc.note}
                        <div className="mt-1 text-[9px] text-gray-500 text-right">- {inc.staff_master?.fullname || 'Unknown'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// container for widgets
const WidgetComponents = {
    HealthScoreCard,
    MoodTrendCard,
    TopStaffList,
    IncidentAlertCard
};

export default WidgetComponents;
