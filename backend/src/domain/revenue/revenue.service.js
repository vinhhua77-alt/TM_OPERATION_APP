import { supabase } from '../../infra/supabase.client.js';

export class RevenueService {
    /**
     * Ghi nhận doanh thu ngày
     */
    static async logDailyRevenue(data) {
        const { store_code, date, gross_sales, net_sales, discount_amount, guest_count, metadata = {} } = data;

        const { data: result, error } = await supabase
            .from('daily_revenue_logs')
            .upsert([{
                store_code,
                date,
                gross_sales: parseFloat(gross_sales) || 0,
                net_sales: parseFloat(net_sales) || 0,
                discount_amount: parseFloat(discount_amount) || 0,
                guest_count: parseInt(guest_count) || 0,
                metadata,
                updated_at: new Date().toISOString()
            }], { onConflict: 'store_code, date' })
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    /**
     * Lấy dữ liệu doanh thu để Decision Engine tính toán
     */
    static async getRevenueMetrics(store_code, startDate, endDate) {
        const { data, error } = await supabase
            .from('daily_revenue_logs')
            .select('*')
            .eq('store_code', store_code)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Xác thực dữ liệu bởi OPS (Module 10 Flow)
     */
    static async verifyRevenue(id, verified_by_ops = true) {
        const { data, error } = await supabase
            .from('daily_revenue_logs')
            .update({ verified_by_ops, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
