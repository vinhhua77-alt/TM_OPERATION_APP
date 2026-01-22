import React from 'react';

const LoadingSpinner = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999, // Ensure it's on top of everything
        }}>
            {/* CSS Spinner Animation */}
            <div className="spinner"></div>

            <div style={{
                marginTop: '16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#004AAD',
                letterSpacing: '0.5px'
            }}>
                ĐANG TẢI DỮ LIỆU...
            </div>

            <style>{`
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(0, 74, 173, 0.1);
                    border-left-color: #004AAD;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
