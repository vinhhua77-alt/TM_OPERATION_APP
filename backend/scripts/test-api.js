import fetch from 'node-fetch';

async function testApi() {
    try {
        const res = await fetch('http://localhost:3001/api/admin/summary');
        const data = await res.json();
        console.log('Summary API Result:', JSON.stringify(data, null, 2));

        const res2 = await fetch('http://localhost:3001/api/admin/audit-logs');
        const data2 = await res2.json();
        console.log('Audit API Result:', JSON.stringify(data2, null, 2));
    } catch (e) {
        console.error('API Test Failed:', e.message);
    }
}

testApi();
