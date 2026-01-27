import React from 'react';

const BrandLoading = ({ message = "Đang tải dữ liệu...", subtext = "Thai Mau System 3.2" }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="relative">
                {/* Logo with pulse effect */}
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <img
                    src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91"
                    alt="Loading Logo"
                    className="relative w-24 h-24 object-contain animate-bounce-slight"
                />
            </div>

            <div className="mt-6 text-center space-y-2">
                <h3 className="text-sm font-black text-blue-800 uppercase tracking-widest animate-pulse">
                    {message}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {subtext}
                </p>
            </div>
        </div>
    );
};

export default BrandLoading;
