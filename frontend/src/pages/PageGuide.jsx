import React, { useState } from 'react';

const PageGuide = ({ onBack }) => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    const sections = [
        {
            title: "1. Đăng nhập & Bắt đầu",
            content: "Sử dụng Mã Nhân Viên (Ví dụ: TM001) và Mật Khẩu được cung cấp để đăng nhập. Nếu quên mật khẩu, hãy liên hệ Quản Lý Cửa Hàng (SM)."
        },
        {
            title: "2. Báo cáo Ca (Shift Log)",
            content: "Vào mục 'Báo Cáo'. Chọn Nhà Hàng, Giờ Vào, Giờ Ra. Chọn Khu Vực làm việc (Layout). Hoàn thành Checklist công việc. Chọn Cảm Nhận về ca làm việc. Nhấn 'Gửi Báo Cáo'."
        },
        {
            title: "3. Xem Lịch Sử Ca",
            content: "Tại màn hình chính (Dashboard), bạn có thể xem lại thống kê các ca làm việc trong tháng, tổng số giờ làm và đánh giá trung bình."
        },
        {
            title: "4. Gặp Sự Cố?",
            content: "Nếu gặp lỗi ứng dụng (màn hình trắng, không gửi được báo cáo), hãy thử:\n- Tải lại trang (Refresh).\n- Xóa cache trình duyệt.\n- Báo ngay cho IT hoặc Quản Lý."
        }
    ];

    return (
        <div className="fade-in">
            <div className="header" style={{ marginBottom: '20px' }}>
                <h2 className="brand-title" style={{ fontSize: '18px' }}>📖 HƯỚNG DẪN SỬ DỤNG</h2>
                <p className="sub-title-dev">DÀNH CHO NHÂN VIÊN VẬN HÀNH</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sections.map((section, index) => (
                    <div key={index} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <button
                            onClick={() => toggleSection(index)}
                            style={{
                                width: '100%',
                                padding: '15px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: openSection === index ? '#F0F9FF' : 'white',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontWeight: '700', fontSize: '12px', color: '#004AAD' }}>{section.title}</span>
                            <span style={{ fontSize: '12px', transform: openSection === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {openSection === index && (
                            <div style={{ padding: '0 15px 15px 15px', fontSize: '11px', color: '#4B5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mt-10">
                <button
                    onClick={onBack}
                    className="btn-login btn-outline"
                    style={{ background: 'white', color: '#666', border: '1px solid #DDD' }}
                >
                    QUAY LẠI
                </button>
            </div>
        </div>
    );
};

export default PageGuide;
