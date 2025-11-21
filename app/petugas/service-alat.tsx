import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/petugas/SideBar';

interface AlatBerat {
    id_alat: number;
    nama_alat: string;
    kategori?: string;
}

interface PerawatanAlat {
    id_perawatan: number;
    id_alat: number;
    tanggal_perawatan: string;
    keterangan: string;
    biaya_perawatan: number;
    status: 'Dijadwalkan' | 'Selesai';
    created_at?: string;
    updated_at?: string;
    alat?: AlatBerat;
}

interface ApiResponse {
    success: boolean;
    data?: PerawatanAlat[] | PerawatanAlat;
    message?: string;
}

const API_BASE = 'http://localhost:8000/api';

export default function ServiceAlat() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [selectedType, setSelectedType] = useState('Semua Tipe');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Data states
    const [services, setServices] = useState<PerawatanAlat[]>([]);
    const [alatList, setAlatList] = useState<AlatBerat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<PerawatanAlat | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        id_alat: '',
        tanggal_perawatan: '',
        keterangan: '',
        biaya_perawatan: '',
        status: 'Dijadwalkan'
    });

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        };
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch perawatan data
    const fetchServices = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/perawatan-alat`, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: ApiResponse = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setServices(data.data);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err instanceof Error ? err.message : 'Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch alat berat list for dropdown
    const fetchAlatList = async () => {
        try {
            const response = await fetch(`${API_BASE}/alat-berat`, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setAlatList(data.data);
                }
            }
        } catch (err) {
            console.error('Error fetching alat list:', err);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchAlatList();
    }, []);

    // Reset form
    const resetForm = () => {
        setFormData({
            id_alat: '',
            tanggal_perawatan: '',
            keterangan: '',
            biaya_perawatan: '',
            status: 'Dijadwalkan'
        });
    };

    // Open add modal
    const handleAdd = () => {
        setIsEditMode(false);
        setSelectedService(null);
        resetForm();
        setIsModalOpen(true);
    };

    // Open edit modal
    const handleEdit = (service: PerawatanAlat) => {
        setIsEditMode(true);
        setSelectedService(service);
        setFormData({
            id_alat: service.id_alat.toString(),
            tanggal_perawatan: service.tanggal_perawatan,
            keterangan: service.keterangan || '',
            biaya_perawatan: service.biaya_perawatan.toString(),
            status: service.status
        });
        setIsModalOpen(true);
    };

    // Open delete modal
    const handleDeleteClick = (service: PerawatanAlat) => {
        setSelectedService(service);
        setIsDeleteModalOpen(true);
    };

    // Submit form (create/update)
    const handleSubmit = async () => {
        if (!formData.id_alat || !formData.tanggal_perawatan || !formData.biaya_perawatan) {
            alert('Harap isi semua field yang wajib!');
            return;
        }

        const payload = {
            id_alat: parseInt(formData.id_alat),
            tanggal_perawatan: formData.tanggal_perawatan,
            keterangan: formData.keterangan,
            biaya_perawatan: parseFloat(formData.biaya_perawatan),
            status: formData.status
        };

        try {
            const url = isEditMode ? `${API_BASE}/perawatan-alat/${selectedService?.id_perawatan}` : `${API_BASE}/perawatan-alat`;
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Gagal menyimpan data');
            }

            alert(isEditMode ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!');
            setIsModalOpen(false);
            fetchServices();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
        }
    };

    // Delete service
    const handleDelete = async () => {
        if (!selectedService) return;
        try {
            const response = await fetch(`${API_BASE}/perawatan-alat/${selectedService.id_perawatan}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Gagal menghapus data');
            alert('Data berhasil dihapus!');
            setIsDeleteModalOpen(false);
            fetchServices();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Filter services
    const filteredServices = services.filter(s => {
        const matchSearch = s.alat?.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = selectedType === 'Semua Tipe' || s.alat?.kategori === selectedType;
        return matchSearch && matchType;
    });

    // Get unique categories for filter
    const categories = ['Semua Tipe', ...new Set(services.map(s => s.alat?.kategori).filter(Boolean))];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#e8e8e8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#e8e8e8' }}>
                {/* Header */}
                <div style={{ backgroundColor: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0e0e0' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1a1a1a', margin: 0, marginBottom: '4px' }}>Service Unit</h1>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Atur penjadwalan maintenance alat berat</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px', margin: 0, marginBottom: '4px' }}>{currentDate}</p>
                        <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>{currentTime} WIB</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div style={{ backgroundColor: 'white', padding: '12px 32px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                        <div style={{ flex: 1, position: 'relative', maxWidth: '280px' }}>
                            <input type="text" placeholder="Temukan" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '6px 12px', backgroundColor: '#e8e8e8', borderRadius: '3px', fontSize: '12px', border: 'none', outline: 'none', color: '#333' }} />
                            <span style={{ position: 'absolute', right: '10px', top: '8px', color: '#999', fontSize: '13px' }}>🔍</span>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{ padding: '6px 14px', backgroundColor: '#e8e8e8', borderRadius: '3px', fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#333', minWidth: '140px', justifyContent: 'space-between' }}>
                                {selectedType}
                                <span style={{ fontSize: '10px', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                            </button>
                            {isDropdownOpen && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: 'white', borderRadius: '3px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden' }}>
                                    {categories.map((option, idx) => (
                                        <div key={idx} onClick={() => { setSelectedType(option as string); setIsDropdownOpen(false); }}
                                            style={{ padding: '10px 14px', cursor: 'pointer', color: '#666', fontSize: '12px', backgroundColor: selectedType === option ? '#f5f5f5' : 'white' }}>
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleAdd} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Tambahkan Jadwal <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
                    </button>
                </div>

                {/* Loading/Error */}
                {isLoading && <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Memuat data...</div>}
                {error && <div style={{ padding: '20px 32px', backgroundColor: '#fee2e2', color: '#dc2626', margin: '16px 32px', borderRadius: '8px' }}>Error: {error}</div>}

                {/* Cards Grid */}
                {!isLoading && !error && (
                    <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px' }}>
                        {filteredServices.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Tidak ada data perawatan</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                {filteredServices.map((service) => (
                                    <div key={service.id_perawatan} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', border: '1px solid #e0e0e0', position: 'relative' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', margin: 0, marginBottom: '12px' }}>
                                            {service.alat?.nama_alat || 'Alat #' + service.id_alat}
                                        </h3>
                                        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEdit(service)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>✏️</button>
                                            <button onClick={() => handleDeleteClick(service)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>🗑️</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333' }}>
                                                <span>🔄</span><span>{service.keterangan || '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333' }}>
                                                <span>📅</span><span>{formatDate(service.tanggal_perawatan)}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                <span>📌</span>
                                                <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', backgroundColor: service.status === 'Selesai' ? '#dcfce7' : '#fef3c7', color: service.status === 'Selesai' ? '#166534' : '#92400e' }}>
                                                    {service.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Total Biaya</div>
                                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>{formatCurrency(service.biaya_perawatan)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', color: '#f59e0b' }}>{isEditMode ? 'Edit Jadwal Service' : 'Tambah Jadwal Service'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333', fontWeight: '500' }}>Alat Berat *</label>
                                <select value={formData.id_alat} onChange={(e) => setFormData({ ...formData, id_alat: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #f59e0b', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                                    <option value="">Pilih Alat</option>
                                    {alatList.map(alat => <option key={alat.id_alat} value={alat.id_alat}>{alat.nama_alat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333', fontWeight: '500' }}>Tanggal Perawatan *</label>
                                <input type="date" value={formData.tanggal_perawatan} onChange={(e) => setFormData({ ...formData, tanggal_perawatan: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #f59e0b', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333', fontWeight: '500' }}>Keterangan</label>
                                <textarea value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Service tahunan, ganti oli, dll"
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #f59e0b', borderRadius: '6px', fontSize: '13px', outline: 'none', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333', fontWeight: '500' }}>Biaya Perawatan *</label>
                                <input type="number" value={formData.biaya_perawatan} onChange={(e) => setFormData({ ...formData, biaya_perawatan: e.target.value })} placeholder="7000000"
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #f59e0b', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333', fontWeight: '500' }}>Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #f59e0b', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                                    <option value="Dijadwalkan">Dijadwalkan</option>
                                    <option value="Selesai">Selesai</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', backgroundColor: '#e5e5e5', color: '#333', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Batal</button>
                            <button onClick={handleSubmit} style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>{isEditMode ? 'Update' : 'Simpan'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '320px', padding: '30px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '36px' }}>🗑️</div>
                        <h3 style={{ margin: '0 0 24px', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>Anda Yakin Menghapus Jadwal Ini?</h3>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={handleDelete} style={{ padding: '10px 30px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>YA</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} style={{ padding: '10px 30px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Tidak</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}