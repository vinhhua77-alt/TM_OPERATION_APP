import { useMemo } from 'react';

/**
 * HOOK: usePermission
 * Quản lý phân quyền tập trung tại Frontend
 */
export const usePermission = (user) => {
    return useMemo(() => {
        // [SANDBOX GOD MODE]
        // Check localStorage directly for immediate UI update
        const isSandbox = localStorage.getItem('sandbox_mode') === 'true';

        // IT, ADMIN và SANDBOX MODE có quyền tối thượng (*)
        const isDivine = ['ADMIN', 'IT'].includes(user?.role) || isSandbox;

        // Ma trận quyền fallback (Sẽ đồng bộ với DB trong tương lai)
        const rolePermissions = {
            OPS: [
                'MANAGE_STAFF',
                'MANAGE_STORE',
                'VIEW_ANALYTICS',
                'VIEW_ADMIN_CONSOLE',
                'VIEW_DAILY_HUB',
                'VIEW_QAQC_HUB',
                'MANAGE_INCIDENT'
            ],
            SM: [
                'MANAGE_STAFF',
                'MANAGE_ANNOUNCEMENT',
                'VIEW_ANALYTICS',
                'VIEW_DAILY_HUB',
                'VIEW_QAQC_HUB',
                'MANAGE_INCIDENT'
            ],
            LEADER: [
                'SUBMIT_LEADER_REPORT',
                'VIEW_STORE_DASHBOARD',
                'VIEW_DAILY_HUB',
                'VIEW_QAQC_HUB'
            ],
            STAFF: [
                'SUBMIT_SHIFTLOG',
                'VIEW_STORE_DASHBOARD',
                'VIEW_DAILY_HUB'
            ]
        };

        const userPerms = rolePermissions[user?.role] || [];

        return {
            /**
             * can('PERMISSION_KEY')
             * Kiểm tra xem user có quyền cụ thể hay không
             */
            can: (permKey) => {
                if (isDivine) return true;
                return userPerms.includes(permKey);
            },

            /**
             * isRole('ROLE_CODE')
             * Check role nhanh nếu cần
             */
            isRole: (role) => user?.role === role,

            isDivine
        };
    }, [user]);
};
