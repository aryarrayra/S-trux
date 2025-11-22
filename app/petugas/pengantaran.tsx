import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Sidebar from '@/components/petugas/SideBar';

export default function JadwalPengantaran() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Semua Data');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    // Fetch data dari API
    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('auth_token');
            
            const response = await fetch(`${API_BASE_URL}/penyewaan`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Filter out data dengan status "Menunggu Persetujuan"
                const filteredData = result.data.filter(penyewaan => 
                    penyewaan.status_sewa !== 'Menunggu Persetujuan' && 
                    penyewaan.status_persetujuan !== 'Menunggu'
                );

                // Transform data dari API ke format yang diinginkan component
                const transformedData = filteredData.map(penyewaan => ({
                    id: `STX${String(penyewaan.id_sewa).padStart(4, '0')}`,
                    id_sewa: penyewaan.id_sewa,
                    company: penyewaan.pelanggan?.company_name || penyewaan.pelanggan?.nama_pelanggan || 'Tidak ada nama perusahaan',
                    equipment: penyewaan.alat?.nama_alat || 'Alat tidak ditemukan',
                    location: penyewaan.lokasi_proyek || 'Lokasi tidak tersedia',
                    date: `${new Date(penyewaan.tanggal_sewa).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })} - ${penyewaan.tanggal_kembali ? new Date(penyewaan.tanggal_kembali).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }) : 'Belum ditentukan'}`,
                    price: new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                    }).format(penyewaan.total_harga || 0),
                    status: getStatusText(penyewaan.status_sewa),
                    statusColor: getStatusColor(penyewaan.status_sewa),
                    originalData: penyewaan
                }));
                
                setDeliveries(transformedData);
            } else {
                throw new Error(result.message || 'Gagal mengambil data');
            }
        } catch (err) {
            console.error('Error fetching deliveries:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function untuk mapping status
    const getStatusText = (status) => {
        const statusMap = {
            'Berjalan': 'Berlangsung',
            'Selesai': 'Selesai',
            'Dibatalkan': 'Dibatalkan',
            'Menunggu Persetujuan': 'Menunggu Persetujuan',
            'Dalam Pengantaran': 'Dalam Pengantaran'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'Berjalan': '#2563eb',
            'Selesai': '#22c55e',
            'Dibatalkan': '#ef4444',
            'Menunggu Persetujuan': '#f59e0b',
            'Dalam Pengantaran': '#8b5cf6'
        };
        return colorMap[status] || '#666';
    };

    // Update status pengantaran
    const updateDeliveryStatus = async (idSewa, newStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            
            const response = await fetch(`${API_BASE_URL}/penyewaan/${idSewa}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status_sewa: newStatus
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                return true;
            } else {
                throw new Error(result.message || 'Gagal update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            throw err;
        }
    };

    // Handle sampai lokasi
    const handleSampaiLokasi = async () => {
        if (selectedDelivery) {
            try {
                await updateDeliveryStatus(selectedDelivery.originalData.id_sewa, 'Selesai');
                
                // Update local state
                setDeliveries(prevDeliveries =>
                    prevDeliveries.map(delivery =>
                        delivery.id_sewa === selectedDelivery.originalData.id_sewa
                            ? { 
                                ...delivery, 
                                status: 'Selesai', 
                                statusColor: '#22c55e',
                                originalData: {
                                    ...delivery.originalData,
                                    status_sewa: 'Selesai'
                                }
                            }
                            : delivery
                    )
                );
                
                setSelectedDelivery(null);
                setShowSuccessModal(true);
            } catch (err) {
                alert('Gagal update status: ' + err.message);
            }
        }
    };

    // Filter data berdasarkan selectedFilter
    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesSearch = delivery.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        switch (selectedFilter) {
            case 'Selesai Hari ini':
                return delivery.status === 'Selesai';
            case 'Beroperasi hari ini':
                return delivery.status === 'Berlangsung';
            case 'Dalam Pengantaran':
                return delivery.status === 'Dalam Pengantaran';
            default:
                return true;
        }
    });

    useEffect(() => {
        fetchDeliveries();
        
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

    // Refresh data setiap 30 detik
    useEffect(() => {
        const interval = setInterval(fetchDeliveries, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div>Loading data pengantaran...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <div style={{ color: '#ef4444', marginBottom: '16px' }}>Error: {error}</div>
                    <button 
                        onClick={fetchDeliveries}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Sidebar />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
                {/* Header */}
                <div style={{ backgroundColor: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0e0e0' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1a1a1a', margin: 0, marginBottom: '4px', fontStyle: 'normal' }}>Jadwal Pengantaran</h1>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0, fontStyle: 'normal' }}>Cek kembali jadwal pengantaran dan pengembalian</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px', margin: 0, marginBottom: '4px', fontStyle: 'normal' }}>{currentDate}</p>
                        <p style={{ color: '#666', fontSize: '12px', margin: 0, fontStyle: 'normal' }}>{currentTime} WIB</p>
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
                            {selectedFilter}
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
                                {['Semua Data', 'Selesai Hari ini', 'Beroperasi hari ini', 'Dalam Pengantaran'].map((option, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setSelectedFilter(option);
                                            setIsDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            color: '#666',
                                            fontSize: '12px',
                                            backgroundColor: selectedFilter === option ? '#f5f5f5' : 'white',
                                            transition: 'background-color 0.2s',
                                            fontStyle: 'normal'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedFilter === option ? '#f5f5f5' : 'white'}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cards Container */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px' }}>
                    {filteredDeliveries.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px', 
                            color: '#666',
                            fontStyle: 'italic'
                        }}>
                            {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data pengantaran'}
                        </div>
                    ) : (
                        filteredDeliveries.map((delivery, index) => (
                            <div
                                key={delivery.id_sewa}
                                onClick={() => setSelectedDelivery(delivery)}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    border: '1px solid #e0e0e0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f59e0b', margin: 0, fontStyle: 'normal' }}>{delivery.id}</h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#333', fontSize: '12px', fontStyle: 'normal' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px' }}>🏢</span>
                                            <span style={{ fontStyle: 'normal' }}>{delivery.company}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px' }}>⚙️</span>
                                            <span style={{ fontStyle: 'normal' }}>{delivery.equipment}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px' }}>📍</span>
                                            <span style={{ fontStyle: 'normal' }}>{delivery.location}</span>
                                        </div>
                                    </div>

                                    <p style={{ color: '#999', fontSize: '10px', margin: '6px 0 0 0', fontStyle: 'normal' }}>{delivery.date}</p>
                                </div>

                                <div style={{ marginLeft: '20px', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <span style={{ backgroundColor: delivery.statusColor, color: 'white', fontSize: '10px', padding: '3px 9px', borderRadius: '2px', fontWeight: '600', fontStyle: 'normal' }}>
                                        {delivery.status}
                                    </span>
                                    <p style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', margin: 0, fontStyle: 'normal' }}>{delivery.price}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedDelivery && !showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        width: '95%',
                        maxWidth: '900px',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        fontStyle: 'normal'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '25px 30px 20px',
                            borderBottom: '1px solid #F59E0B',
                            position: 'relative'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '600',
                                color: '#F59E0B',
                                margin: 0,
                                fontStyle: 'normal'
                            }}>
                                {selectedDelivery.equipment}
                            </h2>
                            <button
                                onClick={() => setSelectedDelivery(null)}
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    top: '20px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    color: '#FF0000',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    padding: '5px'
                                }}
                            >×</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{
                            padding: '30px',
                            paddingTop: '20px',
                            maxHeight: 'calc(80vh - 100px)',
                            overflowY: 'auto'
                        }}>
                            {/* Informasi Sewa */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#F59E0B',
                                    marginBottom: '20px',
                                    fontStyle: 'normal'
                                }}>
                                    Informasi Sewa
                                </h3>

                                <div style={{ marginLeft: '50px' }}>
                                    {/* Row 1 */}
                                    <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Tanggal Sewa</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {new Date(selectedDelivery.originalData.tanggal_sewa).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Nama Penyewa</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.originalData.pelanggan?.nama_pelanggan || 'Tidak tersedia'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Sewa Berakhir</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.originalData.tanggal_kembali 
                                                        ? new Date(selectedDelivery.originalData.tanggal_kembali).toLocaleDateString('id-ID')
                                                        : 'Belum ditentukan'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Nama Perusahaan</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.company}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3 - Lokasi & Status */}
                                    <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Lokasi</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.location}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Status</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                marginBottom: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedDelivery.status}</span>
                                            </div>
                                            {/* Tombol Sampai Lokasi */}
                                            {selectedDelivery.originalData.status_sewa !== 'Selesai' && selectedDelivery.originalData.status_sewa !== 'Dibatalkan' && (
                                                <button
                                                    onClick={handleSampaiLokasi}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        backgroundColor: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        fontStyle: 'normal'
                                                    }}
                                                >Sampai Lokasi</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Unit */}
                            <div>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#F59E0B',
                                    marginBottom: '20px',
                                    fontStyle: 'normal'
                                }}>
                                    Informasi Unit
                                </h3>

                                <div style={{ marginLeft: '50px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ maxWidth: '48%' }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Kategori Unit</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.originalData.alat?.kategori || 'Tidak tersedia'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ maxWidth: '48%' }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Series</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.equipment}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ maxWidth: '48%' }}>
                                            <label style={{
                                                fontSize: '14px',
                                                color: '#000',
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontStyle: 'normal'
                                            }}>Kondisi</label>
                                            <div style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    {selectedDelivery.originalData.alat?.kondisi || 'Tidak tersedia'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '40px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        fontStyle: 'normal'
                    }}>
                        {/* Success Icon */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto 24px',
                            borderRadius: '50%',
                            border: '4px solid #22c55e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '4px solid #22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '40px', color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '12px', fontStyle: 'normal' }}>
                            Berhasil diantar!
                        </h3>

                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: '1.5', fontStyle: 'italic' }}>
                            Anda telah mengantar unit ini sampai lokasi, cek secara berkala status pengembalian unit
                        </p>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            style={{
                                padding: '10px 40px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontStyle: 'normal'
                            }}
                        >Oke</button>
                    </div>
                </div>
            )}
        </div>
    );
}