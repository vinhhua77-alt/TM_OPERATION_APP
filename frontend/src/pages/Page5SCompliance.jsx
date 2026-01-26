import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Page5SCompliance = ({ user, onBack, onNavigate }) => {
    const [view, setView] = useState('MAIN'); // MAIN, STAFF_ZONE_SELECT, STAFF_SIGNAL_FLOW, LEADER_CHECK, FOOD_SAFETY, READINESS
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ riskLevel: 'GREEN', ready: true });

    // Core data for Staff Flow
    const [workZone, setWorkZone] = useState(localStorage.getItem('tm_staff_zone') || null);
    const [assignments, setAssignments] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const storeCode = user?.store_code || 'STORE01';
    const tenantId = user?.tenant_id;

    useEffect(() => {
        if (view === 'STAFF_SIGNAL' || view === 'STAFF_SIGNAL_FLOW') {
            if (!workZone) {
                setView('STAFF_ZONE_SELECT');
            } else {
                fetchAssignments(workZone);
                setView('STAFF_SIGNAL_FLOW');
            }
        }
    }, [view, workZone]);

    const fetchAssignments = async (zone) => {
        setLoading(true);
        try {
            const res = await client.get(`/compliance/staff-assignments?storeCode=${storeCode}&workZone=${zone}`);
            if (res.success) {
                setAssignments(res.data);
            }
        } catch (error) {
            console.error('Fetch assignments error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleZoneSelect = (zone) => {
        setWorkZone(zone);
        localStorage.setItem('tm_staff_zone', zone);
        fetchAssignments(zone);
        setView('STAFF_SIGNAL_FLOW');
    };

    // --- STAFF ZONE SELECTION ---
    const StaffZoneSelect = () => (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-center">
                <h2 className="text-xl font-black uppercase text-slate-800 mb-2">BẠN ĐANG TRỰC KHU VỰC NÀO?</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chọn để nhận lịch xác nhận hôm nay</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <button
                    onClick={() => handleZoneSelect('FOH')}
                    className="group bg-white p-10 rounded-[40px] shadow-xl border-4 border-slate-50 flex flex-col items-center gap-6 active:scale-95 transition-all"
                >
                    <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-5xl group-hover:rotate-6 transition-transform">🏢</div>
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-slate-900 uppercase">FOH</h3>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-1">Sảnh • Thu ngân • Support</p>
                    </div>
                </button>

                <button
                    onClick={() => handleZoneSelect('BOH')}
                    className="group bg-white p-10 rounded-[40px] shadow-xl border-4 border-slate-50 flex flex-col items-center gap-6 active:scale-95 transition-all"
                >
                    <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center text-5xl group-hover:-rotate-6 transition-transform">🍳</div>
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-slate-900 uppercase">BOH</h3>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mt-1">Bếp • Prep • Rửa</p>
                    </div>
                </button>
            </div>

            <div className="p-10 text-center opacity-30">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chọn đúng Zone để nhận signal chuẩn</p>
            </div>
        </div>
    );

    // --- NEW STAFF FLOW (TIME-BASED AREA CONFIRMATION) ---
    const StaffSignalFlow = () => {
        const [report, setReport] = useState({ status: null, reason: null, photo: null });
        const currentArea = assignments[currentStep];

        const handleConfirm = async (status) => {
            if (status === 'READY') {
                submitStep('READY', null);
            } else {
                setReport({ ...report, status: 'HAS_ISSUE' });
            }
        };

        const submitStep = async (status, reason) => {
            setLoading(true);
            try {
                await client.post('/compliance/signals', {
                    tenant_id: tenantId,
                    store_code: storeCode,
                    staff_id: user.staff_id,
                    signal_type: 'HANDOVER',
                    area: currentArea.area_group,
                    status: status,
                    issue_type: reason,
                    note: `Time-based confirmation: ${currentArea.area_name} during ${currentArea.slot_name}`
                });

                if (currentStep < assignments.length - 1) {
                    setCurrentStep(currentStep + 1);
                    setReport({ status: null, reason: null, photo: null });
                } else {
                    alert('✅ Đã hoàn thành tất cả xác nhận!');
                    setView('MAIN');
                }
            } catch (error) {
                alert('Err: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (loading && assignments.length === 0) return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );

        if (!currentArea) return (
            <div className="space-y-6">
                <div className="bg-white p-10 rounded-[40px] text-center shadow-xl border border-slate-100">
                    <span className="text-6xl mb-4 block">☕</span>
                    <h3 className="text-lg font-black uppercase text-slate-800">Không có khu vực nào</h3>
                    <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed italic">Trong khung giờ hiện tại, chưa có yêu cầu xác nhận cho Zone {workZone}.</p>
                    <div className="mt-8 flex flex-col gap-3">
                        <button onClick={() => setView('MAIN')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase">Quay lại Dashboard</button>
                        <button onClick={() => { setWorkZone(null); localStorage.removeItem('tm_staff_zone'); setView('STAFF_ZONE_SELECT'); }} className="text-[10px] font-black text-indigo-500 uppercase">Đổi Zone (Đang chọn {workZone})</button>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="space-y-6">
                {/* AREA HEADER */}
                <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">{currentArea.slot_name}</span>
                                <span className="text-[9px] font-black text-slate-300 uppercase">SIGNAL {currentStep + 1}/{assignments.length}</span>
                            </div>
                            <button onClick={() => { setWorkZone(null); setView('STAFF_ZONE_SELECT'); }} className="text-[9px] font-black text-slate-300 uppercase border-b border-slate-200">Zone: {workZone}</button>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{currentArea.area_name}</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            📌 Tới giờ xác nhận khu vực này
                        </p>
                    </div>
                </div>

                {/* ACTION CARDS */}
                {!report.status ? (
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => handleConfirm('READY')}
                            className="bg-emerald-500 text-white p-10 rounded-[40px] shadow-xl shadow-emerald-500/20 flex flex-col items-center gap-4 active:scale-95 transition-all border-b-8 border-emerald-700"
                        >
                            <span className="text-5xl">✅</span>
                            <span className="text-xl font-black uppercase tracking-widest">ĐẠT CHUẨN</span>
                        </button>
                        <button
                            onClick={() => handleConfirm('HAS_ISSUE')}
                            className="bg-white p-8 rounded-[40px] border-4 border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all"
                        >
                            <span className="text-4xl grayscale opacity-30">⚠️</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">CÓ VẤN ĐỀ</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100">
                            <h3 className="text-xs font-black uppercase text-slate-400 mb-6 text-center tracking-widest">⚠️ LÝ DO CHƯA ĐẠT</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['Thiết bị', 'Thiếu vật tư', 'Quá tải khách', 'Chưa kịp xử lý'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setReport({ ...report, reason: r })}
                                        className={`p-4 rounded-3xl border-2 font-black text-[10px] uppercase transition-all ${report.reason === r ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'border-slate-50 text-slate-400 bg-slate-50'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {report.reason && (
                            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl border-2 border-dashed border-slate-200">📸</div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chụp 1 ảnh thực tế tại {currentArea.area_name}</p>
                            </div>
                        )}

                        <button
                            disabled={!report.reason}
                            onClick={() => submitStep('HAS_ISSUE', report.reason)}
                            className={`w-full py-6 rounded-[40px] font-black uppercase tracking-widest text-xs shadow-xl transition-all ${report.reason ? 'bg-slate-900 text-white active:scale-95' : 'bg-slate-100 text-slate-300'}`}
                        >
                            Xác nhận & Gửi →
                        </button>
                    </div>
                )}

                {/* REFERENCE IMAGE */}
                <div className="bg-slate-100 p-6 rounded-[40px] border border-slate-200 border-dashed text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ảnh mẫu tham khảo</p>
                    <div className="w-full aspect-video bg-white rounded-2xl flex items-center justify-center text-slate-200 text-2xl">🖼️</div>
                </div>
            </div>
        );
    }

    // --- LEADER FLOW: 5S CHECK ---
    const LeaderCheckView = () => {
        const [check, setCheck] = useState({ area: 'FOH', result: 'PASS', rootCause: 'PEOPLE', action: 'FIXED' });

        const handleSubmit = async () => {
            setLoading(true);
            try {
                await client.post('/compliance/checks', {
                    tenant_id: tenantId,
                    store_code: storeCode,
                    leader_id: user.staff_id,
                    area: check.area,
                    result: check.result,
                    root_cause: check.result === 'FAIL' ? check.rootCause : null,
                    action_taken: check.result === 'FAIL' ? check.action : 'FIXED'
                });
                alert('✅ Kiểm tra 5S đã được ghi nhận!');
                setView('MAIN');
            } catch (error) {
                alert('Err: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="space-y-4">
                <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Khu vực kiểm tra</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {['FOH', 'BOH', 'PREP', 'WC'].map(a => (
                            <button
                                key={a}
                                onClick={() => setCheck({ ...check, area: a })}
                                className={`py-4 rounded-2xl font-bold text-xs uppercase transition-all ${check.area === a ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Kết quả</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setCheck({ ...check, result: 'PASS' })}
                            className={`flex-1 py-10 rounded-[32px] border-4 flex flex-col items-center gap-2 transition-all ${check.result === 'PASS' ? 'border-green-500 bg-green-50' : 'border-slate-50 grayscale opacity-40'}`}
                        >
                            <span className="text-4xl text-green-500">🏆</span>
                            <span className="text-xs font-black text-green-700">ĐẠT (PASS)</span>
                        </button>
                        <button
                            onClick={() => setCheck({ ...check, result: 'FAIL' })}
                            className={`flex-1 py-10 rounded-[32px] border-4 flex flex-col items-center gap-2 transition-all ${check.result === 'FAIL' ? 'border-rose-500 bg-rose-50' : 'border-slate-50 grayscale opacity-40'}`}
                        >
                            <span className="text-4xl text-rose-500">❌</span>
                            <span className="text-xs font-black text-rose-700">KHÔNG ĐẠT</span>
                        </button>
                    </div>
                </div>

                {check.result === 'FAIL' && (
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nguyên nhân</h3>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold" value={check.rootCause} onChange={e => setCheck({ ...check, rootCause: e.target.value })}>
                                <option value="PEOPLE">Con người</option>
                                <option value="PROCESS">Quy trình</option>
                                <option value="EQUIPMENT">Thiết bị</option>
                            </select>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Hành động</h3>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold" value={check.action} onChange={e => setCheck({ ...check, action: e.target.value })}>
                                <option value="FIXED">Sửa lỗi ngay</option>
                                <option value="PLAN">Lên kế hoạch xử lý</option>
                                <option value="IGNORE">Tạm bỏ qua (Risk)</option>
                            </select>
                        </div>
                    </div>
                )}

                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                >
                    {loading ? 'Đang lưu...' : 'Xác nhận kiểm tra →'}
                </button>
            </div>
        );
    }

    // --- MAIN VIEW HUB ---
    const MainHub = () => (
        <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Trạng thái sẵn sàng</p>
                        <h2 className="text-3xl font-black">{stats.ready ? '✅ READY' : '❌ NOT READY'}</h2>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.riskLevel === 'GREEN' ? 'bg-green-500' : 'bg-rose-500'} animate-pulse`}>
                        RISK: {stats.riskLevel}
                    </div>
                </div>
                <div className="absolute -right-10 -bottom-10 text-9xl opacity-10">🛡️</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setView('STAFF_SIGNAL')}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-95 transition-all"
                >
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📡</div>
                    <div className="text-left">
                        <h3 className="text-xs font-black uppercase leading-tight">Gửi tín hiệu</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Dành cho Staff</p>
                    </div>
                </button>

                {(user?.role !== 'STAFF') && (
                    <button
                        onClick={() => setView('LEADER_CHECK')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-95 transition-all"
                    >
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                        <div className="text-left">
                            <h3 className="text-xs font-black uppercase leading-tight">Kiểm tra 5S</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Official Audit</p>
                        </div>
                    </button>
                )}

                {(user?.role !== 'STAFF') && (
                    <button
                        onClick={() => setView('FOOD_SAFETY')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-95 transition-all"
                    >
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl">🌡️</div>
                        <div className="text-left">
                            <h3 className="text-xs font-black uppercase leading-tight">Nhiệt độ HACCP</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Food Safety</p>
                        </div>
                    </button>
                )}

                {(user?.role !== 'STAFF') && (
                    <button
                        onClick={() => setView('READINESS')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-95 transition-all"
                    >
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">🚀</div>
                        <div className="text-left">
                            <h3 className="text-xs font-black uppercase leading-tight">Peak Readiness</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Decision Hub</p>
                        </div>
                    </button>
                )}
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 border-dashed text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Module 5S v3.5 - Decision Engine Phase<br /> Dữ liệu được ghi nhận vào Operational Fact Tables
                </p>
            </div>
        </div>
    );

    // --- FOOD SAFETY VIEW ---
    const FoodSafetyView = () => {
        const [temp, setTemp] = useState({ device: 'CHILLER', value: 4, moment: 'PEAK_START' });

        const handleSubmit = async () => {
            setLoading(true);
            try {
                await client.post('/compliance/food-safety', {
                    tenant_id: tenantId,
                    store_code: storeCode,
                    leader_id: user.staff_id,
                    log_moment: temp.moment,
                    device_type: temp.device,
                    temperature: parseFloat(temp.value),
                    threshold_min: temp.device === 'CHILLER' ? 0 : temp.device === 'FREEZER' ? -25 : 60,
                    threshold_max: temp.device === 'CHILLER' ? 4 : temp.device === 'FREEZER' ? -18 : 100
                });
                alert('✅ Nhiệt độ đã được ghi nhận!');
                setView('MAIN');
            } catch (error) {
                alert('Err: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="space-y-4">
                <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Thời điểm</h3>
                    <div className="flex gap-2">
                        {['PEAK_START', 'CLOSING'].map(m => (
                            <button
                                key={m}
                                onClick={() => setTemp({ ...temp, moment: m })}
                                className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase transition-all ${temp.moment === m ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-300'}`}
                            >
                                {m === 'PEAK_START' ? 'Sắp Peak' : 'Đóng cửa'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Thiết bị</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['CHILLER', 'FREEZER', 'HOT_HOLD'].map(d => (
                            <button
                                key={d}
                                onClick={() => setTemp({ ...temp, device: d })}
                                className={`py-4 rounded-xl font-bold text-[10px] uppercase leading-tight transition-all ${temp.device === d ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300'}`}
                            >
                                {d.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-center">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Nhập Nhiệt độ (°C)</h3>
                    <input
                        type="number"
                        step="0.1"
                        value={temp.value}
                        onChange={e => setTemp({ ...temp, value: e.target.value })}
                        className="text-6xl font-black text-center w-full bg-transparent outline-none focus:text-rose-600 transition-all"
                    />
                    <div className="mt-6 flex justify-center gap-4 text-[10px] font-black uppercase text-slate-300">
                        <span>Min: {temp.device === 'CHILLER' ? '0' : temp.device === 'FREEZER' ? '-25' : '60'}°C</span>
                        <span>Max: {temp.device === 'CHILLER' ? '4' : temp.device === 'FREEZER' ? '-18' : '100'}°C</span>
                    </div>
                </div>

                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full py-5 bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                >
                    {loading ? 'Đang lưu...' : 'Ghi nhận nhiệt độ →'}
                </button>
            </div>
        );
    }


    // --- READINESS VIEW: THE DECISION HUB ---
    const ReadinessView = () => {
        const [readinessData, setReadinessData] = useState(null);

        useEffect(() => {
            handleCalculate();
        }, []);

        const handleCalculate = async () => {
            setLoading(true);
            try {
                // Giả lập shiftId cho ca hiện tại nếu chưa có hệ thống ShiftLog tích hợp sâu
                const res = await client.post('/compliance/readiness', {
                    shiftId: null, // Sẽ được parse ở backend hoặc dùng storeCode để lấy ca gần nhất
                    storeCode: storeCode,
                    leaderId: user.staff_id
                });
                if (res.success) {
                    setReadinessData(res.data);
                    setStats({ riskLevel: res.data.risk_level, ready: res.data.peak_ready });
                }
            } catch (error) {
                console.error('Calculate readiness error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (loading && !readinessData) return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className={`p-8 rounded-[40px] text-center shadow-2xl border-b-8 transition-all ${readinessData?.peak_ready ? 'bg-emerald-500 border-emerald-700 text-white' : 'bg-rose-500 border-rose-700 text-white'}`}>
                    <span className="text-6xl mb-4 block">{readinessData?.peak_ready ? '🚀' : '🛑'}</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                        {readinessData?.peak_ready ? 'SẴN SÀNG VÀO PEAK' : 'CHƯA SẴN SÀNG'}
                    </h2>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] mt-2">
                        {readinessData?.peak_ready ? 'Mọi chỉ số đều nằm trong ngưỡng an toàn' : 'Cần xử lý các lỗi nghiêm trọng ngay'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Nhân sự (Manpower)</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${readinessData?.manpower_status === 'OK' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            <span className="text-sm font-black uppercase text-slate-700">{readinessData?.manpower_status || 'OK'}</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Vệ sinh (5S)</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${readinessData?.cleanliness_status === 'OK' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                            <span className="text-sm font-black uppercase text-slate-700">{readinessData?.cleanliness_status || 'OK'}</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Thực phẩm (HACCP)</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${readinessData?.food_safety_status === 'OK' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                            <span className="text-sm font-black uppercase text-slate-700">{readinessData?.food_safety_status || 'OK'}</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Phòng vệ (Risk)</p>
                        <div className="flex items-center gap-2 font-black text-sm">
                            <span className={`${readinessData?.risk_level === 'GREEN' ? 'text-green-500' : readinessData?.risk_level === 'AMBER' ? 'text-amber-500' : 'text-rose-500'}`}>
                                {readinessData?.risk_level || 'GREEN'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-100 p-6 rounded-[40px] text-center border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                        Dữ liệu được tổng hợp lúc: {readinessData?.decided_at ? new Date(readinessData.decided_at).toLocaleTimeString() : '--:--'}<br />
                        Bởi Leader: {user.name || user.staff_id}
                    </p>
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full py-6 bg-slate-900 text-white rounded-[40px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                >
                    Cập nhật trạng thái mới nhất 🔄
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen font-sans pb-10">
            <div className="shrink-0 bg-slate-900 p-6 pb-12 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                    <button onClick={view === 'MAIN' ? onBack : () => setView('MAIN')} className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mb-6">
                        {view === 'MAIN' ? '← Dashboard' : '← Quay lại'}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl rotate-3">
                            {view === 'STAFF_ZONE_SELECT' ? '🏢' : view === 'STAFF_SIGNAL_FLOW' ? '📡' : view === 'LEADER_CHECK' ? '📋' : view === 'FOOD_SAFETY' ? '🌡️' : '🛡️'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                                {view === 'MAIN' ? 'QUẢN TRỊ TUÂN THỦ' : view === 'STAFF_ZONE_SELECT' ? 'CHỌN KHU VỰC TRỰC' : view === 'STAFF_SIGNAL_FLOW' ? 'XÁC NHẬN KHU VỰC' : view === 'LEADER_CHECK' ? 'KIỂM TRA 5S' : view === 'FOOD_SAFETY' ? 'AN TOÀN THỰC THẨM' : 'ĐỘ SẴN SÀNG'}
                            </h1>
                            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Module 5S • HACCP • READINESS</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-5 -mt-6 relative z-20">
                {view === 'MAIN' && <MainHub />}
                {view === 'STAFF_ZONE_SELECT' && <StaffZoneSelect />}
                {view === 'STAFF_SIGNAL_FLOW' && <StaffSignalFlow />}
                {view === 'LEADER_CHECK' && <LeaderCheckView />}
                {view === 'FOOD_SAFETY' && <FoodSafetyView />}
                {view === 'READINESS' && <ReadinessView />}
            </div>
        </div>
    );
};

export default Page5SCompliance;
