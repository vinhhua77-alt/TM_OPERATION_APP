import React from 'react';

const FAB = ({ icon = '+', onClick, label, color = '#004AAD' }) => {
    return (
        <>
            <button
                className="fab-btn fade-in"
                onClick={onClick}
                title={label} // Tooltip for desktop
            >
                {icon}
            </button>
            <style>{`
                .fab-btn {
                    position: fixed;
                    bottom: 80px; /* Above BottomNav (60px) + 20px padding */
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: ${color};
                    color: white;
                    border: none;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 900;
                    transition: transform 0.2s;
                    outline: none;
                }
                .fab-btn:active {
                    transform: scale(0.9);
                }
                
                /* Desktop adjustment: Lower position since BottomNav is hidden */
                @media (min-width: 768px) {
                    .fab-btn {
                        bottom: 30px;
                        right: 30px;
                        width: 56px;
                        height: 56px;
                    }
                }
            `}</style>
        </>
    );
};

export default FAB;
