/**
 * DASHBOARD SERVICE
 * Business logic for employee dashboard
 */

import { DashboardRepo } from '../../infra/dashboard.repo.js';

export class DashboardService {
    /**
     * Get employee dashboard data
     * @param {object} currentUser - Authenticated user
     * @param {string} staffId - Staff ID to fetch data for
     * @param {string} yearMonth - Optional year-month (defaults to current month)
     */
    static async getEmployeeDashboard(currentUser, staffId, yearMonth) {
        // Authorization: Users can only view their own dashboard unless they're admin/ops
        if (currentUser.id !== staffId && !['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: You can only view your own dashboard');
        }

        // Default to current month if not specified
        if (!yearMonth) {
            const now = new Date();
            yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        // Trim whitespace and validate yearMonth format
        yearMonth = yearMonth.trim();
        console.log('Dashboard service - received yearMonth:', JSON.stringify(yearMonth));

        if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
            console.error('Invalid month format received:', yearMonth);
            throw new Error(`Invalid month format: "${yearMonth}". Use YYYY-MM`);
        }

        return await DashboardRepo.getEmployeeDashboard(staffId, yearMonth);
    }

    /**
     * Get available months for staff member
     */
    static async getAvailableMonths(currentUser, staffId) {
        // Authorization check
        if (currentUser.id !== staffId && !['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        return await DashboardRepo.getAvailableMonths(staffId);
    }
}
