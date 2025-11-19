import React, { useState } from 'react';
import Sidebar from '@/components/petugas/SideBar';

export default function JadwalPengantaran() {
    const [searchTerm, setSearchTerm] = useState('');

    const deliveries = [
        {
            id: 'STX0098',
            company: 'PT Acong Makmuir jayaraya',
            equipment: 'Excavator Caterpillar 320D',
            location: 'Jln Bamboo htami, Jakarta Timur',
            date: '29 Oct 2025 - 01 Nov 2025',
            price: 'Rp 13.500.000',
            status: 'Berlangsung',
            statusColor: '#2563eb'
        },
        {
            id: 'STX0081',
            company: 'PT Acong Makmuir jayaraya',
            equipment: 'Bulldozer Volvo',
            location: 'Jln Bamboo htami, Jakarta Timur',
            date: '27 Oct 2025 - 28 Oct 2025',
            price: 'Rp 13.500.000',
            status: 'Selesai',
            statusColor: '#22c55e'
        },
        {
            id: 'STX0921',
            company: 'PT Acong Makmuir jayaraya',
            equipment: 'Tower Crane Leihuner',
            location: 'Jln Bamboo htami, Jakarta Timur',
            date: '30 Nov 2025 - 05 Dec 2025',
            price: 'Rp 13.500.000',
            status: 'Akan Datang',
            statusColor: '#f59e0b'
        }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
            <Sidebar />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
                {/* Header */}
                <div style={{ backgroundColor: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1a1a1a', margin: 0, marginBottom: '4px' }}>Jadwal Pengantaran</h1>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Cek kembali jadwal pengantaran dan pengembaliaan</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px', margin: 0, marginBottom: '4px' }}>Rabu, 29 Oktober 2025</p>
                        <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>18:08 WIB</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div style={{ backgroundColor: 'white', padding: '12px 32px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ flex: 1, position: 'relative', maxWidth: '280px' }}>
                        <input
                            type="text"
                            placeholder="Pencarian"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '6px 12px', backgroundColor: '#e8e8e8', borderRadius: '3px', fontSize: '12px', border: 'none', outline: 'none', color: '#333' }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '8px', color: '#999', fontSize: '13px' }}>🔍</span>
                    </div>

                    <button style={{ padding: '6px 14px', backgroundColor: '#e8e8e8', borderRadius: '3px', fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#333' }}>
                        Semua Data
                        <span style={{ fontSize: '10px' }}>▼</span>
                    </button>
                </div>

                {/* Cards Container */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px' }}>
                    {deliveries.map((delivery, index) => (
                        <div key={index} style={{ backgroundColor: 'white', borderRadius: '4px', padding: '16px', marginBottom: '12px', border: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f59e0b', margin: 0 }}>{delivery.id}</h3>
                                    <span style={{ backgroundColor: delivery.statusColor, color: 'white', fontSize: '10px', padding: '3px 9px', borderRadius: '2px', fontWeight: '600' }}>
                                        {delivery.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#333', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px' }}>🏢</span>
                                        <span>{delivery.company}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px' }}>⚙️</span>
                                        <span>{delivery.equipment}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px' }}>📍</span>
                                        <span>{delivery.location}</span>
                                    </div>
                                </div>

                                <p style={{ color: '#999', fontSize: '10px', margin: '6px 0 0 0' }}>{delivery.date}</p>
                            </div>

                            <div style={{ marginLeft: '20px', textAlign: 'right' }}>
                                <p style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{delivery.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}