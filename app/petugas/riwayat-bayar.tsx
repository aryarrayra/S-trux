import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/petugas/SideBar';
import { pembayaranService } from '@/services/pembayaranService';

export default function RiwayatBayar() {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Semua');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        
        // Load data pembayaran
        loadPayments();
        
        return () => clearInterval(timer);
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await pembayaranService.getAllPayments();
            setPayments(data);
            setError('');
        } catch (err) {
            setError('Gagal memuat data pembayaran: ' + err.message);
            console.error('Error loading payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = async (payment) => {
        try {
            // Fetch detail lengkap dengan relasi
            const detail = await pembayaranService.getPaymentById(payment.id_pembayaran);
            setSelectedPayment(detail);
            setShowModal(true);
        } catch (err) {
            setError('Gagal memuat detail pembayaran: ' + err.message);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedPayment) return;

        try {
            await pembayaranService.updatePaymentStatus(selectedPayment.id_pembayaran, status);
            
            // Update local state
            const updatedPayments = payments.map(p => 
                p.id_pembayaran === selectedPayment.id_pembayaran 
                    ? { ...p, status_pembayaran: status }
                    : p
            );
            setPayments(updatedPayments);
            
            // Update selected payment
            setSelectedPayment({ ...selectedPayment, status_pembayaran: status });
            
            // Close modal
            setShowModal(false);
            
            alert(`Status berhasil diubah menjadi: ${status}`);
        } catch (err) {
            setError('Gagal mengupdate status: ' + err.message);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Lunas': '#2563eb', // Biru
            'Belum Lunas': '#f59e0b', // Kuning/Oranye
            'Ditolak': '#dc2626', // Merah
            'Menunggu Verifikasi': '#6b7280', // Abu-abu
            'Belum Verifikasi': '#dc2626' // Merah
        };
        return colors[status] || '#6b7280';
    };

    const getStatusText = (status) => {
        const texts = {
            'Lunas': 'Terverifikasi',
            'Belum Lunas': 'Belum Verifikasi',
            'Ditolak': 'Ditolak',
            'Menunggu Verifikasi': 'Menunggu',
            'Belum Verifikasi': 'Belum Verifikasi'
        };
        return texts[status] || status;
    };

    // Filter payments berdasarkan status
    const filteredPayments = payments.filter(payment => {
        if (selectedStatus === 'Semua') return true;
        
        const statusMap = {
            'Terverifikasi': 'Lunas',
            'Belum verifikasi': 'Belum Lunas',
            'Ditolak': 'Ditolak',
            'Menunggu': 'Menunggu Verifikasi'
        };
        
        return payment.status_pembayaran === statusMap[selectedStatus];
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#e8e8e8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div>Memuat data pembayaran...</div>
                </div>
            </div>
        );
    }

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

                {/* Error Message */}
                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 32px', borderBottom: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

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
                        {filteredPayments.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                Tidak ada data pembayaran
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>ID Pembayaran</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>ID Sewa</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Metode</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Jumlah Bayar</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#f59e0b', fontStyle: 'normal' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment, index) => (
                                        <tr
                                            key={payment.id_pembayaran}
                                            onClick={() => handleOpenDetail(payment)}
                                            style={{
                                                borderBottom: '1px solid #e0e0e0',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.id_pembayaran}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.id_sewa}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>{payment.metode || 'Transfer'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', fontStyle: 'normal' }}>
                                                Rp {payment.jumlah_bayar?.toLocaleString('id-ID')}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', fontStyle: 'normal' }}>
                                                <span style={{
                                                    color: getStatusColor(payment.status_pembayaran),
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    {getStatusText(payment.status_pembayaran)}
                                                    <span style={{ fontSize: '16px' }}>→</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
                                Pembayaran #{selectedPayment.id_pembayaran}
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
                            {/* Left Side - Informasi Pembayaran & Sewa */}
                            <div style={{ flex: 1 }}>
                                {/* Informasi Pembayaran */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: '#F59E0B',
                                        marginBottom: '20px',
                                        fontStyle: 'normal'
                                    }}>
                                        Informasi Pembayaran
                                    </h3>

                                    <div style={{ marginLeft: '50px' }}>
                                        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Tanggal Bayar</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                        {new Date(selectedPayment.tanggal_bayar).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Metode Pembayaran</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.metode || 'Transfer'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Jumlah Bayar</label>
                                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>
                                                    Rp {selectedPayment.jumlah_bayar?.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>Status</label>
                                            <div style={{ 
                                                backgroundColor: '#FFFFFF', 
                                                border: '1px solid #F59E0B', 
                                                borderRadius: '8px', 
                                                padding: '12px',
                                                color: getStatusColor(selectedPayment.status_pembayaran),
                                                fontWeight: '600'
                                            }}>
                                                <span style={{ fontSize: '14px', fontStyle: 'normal' }}>
                                                    {getStatusText(selectedPayment.status_pembayaran)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informasi Sewa (jika ada relasi) */}
                                {selectedPayment.penyewaan && (
                                    <div>
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
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ fontSize: '14px', color: '#000', display: 'block', marginBottom: '8px', fontStyle: 'normal' }}>ID Sewa</label>
                                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#000', fontStyle: 'normal' }}>{selectedPayment.penyewaan.id_sewa}</span>
                                                </div>
                                            </div>

                                            {/* Tambahkan informasi lain dari penyewaan jika diperlukan */}
                                        </div>
                                    </div>
                                )}
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
                                    *pastikan bukti transfer sesuai dengan informasi pembayaran
                                </p>

                                {/* Image Display */}
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
                                    {selectedPayment.bukti_bayar ? (
                                        <img 
                                            src={pembayaranService.getBuktiBayarUrl(selectedPayment.bukti_bayar)}
                                            alt="Bukti Bayar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#6b7280'
                                        }}>
                                            <span style={{ fontSize: '48px', marginBottom: '8px' }}>📄</span>
                                            <span style={{ fontSize: '14px' }}>Tidak ada bukti bayar</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {selectedPayment.status_pembayaran !== 'Lunas' && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            onClick={() => handleUpdateStatus('Lunas')}
                                            style={{
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
                                            }}
                                        >
                                            Terima
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus('Ditolak')}
                                            style={{
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
                                            }}
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}