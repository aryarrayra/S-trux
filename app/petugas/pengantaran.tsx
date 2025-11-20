import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/petugas/SideBar';

export default function JadwalPengantaran() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Semua Data');

    // Modal & Status
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
    const [showSuccessDelivery, setShowSuccessDelivery] = useState(false);
    const [showSuccessReturn, setShowSuccessReturn] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<'Beroperasi hari ini' | 'Berhasil dijemput'>('Beroperasi hari ini');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setCurrentDate(dateStr);
            setCurrentTime(timeStr);
        };
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const deliveries = [
        { id: 'STX0098', company: 'PT Acong Makmur jayaraya', equipment: 'Excavator Caterpillar 3200D', location: 'Jln Bambu hitam, Jakarta Timur', date: '29 Oct 2025 - 01 Nov 2025', price: 'Rp 13.500.000', badge: 'Beroperasi', badgeColor: '#3b82f6' },
        { id: 'STX0081', company: 'PT Acong Makmur jayaraya', equipment: 'Bulldozer Volvo', location: 'Jln Bambu hitam, Jakarta Timur', date: '27 Oct 2025 - 28 Oct 2025', price: 'Rp 13.500.000', badge: 'Selesai', badgeColor: '#22c55e' },
        { id: 'STX0921', company: 'PT Acong Makmur jayaraya', equipment: 'Tower Crane Leihuner', location: 'Jln Bambu hitam, Jakarta Timur', date: '30 Nov 2025 - 05 Dec 2025', price: 'Rp 13.500.000', badge: 'Mendatang', badgeColor: '#f59e0b' },
    ];

    const openDetail = (del: any) => {
        setSelectedDelivery(del);
        setCurrentStatus('Beroperasi hari ini');
    };

    const handleSampaiLokasi = () => {
        setShowSuccessDelivery(true);
        setCurrentStatus('Berhasil dijemput');
    };

    const closeAll = () => {
        setSelectedDelivery(null);
        setShowSuccessDelivery(false);
        setShowSuccessReturn(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Sidebar />

            {/* HEADER & FILTER – TETAP SAMA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0e0e0' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Jadwal Pengantaran</h1>
                        <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0 0' }}>Cek kembali jadwal pengantaran dan pengembalian</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px' }}>{currentDate}</p>
                        <p style={{ color: '#666', fontSize: '12px' }}>{currentTime} WIB</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '12px 32px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ flex: 1, position: 'relative', maxWidth: '280px' }}>
                        <input type="text" placeholder="Pencarian" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '6px 12px', backgroundColor: '#e8e8e8', borderRadius: '3px', border: 'none', fontSize: '12px', outline: 'none' }} />
                        <span style={{ position: 'absolute', right: '10px', top: '8px', color: '#999' }}>🔍</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{ padding: '6px 14px', backgroundColor: '#e8e8e8', borderRadius: '3px', border: 'none', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '140px', justifyContent: 'space-between' }}>
                            {selectedFilter} <span style={{ fontSize: '10px', transform: isDropdownOpen ? 'rotate(180deg)' : '' }}>▼</span>
                        </button>
                        {isDropdownOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: 'white', borderRadius: '3px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000 }}>
                                {['Semua Data', 'Selesai Hari ini', 'Beroperasi hari ini', 'Mendatang'].map((opt, i) => (
                                    <div key={i} onClick={() => { setSelectedFilter(opt); setIsDropdownOpen(false); }}
                                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '12px', backgroundColor: selectedFilter === opt ? '#f5f5f5' : 'white' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedFilter === opt ? '#f5f5f5' : 'white'}>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cards – PERBAIKAN TYPO DI SINI */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px' }}>
                    {deliveries.map((d, i) => (
                        <div key={i} onClick={() => openDetail(d)} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', border: '1px solid #e0e0e0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                            <div>
                                <h3 style={{ color: '#f59e0b', fontWeight: '600', margin: '0 0 12px 0' }}>{d.id}</h3>
                                <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.6' }}>
                                    <div>PT Acong Makmur jayaraya</div>
                                    <div>{d.equipment}</div>
                                    <div>Jln Bambu hitam, Jakarta Timur</div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#999', margin: '8px 0 0 0' }}>{d.date}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ backgroundColor: d.badgeColor, color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{d.badge}</span>
                                <p style={{ fontSize: '18px', fontWeight: '600', margin: '12px 0 0 0' }}>{d.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL LANDSCAPE – TETAP SAMA */}
            {selectedDelivery && !showSuccessDelivery && !showSuccessReturn && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        width: '95vw',
                        maxWidth: '1100px',
                        height: '78vh',
                        display: 'flex',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        {/* KIRI – INFORMASI SEWA */}
                        <div style={{ flex: 1, padding: '32px', backgroundColor: '#fffbeb', borderRight: '1px solid #fed7aa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, color: '#f59e0b', fontSize: '26px', fontWeight: '700' }}>Excavator Caterpillar 3200D</h2>
                                <button onClick={closeAll} style={{ background: 'none', border: 'none', fontSize: '32px', color: '#999', cursor: 'pointer' }}>×</button>
                            </div>

                            <p style={{ color: '#f59e0b', fontWeight: '600', margin: '0 0 20px 0' }}>Informasi Sewa</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', fontSize: '14px' }}>
                                <div><div style={{ color: '#666', marginBottom: '6px' }}>Tanggal Sewa</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>17/10/2025</div></div>
                                <div><div style={{ color: '#666', marginBottom: '6px' }}>Nama Penyewa</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>Santoso Merogo</div></div>
                                <div><div style={{ color: '#666', marginBottom: '6px' }}>Sewa Berakhir</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>30/10/2025</div></div>
                                <div><div style={{ color: '#666', marginBottom: '6px' }}>Nama Perusahaan</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>PT. Sumber Makmur</div></div>
                                <div><div style={{ color: '#666', marginBottom: '6px' }}>Lokasi</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>Jln Bambu hitam, Jakarta Timur</div></div>

                                {/* STATUS PILL */}
                                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                    <div style={{ color: '#666', marginBottom: '10px' }}>Status</div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1, backgroundColor: currentStatus === 'Beroperasi hari ini' ? '#fffbeb' : '#f3f4f6', color: currentStatus === 'Beroperasi hari ini' ? '#d97706' : '#9ca3af', padding: '14px', borderRadius: '999px', textAlign: 'center', fontWeight: '600', border: currentStatus === 'Beroperasi hari ini' ? '2px solid #fdba74' : 'none' }}>
                                            Beroperasi hari ini
                                        </div>
                                        <div style={{ flex: 1, backgroundColor: currentStatus === 'Berhasil dijemput' ? '#e5e7eb' : '#f9fafb', color: currentStatus === 'Berhasil dijemput' ? '#374151' : '#9ca3af', padding: '14px', borderRadius: '999px', textAlign: 'center', fontWeight: currentStatus === 'Berhasil dijemput' ? '600' : '500' }}>
                                            Berhasil dijemput
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KANAN – INFORMASI UNIT + TOMBOL */}
                        <div style={{ width: '380px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ color: '#f59e0b', fontWeight: '600', margin: '0 0 20px 0' }}>Informasi Unit</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
                                    <div><div style={{ color: '#666', marginBottom: '6px' }}>Kategori Unit</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>Excavator</div></div>
                                    <div><div style={{ color: '#666', marginBottom: '6px' }}>Series</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>Caterpillar CAT 3200D</div></div>
                                    <div><div style={{ color: '#666', marginBottom: '6px' }}>Kondisi</div><div style={{ backgroundColor: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>Baik</div></div>
                                </div>
                            </div>

                            {currentStatus === 'Beroperasi hari ini' && (
                                <button onClick={handleSampaiLokasi}
                                    style={{ width: '100%', backgroundColor: '#22c55e', color: 'white', padding: '20px', borderRadius: '999px', border: 'none', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 25px rgba(34,197,94,0.4)' }}>
                                    Sampai Lokasi
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Notifikasi tetap sama */}
            {showSuccessDelivery && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '40px 32px', textAlign: 'center', maxWidth: '380px' }}>
                        <div style={{ width: '90px', height: '90px', border: '6px solid #22c55e', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '48px', color: '#22c55e' }}>✓</span>
                        </div>
                        <h3 style={{ color: '#f59e0b', fontWeight: '600' }}>Berhasil diantar!</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>Anda telah mengantar unit ini sampai lokasi,<br />cek secara berkala status pengembalian unit</p>
                        <button onClick={() => setShowSuccessDelivery(false)} style={{ marginTop: '24px', backgroundColor: '#f59e0b', color: 'white', padding: '12px 40px', borderRadius: '999px', border: 'none', fontWeight: '600' }}>Oke</button>
                    </div>
                </div>
            )}

            {showSuccessReturn && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '40px 32px', textAlign: 'center', maxWidth: '380px' }}>
                        <div style={{ width: '90px', height: '90px', border: '6px solid #22c55e', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '48px', color: '#22c55e' }}>✓</span>
                        </div>
                        <h3 style={{ color: '#f59e0b', fontWeight: '600' }}>Sewa telah berakhir, saatnya kembali!</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>Anda telah menjemput unit ini dan<br />mengembalikan ke armada</p>
                        <button onClick={closeAll} style={{ marginTop: '24px', backgroundColor: '#f59e0b', color: 'white', padding: '12px 40px', borderRadius: '999px', border: 'none', fontWeight: '600' }}>Oke</button>
                    </div>
                </div>
            )}
        </div>
    );
}