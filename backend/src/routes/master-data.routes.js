/**
 * MASTER DATA ROUTES
 * API endpoints for all master data tables
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { MasterDataService } from '../domain/master/master-data.service.js';

const router = express.Router();

// ==================== STORE ROUTES ====================

router.get('/stores', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.getAllStores(req.user);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.post('/stores', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.createStore(req.user, req.body);
        res.json({ success: true, data, message: 'Store created' });
    } catch (error) {
        next(error);
    }
});

router.put('/stores/:store_code', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.updateStore(req.user, req.params.store_code, req.body);
        res.json({ success: true, data, message: 'Store updated' });
    } catch (error) {
        next(error);
    }
});

router.delete('/stores/:store_code', authenticateToken, async (req, res, next) => {
    try {
        await MasterDataService.deleteStore(req.user, req.params.store_code);
        res.json({ success: true, message: 'Store deleted' });
    } catch (error) {
        next(error);
    }
});

// ==================== CHECKLIST ROUTES ====================

router.get('/checklists', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.getAllChecklists(req.user, req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.post('/checklists', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.createChecklist(req.user, req.body);
        res.json({ success: true, data, message: 'Checklist created' });
    } catch (error) {
        next(error);
    }
});

router.put('/checklists/:id', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.updateChecklist(req.user, req.params.id, req.body);
        res.json({ success: true, data, message: 'Checklist updated' });
    } catch (error) {
        next(error);
    }
});

router.delete('/checklists/:id', authenticateToken, async (req, res, next) => {
    try {
        await MasterDataService.deleteChecklist(req.user, req.params.id);
        res.json({ success: true, message: 'Checklist deleted' });
    } catch (error) {
        next(error);
    }
});

// ==================== POSITIONS ROUTES ====================

router.get('/positions', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.getAllPositions(req.user, req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.post('/positions', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.createPosition(req.user, req.body);
        res.json({ success: true, data, message: 'Position created' });
    } catch (error) {
        next(error);
    }
});

router.put('/positions/:id', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.updatePosition(req.user, req.params.id, req.body);
        res.json({ success: true, data, message: 'Position updated' });
    } catch (error) {
        next(error);
    }
});

router.delete('/positions/:id', authenticateToken, async (req, res, next) => {
    try {
        await MasterDataService.deletePosition(req.user, req.params.id);
        res.json({ success: true, message: 'Position deleted' });
    } catch (error) {
        next(error);
    }
});

// ==================== INCIDENTS ROUTES ====================

router.get('/incidents', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.getAllIncidents(req.user, req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.post('/incidents', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.createIncident(req.user, req.body);
        res.json({ success: true, data, message: 'Incident created' });
    } catch (error) {
        next(error);
    }
});

router.put('/incidents/:id', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.updateIncident(req.user, req.params.id, req.body);
        res.json({ success: true, data, message: 'Incident updated' });
    } catch (error) {
        next(error);
    }
});

router.delete('/incidents/:id', authenticateToken, async (req, res, next) => {
    try {
        await MasterDataService.deleteIncident(req.user, req.params.id);
        res.json({ success: true, message: 'Incident deleted' });
    } catch (error) {
        next(error);
    }
});

// ==================== LAYOUTS ROUTES ====================

router.get('/layouts', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.getAllLayouts(req.user, req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.post('/layouts', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.createLayout(req.user, req.body);
        res.json({ success: true, data, message: 'Layout created' });
    } catch (error) {
        next(error);
    }
});

router.put('/layouts/:id', authenticateToken, async (req, res, next) => {
    try {
        const data = await MasterDataService.updateLayout(req.user, req.params.id, req.body);
        res.json({ success: true, data, message: 'Layout updated' });
    } catch (error) {
        next(error);
    }
});

router.delete('/layouts/:id', authenticateToken, async (req, res, next) => {
    try {
        await MasterDataService.deleteLayout(req.user, req.params.id);
        res.json({ success: true, message: 'Layout deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
