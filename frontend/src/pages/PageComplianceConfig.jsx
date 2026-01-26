import React, { useState, useEffect } from 'react';
import { complianceAPI } from '../api/compliance.api';

const PageComplianceConfig = ({ user, storeCode = 'STORE01' }) => {
    const [areas, setAreas] = useState([]);
    const [slots, setSlots] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subTab, setSubTab] = useState('ASSIGN'); // ASSIGN | MASTER
    const [zone, setZone] = useState('FOH'); // FOH | BOH

    useEffect(() => {
        loadConfig();
    }, [storeCode]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const [aRes, sRes, asRes] = await Promise.all([
                complianceAPI.getAreas(storeCode),
                complianceAPI.getSlots(),
                complianceAPI.getAssignments(storeCode)
            ]);
            if (aRes.success) setAreas(aRes.data?.sort((a, b) => a.id - b.id) || []);
            if (sRes.success) setSlots(sRes.data?.sort((a, b) => a.order_index - b.order_index) || []);
            if (asRes.success) setAssignments(asRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignment = async (zoneKey, slotId, areaId) => {
        const existing = assignments.find(a => a.work_zone === zoneKey && a.time_slot_id === slotId && a.area_id === areaId);
        try {
            if (existing) {
                // Optimistic UI update
                setAssignments(prev => prev.filter(a => a.id !== existing.id));
                await complianceAPI.deleteAssignment(existing.id);
            } else {
                // Optimistic UI update
                const newAssign = {
                    tenant_id: user.tenant_id,
                    store_code: storeCode,
                    work_zone: zoneKey,
                    time_slot_id: slotId,
                    area_id: areaId,
                    id: 'temp-' + Date.now()
                };
                setAssignments(prev => [...prev, newAssign]);
                await complianceAPI.saveAssignment(newAssign);
            }
            // Silent refresh to confirm ID
            const res = await complianceAPI.getAssignments(storeCode);
            if (res.success) setAssignments(res.data);
        } catch (error) {
            console.error(error);
            alert('Lỗi cập nhật. Vui lòng thử lại.');
            loadConfig(); // Revert on error
        }
    };

    if (loading) return <div className="p-10 text-center animate-spin text-slate-400">🌀</div>;

    return (
        <div className="space-y-4 animate-fade-in w-full">
            {/* Minimalist Tab Switcher */}
            <div className="flex border-b border-slate-200 mb-2">
                {[
                    { id: 'ASSIGN', label: 'Phân công (Assignment)' },
                    { id: 'MASTER', label: 'Danh mục (Master Data)' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSubTab(t.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tight border-b-2 transition-colors ${subTab === t.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {subTab === 'ASSIGN' && (
                <div className="space-y-4">
                    {/* Zone Switcher - Minimalist */}
                    <div className="flex gap-4 items-center mb-2 px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Zone:</span>
                        {['FOH', 'BOH'].map(z => (
                            <label key={z} className="flex items-center cursor-pointer gap-2 group">
                                <input
                                    type="radio"
                                    name="zone"
                                    checked={zone === z}
                                    onChange={() => setZone(z)}
                                    className="hidden"
                                />
                                <span className={`text-[10px] font-black uppercase transition-colors ${zone === z ? 'text-blue-600 border-b border-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                    {z === 'FOH' ? '🏢 Front of House' : '🍳 Back of House'}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Minimalist Matrix Table */}
                    <div className="bg-white border border-slate-200 shadow-none overflow-hidden rounded-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase min-w-[150px] border-r border-slate-100">Area / Slot</th>
                                        {slots.map(slot => (
                                            <th key={slot.id} className="w-[80px] px-1 py-2 text-center border-r border-slate-100 last:border-r-0">
                                                <div className="text-[9px] font-bold text-slate-600 uppercase leading-none">{slot.slot_name}</div>
                                                <div className="text-[7px] font-mono text-slate-400 mt-0.5">{slot.start_time.substring(0, 5)}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {areas.map(area => (
                                        <tr key={area.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-3 py-2 border-r border-slate-50">
                                                <div className="text-[10px] font-bold text-slate-800 uppercase">{area.area_name}</div>
                                                <div className="text-[8px] text-slate-400 font-mono hidden group-hover:block">ID: {area.id}</div>
                                            </td>
                                            {slots.map(slot => {
                                                const isActive = assignments.some(a => a.work_zone === zone && a.time_slot_id === slot.id && a.area_id === area.id);
                                                return (
                                                    <td
                                                        key={`${area.id}-${slot.id}`}
                                                        className="px-0 py-0 border-r border-slate-50 last:border-r-0 text-center cursor-pointer hover:bg-black/5"
                                                        onClick={() => toggleAssignment(zone, slot.id, area.id)}
                                                    >
                                                        <div className="h-10 w-full flex items-center justify-center">
                                                            {isActive ? (
                                                                <span className="text-blue-600 text-sm">●</span>
                                                            ) : (
                                                                <span className="text-slate-100 text-[8px]">•</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {areas.length === 0 && (
                                        <tr>
                                            <td colSpan={slots.length + 1} className="py-8 text-center text-[10px] text-slate-400 italic">
                                                Chưa có khu vực (Area) nào được định nghĩa.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'MASTER' && (
                <div className="grid grid-cols-2 gap-4">
                    {/* AREAS LIST */}
                    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-[9px] font-bold text-slate-500 uppercase">Areas Definitions</h3>
                            <button className="text-[9px] font-black text-blue-600 hover:underline uppercase">+ Add</button>
                        </div>
                        <ul className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                            {areas.map(a => (
                                <li key={a.id} className="px-3 py-2 flex justify-between items-center hover:bg-slate-50">
                                    <span className="text-[10px] font-mono font-bold text-slate-700">{a.area_name}</span>
                                    <button className="text-[8px] text-slate-300 hover:text-red-500 font-bold uppercase">Edit</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* SLOTS LIST */}
                    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-[9px] font-bold text-slate-500 uppercase">Time Slots</h3>
                            <button className="text-[9px] font-black text-blue-600 hover:underline uppercase">+ Add</button>
                        </div>
                        <ul className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                            {slots.map(s => (
                                <li key={s.id} className="px-3 py-2 flex justify-between items-center hover:bg-slate-50">
                                    <div>
                                        <div className="text-[10px] font-mono font-bold text-slate-700">{s.slot_name}</div>
                                        <div className="text-[8px] text-slate-400 font-mono">{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</div>
                                    </div>
                                    <button className="text-[8px] text-slate-300 hover:text-red-500 font-bold uppercase">Edit</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageComplianceConfig;
