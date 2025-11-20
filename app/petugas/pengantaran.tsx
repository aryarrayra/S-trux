import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Sidebar from '@/components/petugas/SideBar';

export default function JadwalPengantaran() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Semua Data');
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deliveries, setDeliveries] = useState([
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
    ]);

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

    const handleSampaiLokasi = () => {
        if (selectedDelivery) {
            setDeliveries(prevDeliveries =>
                prevDeliveries.map(delivery =>
                    delivery.id === selectedDelivery.id
                        ? { ...delivery, status: 'Selesai', statusColor: '#22c55e' }
                        : delivery
                )
            );
            setSelectedDelivery(null);
            setShowSuccessModal(true);
        }
    };

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
                                {['Semua Data', 'Selesai Hari ini', 'Beroperasi hari ini', 'Mendatang'].map((option, idx) => (
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
                    {deliveries.map((delivery, index) => (
                        <div
                            key={index}
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
                    ))}
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>17/10/2025</span>
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>Santoso Merogo</span>
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>30/10/2025</span>
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>PT. Sumber Makmur</span>
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>Jln Bambu hitam, Jakarta Timur</span>
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
                                            {selectedDelivery.status !== 'Selesai' && (
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>Excavator</span>
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>Caterpillar CAT 3200D</span>
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
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>Baik</span>
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