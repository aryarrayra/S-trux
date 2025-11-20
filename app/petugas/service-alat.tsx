import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/petugas/SideBar';

export default function ServiceAlat() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [selectedType, setSelectedType] = useState('Semua Tipe');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
            setCurrentDate(dateStr);
            setCurrentTime(timeStr);
        };

        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const services = [
        {
            id: 1,
            category: 'EXCAVATOR KOMATSU',
            units: 2,
            lastService: 'service tahunan',
            nextService: '05 November 2025',
            totalCost: 'Rp 7.000.000'
        },
        {
            id: 2,
            category: 'EXCAVATOR KOMATSU',
            units: 2,
            lastService: 'service tahunan',
            nextService: '05 November 2025',
            totalCost: 'Rp 7.000.000'
        },
        {
            id: 3,
            category: 'EXCAVATOR KOMATSU',
            units: 2,
            lastService: 'service tahunan',
            nextService: '05 November 2025',
            totalCost: 'Rp 7.000.000'
        },
        {
            id: 4,
            category: 'EXCAVATOR KOMATSU',
            units: 2,
            lastService: 'service tahunan',
            nextService: '05 November 2025',
            totalCost: 'Rp 7.000.000'
        },
        {
            id: 5,
            category: 'EXCAVATOR KOMATSU',
            units: 2,
            lastService: 'service tahunan',
            nextService: '05 November 2025',
            totalCost: 'Rp 7.000.000'
        },
        {
            id: 6,
            category: 'EXCAVATOR KOMATSU',
            units: 2,
            lastService: 'service tahunan',
            nextService: '05 November 2025',
            totalCost: 'Rp 7.000.000'
        }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#e8e8e8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Sidebar />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#e8e8e8' }}>
                {/* Header */}
                <div style={{ backgroundColor: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0e0e0' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1a1a1a', margin: 0, marginBottom: '4px', fontStyle: 'normal' }}>Service unit</h1>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0, fontStyle: 'normal' }}>atur penjadwalan maintenance alat berat</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px', margin: 0, marginBottom: '4px', fontStyle: 'normal' }}>{currentDate}</p>
                        <p style={{ color: '#666', fontSize: '12px', margin: 0, fontStyle: 'normal' }}>{currentTime} WIB</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div style={{ backgroundColor: 'white', padding: '12px 32px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                        <div style={{ flex: 1, position: 'relative', maxWidth: '280px' }}>
                            <input
                                type="text"
                                placeholder="Temukan"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 12px',
                                    backgroundColor: '#e8e8e8',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#333',
                                    fontStyle: 'normal'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '10px', top: '8px', color: '#999', fontSize: '13px' }}>🔍</span>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    padding: '6px 14px',
                                    backgroundColor: '#e8e8e8',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#333',
                                    minWidth: '140px',
                                    justifyContent: 'space-between',
                                    fontStyle: 'normal'
                                }}
                            >
                                {selectedType}
                                <span style={{ fontSize: '10px', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                            </button>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    borderRadius: '3px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    fontStyle: 'normal'
                                }}>
                                    {['Semua Tipe', 'Excavator', 'Bulldozer', 'Crane'].map((option, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setSelectedType(option);
                                                setIsDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 14px',
                                                cursor: 'pointer',
                                                color: '#666',
                                                fontSize: '12px',
                                                backgroundColor: selectedType === option ? '#f5f5f5' : 'white',
                                                transition: 'background-color 0.2s',
                                                fontStyle: 'normal'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedType === option ? '#f5f5f5' : 'white'}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontStyle: 'normal'
                    }}>
                        Tambahkan Jadwal
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
                    </button>
                </div>

                {/* Cards Grid */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                    }}>
                        {services.map((service) => (
                            <div key={service.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '20px',
                                border: '1px solid #e0e0e0',
                                position: 'relative'
                            }}>
                                {/* Category Title */}
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#f59e0b',
                                    margin: 0,
                                    marginBottom: '12px',
                                    fontStyle: 'normal'
                                }}>
                                    {service.category}
                                </h3>

                                {/* Icons - Top Right */}
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        fontSize: '18px'
                                    }}>✏️</button>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        fontSize: '18px'
                                    }}>🗑️</button>
                                </div>

                                {/* Info Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>
                                        <span>⚙️</span>
                                        <span>{service.units} unit</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>
                                        <span>🔄</span>
                                        <span>{service.lastService}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>
                                        <span>📅</span>
                                        <span>{service.nextService}</span>
                                    </div>
                                </div>

                                {/* Cost */}
                                <div style={{
                                    fontSize: '12px',
                                    color: '#999',
                                    marginBottom: '4px',
                                    fontStyle: 'normal'
                                }}>
                                    total biaya
                                </div>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1a1a1a',
                                    fontStyle: 'normal'
                                }}>
                                    {service.totalCost}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}