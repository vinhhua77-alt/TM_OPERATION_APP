import React from 'react';

const PageAbout = ({ onBack }) => {
    return (
        <div className="fade-in text-center">
            <div className="header" style={{ marginBottom: '30px' }}>
                <img src="https://theme.hstatic.net/200000475475/1000828169/14/logo.png?v=91" className="logo-img" alt="logo" style={{ width: '80px', marginBottom: '15px' }} />
                <h2 className="brand-title" style={{ fontSize: '20px' }}>THÁI MẬU GROUP</h2>
                <p className="sub-title-dev" style={{ fontSize: '11px', marginTop: '5px' }}>HỆ THỐNG VẬN HÀNH TOÀN DIỆN</p>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#004AAD', marginBottom: '5px' }}>PHIÊN BẢN</h3>
                    <p style={{ fontSize: '11px', color: '#666' }}>v3.0.0 (Decision Engine Core)</p>
                    <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>Release: 25-01-2026</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#004AAD', marginBottom: '5px' }}>PHÁT TRIỂN BỞI</h3>
                    <p style={{ fontSize: '11px', color: '#666' }}>Vinh Gà & IT Team</p>
                    <p style={{ fontSize: '10px', color: '#999' }}>© 2026 Thai Mau Group</p>
                </div>

                <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#004AAD', marginBottom: '5px' }}>HỖ TRỢ KỸ THUẬT</h3>
                    <p style={{ fontSize: '11px', color: '#666' }}>Email: thaimaugroup@gmail.com</p>
                    <p style={{ fontSize: '11px', color: '#666' }}>Hotline: 0900 99 88 003 </p>
                </div>
            </div>

            <button
                onClick={onBack}
                className="btn-login btn-outline"
                style={{ background: 'transparent', color: '#666', border: '1px solid #DDD', marginTop: '20px' }}
            >
                QUAY LẠI
            </button>
        </div>
    );
};

export default PageAbout;
