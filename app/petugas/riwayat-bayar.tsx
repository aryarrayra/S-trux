import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/petugas/SideBar';

export default function RiwayatBayar() {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Semua');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

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

    const payments = [
        {
            id: 'STX0001',
            unit: 'Excavator Caterpillar 3200D',
            method: 'Transfer Bank',
            proof: 'img_02332912.png',
            status: 'Belum Verifikasi',
            statusColor: '#dc2626',
            tanggalSewa: '17/10/2025',
            namaPenyewa: 'Santoso Merogo',
            sewaBerahir: '30/10/2025',
            namaPerusahaan: 'PT. Sumber Makmur',
            lokasi: 'Jln Bambu hitam, Jakarta Timur',
            kategoriUnit: 'Excavator',
            series: 'Caterpillar CAT 3200D',
            kondisi: 'Baik'
        },
        {
            id: 'STX0001',
            unit: 'Excavator Caterpillar 3200D',
            method: 'Transfer Bank',
            proof: 'img_02332912.png',
            status: 'Terverifikasi',
            statusColor: '#2563eb',
            tanggalSewa: '17/10/2025',
            namaPenyewa: 'Santoso Merogo',
            sewaBerahir: '30/10/2025',
            namaPerusahaan: 'PT. Sumber Makmur',
            lokasi: 'Jln Bambu hitam, Jakarta Timur',
            kategoriUnit: 'Excavator',
            series: 'Caterpillar CAT 3200D',
            kondisi: 'Baik'
        },
        {
            id: 'STX0001',
            unit: 'Excavator Caterpillar 3200D',
            method: 'Transfer Bank',
            proof: 'img_02332912.png',
            status: 'Menunggu',
            statusColor: '#f59e0b',
            tanggalSewa: '17/10/2025',
            namaPenyewa: 'Santoso Merogo',
            sewaBerahir: '30/10/2025',
            namaPerusahaan: 'PT. Sumber Makmur',
            lokasi: 'Jln Bambu hitam, Jakarta Timur',
            kategoriUnit: 'Excavator',
            series: 'Caterpillar CAT 3200D',
            kondisi: 'Baik'
        },
        {
            id: 'STX0001',
            unit: 'Excavator Caterpillar 3200D',
            method: 'Transfer Bank',
            proof: 'img_02332912.png',
            status: 'Ditolak',
            statusColor: '#6b7280',
            tanggalSewa: '17/10/2025',
            namaPenyewa: 'Santoso Merogo',
            sewaBerahir: '30/10/2025',
            namaPerusahaan: 'PT. Sumber Makmur',
            lokasi: 'Jln Bambu hitam, Jakarta Timur',
            kategoriUnit: 'Excavator',
            series: 'Caterpillar CAT 3200D',
            kondisi: 'Baik'
        }
    ];

    const handleOpenDetail = (payment: any) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#e8e8e8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Sidebar />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#e8e8e8' }}>
                {/* Header */}
                <div style={{ backgroundColor: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0e0e0' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1a1a1a', margin: 0, marginBottom: '4px', fontStyle: 'normal' }}>Riwayat Bayar</h1>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0, fontStyle: 'normal' }}>rekap aktivitas pembayaran yang dilakukan user</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px', margin: 0, marginBottom: '4px', fontStyle: 'normal' }}>{currentDate}</p>
                        <p style={{ color: '#666', fontSize: '12px', margin: 0, fontStyle: 'normal' }}>{currentTime} WIB</p>
                    </div>
                </div>

                {/* Filter */}
                <div style={{ backgroundColor: 'white', padding: '12px 32px', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ position: 'relative', maxWidth: '200px' }}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                width: '100%',
                                padding: '8px 14px',
                                backgroundColor: '#e8e8e8',
                                borderRadius: '3px',
                                fontSize: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                color: '#999',
                                fontStyle: 'normal'
                            }}
                        >
                            {selectedStatus}
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
                                {['Semua', 'Terverifikasi', 'Belum verifikasi', 'Ditolak', 'Menunggu'].map((option, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setSelectedStatus(option);
                                            setIsDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            color: '#666',
                                            fontSize: '12px',
                                            backgroundColor: selectedStatus === option ? '#f5f5f5' : 'white',
                                            transition: 'background-color 0.2s',
                                            fontStyle: 'normal'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedStatus === option ? '#f5f5f5' : 'white'}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>ID Transaksi</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Unit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Metode</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Bukti Bayar</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => handleOpenDetail(payment)}
                                        style={{
                                            borderBottom: '1px solid #e0e0e0',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.id}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.unit}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.method}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.proof}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', fontStyle: 'normal' }}>
                                            <span style={{
                                                color: payment.statusColor,
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                {payment.status}
                                                <span style={{ fontSize: '16px' }}>→</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            {showModal && selectedPayment && (
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
                        maxHeight: '90vh',
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
                                {selectedPayment.id}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
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
                            maxHeight: 'calc(90vh - 100px)',
                            overflowY: 'auto',
                            display: 'flex',
                            gap: '40px'
                        }}>
                            {/* Left Side - Informasi Sewa & Unit */}
                            <div style={{ flex: 1 }}>
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
                                        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Tanggal Sewa</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.tanggalSewa}</span>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Nama Penyewa</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.namaPenyewa}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Sewa Berakhir</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.sewaBerahir}</span>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Nama Perusahaan</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.namaPerusahaan}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Lokasi</label>
                                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.lokasi}</span>
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
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Kategori Unit</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.kategoriUnit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ maxWidth: '48%' }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Series</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.series}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ maxWidth: '48%' }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Kondisi</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.kondisi}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Foto Bukti Bayar */}
                            <div style={{ width: '320px' }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#F59E0B',
                                    marginBottom: '8px',
                                    fontStyle: 'normal'
                                }}>
                                    Foto bukti bayar
                                </h3>
                                <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '16px', fontStyle: 'normal' }}>
                                    *bila sesusai bukti teransfer dan informasi penting lainnya
                                </p>

                                {/* Image Placeholder */}
                                <div style={{
                                    width: '100%',
                                    height: '280px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '12px',
                                    border: '2px solid #fbbf24',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{ fontSize: '48px' }}>🏍️</span>
                                    <div style={{
                                        position: 'absolute',
                                        fontSize: '48px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                    }}>DEMIKIAN</div>
                                </div>

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontStyle: 'normal'
                                    }}>
                                        Terima
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontStyle: 'normal'
                                    }}>
                                        Tolak
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}