import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Sidebar from '@/components/petugas/SideBar';
import { penyewaanService } from '@/services/penyewaanService';

export default function PetugasDashboard() {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [chartData, setChartData] = useState({
        masuk: 0,
        dijadwalkan: 0,
        berjalan: 0,
        dibatalkan: 0
    });
    const [deliveries, setDeliveries] = useState([]);
    const [donutData, setDonutData] = useState({
        diantar: 0,
        menunggu: 0,
        diantarPercentage: 0,
        menungguPercentage: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        
        // Load data
        loadDashboardData();
        
        return () => clearInterval(timer);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load semua data secara parallel
            const [chartStats, todayDeliveries, donutStats] = await Promise.all([
                penyewaanService.getChartData(),
                penyewaanService.getTodayDeliveries(),
                penyewaanService.getDonutChartData()
            ]);

            setChartData(chartStats);
            setDeliveries(todayDeliveries);
            setDonutData(donutStats);
            setError('');
        } catch (err) {
            setError('Gagal memuat data dashboard: ' + err.message);
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menghitung tinggi bar chart (dengan maksimum 260px)
    const calculateBarHeight = (value) => {
        const maxValue = Math.max(
            chartData.masuk,
            chartData.dijadwalkan, 
            chartData.berjalan,
            chartData.dibatalkan
        );
        
        if (maxValue === 0) return 0;
        return (value / maxValue) * 260;
    };

    // Fungsi untuk menghitung sudut conic gradient untuk donut chart
    const calculateConicGradient = () => {
        const { diantarPercentage, menungguPercentage } = donutData;
        const diantarDegrees = (diantarPercentage / 100) * 360;
        
        return `conic-gradient(#F59E0B 0deg ${diantarDegrees}deg, #FFDA6A ${diantarDegrees}deg 360deg)`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
                <Sidebar />
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '40px 50px'
                }}>
                    <div>Memuat data dashboard...</div>
                </div>
            </div>
        );
    }

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

                {/* Error Message */}
                {error && (
                    <div style={{ 
                        backgroundColor: '#fee2e2', 
                        color: '#dc2626', 
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

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
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column-reverse', 
                            justifyContent: 'space-between', 
                            height: '260px', 
                            textAlign: 'right', 
                            paddingRight: '10px', 
                            minWidth: '40px' 
                        }}>
                            {[0, 10, 20, 30, 40, 50, 60].map((num) => (
                                <span key={num} style={{ fontSize: '12px', color: '#999' }}>
                                    {num}
                                </span>
                            ))}
                        </div>

                        {/* BARS */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '60px', 
                            alignItems: 'flex-end', 
                            flex: 1, 
                            paddingBottom: '0px' 
                        }}>
                            {/* Bar: Masuk (Menunggu Persetujuan) */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: `${calculateBarHeight(chartData.masuk)}px`,
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px',
                                    transition: 'height 0.3s ease'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                                    Masuk ({chartData.masuk})
                                </p>
                            </div>

                            {/* Bar: Dijadwalkan (Dalam Pengantaran) */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: `${calculateBarHeight(chartData.dijadwalkan)}px`,
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px',
                                    transition: 'height 0.3s ease'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                                    Dijadwalkan ({chartData.dijadwalkan})
                                </p>
                            </div>

                            {/* Bar: Berjalan */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: `${calculateBarHeight(chartData.berjalan)}px`,
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px',
                                    transition: 'height 0.3s ease'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                                    Berjalan ({chartData.berjalan})
                                </p>
                            </div>

                            {/* Bar: Dibatalkan */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '65px',
                                    height: `${calculateBarHeight(chartData.dibatalkan)}px`,
                                    backgroundColor: '#FFC107',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '14px',
                                    transition: 'height 0.3s ease'
                                }}></div>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                                    Dibatalkan ({chartData.dibatalkan})
                                </p>
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
                            background: calculateConicGradient(),
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
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#F59E0B'
                            }}>
                                {donutData.diantarPercentage}%
                            </div>
                        </div>

                        {/* LEGEND */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '14px', 
                            alignSelf: 'flex-start', 
                            marginLeft: '0px' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    backgroundColor: '#F59E0B', 
                                    borderRadius: '3px' 
                                }}></div>
                                <span style={{ fontSize: '13px', color: '#000', fontWeight: '500' }}>
                                    Diantar ({donutData.diantar})
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    backgroundColor: '#FFDA6A', 
                                    borderRadius: '3px' 
                                }}></div>
                                <span style={{ fontSize: '13px', color: '#000', fontWeight: '500' }}>
                                    Menunggu kurir ({donutData.menunggu})
                                </span>
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
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{ 
                                fontSize: '15px', 
                                fontWeight: 'bold', 
                                color: '#000', 
                                margin: 0 
                            }}>
                                Jadwal pengiriman hari ini
                            </h3>
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                backgroundColor: '#F5E6D3',
                                padding: '4px 8px',
                                borderRadius: '12px'
                            }}>
                                Total: {deliveries.length}
                            </span>
                        </div>

                        {deliveries.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                color: '#666', 
                                fontSize: '14px',
                                padding: '20px'
                            }}>
                                Tidak ada jadwal pengiriman hari ini
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {deliveries.map((delivery, idx) => (
                                    <div key={delivery.id_sewa} style={{
                                        backgroundColor: '#FFFFFF',
                                        padding: '18px 20px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid #F0E6D8',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ 
                                                fontSize: '13px', 
                                                fontWeight: '600', 
                                                color: '#000', 
                                                margin: '0 0 5px 0' 
                                            }}>
                                                {delivery.no} - {delivery.dest}
                                            </p>
                                            <p style={{ 
                                                fontSize: '12px', 
                                                color: '#999', 
                                                margin: '0 0 3px 0',
                                                fontStyle: 'italic' 
                                            }}>
                                                {delivery.company}
                                            </p>
                                            <p style={{ 
                                                fontSize: '11px', 
                                                color: '#F59E0B', 
                                                margin: 0,
                                                fontWeight: '500'
                                            }}>
                                                Status: {delivery.status_sewa} • {delivery.alat_berat}
                                            </p>
                                        </div>
                                        <ChevronRight size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}