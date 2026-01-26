import client from './client';

export const complianceAPI = {
    // AREAS
    getAreas: (storeCode) => client.get(`/compliance/config/areas?storeCode=${storeCode}`),
    createArea: (data) => client.post('/compliance/config/areas', data),
    updateArea: (id, data) => client.put(`/compliance/config/areas/${id}`, data),
    deleteArea: (id) => client.delete(`/compliance/config/areas/${id}`),

    // SLOTS
    getSlots: () => client.get('/compliance/config/slots'),
    createSlot: (data) => client.post('/compliance/config/slots', data),
    updateSlot: (id, data) => client.put(`/compliance/config/slots/${id}`, data),
    deleteSlot: (id) => client.delete('/compliance/config/slots/' + id),

    // ASSIGNMENTS (The Matrix)
    getAssignments: (storeCode) => client.get(`/compliance/config/assignments?storeCode=${storeCode}`),
    saveAssignment: (data) => client.post('/compliance/config/assignments', data),
    deleteAssignment: (id) => client.delete(`/compliance/config/assignments/${id}`)
};
