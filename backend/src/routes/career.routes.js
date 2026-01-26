import express from 'express';
const router = express.Router();
import careerService from '../domain/career/career.service.js';
// import { authenticateToken, authorizeRole } from '../middleware/auth.js'; // Uncomment later

// 1. Get List Configs (Public for Staff to view)
router.get('/config', async (req, res) => {
    try {
        const result = await careerService.getConfigs();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Check Eligibility (Staff checks themselves)
router.post('/check-eligibility', async (req, res) => {
    // Expected Body: { staffId, currentRole, totalHours }
    try {
        // In real app, get staffId from Req.user (JWT)
        const { staffId, currentRole, totalHours } = req.body;
        const result = await careerService.checkEligibility(staffId, currentRole, parseInt(totalHours) || 0);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Submit Request (Staff)
router.post('/request', async (req, res) => {
    try {
        const result = await careerService.submitTraineeRequest(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Get Pending Requests (SM/Admin only)
router.get('/pending-requests', async (req, res) => {
    try {
        const { storeId } = req.query; // Filter by store
        const result = await careerService.getPendingRequests(storeId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Approve/Reject Request (SM/Admin only)
router.post('/approve', async (req, res) => {
    try {
        const { requestId, approverId, decision } = req.body;
        const result = await careerService.approveRequest(requestId, approverId, decision);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Manage Configs (Admin only)
router.post('/config', async (req, res) => {
    try {
        // TODO: Check Admin Role
        const result = await careerService.saveConfig(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/config/:key', async (req, res) => {
    try {
        // TODO: Check Admin Role
        const { key } = req.params;
        const result = await careerService.deleteConfig(key);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
