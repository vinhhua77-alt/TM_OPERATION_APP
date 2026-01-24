import React, { useState } from 'react';

const PageGuide = ({ onBack }) => {
    const [openSection, setOpenSection] = useState(0);

    const sections = [
        {
            title: "1. ĐĂNG NHẬP & QUYỀN TRUY CẬP",
            icon: "🔑",
            content: "• Sử dụng Mã Nhân Viên (TMxxx) để đăng nhập.\n• Nếu là LEADER: Bạn sẽ có thêm quyền 'Leader Log' để quản lý vận hành.\n• Nếu là STAFF: Bạn tập trung vào 'Nhật ký ca' và tích lũy 'Giờ bay'."
        },
        {
            title: "2. NHẬT KÝ CA & CHECKLIST V8",
            icon: "📝",
            content: "• Chọn Khu vực (Layout): Mỗi khu vực (FOH, BOH, CASH...) có màu sắc riêng.\n• Hoàn thành Checklist: Đảm bảo các tiêu chuẩn Sapphire được thực thi 100%.\n• Báo cáo Sự cố: Nếu có mục nào chọn 'KHÔNG', hệ thống sẽ bắt buộc mô tả sự cố để Team hỗ trợ kịp thời."
        },
        {
            title: "3. CẢM NHẬN & LÝ DO CỐT LÕI",
            icon: "😊",
            content: "• Đánh giá Mood: Chọn Icon cảm xúc sau khi tan ca.\n• Lý do (2/6): Bạn CHỈ ĐƯỢC CHỌN TỐI ĐA 2 lý do cốt lõi nhất giải thích cho cảm xúc của mình. Việc này giúp hệ thống Decision Engine lọc ra đúng vấn đề cần cải thiện."
        },
        {
            title: "4. LỘ TRÌNH 'GIỜ BAY' (CAREER)",
            icon: "✈️",
            content: "• Bay đủ 300H: Nút 'TẬP SỰ QUẢN LÝ' sẽ được mở khóa.\n• Tích lũy thực chiến: Hệ thống Decision Engine tự động cộng dồn giờ từ mọi báo cáo hợp lệ.\n• Thăng tiến: Đây là cơ sở minh bạch nhất để bạn lên Leader hoặc SM."
        },
        {
            title: "5. GAMIFICATION & SÁNG KIẾN",
            icon: "💎",
            content: "• XP & Level: Mỗi báo cáo giúp bạn thăng cấp (Level up).\n• Streak (🔥): Duy trì gửi báo cáo mỗi ngày để thắp lửa chuỗi ca làm liên tiếp.\n• Sáng kiến: Đừng quên đóng góp ý tưởng trong mục 'Sáng kiến hôm nay' để nhận phần thưởng XP đặc biệt!"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-10 animate-in fade-in duration-500">
            {/* Header Sapphire Style */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 pb-12 text-white relative overflow-hidden shadow-xl mb-[-30px]">
                <div className="relative z-10">
                    <button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white text-[8px] font-black px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest mb-6 transition-all active:scale-95">
                        ← Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-2xl rotate-3">📖</div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">HDSD SAPPHIRE</h1>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1 italic">V3.0 Decision Engine</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
            </div>

            {/* Accordion List */}
            <div className="px-4 space-y-3 relative z-20">
                {sections.map((section, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => setOpenSection(openSection === index ? null : index)}
                            className={`w-full p-5 flex items-center justify-between text-left transition-colors ${openSection === index ? 'bg-slate-50' : 'bg-white'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xl">{section.icon}</span>
                                <span className={`text-[11px] font-black uppercase tracking-tight ${openSection === index ? 'text-blue-600' : 'text-slate-600'}`}>
                                    {section.title}
                                </span>
                            </div>
                            <span className={`text-xs transition-transform duration-300 ${openSection === index ? 'rotate-180 text-blue-500' : 'text-slate-300'}`}>
                                ▿
                            </span>
                        </button>
                        {openSection === index && (
                            <div className="px-6 pb-6 pt-1 animate-in slide-in-from-top-4 duration-300">
                                <div className="h-[1px] bg-slate-100 mb-4 w-full opacity-50"></div>
                                <div className="text-[11px] font-medium text-slate-500 leading-relaxed whitespace-pre-line font-italic">
                                    {section.content}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Insight */}
            <div className="mt-8 px-6 text-center">
                <div className="inline-block p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1 italic">💎 TM PRIDE</p>
                    <p className="text-[9px] text-blue-600/70 font-medium">"Kỷ luật là sức mạnh - Cải tiến là tương lai"</p>
                </div>
            </div>
        </div>
    );
};

export default PageGuide;
