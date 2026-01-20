import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';
let TOKEN = '';

async function login() {
    console.log('Testing Login...');
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                staffId: 'TM0001',
                password: '123456'
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Login Successful');
            TOKEN = data.token;
            return true;
        } else {
            console.error('❌ Login Failed:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Login Error:', error.message);
        return false;
    }
}

async function checkMasterData() {
    console.log('\nTesting Master Data...');
    try {
        const response = await fetch(`${BASE_URL}/master/data`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        if (data.success && data.data.stores?.length > 0) {
            console.log('✅ Master Data OK - Stores:', data.data.stores.length);
            console.log('   Layouts keys:', Object.keys(data.data.layouts));
        } else {
            console.error('❌ Master Data Failed:', data);
        }
    } catch (error) {
        console.error('❌ Master Data Error:', error.message);
    }
}

async function checkDashboardStats() {
    console.log('\nTesting Dashboard Stats...');
    try {
        const response = await fetch(`${BASE_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        if (data.success && data.data.totalLogs !== undefined) {
            console.log('✅ Dashboard Stats OK - Total Logs:', data.data.totalLogs);
        } else {
            console.error('❌ Dashboard Stats Failed:', data);
        }
    } catch (error) {
        console.error('❌ Dashboard Stats Error:', error.message);
    }
}

async function checkShiftSubmit() {
    console.log('\nTesting Shift Submit...');
    const payload = {
        storeId: 'DD-THISO',
        layout: 'KITCHEN',
        lead: 'L01',
        startH: '08', startM: '00',
        endH: '16', endM: '00',
        rating: 'OK',
        selectedReasons: ['Nhân sự'],
        checks: { cki_1: 'yes' },
        incidentType: '',
        isCommitted: true
    };

    try {
        const response = await fetch(`${BASE_URL}/shift/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            console.log('✅ Shift Submit OK - ID:', data.data.id);
        } else {
            console.error('❌ Shift Submit Failed:', data);
        }
    } catch (error) {
        console.error('❌ Shift Submit Error:', error.message);
    }
}

async function run() {
    const loginSuccess = await login();
    if (loginSuccess) {
        await checkMasterData();
        await checkDashboardStats();
        await checkShiftSubmit();
    } else {
        console.log('⚠️ Skipping other tests due to login failure.');
    }
}

run();
