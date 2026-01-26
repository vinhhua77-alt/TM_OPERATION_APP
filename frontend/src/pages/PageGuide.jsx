import React from 'react';

const PageGuide = ({ onBack }) => {
    // Guide Content
    const guides = [
        {
            title: "ĐĂNG NHẬP",
            icon: "🔑",
            color: "blue",
            steps: [
                "Dùng mã TMxxx",
                "Password mặc định",
                "Đổi Pass ngay lần đầu"
            ]
        },
        {
            title: "CHECKLIST & SHIFT",
            icon: "📝",
            color: "purple",
            steps: [
                "Vào ca / Ra ca đúng giờ",
                "Ghi lý do nếu lệch ca",
                "Checklist vận hành đầy đủ"
            ]
        },
        {
            title: "LỘ TRÌNH THĂNG TIẾN",
            icon: "🐣",
            color: "pink",
            steps: [
                "Tích lũy 'Giờ Ấp' mỗi ca",
                "Đủ giờ -> Bật 'Chế độ Tập sự'",
                "Chờ Leader/SM duyệt"
            ]
        },
        {
            title: "CẢM XÚC & GAMING",
            icon: "💎",
            color: "orange",
            steps: [
                "Rate Mood cuối ca",
                "Nhận XP khi completed",
                "Đua Top Leaderboard"
            ]
        },
        {
            title: "SỰ CỐ VẬN HÀNH",
            icon: "⚠️",
            color: "red",
            steps: [
                "Báo cáo ngay lập tức",
                "Chụp ảnh (nếu cần)",
                "Leader sẽ xử lý"
            ]
        },
        {
            title: "SÁNG KIẾN",
            icon: "💡",
            color: "cyan",
            steps: [
                "Góp ý cải tiến quy trình",
                "Nhận XP thưởng nóng",
                "Được BOD ghi nhận"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20 fade-in">
            {/* HEADER & CONTROLS */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-100 px-3 py-3 space-y-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        HƯỚNG DẪN VẬN HÀNH
                    </h1>
                    <button onClick={onBack} className="text-sm text-slate-500 font-bold">Thoát</button>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                    {guides.map((guide, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full hover:border-black transition-colors">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 bg-${guide.color}-50 text-${guide.color}-600`}>
                                {guide.icon}
                            </div>

                            <h3 className="text-xs font-black text-slate-700 uppercase mb-2 tracking-tight">
                                {guide.title}
                            </h3>

                            <ul className="space-y-1.5 flex-1">
                                {guide.steps.map((step, sIdx) => (
                                    <li key={sIdx} className="text-[10px] font-medium text-slate-500 flex items-start gap-1.5">
                                        <span className={`w-1 h-1 rounded-full mt-1.5 bg-${guide.color}-400 shrink-0`}></span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* BOTTOM NOTE */}
                <div className="mt-6 text-center px-4">
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 border-dashed">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">💎 SYSTEM V3.2</p>
                        <p className="text-[9px] text-slate-500">"Hệ thống tự động ghi nhận mọi nỗ lực của bạn"</p>
                        <div className="mt-2 text-[8px] text-slate-400">Release: 27/01/2026 • SaaS Enabled</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageGuide;
