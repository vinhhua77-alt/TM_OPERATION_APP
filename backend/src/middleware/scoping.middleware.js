/**
 * SCOPING MIDDLEWARE
 * Mục tiêu: Đảm bảo dữ liệu bị cô lập theo Store cho các Role Leader và SM.
 * Nếu user là SM hoặc LEADER, middleware sẽ ghi đè storeId/storeCode bằng store_code của user.
 */
export const enforceStoreScoping = (req, res, next) => {
    // Nếu chưa đăng nhập hoặc là Admin/IT/OPS (có quyền xem diện rộng) thì không ép scoping
    if (!req.user || ['ADMIN', 'IT', 'OPS', 'AM'].includes(req.user.role)) {
        return next();
    }

    const userStore = req.user.store_code || req.user.storeCode;

    // Chỉ áp dụng cho SM và LEADER (Cô lập dữ liệu tại cửa hàng của họ)
    if (['SM', 'LEADER'].includes(req.user.role)) {
        if (userStore) {
            // Ghi đè tham số trong Query
            if (req.query.storeId) req.query.storeId = userStore;
            if (req.query.storeCode) req.query.storeCode = userStore;
            if (req.query.store_code) req.query.store_code = userStore;

            // Ghi đè tham số trong Body
            if (req.body.storeId) req.body.storeId = userStore;
            if (req.body.storeCode) req.body.storeCode = userStore;
            if (req.body.store_code) req.body.store_code = userStore;
        } else {
            // Trường hợp hy hữu user không có store_code gán vào
            return res.status(403).json({
                success: false,
                message: 'Tài khoản chưa được gán chi nhánh vận hành.'
            });
        }
    }

    next();
};
