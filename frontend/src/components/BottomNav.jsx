import { Home, BookOpen, BarChart2, Settings } from 'lucide-react';

const BottomNav = ({ active, onNavigate }) => {
    const tabs = [
        { id: 'HOME', label: 'HOME', icon: Home },
        { id: 'SHIFT_LOG', label: 'NHẬT KÝ CA', icon: BookOpen },
        { id: 'DASHBOARD', label: 'SỐ LIỆU', icon: BarChart2 },
        { id: 'SETTING', label: 'SETTING', icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            {tabs.map(tab => {
                const isActive = active === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onNavigate(tab.id)}
                        className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-gray-300 hover:text-gray-400'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[9px] font-bold uppercase ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;
