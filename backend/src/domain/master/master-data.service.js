/**
 * MASTER DATA SERVICE
 * Business logic for master data management
 */

import { MasterDataRepo } from '../../infra/master-data.repo.js';

export class MasterDataService {
    // ==================== STORE ====================

    static async getAllStores(currentUser) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllStores();
    }

    static async createStore(currentUser, storeData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        // Validation
        if (!storeData.store_code || !storeData.store_name) {
            throw new Error('store_code and store_name are required');
        }

        return await MasterDataRepo.createStore(storeData);
    }

    static async updateStore(currentUser, storeCode, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updateStore(storeCode, updates);
    }

    static async deleteStore(currentUser, storeCode) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deleteStore(storeCode);
    }

    // ==================== CHECKLIST ====================

    static async getAllChecklists(currentUser, filters) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllChecklists(filters);
    }

    static async createChecklist(currentUser, checklistData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.createChecklist(checklistData);
    }

    static async updateChecklist(currentUser, id, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updateChecklist(id, updates);
    }

    static async deleteChecklist(currentUser, id) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deleteChecklist(id);
    }

    // ==================== POSITIONS ====================

    static async getAllPositions(currentUser, filters) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllPositions(filters);
    }

    static async createPosition(currentUser, positionData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.createPosition(positionData);
    }

    static async updatePosition(currentUser, id, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updatePosition(id, updates);
    }

    static async deletePosition(currentUser, id) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deletePosition(id);
    }

    // ==================== INCIDENTS ====================

    static async getAllIncidents(currentUser, filters) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllIncidents(filters);
    }

    static async createIncident(currentUser, incidentData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        // Validation
        if (!incidentData.incident_id || !incidentData.incident_name) {
            throw new Error('incident_id and incident_name are required');
        }

        // Validate ID format (IC_LAYOUT_...)
        // Allow simpler format if needed, but let's stick to IC for now

        return await MasterDataRepo.createIncident(incidentData);
    }

    static async updateIncident(currentUser, id, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updateIncident(id, updates);
    }

    static async deleteIncident(currentUser, id) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deleteIncident(id);
    }

    // ==================== LAYOUTS ====================

    static async getAllLayouts(currentUser, filters) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllLayouts(filters);
    }

    static async createLayout(currentUser, layoutData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        // Validation
        if (!layoutData.layout_code || !layoutData.layout_name) {
            throw new Error('layout_code and layout_name are required');
        }

        return await MasterDataRepo.createLayout(layoutData);
    }

    static async updateLayout(currentUser, id, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updateLayout(id, updates);
    }

    static async deleteLayout(currentUser, id) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deleteLayout(id);
    }

    // ==================== ROLES ====================

    static async getAllRoles(currentUser, filters) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllRoles(filters);
    }

    static async createRole(currentUser, roleData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        if (!roleData.role_code || !roleData.role_name) {
            throw new Error('role_code and role_name are required');
        }
        return await MasterDataRepo.createRole(roleData);
    }

    static async updateRole(currentUser, id, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updateRole(id, updates);
    }

    static async deleteRole(currentUser, id) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deleteRole(id);
    }

    // ==================== SHIFTS ====================

    static async getAllShifts(currentUser, filters) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.getAllShifts(filters);
    }

    static async createShift(currentUser, shiftData) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        if (!shiftData.shift_code || !shiftData.shift_name) {
            throw new Error('shift_code and shift_name are required');
        }
        return await MasterDataRepo.createShift(shiftData);
    }

    static async updateShift(currentUser, id, updates) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.updateShift(id, updates);
    }

    static async deleteShift(currentUser, id) {
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await MasterDataRepo.deleteShift(id);
    }
}
