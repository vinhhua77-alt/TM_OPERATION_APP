import { supabase } from '../../infra/supabase.client.js';

/**
 * Sandbox Service
 * Quản lý sandbox sessions và data lifecycle
 */
export class SandboxService {
    /**
     * Start a sandbox session for user
     */
    static async startSession(userId) {
        try {
            // Check if user already has active session
            const existingSession = await this.getActiveSession(userId);

            if (existingSession) {
                return {
                    success: true,
                    data: {
                        session_id: existingSession.id,
                        expires_at: existingSession.expires_at,
                        message: 'Đã có session đang hoạt động'
                    }
                };
            }

            const { data, error } = await supabase
                .from('sandbox_sessions')
                .insert({
                    user_id: userId,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data: {
                    session_id: data.id,
                    expires_at: data.expires_at
                }
            };
        } catch (error) {
            console.error('Error starting sandbox session:', error);
            return {
                success: false,
                error_code: 'SANDBOX:START_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Get active sandbox session for user
     */
    static async getActiveSession(userId) {
        const { data } = await supabase
            .from('sandbox_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return data;
    }

    /**
     * End sandbox session
     */
    static async endSession(sessionId) {
        try {
            const { error } = await supabase
                .from('sandbox_sessions')
                .update({ is_active: false })
                .eq('id', sessionId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error ending sandbox session:', error);
            return {
                success: false,
                error_code: 'SANDBOX:END_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Cleanup expired sandbox data
     * Run by scheduled job every hour
     */
    static async cleanupExpiredData() {
        try {
            const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // Delete from all sandbox-enabled tables
            const tables = ['raw_shiftlog', 'leader_reports', 'raw_operational_events'];
            const results = {};

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .delete()
                    .eq('is_sandbox', true)
                    .lt('created_at', cutoffTime)
                    .select('id');

                if (error) {
                    console.error(`Error cleaning up ${table}:`, error);
                    results[table] = { error: error.message };
                } else {
                    results[table] = { deleted: data?.length || 0 };
                }
            }

            // Mark expired sessions as inactive
            const { error: sessionError } = await supabase
                .from('sandbox_sessions')
                .update({ is_active: false })
                .lt('expires_at', new Date().toISOString())
                .eq('is_active', true);

            if (sessionError) {
                console.error('Error deactivating expired sessions:', sessionError);
            }

            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('Error in cleanup process:', error);
            return {
                success: false,
                error_code: 'SANDBOX:CLEANUP_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Get sandbox statistics for user
     */
    static async getStats(userId) {
        try {
            const session = await this.getActiveSession(userId);

            if (!session) {
                return {
                    success: true,
                    data: { active_session: false }
                };
            }

            // Count sandbox records by user
            const { count: shiftlogCount } = await supabase
                .from('raw_shiftlog')
                .select('*', { count: 'exact', head: true })
                .eq('is_sandbox', true)
                .eq('staff_id', userId);

            const { count: leaderReportCount } = await supabase
                .from('leader_reports')
                .select('*', { count: 'exact', head: true })
                .eq('is_sandbox', true)
                .eq('leader_id', userId);

            const { count: eventCount } = await supabase
                .from('raw_operational_events')
                .select('*', { count: 'exact', head: true })
                .eq('is_sandbox', true)
                .eq('staff_id', userId);

            return {
                success: true,
                data: {
                    active_session: true,
                    session_id: session.id,
                    expires_at: session.expires_at,
                    records: {
                        shift_logs: shiftlogCount || 0,
                        leader_reports: leaderReportCount || 0,
                        operational_events: eventCount || 0
                    }
                }
            };
        } catch (error) {
            console.error('Error getting sandbox stats:', error);
            return {
                success: false,
                error_code: 'SANDBOX:STATS_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Export sandbox data for user (raw JSON format)
     * Frontend will handle Excel conversion
     */
    static async exportSandboxData(userId) {
        try {
            const session = await this.getActiveSession(userId);

            if (!session) {
                throw new Error('No active sandbox session');
            }

            // Fetch all sandbox data for this user
            const { data: shiftLogs } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .eq('is_sandbox', true)
                .eq('staff_id', userId)
                .order('created_at', { ascending: false });

            const { data: leaderReports } = await supabase
                .from('leader_reports')
                .select('*')
                .eq('is_sandbox', true)
                .eq('leader_id', userId)
                .order('created_at', { ascending: false });

            return {
                success: true,
                data: {
                    shift_logs: shiftLogs || [],
                    leader_reports: leaderReports || [],
                    exported_at: new Date().toISOString(),
                    session_id: session.id
                }
            };
        } catch (error) {
            console.error('Error exporting sandbox data:', error);
            return {
                success: false,
                error_code: 'SANDBOX:EXPORT_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Clear all sandbox data for user
     */
    static async clearSessionData(userId) {
        try {
            const tables = ['raw_shiftlog', 'leader_reports', 'raw_operational_events'];
            const results = {};

            for (const table of tables) {
                // Determine user field based on table
                const userField = table === 'leader_reports' ? 'leader_id' : 'staff_id';

                const { data, error } = await supabase
                    .from(table)
                    .delete()
                    .eq('is_sandbox', true)
                    .eq(userField, userId)
                    .select('id');

                if (error) {
                    console.error(`Error clearing ${table}:`, error);
                    results[table] = { error: error.message };
                } else {
                    results[table] = { deleted: data?.length || 0 };
                }
            }

            return {
                success: true,
                message: 'Đã xóa toàn bộ dữ liệu Test thành công',
                results
            };
        } catch (error) {
            console.error('Error in clearSessionData:', error);
            return {
                success: false,
                error_code: 'SANDBOX:CLEAR_FAILED',
                message: error.message
            };
        }
    }
}
