import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Sidebar from '@/components/petugas/SideBar';

export default function PetugasDashboard() {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', {
                weekday: 'short',
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

    const deliveries = [
        { no: 'STX0098', dest: 'Jln Bambu Hitam, Jakarta timur', company: 'PT Acong Makmur Jaya' },
        { no: 'STX0098', dest: 'Jln Bambu Hitam, Jakarta timur', company: 'PT Acong Makmur Jaya' },
        { no: 'STX0098', dest: 'Jln Bambu Hitam, Jakarta timur', company: 'PT Acong Makmur Jaya' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <div style={{
                flex: 1,
                padding: '40px 50px',
                backgroundColor: '#FFFFFF',
                overflowY: 'auto' as const,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontStyle: 'normal'
            }}>
                {/* HEADER */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '40px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', margin: '0 0 8px 0' }}>
                            Dashboard Petugas
                        </h1>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                            Selamat datang kembali, mari mulai pekerjaan hari ini!
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#F59E0B', margin: '0 0 4px 0' }}>
                            {currentDate}
                        </p>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                            {currentTime} WIB
                        </p>
                    </div>
                </div>

                {/* CHART CARD */}
                <div style={{
                    backgroundColor: '#FFF4E0',
                    borderRadius: '20px',
                    padding: '35px 40px',
                    marginBottom: '30px',
                    border: '2px solid #F5E6D3'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', margin: '0 0 35px 0' }}>
                        Pesanan
                    </h2>

                    {/* BAR CHART WITH Y-AXIS */}
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end', minHeight: '280px', position: 'relative' }}>
                        {/* Y-AXIS LABELS */}
                        <div style={{ display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', height: '260px', textAlign: 'right', paddingRight: '10px', minWidth: '40px' }}>
                            <span style={{ fontSize: '12px', color: '#999' }}>10</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>20</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>30</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>40</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>50</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>60</span>
                        </div>

                        {/* BARS */}
                        <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-end', flex: 1, paddingBottom: '0px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: '195px',
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Masuk</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: '130px',
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Dijadwalkan</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: '100px',
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Berjalan</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: '35px',
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Dibatalkan</p>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM LINE */}
                    <div style={{ borderBottom: '2px solid #D4A574', marginTop: '20px' }}></div>
                </div>

                {/* BOTTOM ROW */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '30px'
                }}>
                    {/* DONUT CHART */}
                    <div style={{
                        backgroundColor: '#FFF4E0',
                        borderRadius: '20px',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #F5E6D3'
                    }}>
                        {/* DONUT */}
                        <div style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: 'conic-gradient(#F59E0B 0deg 234deg, #FFDA6A 234deg 360deg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '35px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '115px',
                                height: '115px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF'
                            }}></div>
                        </div>

                        {/* LEGEND */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignSelf: 'flex-start', marginLeft: '0px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '16px', height: '16px', backgroundColor: '#F59E0B', borderRadius: '3px' }}></div>
                                <span style={{ fontSize: '13px', color: '#000', fontWeight: '500' }}>Diantar</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '16px', height: '16px', backgroundColor: '#FFDA6A', borderRadius: '3px' }}></div>
                                <span style={{ fontSize: '13px', color: '#000', fontWeight: '500' }}>Menunggu kurir</span>
                            </div>
                        </div>
                    </div>

                    {/* SCHEDULE CARD */}
                    <div style={{
                        backgroundColor: '#FFF4E0',
                        borderRadius: '20px',
                        padding: '40px',
                        border: '2px solid #F5E6D3'
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: '0 0 24px 0' }}>
                            Jadwal pengiriman hari ini
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {deliveries.map((delivery, idx) => (
                                <div key={idx} style={{
                                    backgroundColor: '#FFFFFF',
                                    padding: '18px 20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid #F0E6D8'
                                }}>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#000', margin: '0 0 5px 0' }}>
                                            {delivery.no} - {delivery.dest}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#999', margin: 0, fontStyle: 'italic' }}>
                                            {delivery.company}
                                        </p>
                                    </div>
                                    <ChevronRight size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}