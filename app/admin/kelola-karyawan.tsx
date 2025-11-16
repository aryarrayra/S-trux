import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { Search, Edit2, Trash2, X, Check, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Mock data fallback sesuai struktur database
const INITIAL_EMPLOYEES = [
    {
        id_petugas: '1',
        nama_petugas: 'Argara Bhumi Tara',
        role: 'Karyawan',
        no_telp: '0823487322123',
        email: 'Argar2187@gmail.com',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1999-10-17',
        alamat: 'Jl. Mawar III Jakarta Pusat',
        status: 'aktif'
    },
    {
        id_petugas: '2',
        nama_petugas: 'Budi Santoso',
        role: 'Petugas',
        no_telp: '0812345678901',
        email: 'budi.santoso@gmail.com',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '1995-05-15',
        alamat: 'Jl. Merdeka No. 123 Bandung',
        status: 'aktif'
    },
];

type Employee = {
    id_petugas: string;
    nama_petugas: string;
    role: string;
    no_telp: string;
    email: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    alamat?: string;
    status?: string;
};

interface ApiResponse {
    success: boolean;
    data?: any[];
    message?: string;
}

export default function KelolaKaryawan() {
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [nama_petugas, setNamaPetugas] = useState('');
    const [email, setEmail] = useState('');
    const [tempat_lahir, setTempatLahir] = useState('');
    const [alamat, setAlamat] = useState('');
    const [tanggal_lahir, setTanggalLahir] = useState('');
    const [no_telp, setNoTelp] = useState('');
    const [role, setRole] = useState('Karyawan');
    const [status, setStatus] = useState('aktif'); // Default ke 'aktif'

    const API_BASE = 'http://localhost:8000/api';

    // Fetch data dari API
    const fetchEmployees = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching employees from API...');
            const response = await fetch(`${API_BASE}/petugas`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            console.log('✅ API Response:', data);

            if (data.success && data.data) {
                // Transform data dari API ke format yang sesuai dengan struktur database
                const transformedData: Employee[] = data.data.map((item: any) => ({
                    id_petugas: item.id_petugas?.toString() || Math.random().toString(),
                    nama_petugas: item.nama_petugas || 'Nama tidak tersedia',
                    role: item.role || 'Karyawan',
                    no_telp: item.no_telp || 'Tidak ada telepon',
                    email: item.email || 'Email tidak tersedia',
                    tempat_lahir: item.tempat_lahir || '',
                    tanggal_lahir: item.tanggal_lahir || '',
                    alamat: item.alamat || '',
                    status: item.status || 'aktif'
                }));
                setEmployees(transformedData);
            } else {
                throw new Error(data.message || 'Gagal mengambil data petugas');
            }
        } catch (error) {
            console.error('❌ Error fetching employees:', error);
            setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data');
            // Tetap gunakan data fallback
            setEmployees(INITIAL_EMPLOYEES);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data saat component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    const getCurrentDate = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();
        const dayName = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return {
            full: `${dayName}, ${date} ${month} ${year}`,
            time: `${hours}:${minutes} WIB`
        };
    };

    const currentDate = getCurrentDate();

    // Format date ke YYYY-MM-DD untuk database
    const formatDateForDB = (dateString: string) => {
        if (!dateString) return '';
        // Jika date string sudah dalam format YYYY-MM-DD, return langsung
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        // Convert dari DD/MM/YYYY ke YYYY-MM-DD
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    // Format date ke DD/MM/YYYY untuk display
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        try {
            // Jika format sudah YYYY-MM-DD
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const date = new Date(dateString);
                return date.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
            return dateString;
        } catch (error) {
            return '';
        }
    };

    // Format date ke YYYY-MM-DD untuk input type="date"
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            // Jika format sudah YYYY-MM-DD, return langsung
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            // Convert dari DD/MM/YYYY ke YYYY-MM-DD
            const parts = dateString.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            // Coba parse sebagai Date object
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return '';
        } catch (error) {
            return '';
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.nama_petugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.no_telp.includes(searchQuery)
    );

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsAddMode(false);
        setNamaPetugas(employee.nama_petugas);
        setEmail(employee.email);
        setTempatLahir(employee.tempat_lahir || '');
        setAlamat(employee.alamat || '');
        setTanggalLahir(employee.tanggal_lahir || '');
        setNoTelp(employee.no_telp);
        setRole(employee.role || 'Karyawan');
        setStatus(employee.status || 'aktif'); // Default ke 'aktif'
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setNamaPetugas('');
        setEmail('');
        setTempatLahir('');
        setAlamat('');
        setTanggalLahir('');
        setNoTelp('');
        setRole('Karyawan');
        setStatus('aktif'); // Reset ke 'aktif'
    };

    const handleDelete = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async (confirmed: boolean) => {
        if (confirmed && selectedEmployee) {
            try {
                // Delete dari API
                const response = await fetch(`${API_BASE}/petugas/${selectedEmployee.id_petugas}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Hapus dari state lokal
                    setEmployees(prev => prev.filter(emp => emp.id_petugas !== selectedEmployee.id_petugas));
                    console.log('✅ Karyawan dihapus:', selectedEmployee.id_petugas);
                    Alert.alert('Sukses', 'Data berhasil dihapus');
                } else {
                    const errorText = await response.text();
                    console.error('❌ Server response:', errorText);
                    throw new Error('Gagal menghapus data');
                }
            } catch (error) {
                console.error('❌ Error deleting employee:', error);
                Alert.alert('Error', 'Gagal menghapus data dari server');
            }
        }
        setDeleteModalVisible(false);
        setSelectedEmployee(null);
    };

    const validateForm = (): boolean => {
        if (!nama_petugas.trim()) {
            Alert.alert('Error', 'Nama lengkap harus diisi!');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Email harus diisi!');
            return false;
        }
        if (!no_telp.trim()) {
            Alert.alert('Error', 'Nomor telepon harus diisi!');
            return false;
        }
        
        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Format email tidak valid!');
            return false;
        }
        
        return true;
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;
        if (selectedEmployee) {
            try {
                const updateData = {
                    nama_petugas: nama_petugas,
                    email: email,
                    tempat_lahir: tempat_lahir,
                    alamat: alamat,
                    tanggal_lahir: formatDateForDB(tanggal_lahir),
                    no_telp: no_telp,
                    role: role,
                    status: status, // Sudah dalam format 'aktif'/'nonaktif'
                };

                console.log('📤 Data update yang dikirim:', updateData);

                const response = await fetch(`${API_BASE}/petugas/${selectedEmployee.id_petugas}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                console.log('📡 Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Server response:', errorText);
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                    
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                console.log('✅ Response data:', result);
                
                // Update state lokal
                setEmployees(prev => prev.map(emp =>
                    emp.id_petugas === selectedEmployee.id_petugas
                        ? {
                            ...emp,
                            nama_petugas,
                            email,
                            tempat_lahir,
                            alamat,
                            tanggal_lahir: formatDateForDB(tanggal_lahir),
                            no_telp,
                            role,
                            status,
                        }
                        : emp
                ));
                console.log('✅ Data diupdate:', selectedEmployee.id_petugas);
                Alert.alert('Sukses', 'Data berhasil diupdate');
                setModalVisible(false);
            } catch (error) {
                console.error('💥 Error updating employee:', error);
                Alert.alert('Error', error instanceof Error ? error.message : 'Gagal mengupdate data di server');
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const newEmployeeData = {
                nama_petugas: nama_petugas,
                email: email,
                tempat_lahir: tempat_lahir,
                alamat: alamat,
                tanggal_lahir: formatDateForDB(tanggal_lahir),
                no_telp: no_telp,
                role: role,
                status: status, // Sudah dalam format 'aktif'/'nonaktif'
            };

            console.log('📤 Data yang dikirim:', newEmployeeData);

            const response = await fetch(`${API_BASE}/petugas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(newEmployeeData),
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Server response:', errorText);
                let errorMessage = `HTTP error! status: ${response.status}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Response data:', result);
            
            // Tambahkan ke state lokal
            const newEmployee: Employee = {
                id_petugas: result.data?.id_petugas || String(employees.length + 1),
                nama_petugas,
                email,
                tempat_lahir,
                alamat,
                tanggal_lahir: formatDateForDB(tanggal_lahir),
                no_telp,
                role,
                status,
            };
            setEmployees(prev => [...prev, newEmployee]);
            console.log('✅ Data baru ditambahkan:', newEmployee);
            Alert.alert('Sukses', 'Data berhasil ditambahkan');
            setModalVisible(false);
        } catch (error) {
            console.error('💥 Error adding employee:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Gagal menambahkan data ke server');
        }
    };

    const handleClear = () => {
        resetForm();
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    // Handler untuk pilih role dari dropdown
    const selectRole = (selectedRole: string) => {
        setRole(selectedRole);
        setShowRoleDropdown(false);
    };

    // Handler untuk pilih status dari dropdown - PERBAIKAN DI SINI
    const selectStatus = (selectedStatus: string) => {
        // Simpan dalam format yang sesuai database ('aktif'/'nonaktif')
        const dbStatus = selectedStatus === 'Aktif' ? 'aktif' : 'nonaktif';
        setStatus(dbStatus);
        setShowStatusDropdown(false);
    };

    // Refresh data
    const handleRefresh = () => {
        fetchEmployees();
    };

    // Helper untuk menampilkan status di UI
    const getStatusDisplay = (statusValue: string) => {
        return statusValue === 'aktif' ? 'Aktif' : 'Nonaktif';
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.pageTitle}>Kelola Karyawan Dan Petugas</Text>
                            <Text style={styles.pageSubtitle}>Lorem Ipsum Dolor Sit Amet Consectetur</Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar & Add Button */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <Search color="#999" size={20} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari berdasarkan nama, email, atau nomor telepon..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#999"
                            />
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Text style={styles.addButtonText}>Tambahkan</Text>
                            <Text style={styles.addButtonIcon}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading & Error State */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Memuat data...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Error: {error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchEmployees}>
                                <Text style={styles.retryButtonText}>Coba Lagi</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Table */}
                    {!isLoading && !error && (
                        <ScrollView style={styles.tableContainer}>
                            <View style={styles.table}>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <View style={[styles.tableHeaderCell, { flex: 1.5 }]}>
                                        <Text style={styles.tableHeaderText}>Nama Lengkap</Text>
                                    </View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}>
                                        <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Role</Text>
                                    </View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}>
                                        <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>No. Telp</Text>
                                    </View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1.5 }]}>
                                        <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Email</Text>
                                    </View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.8 }]}>
                                        <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Status</Text>
                                    </View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.8 }]}>
                                        <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Aksi</Text>
                                    </View>
                                </View>

                                {/* Table Body */}
                                {filteredEmployees.map((employee, index) => (
                                    <View key={employee.id_petugas} style={styles.tableRow}>
                                        <View style={[styles.tableCell, { flex: 1.5, backgroundColor: '#F5EFE7', alignItems: 'flex-start' }]}>
                                            <Text style={styles.employeeName}>{employee.nama_petugas}</Text>
                                        </View>

                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                                            <Text style={styles.employeeRole}>{employee.role}</Text>
                                        </View>

                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                                            <Text style={styles.employeePhone}>{employee.no_telp}</Text>
                                        </View>

                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1.5, backgroundColor: '#F5EFE7' }]}>
                                            <Text style={styles.employeeEmail}>{employee.email}</Text>
                                        </View>

                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 0.8, backgroundColor: '#F5EFE7' }]}>
                                            <View style={[
                                                styles.statusBadge,
                                                employee.status === 'aktif' ? styles.statusActive : styles.statusInactive
                                            ]}>
                                                <Text style={styles.statusText}>
                                                    {getStatusDisplay(employee.status || 'aktif')}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 0.8, backgroundColor: '#F5EFE7' }]}>
                                            <View style={styles.actionButtons}>
                                                <TouchableOpacity
                                                    style={styles.editButton}
                                                    onPress={() => handleEdit(employee)}
                                                >
                                                    <Edit2 color={COLORS.white} size={16} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => handleDelete(employee)}
                                                >
                                                    <Trash2 color={COLORS.white} size={16} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* Edit/Add Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Header Modal */}
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <X color="#F59E0B" size={24} />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>{isAddMode ? 'Tambah Data Anggota' : 'Update Data Anggota'}</Text>
                                <View style={styles.modalDateContainer}>
                                    <Text style={styles.modalDateText}>{currentDate.full}</Text>
                                    <Text style={styles.modalTimeText}>{currentDate.time}</Text>
                                </View>
                            </View>

                            {/* Content Modal */}
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                <View style={styles.formContainer}>
                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Nama Lengkap *</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={nama_petugas}
                                                onChangeText={setNamaPetugas}
                                                placeholder="Eggy Johns"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Email *</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={email}
                                                onChangeText={setEmail}
                                                placeholder="Eggy10@gmail.com"
                                                placeholderTextColor="#999"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Tempat Lahir</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={tempat_lahir}
                                                onChangeText={setTempatLahir}
                                                placeholder="Jakarta"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Alamat</Text>
                                            <TextInput
                                                style={[styles.input, styles.textArea]}
                                                value={alamat}
                                                onChangeText={setAlamat}
                                                placeholder="Jl. Mawar III Jakarta Pusat"
                                                placeholderTextColor="#999"
                                                multiline
                                                numberOfLines={3}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Tanggal Lahir</Text>
                                            {/* Solusi terbaik untuk date input */}
                                            <View style={styles.dateInputWrapper}>
                                                <input
                                                    type="date"
                                                    value={formatDateForInput(tanggal_lahir)}
                                                    onChange={(e) => setTanggalLahir(e.target.value)}
                                                    style={styles.webDateInput}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>No. Telp *</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={no_telp}
                                                onChangeText={setNoTelp}
                                                placeholder="0172631291286821"
                                                placeholderTextColor="#999"
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Role</Text>
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowRoleDropdown(true)}
                                            >
                                                <Text style={styles.selectText}>{role}</Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Status</Text>
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowStatusDropdown(true)}
                                            >
                                                <Text style={styles.selectText}>
                                                    {getStatusDisplay(status)}
                                                </Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Footer Modal - Buttons */}
                            <View style={styles.modalFooter}>
                                {isAddMode ? (
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveButtonText}>Simpan</Text>
                                        <Check color={COLORS.white} size={18} />
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.updateButton}
                                            onPress={handleUpdate}
                                        >
                                            <Text style={styles.updateButtonText}>Update</Text>
                                            <Check color={COLORS.white} size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={handleClear}
                                        >
                                            <Text style={styles.clearButtonText}>Clear</Text>
                                            <X color={COLORS.white} size={18} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Custom Modal untuk Dropdown Role */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showRoleDropdown}
                    onRequestClose={() => setShowRoleDropdown(false)}
                >
                    <TouchableOpacity
                        style={styles.dropdownOverlay}
                        activeOpacity={1}
                        onPress={() => setShowRoleDropdown(false)}
                    >
                        <View style={styles.dropdownContent}>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectRole('Karyawan')}
                            >
                                <Text style={styles.dropdownText}>Karyawan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectRole('Petugas')}
                            >
                                <Text style={styles.dropdownText}>Petugas</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectRole('Admin')}
                            >
                                <Text style={styles.dropdownText}>Admin</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Custom Modal untuk Dropdown Status */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showStatusDropdown}
                    onRequestClose={() => setShowStatusDropdown(false)}
                >
                    <TouchableOpacity
                        style={styles.dropdownOverlay}
                        activeOpacity={1}
                        onPress={() => setShowStatusDropdown(false)}
                    >
                        <View style={styles.dropdownContent}>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectStatus('Aktif')}
                            >
                                <Text style={styles.dropdownText}>Aktif</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectStatus('Nonaktif')}
                            >
                                <Text style={styles.dropdownText}>Nonaktif</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={deleteModalVisible}
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.confirmOverlay}>
                        <View style={styles.confirmContent}>
                            <View style={styles.confirmIconContainer}>
                                <View style={styles.confirmIcon}>
                                    <Trash2 color="#EF4444" size={48} />
                                </View>
                            </View>
                            <Text style={styles.confirmTitle}>Anda Yakin Menghapus Anggota Ini?</Text>
                            <View style={styles.confirmButtons}>
                                <TouchableOpacity
                                    style={styles.confirmYesButton}
                                    onPress={() => handleConfirmDelete(true)}
                                >
                                    <Text style={styles.confirmButtonText}>YA</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmNoButton}
                                    onPress={() => handleConfirmDelete(false)}
                                >
                                    <Text style={styles.confirmButtonText}>Tidak</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.white,
    },
    mainContent: {
        flex: 1,
        padding: 30,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    pageTitle: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 32,
        color: '#F59E0B',
        marginBottom: 5,
        letterSpacing: 0.2,
    },
    pageSubtitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
    },
    dateTimeContainer: {
        alignItems: 'flex-end',
    },
    dateText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.primary,
    },
    timeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 18,
        color: COLORS.darkGray,
    },
    searchRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: COLORS.darkGray,
    },
    refreshButton: {
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#F59E0B',
        borderRadius: 8,
        alignItems: 'center',
    },
    refreshButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 12,
        color: COLORS.white,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB022',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    addButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.white,
    },
    addButtonIcon: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        color: COLORS.white,
    },
    // Loading & Error Styles
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: COLORS.primary,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        marginBottom: 20,
    },
    errorText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.white,
    },
    tableContainer: {
        flex: 1,
    },
    table: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#D4A574',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E8D5C4',
        borderBottomWidth: 2,
        borderBottomColor: '#D4A574',
    },
    tableHeaderCell: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    tableHeaderCellBorder: {
        borderLeftWidth: 2,
        borderLeftColor: '#D4A574',
    },
    tableHeaderText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.darkGray,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#D4A574',
    },
    tableCell: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCellBorder: {
        borderLeftWidth: 2,
        borderLeftColor: '#D4A574',
    },
    employeeName: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    employeeRole: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    employeePhone: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    employeeEmail: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusActive: {
        backgroundColor: '#DCFCE7',
    },
    statusInactive: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 12,
        color: COLORS.darkGray,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        backgroundColor: '#FDB022',
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FDB022',
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        width: '85%',
        maxWidth: 900,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 20,
        color: '#F59E0B',
        flex: 1,
        marginLeft: 15,
        textAlign: 'center',
    },
    modalDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    modalDateText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#F59E0B',
    },
    modalTimeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.darkGray,
    },
    modalBody: {
        padding: 30,
        maxHeight: 500,
    },
    formContainer: {
        gap: 20,
        width: '100%',
    },
    formRow: {
        flexDirection: 'row',
        gap: 20,
        width: '100%',
    },
    formGroup: {
        flex: 1,
        minWidth: 0, // Penting untuk mencegah overflow
    },
    label: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
        width: '100%',
    },
    // Solusi terbaik untuk date input
    dateInputWrapper: {
        width: '100%',
    },
    webDateInput: {
        width: '100%',
        padding: '12px 15px',
        border: '1.5px solid #F59E0B',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: 'Poppins, sans-serif',
        color: COLORS.darkGray,
        backgroundColor: COLORS.white,
        minHeight: '48px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    selectInput: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    selectText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    selectArrow: {
        fontSize: 12,
        color: '#F59E0B',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 10,
    },
    updateButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 10,
    },
    clearButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB022',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 10,
    },
    saveButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    // Styles untuk Custom Dropdown
    dropdownOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownContent: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        width: '80%',
        maxWidth: 300,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    dropdownItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    dropdownText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: COLORS.darkGray,
    },

    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmContent: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: '100%',
        maxWidth: 300,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmIconContainer: {
        marginBottom: 20,
    },
    confirmIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: '#F59E0B',
        textAlign: 'center',
        marginBottom: 25,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    confirmYesButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    confirmNoButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 13,
        color: COLORS.white,
    },
});