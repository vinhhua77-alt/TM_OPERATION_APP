-- Migration V3.20: Standardize Career Path (Compliance & Reality)
-- Purpose: Map user's 5-level career path with is_trainee logic

-- 1. Cập nhật bảng giá lương chuẩn Career Path (User Updated)
UPDATE career_levels_config SET level_name = 'Tập sự (Trainee)', base_pay = 26000 WHERE level_code = 'L0';
UPDATE career_levels_config SET level_name = 'Nhân viên (Staff)', base_pay = 28000 WHERE level_code = 'L1';
UPDATE career_levels_config SET level_name = 'Tổ trưởng (Crew Leader)', base_pay = 35000 WHERE level_code = 'L2';
UPDATE career_levels_config SET level_name = 'Trợ lý Quản lý (Asst. SM)', base_pay = 42000 WHERE level_code = 'L3';
UPDATE career_levels_config SET level_name = 'Quản lý cửa hàng (SM)', base_pay = 50000 WHERE level_code = 'L4';

-- 2. Gán cấp độ dựa trên Role + Trạng thái Trainee (Lộ trình phát triển)

-- STAFF + TRAINEE = L0 (Tập sự mới vào)
UPDATE staff_master SET current_level = 'L0' WHERE role = 'STAFF' AND is_trainee = true;

-- STAFF (Normal) = L1 (Nhân viên chính thức)
UPDATE staff_master SET current_level = 'L1' WHERE role = 'STAFF' AND is_trainee = false;

-- CREW LEADER (Normal) = L2 (Tổ trưởng vận hành)
UPDATE staff_master SET current_level = 'L2' WHERE role = 'LEADER' AND is_trainee = false;

-- CREW LEADER + TRAINEE = L3 (Đang tập sự lên Trợ lý SM)
UPDATE staff_master SET current_level = 'L3' WHERE role = 'LEADER' AND is_trainee = true;

-- SM (Normal) = L4 (Quản lý cửa hàng)
UPDATE staff_master SET current_level = 'L4' WHERE role = 'SM';
