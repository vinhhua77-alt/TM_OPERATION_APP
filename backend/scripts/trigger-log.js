import { AccessService } from '../src/domain/access/access.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function triggerLog() {
    console.log('--- TRIGGERING AUDIT LOG ---');

    const mockUser = { id: 1, role: 'ADMIN' }; // Mock admin user
    const payload = { roleCode: 'ADMIN', permKey: 'VIEW_DASHBOARD', canAccess: true };

    try {
        await AccessService.updateConfig(mockUser, 'PERMISSION', payload);
        console.log('UpdateConfig call finished.');
    } catch (e) {
        console.error('UpdateConfig failed:', e);
    }
}

triggerLog();
