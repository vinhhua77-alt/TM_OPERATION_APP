const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-lg font-black text-gray-800 leading-none">{value}</p>
        </div>
    </div>
);

export default StatCard;
