import React, { useState } from 'react';

/**
 * CustomMetricGrid - 3x3 Grid of Metrics
 * Allows users to pick metrics and see them in real-time.
 * Added: LAB Mode for custom formulas.
 */
const CustomMetricGrid = ({ config, metrics, onSave, loading }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLabMode, setIsLabMode] = useState(false);
    const [localLayout, setLocalLayout] = useState(config?.grid_layout || Array(9).fill({}));
    const [customScripts, setCustomScripts] = useState(config?.custom_scripts || {});

    // Available raw metrics to pick from
    const baseMetrics = [
        { key: 'health', label: 'Health Score', icon: '🌡️' },
        { key: 'checklist', label: 'Checklist Comp.', icon: '✅' },
        { key: 'incidents', label: 'Incident Count', icon: '⚠️' },
        { key: 'late', label: 'Late Count', icon: '⏰' },
        { key: 'mood', label: 'Avg Mood', icon: '😊' },
        { key: 'headcount', label: 'Headcount', icon: '👥' },
        { key: 'cagay', label: 'Split Shifts', icon: '📉' },
        { key: 'uniform', label: 'Uniform Viol.', icon: '👔' },
        { key: 'training', label: 'Training HR', icon: '📖' },
        { key: 'revenue', label: 'Net Sales', icon: '💰' },
    ];

    // Calculate value for a slot
    const getSlotValue = (slot) => {
        if (!slot.metric_key) return null;

        // Check if it's a custom script
        if (slot.is_custom && customScripts[slot.metric_key]) {
            try {
                // Simple formula evaluator: replace keys with values
                let formula = customScripts[slot.metric_key];
                Object.keys(metrics).forEach(key => {
                    const val = metrics[key] || 0;
                    formula = formula.replace(new RegExp(key, 'g'), val);
                });
                // eslint-disable-next-line no-eval
                const result = eval(formula);
                return typeof result === 'number' ? result.toFixed(1) : result;
            } catch (e) {
                return 'ERR!';
            }
        }

        return metrics[slot.metric_key];
    };

    const handleUpdateSlot = (index, value) => {
        const newLayout = [...localLayout];
        if (value.startsWith('CUSTOM:')) {
            const scriptKey = value.replace('CUSTOM:', '');
            newLayout[index] = { metric_key: scriptKey, label: scriptKey, icon: '🧪', is_custom: true };
        } else {
            const selected = baseMetrics.find(m => m.key === value);
            newLayout[index] = selected ? { metric_key: selected.key, label: selected.label, icon: selected.icon } : {};
        }
        setLocalLayout(newLayout);
    };

    const handleAddScript = (name, formula) => {
        setCustomScripts(prev => ({ ...prev, [name]: formula }));
    };

    const handleSave = () => {
        onSave({ grid_layout: localLayout, custom_scripts: customScripts });
        setIsEditing(false);
        setIsLabMode(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Central Dashboard (3x3 Grid)
                </h3>
                <div className="flex gap-2">
                    {isEditing && (
                        <button
                            onClick={() => setIsLabMode(!isLabMode)}
                            className={`text-[8px] font-black px-3 py-1 rounded-full border transition-all ${isLabMode ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                        >
                            {isLabMode ? 'VIEW GRID' : 'LAB MODE (SCRIPT)'}
                        </button>
                    )}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`text-[8px] font-black px-3 py-1 rounded-full border transition-all ${isEditing ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                        {isEditing ? 'LƯU HỆ THỐNG' : 'TÙY BIẾN'}
                    </button>
                </div>
            </div>

            {isEditing && isLabMode ? (
                <div className="bg-slate-900 rounded-3xl p-5 text-white animate-in slide-in-from-top-4 duration-500">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">🧪 Metric Lab (Custom Scripts)</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(customScripts).map(([name, formula]) => (
                                <div key={name} className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="text-[9px] font-black text-indigo-300">{name}</div>
                                    <div className="text-[8px] font-mono text-white/50 truncate">{formula}</div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                            <input id="script-name" placeholder="Tên chỉ số (VD: PowerIndex)" className="w-full bg-slate-800 border-none rounded-lg text-[10px] p-2 text-white" />
                            <input id="script-formula" placeholder="Công thức (VD: health * 0.8 + checklists * 0.2)" className="w-full bg-slate-800 border-none rounded-lg text-[10px] p-2 text-white" />
                            <button
                                onClick={() => {
                                    const n = document.getElementById('script-name').value;
                                    const f = document.getElementById('script-formula').value;
                                    if (n && f) {
                                        handleAddScript(n, f);
                                        document.getElementById('script-name').value = '';
                                        document.getElementById('script-formula').value = '';
                                    }
                                }}
                                className="w-full py-2 bg-indigo-600 rounded-xl text-[9px] font-black uppercase"
                            >
                                Thêm Công Thức
                            </button>
                        </div>
                        <p className="text-[7px] text-white/30 italic">Biến khả dụng: health, checklist, incidents, late, mood, headcount, uniform...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {localLayout.slice(0, 9).map((slot, i) => {
                        const val = getSlotValue(slot);
                        const hasValue = val !== undefined && val !== null;

                        return (
                            <div
                                key={i}
                                className={`
                                    aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all duration-500
                                    ${isEditing ? 'border-dashed border-indigo-300 bg-indigo-50/20' : 'border-slate-50 bg-white hover:shadow-md'}
                                `}
                            >
                                {isEditing ? (
                                    <select
                                        value={slot.is_custom ? `CUSTOM:${slot.metric_key}` : (slot.metric_key || '')}
                                        onChange={(e) => handleUpdateSlot(i, e.target.value)}
                                        className="w-full bg-transparent text-[8px] font-black text-slate-600 border-none focus:ring-0 appearance-none text-center"
                                    >
                                        <option value="">-- Trống --</option>
                                        <optgroup label="Chỉ số cơ bản">
                                            {baseMetrics.map(m => (
                                                <option key={m.key} value={m.key}>{m.label}</option>
                                            ))}
                                        </optgroup>
                                        {Object.keys(customScripts).length > 0 && (
                                            <optgroup label="Công thức Lab">
                                                {Object.keys(customScripts).map(s => (
                                                    <option key={s} value={`CUSTOM:${s}`}>{s}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                ) : (
                                    slot.metric_key ? (
                                        <>
                                            <span className="text-xl mb-1">{slot.icon}</span>
                                            <div className="text-[12px] font-black text-slate-800 leading-none">
                                                {loading ? '...' : (hasValue ? (val + (slot.is_custom ? '' : '')) : 'N/A')}
                                            </div>
                                            <div className="text-[6px] font-extrabold text-slate-400 uppercase tracking-tighter mt-1 truncate w-full">{slot.label}</div>
                                        </>
                                    ) : (
                                        <div className="w-1 h-1 rounded-full bg-slate-100"></div>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomMetricGrid;
