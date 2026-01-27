import React, { useState, useEffect } from 'react';
import { staffAPI } from '../api/staff';

const roles = [
    { code: 'ADMIN', icon: '🛡️', color: 'bg-slate-900' },
    { code: 'IT', icon: '💻', color: 'bg-blue-900' },
    { code: 'OPS', icon: '⚙️', color: 'bg-indigo-600' },
    { code: 'SM', icon: '👑', color: 'bg-violet-600' },
    { code: 'LEADER', icon: '👔', color: 'bg-blue-600' },
    { code: 'STAFF', icon: '👥', color: 'bg-emerald-600' }
];

const RoleImpersonator = ({ currentRole, onRoleChange, onUserChange, onReset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('ROLES'); // 'ROLES' or 'STAFF'
    const [search, setSearch] = useState('');
    const [staffList, setStaffList] = useState([]); // Full list for searching
    const [topStaff, setTopStaff] = useState([]);   // Top 10 active
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && view === 'STAFF') {
            loadStaff();
        }
    }, [isOpen, view]);

    const loadStaff = async () => {
        setLoading(true);
        try {
            // 1. Load Top Active (Fast) - Display immediately
            const topRes = await staffAPI.getTopActiveStaff();
            if (topRes.success) {
                setTopStaff(topRes.data);
            }
            // 2. Load All for search (Background)
            const allRes = await staffAPI.getAllStaff({ status: 'ACTIVE' });
            if (allRes.success) {
                setStaffList(allRes.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getDisplayList = () => {
        if (!search) return topStaff.length > 0 ? topStaff : staffList.slice(0, 10);
        return staffList.filter(s =>
            s.staff_name.toLowerCase().includes(search.toLowerCase()) ||
            s.staff_id.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 10);
    };

    const displayStaff = getDisplayList();

    return (
        <div className="fixed bottom-40 right-4 z-[9999] flex flex-col items-end gap-2">
            {isOpen && (
                <div className="bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl rounded-[32px] p-2 flex flex-col gap-1 mb-2 animate-in slide-in-from-bottom-5 duration-300 w-64 overflow-hidden">
                    <div className="flex bg-slate-100 rounded-2xl p-1 mb-2">
                        <button
                            onClick={() => setView('ROLES')}
                            className={`flex-1 py-1.5 text-[9px] font-black rounded-xl transition-all ${view === 'ROLES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                        >
                            ROLES
                        </button>
                        <button
                            onClick={() => setView('STAFF')}
                            className={`flex-1 py-1.5 text-[9px] font-black rounded-xl transition-all ${view === 'STAFF' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                        >
                            {search ? 'SEARCH' : 'TOP ACTIVE'}
                        </button>
                    </div>

                    {view === 'ROLES' ? (
                        <div className="grid grid-cols-1 gap-1">
                            {roles.map(r => (
                                <button
                                    key={r.code}
                                    onClick={() => {
                                        onRoleChange(r.code);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all active:scale-95 ${currentRole === r.code
                                        ? `${r.color} text-white shadow-lg`
                                        : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    <span className="text-sm">{r.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{r.code}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            <input
                                type="text"
                                placeholder="Search Name/ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mx-1 px-3 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold focus:ring-0 mb-1"
                                autoFocus
                            />
                            {loading && topStaff.length === 0 ? (
                                <div className="py-10 text-center text-[10px] font-bold text-slate-300">Searching...</div>
                            ) : displayStaff.length > 0 ? (
                                displayStaff.map((s, idx) => (
                                    <button
                                        key={s.staff_id}
                                        onClick={() => {
                                            onUserChange(s);
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                                    >
                                        <div className="flex flex-col items-start">
                                            <div className="text-[10px] font-black text-slate-800 leading-tight">
                                                {!search && idx < 3 && <span className="mr-1">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                                                {s.staff_name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">{s.role}</span>
                                                <span className="text-[8px] font-bold text-slate-400">ID: {s.staff_id}</span>
                                            </div>
                                        </div>
                                        {s.shift_count > 0 && (
                                            <div className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md text-[8px] font-black whitespace-nowrap">
                                                🔥 {s.shift_count}
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="py-4 text-center text-[10px] font-bold text-slate-400 italic">No staff found</div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            onReset();
                            setIsOpen(false);
                        }}
                        className="mt-2 flex items-center justify-center py-2 text-[9px] font-black text-emerald-500 bg-emerald-50 rounded-xl transition-all hover:bg-emerald-100 border border-emerald-100"
                    >
                        RESTORE DIVINE ACCESS
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-2xl transition-all border-2 transform hover:scale-110 active:scale-90 ${isOpen ? 'bg-white border-blue-600 text-blue-600 rotate-90' : 'bg-slate-900 border-white text-white rotate-0'
                    }`}
                title="Divine Mode (Impersonation)"
            >
                {isOpen ? '✕' : '🎩'}
            </button>
        </div>
    );
};

export default RoleImpersonator;
