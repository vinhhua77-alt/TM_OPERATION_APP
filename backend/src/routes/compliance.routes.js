import express from 'express';
import { ComplianceService } from '../domain/decision/compliance.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { enforceStoreScoping } from '../middleware/scoping.middleware.js';

const router = express.Router();

// Apply authentication & scoping to ALL compliance routes
router.use(authenticateToken);
router.use(enforceStoreScoping);

/**
 * Staff Signals
 */
router.post('/signals', async (req, res) => {
    try {
        const payload = { ...req.body, tenant_id: req.tenantId };
        const data = await ComplianceService.processStaffSignal(payload);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Leader 5S Checks
 */
router.post('/checks', async (req, res) => {
    try {
        const payload = { ...req.body, tenant_id: req.tenantId };
        const data = await ComplianceService.processLeaderCheck(payload);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Food Safety Logs
 */
router.post('/food-safety', async (req, res) => {
    try {
        const payload = { ...req.body, tenant_id: req.tenantId };
        const data = await ComplianceService.processFoodSafetyLog(payload);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Shift Readiness & Aggregation
 */
router.post('/readiness', async (req, res) => {
    try {
        const { shiftId, storeCode, leaderId } = req.body;
        const data = await ComplianceService.calculateShiftReadiness(shiftId, storeCode, req.tenantId, leaderId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Staff Assignments (Based on Config)
 * ENFORCED: Tenant isolation
 */
router.get('/staff-assignments', async (req, res) => {
    try {
        const { storeCode, workZone } = req.query;
        const data = await ComplianceService.getStaffAssignments(storeCode, workZone, req.tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- ADMIN CONFIG ROUTES ---

// AREAS
router.get('/config/areas', async (req, res) => {
    try {
        const data = await ComplianceService.getAreas(req.query.storeCode, req.tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/config/areas', async (req, res) => {
    try {
        const payload = { ...req.body, tenant_id: req.tenantId };
        const data = await ComplianceService.createArea(payload);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// SLOTS
router.get('/config/slots', async (req, res) => {
    try {
        const data = await ComplianceService.getSlots(req.tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/config/slots', async (req, res) => {
    try {
        const payload = { ...req.body, tenant_id: req.tenantId };
        const data = await ComplianceService.createSlot(payload);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ASSIGNMENTS
router.get('/config/assignments', async (req, res) => {
    try {
        const data = await ComplianceService.getAssignments(req.query.storeCode, req.tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
