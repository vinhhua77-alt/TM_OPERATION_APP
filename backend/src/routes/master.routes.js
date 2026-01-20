/**
 * MASTER ROUTES
 * API endpoints cho Master Data
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả routes cần authentication
router.use(async (req, res, next) => {
    await authenticateToken(req, res, next);
});

/**
 * GET /api/master/data
 * Lấy tất cả master data cần thiết cho frontend
 */
router.get('/data', (req, res) => {
    // Mock data for initial implementation
    // In production, this should fetch from database/sheets
    const masterData = {
        stores: [
            { id: 'DD-THISO', name: 'DD - THISO MALL', store_code: 'DD-THISO' },
            { id: 'DD-PMAL', name: 'DD- PARC MALL', store_code: 'DD-PMAL' },
            { id: 'DN-CLON', name: 'ĐN - Chợ Lớn', store_code: 'DN-CLON' },
            { id: 'DN-PMH', name: 'ĐN - Phú Mỹ Hưng', store_code: 'DN-PMH' },
            { id: 'DH-CVL', name: 'Đông Hỷ - CVL', store_code: 'DH-CVL' },
            { id: 'GG-CVL', name: 'GET&GO CVL', store_code: 'GG-CVL' },
            { id: 'TMG', name: 'THÁI MẬU', store_code: 'TMG' }
        ],
        leaders: [
            { id: 'L01', name: 'Nguyễn Văn A', store_code: 'DN-CLON' },
            { id: 'L02', name: 'Trần Thị B', store_code: 'DD-THISO' }
        ],
        shifts: [
            { name: 'Ca Sáng', start: '08:00', end: '16:00' },
            { name: 'Ca Chiều', start: '14:00', end: '22:00' },
            { name: 'Ca Gãy', start: '10:00', end: '14:00' }
        ],
        layouts: {
            "KITCHEN": {
                "name": "BẾP",
                "subPositions": ["Bếp Chính", "Phụ Bếp", "Chảo", "Thớt"],
                "checklist": [
                    { "id": "cki_1", "text": "Vệ sinh khu vực làm việc sạch sẽ" },
                    { "id": "cki_2", "text": "Kiểm tra nguyên vật liệu đầy đủ" },
                    { "id": "cki_3", "text": "Tắt các thiết bị điện khi không sử dụng" }
                ],
                "incidents": ["Hỏng thiết bị", "Thiếu nguyên liệu", "Tai nạn lao động", "Khác"]
            },
            "SERVICE": {
                "name": "PHỤC VỤ",
                "subPositions": ["Order", "Runner", "Cashier"],
                "checklist": [
                    { "id": "srv_1", "text": "Đồng phục chỉnh tề, tác phong chuyên nghiệp" },
                    { "id": "srv_2", "text": "Vệ sinh khu vực bàn ghế sạch sẽ" },
                    { "id": "srv_3", "text": "Setup bàn ăn đầy đủ dụng cụ" }
                ],
                "incidents": ["Khách phàn nàn", "Đổ vỡ", "Sai món", "Khác"]
            }
        },
        // NEW FIELDS FOR LEADER REPORT
        areas: ['SẢNH', 'BẾP', 'QUẦY', 'KHO', 'KHÁC'],
        staff: [ // Mock staff list for feedback
            { id: 'S01', name: 'Nguyễn Văn A', store: 'DN-CLON' },
            { id: 'S02', name: 'Trần Thị B', store: 'DN-CLON' },
            { id: 'S03', name: 'Lê Văn C', store: 'DD-THISO' }
        ],
        leaderChecklist: [
            "Kiểm tra nhân sự đầu ca",
            "Kiểm tra hàng hóa/nguyên vật liệu",
            "Kiểm tra vệ sinh khu vực",
            "Kiểm tra công cụ dụng cụ",
            "Bàn giao ca trước & lưu ý"
        ],
        leaderIncidents: [
            "Hỏng thiết bị", "Thiếu nhân sự", "Sự cố khách hàng", "Hết món/NVL", "Khác"
        ]
    };

    res.json({
        success: true,
        data: masterData
    });
});

export default router;
