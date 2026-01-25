/**
 * CAREER SERVICE - DECISION ENGINE V3
 * Chịu trách nhiệm quản lý thăng tiến và trạng thái nghề nghiệp.
 */

import { supabase } from '../../infra/supabase.client.js';

export class CareerService {
    /**
     * Kiểm tra điều kiện thăng tiến cho một nhân viên
     */
    static async checkPromotionEligibility(staffId) {
        try {
            // 1. Lấy thông tin nhân viên hiện tại
            const { data: staff, error: staffError } = await supabase
                .from('staff_master')
                .select('current_level, trust_score, performance_score, level_changed_at')
                .eq('staff_id', staffId)
                .single();

            if (staffError) throw staffError;

            // 2. Xác định level tiếp theo
            const currentLevel = staff.current_level || 'L0';
            const nextLevelCode = this.getNextLevelCode(currentLevel);

            if (!nextLevelCode) {
                return { eligible: false, reason: 'Already at maximum level' };
            }

            // 3. Lấy cấu hình level tiếp theo
            const { data: config, error: configError } = await supabase
                .from('career_levels_config')
                .select('*')
                .eq('level_code', nextLevelCode)
                .single();

            if (configError) throw configError;

            // 4. Kiểm tra các điều kiện
            const daysInLevel = Math.floor((new Date() - new Date(staff.level_changed_at)) / (1000 * 60 * 60 * 24));

            const checks = {
                trust_score: staff.trust_score >= config.min_trust_score,
                ops_score: staff.performance_score >= config.min_ops_score,
                time_in_level: daysInLevel >= config.min_days_in_level
            };

            const isEligible = Object.values(checks).every(v => v === true);

            // 5. Cập nhật trạng thái trong staff_master
            await supabase
                .from('staff_master')
                .update({ promotion_eligible: isEligible })
                .eq('staff_id', staffId);

            return {
                eligible: isEligible,
                current_level: currentLevel,
                next_level: nextLevelCode,
                requirements: config,
                current_stats: {
                    trust_score: staff.trust_score,
                    ops_score: staff.performance_score,
                    days_in_level: daysInLevel
                },
                checks
            };

        } catch (error) {
            console.error('CareerService.checkPromotionEligibility error:', error);
            throw error;
        }
    }

    /**
     * Thực hiện thăng cấp
     */
    static async promoteStaff(staffId, promotedBy) {
        try {
            const eligibility = await this.checkPromotionEligibility(staffId);

            if (!eligibility.eligible) {
                throw new Error('Staff is not eligible for promotion');
            }

            const { data: result, error } = await supabase
                .from('staff_master')
                .update({
                    current_level: eligibility.next_level,
                    promotion_eligible: false,
                    level_changed_at: new Date().toISOString()
                })
                .eq('staff_id', staffId)
                .select()
                .single();

            if (error) throw error;

            // Log vào audit hoặc promotion logs
            await supabase.from('staff_audit_log').insert({
                staff_id: staffId,
                action: 'PROMOTION',
                old_data: { level: eligibility.current_level },
                new_data: { level: eligibility.next_level },
                changed_by: promotedBy
            });

            return result;
        } catch (error) {
            console.error('CareerService.promoteStaff error:', error);
            throw error;
        }
    }

    static getNextLevelCode(currentLevel) {
        const levels = ['L0', 'L1', 'L2', 'L3', 'L4'];
        const index = levels.indexOf(currentLevel);
        if (index === -1 || index === levels.length - 1) return null;
        return levels[index + 1];
    }
}
