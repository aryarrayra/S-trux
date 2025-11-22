import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, Edit2, Trash2, X, Check, Calendar, Eye, EyeOff, Copy, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    status: string;
};

interface ApiResponse {
    success: boolean;
    data?: any[];
    message?: string;
}

const STORAGE_KEY = 'employees_data';

export default function KelolaKaryawan() {
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Form states
    const [nama_petugas, setNamaPetugas] = useState('');
    const [email, setEmail] = useState('');
    const [tempat_lahir, setTempatLahir] = useState('');
    const [alamat, setAlamat] = useState('');
    const [tanggal_lahir, setTanggalLahir] = useState('');
    const [no_telp, setNoTelp] = useState('');
    const [role, setRole] = useState('Karyawan');
    const [status, setStatus] = useState('aktif');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

        const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        const days = [];
        
        // Tambahkan hari kosong untuk minggu pertama
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        // Tambahkan hari dalam bulan
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const selectDate = (date: Date) => {
        setSelectedDate(date);
        setTanggalLahir(formatDateForDisplay(date));
        setShowCustomDatePicker(false);
    };

    const getMonthName = (date: Date) => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[date.getMonth()];
    };

    const getDayName = (dayIndex: number) => {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        return days[dayIndex];
    };


    const API_BASE = 'http://localhost:8000/api';

    const saveToStorage = async (data: Employee[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    };

    // Fungsi untuk generate password otomatis
    const generatePassword = (employeeCount: number): string => {
        const nextNumber = employeeCount + 1;
        return `petugas${String(nextNumber).padStart(4, '0')}`;
    };

const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(`${API_BASE}/petugas`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.data) {
            const transformedData: Employee[] = data.data.map((item: any) => ({
                id_petugas: item.id_petugas?.toString() || Math.random().toString(),
                nama_petugas: item.nama_petugas || 'Nama tidak tersedia',
                role: item.role || 'Karyawan',
                no_telp: item.no_telp || 'Tidak ada telepon',
                email: item.email || 'Email tidak tersedia',
                tempat_lahir: item.tempat_lahir || '',
                tanggal_lahir: item.tanggal_lahir || '',
                alamat: item.alamat || '',
                status: item.status === 'aktif' || item.status === 'nonaktif' ? item.status : 'aktif' // PERBAIKAN DI SINI
            }));
            setEmployees(transformedData);
            await saveToStorage(transformedData);
        } else {
            throw new Error(data.message || 'Gagal mengambil data petugas');
        }
    } catch (error) {
        console.error('Error fetching employees:', error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
        
        // Fallback ke data lokal jika API error
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setEmployees(JSON.parse(stored));
            } else {
                setEmployees(INITIAL_EMPLOYEES);
            }
        } catch (e) {
            setEmployees(INITIAL_EMPLOYEES);
        }
    } finally {
        setIsLoading(false);
    }
};

    useEffect(() => {
        const initData = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setEmployees(JSON.parse(stored));
                } else {
                    await fetchEmployees();
                    return;
                }
            } catch (e) {
                await fetchEmployees();
            } finally {
                setIsLoading(false);
            }
        };
        initData();
    }, []);

    const getCurrentDate = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();
        return {
            full: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
            time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        };
    };

    const currentDate = getCurrentDate();

    // Format date untuk display (DD/MM/YYYY)
    const formatDateForDisplay = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format date untuk database (YYYY-MM-DD)
    const formatDateForDB = (dateString: string): string => {
        if (!dateString) return '';
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
        
        // Convert dari DD/MM/YYYY ke YYYY-MM-DD
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    // Convert dari YYYY-MM-DD ke Date object
    const parseDateFromDB = (dateString: string): Date => {
        if (!dateString) return new Date();
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const parts = dateString.split('-');
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return new Date();
    };

    const getStatusDisplay = (statusValue: string) => {
        return statusValue === 'aktif' ? 'Aktif' : 'Nonaktif';
    };

    const getStatusColor = (statusValue: string) => {
        return statusValue === 'aktif' ? styles.statusActive : styles.statusInactive;
    };

    const filteredEmployees = employees.filter(emp =>
        emp.nama_petugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.no_telp.includes(searchQuery)
    );

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsAddMode(false);
        setNamaPetugas(employee.nama_petugas);
        setEmail(employee.email);
        setTempatLahir(employee.tempat_lahir || '');
        setAlamat(employee.alamat || '');
        
        // Set tanggal lahir dan selectedDate
        if (employee.tanggal_lahir) {
            const date = parseDateFromDB(employee.tanggal_lahir);
            setSelectedDate(date);
            setTanggalLahir(formatDateForDisplay(date));
        } else {
            setSelectedDate(new Date());
            setTanggalLahir('');
        }
        
        setNoTelp(employee.no_telp);
        setRole(employee.role || 'Karyawan');
        setStatus(employee.status || 'aktif');
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsAddMode(true);
        resetForm();
        
        // Generate password otomatis saat mode tambah
        const newPassword = generatePassword(employees.length);
        setGeneratedPassword(newPassword);
        
        setModalVisible(true);
    };

    const resetForm = () => {
        setNamaPetugas('');
        setEmail('');
        setTempatLahir('');
        setAlamat('');
        setSelectedDate(new Date());
        setTanggalLahir('');
        setNoTelp('');
        setRole('Karyawan');
        setStatus('aktif');
        setGeneratedPassword('');
        setShowGeneratedPassword(false);
    };

    const handleDelete = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async (confirmed: boolean) => {
        if (confirmed && selectedEmployee) {
            try {
                const response = await fetch(`${API_BASE}/petugas/${selectedEmployee.id_petugas}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    const updated = employees.filter(emp => emp.id_petugas !== selectedEmployee.id_petugas);
                    setEmployees(updated);
                    await saveToStorage(updated);
                    Alert.alert('Sukses', 'Data berhasil dihapus');
                } else {
                    throw new Error('Gagal menghapus data');
                }
            } catch (error) {
                Alert.alert('Error', 'Gagal menghapus data dari server');
            }
        }
        setDeleteModalVisible(false);
        setSelectedEmployee(null);
    };

    const validateForm = (): boolean => {
        if (!nama_petugas.trim()) { Alert.alert('Error', 'Nama lengkap harus diisi!'); return false; }
        if (!email.trim()) { Alert.alert('Error', 'Email harus diisi!'); return false; }
        if (!no_telp.trim()) { Alert.alert('Error', 'Nomor telepon harus diisi!'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert('Error', 'Format email tidak valid!'); return false; }
        return true;
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (date) {
            setSelectedDate(date);
            setTanggalLahir(formatDateForDisplay(date));
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;
        if (!selectedEmployee) return;

        try {
            const updateData = {
                nama_petugas,
                email,
                tempat_lahir,
                alamat,
                tanggal_lahir: formatDateForDB(tanggal_lahir),
                no_telp,
                role,
                status,
            };

            const response = await fetch(`${API_BASE}/petugas/${selectedEmployee.id_petugas}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            const updated = employees.map(emp =>
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
                        status
                    }
                    : emp
            );
            setEmployees(updated);
            await saveToStorage(updated);
            Alert.alert('Sukses', 'Data berhasil diupdate');
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Gagal mengupdate data');
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const newData = {
                nama_petugas,
                email,
                tempat_lahir,
                alamat,
                tanggal_lahir: formatDateForDB(tanggal_lahir),
                no_telp,
                role,
                status,
                password: generatedPassword // Kirim password yang digenerate
            };

            const response = await fetch(`${API_BASE}/petugas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const newEmployee: Employee = {
                id_petugas: result.data?.id_petugas || String(employees.length + 1),
                nama_petugas,
                email,
                tempat_lahir,
                alamat,
                tanggal_lahir: formatDateForDB(tanggal_lahir),
                no_telp,
                role,
                status: status || 'aktif',
            };
            
            const updated = [...employees, newEmployee];
            setEmployees(updated);
            await saveToStorage(updated);
            
            // Tampilkan modal password setelah berhasil create
            setModalVisible(false);
            setPasswordModalVisible(true);
            
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Gagal menambahkan data');
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedPassword);
            Alert.alert('Berhasil', 'Password telah disalin ke clipboard');
        } catch (error) {
            console.error('Failed to copy password:', error);
        }
    };

    const selectRole = (selectedRole: string) => { setRole(selectedRole); setShowRoleDropdown(false); };
    const selectStatus = (selectedStatus: string) => { setStatus(selectedStatus === 'Aktif' ? 'aktif' : 'nonaktif'); setShowStatusDropdown(false); };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />
                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.pageTitle}>Kelola Karyawan Dan Petugas</Text>
                            <Text style={styles.pageSubtitle}>Halaman untuk kelola petugas</Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={fetchEmployees}>
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <Search color="#999" size={20} />
                            <TextInput style={styles.searchInput} placeholder="Cari..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#999" />
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Text style={styles.addButtonText}>Tambahkan</Text>
                            <Text style={styles.addButtonIcon}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading && <View style={styles.loadingContainer}><Text style={styles.loadingText}>Memuat data...</Text></View>}
                    {error && <View style={styles.errorContainer}><Text style={styles.errorText}>Error: {error}</Text></View>}

                    {!isLoading && !error && employees.length > 0 && (
                        <ScrollView style={styles.tableContainer}>
                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <View style={[styles.tableHeaderCell, { flex: 1.5 }]}><Text style={styles.tableHeaderText}>Nama Lengkap</Text></View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Role</Text></View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>No. Telp</Text></View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1.5 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Email</Text></View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.8 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Status</Text></View>
                                    <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.8 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Aksi</Text></View>
                                </View>
                                {filteredEmployees.map((emp) => (
                                    <View key={emp.id_petugas} style={styles.tableRow}>
                                        <View style={[styles.tableCell, { flex: 1.5, alignItems: 'flex-start' }]}><Text style={styles.employeeName}>{emp.nama_petugas}</Text></View>
                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1 }]}><Text style={styles.employeeRole}>{emp.role}</Text></View>
                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1 }]}><Text style={styles.employeePhone}>{emp.no_telp}</Text></View>
                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1.5 }]}><Text style={styles.employeeEmail}>{emp.email}</Text></View>
                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 0.8 }]}>
                                            <View style={[styles.statusBadge, getStatusColor(emp.status)]}>
                                                <Text style={styles.statusText}>{getStatusDisplay(emp.status)}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.tableCell, styles.tableCellBorder, { flex: 0.8 }]}>
                                            <View style={styles.actionButtons}>
                                                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(emp)}><Edit2 color="#FFF" size={16} /></TouchableOpacity>
                                                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(emp)}><Trash2 color="#FFF" size={16} /></TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* EDIT/ADD MODAL */}
                <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}><X color="#F59E0B" size={24} /></TouchableOpacity>
                                <Text style={styles.modalTitle}>{isAddMode ? 'Tambah Data Anggota' : 'Update Data Anggota'}</Text>
                                <View style={styles.modalDateContainer}>
                                    <Text style={styles.modalDateText}>{currentDate.full}</Text>
                                    <Text style={styles.modalTimeText}>{currentDate.time}</Text>
                                </View>
                            </View>

                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                <View style={styles.formContainer}>
                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Nama Lengkap *</Text>
                                            <TextInput style={styles.input} value={nama_petugas} onChangeText={setNamaPetugas} placeholder="Nama" placeholderTextColor="#999" />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Email *</Text>
                                            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@gmail.com" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Tempat Lahir</Text>
                                            <TextInput style={styles.input} value={tempat_lahir} onChangeText={setTempatLahir} placeholder="Jakarta" placeholderTextColor="#999" />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Alamat</Text>
                                            <TextInput style={[styles.input, styles.textArea]} value={alamat} onChangeText={setAlamat} placeholder="Alamat lengkap" placeholderTextColor="#999" multiline numberOfLines={3} />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Tanggal Lahir</Text>
                                            <TouchableOpacity 
                                                style={styles.dateInputContainer} 
                                                onPress={() => setShowCustomDatePicker(true)}
                                            >
                                                <TextInput 
                                                    style={styles.dateInput}
                                                    value={tanggal_lahir}
                                                    placeholder="Pilih tanggal lahir"
                                                    placeholderTextColor="#999"
                                                    editable={false}
                                                />
                                                <Calendar color="#F59E0B" size={20} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>No. Telp *</Text>
                                            <TextInput style={styles.input} value={no_telp} onChangeText={setNoTelp} placeholder="08123456789" placeholderTextColor="#999" keyboardType="phone-pad" />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Role</Text>
                                            <TouchableOpacity style={styles.selectInput} onPress={() => setShowRoleDropdown(true)}>
                                                <Text style={styles.selectText}>{role}</Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Status</Text>
                                            <TouchableOpacity style={styles.selectInput} onPress={() => setShowStatusDropdown(true)}>
                                                <Text style={styles.selectText}>{getStatusDisplay(status)}</Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Info Password untuk mode tambah */}
                                    {isAddMode && (
                                        <View style={styles.passwordInfoContainer}>
                                            <Text style={styles.passwordInfoText}>
                                                Password akan digenerate otomatis: <Text style={styles.passwordText}>{generatedPassword}</Text>
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                {isAddMode ? (
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
                                        <Text style={styles.saveButtonText}>Simpan</Text>
                                        <Check color="#FFF" size={18} />
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.7}>
                                            <Text style={styles.updateButtonText}>Update</Text>
                                            <Check color="#FFF" size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.clearButton} onPress={resetForm} activeOpacity={0.7}>
                                            <Text style={styles.clearButtonText}>Clear</Text>
                                            <X color="#FFF" size={18} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {/* Modal Tampilkan Password Setelah Create */}
                <Modal animationType="fade" transparent={true} visible={passwordModalVisible} onRequestClose={() => setPasswordModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.passwordModalContent}>
                            <View style={styles.passwordModalHeader}>
                                <Text style={styles.passwordModalTitle}>Data Petugas Berhasil Dibuat!</Text>
                                <Text style={styles.passwordModalSubtitle}>Simpan password berikut untuk login:</Text>
                            </View>
                            
                            <View style={styles.passwordDisplayContainer}>
                                <Text style={styles.passwordLabel}>Password:</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordDisplay}
                                        value={generatedPassword}
                                        editable={false}
                                        secureTextEntry={!showGeneratedPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowGeneratedPassword(!showGeneratedPassword)}
                                    >
                                        {showGeneratedPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.copyButton}
                                        onPress={copyToClipboard}
                                    >
                                        <Copy size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.passwordWarning}>
                                    ⚠️ Password ini tidak dapat dilihat lagi. Pastikan untuk menyimpannya dengan aman.
                                </Text>
                            </View>

                            <View style={styles.passwordModalFooter}>
                                <TouchableOpacity
                                    style={styles.okButton}
                                    onPress={() => {
                                        setPasswordModalVisible(false);
                                        resetForm();
                                    }}
                                >
                                    <Text style={styles.okButtonText}>OK, Saya Sudah Mencatat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Role Dropdown */}
                <Modal animationType="fade" transparent={true} visible={showRoleDropdown} onRequestClose={() => setShowRoleDropdown(false)}>
                    <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowRoleDropdown(false)}>
                        <View style={styles.dropdownContent}>
                            {['Karyawan', 'Petugas', 'Admin'].map(r => (
                                <TouchableOpacity key={r} style={styles.dropdownItem} onPress={() => selectRole(r)}>
                                    <Text style={styles.dropdownText}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Status Dropdown */}
                <Modal animationType="fade" transparent={true} visible={showStatusDropdown} onRequestClose={() => setShowStatusDropdown(false)}>
                    <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowStatusDropdown(false)}>
                        <View style={styles.dropdownContent}>
                            {['Aktif', 'Nonaktif'].map(s => (
                                <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => selectStatus(s)}>
                                    <Text style={styles.dropdownText}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showCustomDatePicker}
                    onRequestClose={() => setShowCustomDatePicker(false)}
                >
                    <View style={styles.datePickerOverlay}>
                        <View style={styles.datePickerContainer}>
                            <View style={styles.datePickerHeader}>
                                <TouchableOpacity onPress={() => setShowCustomDatePicker(false)}>
                                    <X color="#F59E0B" size={24} />
                                </TouchableOpacity>
                                <Text style={styles.datePickerTitle}>Pilih Tanggal Lahir</Text>
                                <View style={styles.monthNavigator}>
                                    <TouchableOpacity onPress={() => navigateMonth('prev')}>
                                        <ChevronLeft color="#F59E0B" size={24} />
                                    </TouchableOpacity>
                                    <Text style={styles.monthText}>
                                        {getMonthName(currentMonth)} {currentMonth.getFullYear()}
                                    </Text>
                                    <TouchableOpacity onPress={() => navigateMonth('next')}>
                                        <ChevronRight color="#F59E0B" size={24} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.calendarContainer}>
                                <View style={styles.weekDays}>
                                    {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                                        <Text key={dayIndex} style={styles.weekDayText}>
                                            {getDayName(dayIndex)}
                                        </Text>
                                    ))}
                                </View>

                                <View style={styles.calendarGrid}>
                                    {getDaysInMonth(currentMonth).map((date, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.calendarDay,
                                                !date && styles.calendarDayEmpty,
                                                date && date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelected
                                            ]}
                                            onPress={() => date && selectDate(date)}
                                            disabled={!date}
                                        >
                                            <Text style={[
                                                styles.calendarDayText,
                                                date && date.toDateString() === selectedDate.toDateString() && styles.calendarDayTextSelected,
                                                date && date.getDay() === 0 && styles.calendarDaySunday
                                            ]}>
                                                {date ? date.getDate() : ''}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.datePickerFooter}>
                                <Text style={styles.selectedDateText}>
                                    Tanggal terpilih: {formatDateForDisplay(selectedDate)}
                                </Text>
                                <TouchableOpacity 
                                    style={styles.confirmDateButton}
                                    onPress={() => setShowCustomDatePicker(false)}
                                >
                                    <Text style={styles.confirmDateButtonText}>Konfirmasi</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Delete Modal */}
                <Modal animationType="fade" transparent={true} visible={deleteModalVisible} onRequestClose={() => setDeleteModalVisible(false)}>
                    <View style={styles.confirmOverlay}>
                        <View style={styles.confirmContent}>
                            <View style={styles.confirmIcon}><Trash2 color="#EF4444" size={48} /></View>
                            <Text style={styles.confirmTitle}>Anda Yakin Menghapus Anggota Ini?</Text>
                            <View style={styles.confirmButtons}>
                                <TouchableOpacity style={styles.confirmYesButton} onPress={() => handleConfirmDelete(true)}>
                                    <Text style={styles.confirmButtonText}>YA</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.confirmNoButton} onPress={() => handleConfirmDelete(false)}>
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
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF' },
    mainContent: { flex: 1, padding: 30, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
    pageTitle: { fontSize: 32, color: '#F59E0B', marginBottom: 5 },
    pageSubtitle: { fontSize: 14, color: '#666' },
    dateTimeContainer: { alignItems: 'flex-end' },
    dateText: { fontSize: 14, color: '#F59E0B' },
    timeText: { fontSize: 18, color: '#333' },
    refreshButton: { marginTop: 10, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#F59E0B', borderRadius: 8 },
    refreshButtonText: { fontSize: 12, color: '#FFF' },
    searchRow: { flexDirection: 'row', marginBottom: 20, gap: 15 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDB022', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, gap: 8 },
    addButtonText: { fontSize: 14, color: '#FFF' },
    addButtonIcon: { fontSize: 20, color: '#FFF' },
    loadingContainer: { padding: 20, alignItems: 'center' },
    loadingText: { fontSize: 16, color: '#F59E0B' },
    errorContainer: { padding: 20, alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 10, marginBottom: 20 },
    errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
    tableContainer: { flex: 1 },
    table: { backgroundColor: '#FFF', borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#D4A574' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#E8D5C4', borderBottomWidth: 2, borderBottomColor: '#D4A574' },
    tableHeaderCell: { paddingVertical: 15, paddingHorizontal: 20, justifyContent: 'center' },
    tableHeaderCellBorder: { borderLeftWidth: 2, borderLeftColor: '#D4A574' },
    tableHeaderText: { fontSize: 14, color: '#333', fontWeight: '600' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#D4A574' },
    tableCell: { paddingVertical: 15, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5EFE7' },
    tableCellBorder: { borderLeftWidth: 2, borderLeftColor: '#D4A574' },
    employeeName: { fontSize: 13, color: '#333', fontWeight: '500' },
    employeeRole: { fontSize: 13, color: '#333' },
    employeePhone: { fontSize: 13, color: '#333' },
    employeeEmail: { fontSize: 13, color: '#333' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusActive: { backgroundColor: '#DCFCE7' },
    statusInactive: { backgroundColor: '#FEE2E2' },
    statusText: { fontSize: 12, color: '#333', fontWeight: '500' },
    actionButtons: { flexDirection: 'row', gap: 8 },
    editButton: { backgroundColor: '#FDB022', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    deleteButton: { backgroundColor: '#FDB022', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', borderRadius: 10, width: '85%', maxWidth: 900, maxHeight: '90%' },
    passwordModalContent: { backgroundColor: '#FFF', borderRadius: 10, width: '85%', maxWidth: 500, padding: 0 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
    passwordModalHeader: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#E5E5E5', alignItems: 'center' },
    passwordModalTitle: { fontSize: 20, color: '#10B981', fontWeight: '600', marginBottom: 8 },
    passwordModalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
    modalTitle: { fontSize: 20, color: '#F59E0B', flex: 1, marginLeft: 15, textAlign: 'center', fontWeight: '500' },
    modalDateContainer: { flexDirection: 'column', alignItems: 'flex-end' },
    modalDateText: { fontSize: 12, color: '#F59E0B' },
    modalTimeText: { fontSize: 14, color: '#333', fontWeight: '500' },
    modalBody: { padding: 30, maxHeight: 400 },
    formContainer: { gap: 20, width: '100%' },
    formRow: { flexDirection: 'row', gap: 20, width: '100%' },
    formGroup: { flex: 1, minWidth: 0 },
    label: { fontSize: 13, color: '#333', marginBottom: 8, fontWeight: '500' },
    input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 13, color: '#333', width: '100%' },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    dateInput: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        padding: 0,
        margin: 0,
    },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    selectInput: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    selectText: { fontSize: 13, color: '#333' },
    selectArrow: { fontSize: 12, color: '#F59E0B' },
    passwordInfoContainer: { backgroundColor: '#F0F9FF', padding: 15, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#0EA5E9' },
    passwordInfoText: { fontSize: 13, color: '#0369A1', textAlign: 'center' },
    passwordText: { fontWeight: '600', color: '#0C4A6E' },
    modalFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, gap: 15, borderTopWidth: 1, borderTopColor: '#E5E5E5', backgroundColor: '#FFF' },
    passwordDisplayContainer: { padding: 25 },
    passwordLabel: { fontSize: 16, color: '#333', marginBottom: 10, fontWeight: '500' },
    passwordInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    passwordDisplay: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#1E293B', fontWeight: '500' },
    eyeButton: { padding: 10, marginLeft: 10 },
    copyButton: { backgroundColor: '#3B82F6', padding: 10, borderRadius: 8, marginLeft: 10 },
    passwordWarning: { fontSize: 12, color: '#EF4444', textAlign: 'center', fontStyle: 'italic' },
    passwordModalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
    okButton: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    okButtonText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
    updateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 35, paddingVertical: 12, borderRadius: 25, gap: 10 },
    updateButtonText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
    clearButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 35, paddingVertical: 12, borderRadius: 25, gap: 10 },
    clearButtonText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
    saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDB022', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25, gap: 10 },
    saveButtonText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
    dropdownOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    dropdownContent: { backgroundColor: '#FFF', borderRadius: 8, width: '80%', maxWidth: 300, elevation: 5 },
    dropdownItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
    dropdownText: { fontSize: 16, color: '#333' },
    confirmOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    confirmContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 300, padding: 30, alignItems: 'center' },
    confirmIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    confirmTitle: { fontSize: 14, color: '#F59E0B', textAlign: 'center', marginBottom: 25, fontWeight: '600' },
    confirmButtons: { flexDirection: 'row', gap: 12 },
    confirmYesButton: { backgroundColor: '#FDB022', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, minWidth: 80, alignItems: 'center' },
    confirmNoButton: { backgroundColor: '#FDB022', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, minWidth: 80, alignItems: 'center' },
    confirmButtonText: { fontSize: 13, color: '#FFF', fontWeight: '600' },

    // ========== STYLES UNTUK CUSTOM DATE PICKER ==========
    datePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    datePickerContainer: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    datePickerHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        alignItems: 'center',
        backgroundColor: '#FEF7E5',
    },
    datePickerTitle: {
        fontSize: 18,
        color: '#F59E0B',
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 15,
    },
    monthNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    monthText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    calendarContainer: {
        padding: 15,
        backgroundColor: '#FFF',
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    weekDayText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        width: 40,
        height: 30,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingHorizontal: 5,
    },
    calendarDay: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
    },
    calendarDayEmpty: {
        backgroundColor: 'transparent',
    },
    calendarDaySelected: {
        backgroundColor: '#F59E0B',
    },
    calendarDayText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    calendarDayTextSelected: {
        color: '#FFF',
        fontWeight: '600',
    },
    calendarDaySunday: {
        color: '#EF4444',
    },
    datePickerFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        alignItems: 'center',
        backgroundColor: '#FEF7E5',
    },
    selectedDateText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    confirmDateButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 150,
        alignItems: 'center',
    },
    confirmDateButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});