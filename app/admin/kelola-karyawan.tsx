import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Search, Edit2, Trash2, X, Check, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Mock data
const INITIAL_EMPLOYEES = [
    {
        id: '1',
        namaLengkap: 'Argara Bhumi Tara',
        role: 'Karyawan',
        noTelp: '0823487322123',
        email: '@Argar2187@gmail.com',
    },
    {
        id: '2',
        namaLengkap: 'Budi Santoso',
        role: 'Karyawan',
        noTelp: '0812345678901',
        email: 'budi.santoso@gmail.com',
    },
    {
        id: '3',
        namaLengkap: 'Citra Dewi',
        role: 'Petugas',
        noTelp: '0856789012345',
        email: 'citra.dewi@gmail.com',
    },
    {
        id: '4',
        namaLengkap: 'Dimas Prasetyo',
        role: 'Karyawan',
        noTelp: '0898765432109',
        email: 'dimas.prasetyo@gmail.com',
    },
    {
        id: '5',
        namaLengkap: 'Eka Putri',
        role: 'Petugas',
        noTelp: '0821234567890',
        email: 'eka.putri@gmail.com',
    },
];

type Employee = {
    id: string;
    namaLengkap: string;
    role: string;
    noTelp: string;
    email: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    alamat?: string;
};

export default function KelolaKaryawan() {
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form states
    const [namaLengkap, setNamaLengkap] = useState('');
    const [email, setEmail] = useState('');
    const [tempatLahir, setTempatLahir] = useState('');
    const [alamat, setAlamat] = useState('');
    const [tanggalLahir, setTanggalLahir] = useState('');
    const [date, setDate] = useState(new Date());
    const [noTelp, setNoTelp] = useState('');
    const [role, setRole] = useState('Karyawan');

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

    // Format date ke DD/MM/YYYY
    const formatDate = (dateObj: Date) => {
        return dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Update tanggalLahir string saat date berubah
    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setTanggalLahir(formatDate(currentDate));
    };

    const filteredEmployees = employees.filter(employee =>
        employee.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.noTelp.includes(searchQuery)
    );

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsAddMode(false);
        setNamaLengkap(employee.namaLengkap);
        setEmail(employee.email);
        setTempatLahir(employee.tempatLahir || '');
        setAlamat(employee.alamat || '');
        const parsedDate = employee.tanggalLahir ? new Date(employee.tanggalLahir.split('/').reverse().join('-')) : new Date();
        setDate(parsedDate);
        setTanggalLahir(employee.tanggalLahir || '');
        setNoTelp(employee.noTelp);
        setRole(employee.role || 'Karyawan');
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setNamaLengkap('');
        setEmail('');
        setTempatLahir('');
        setAlamat('');
        const defaultDate = new Date();
        setDate(defaultDate);
        setTanggalLahir('');
        setNoTelp('');
        setRole('Karyawan');
    };

    const handleDelete = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = (confirmed: boolean) => {
        if (confirmed && selectedEmployee) {
            setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
            console.log('Karyawan dihapus:', selectedEmployee.id);
        }
        setDeleteModalVisible(false);
        setSelectedEmployee(null);
    };

    const validateForm = (): boolean => {
        if (!namaLengkap.trim() || !email.trim() || !tempatLahir.trim() || !alamat.trim() || !tanggalLahir.trim() || !noTelp.trim() || !role.trim()) {
            Alert.alert('Error', 'Semua field harus diisi!');
            return false;
        }
        return true;
    };

    const handleUpdate = () => {
        if (!validateForm()) return;
        if (selectedEmployee) {
            setEmployees(prev => prev.map(emp =>
                emp.id === selectedEmployee.id
                    ? {
                        ...emp,
                        namaLengkap,
                        email,
                        tempatLahir,
                        alamat,
                        tanggalLahir,
                        noTelp,
                        role,
                    }
                    : emp
            ));
            console.log('Data diupdate:', selectedEmployee.id);
        }
        setModalVisible(false);
    };

    const handleSave = () => {
        if (!validateForm()) return;
        const newEmployee: Employee = {
            id: String(employees.length + 1),
            namaLengkap,
            email,
            tempatLahir,
            alamat,
            tanggalLahir,
            noTelp,
            role,
        };
        setEmployees(prev => [...prev, newEmployee]);
        console.log('Data baru ditambahkan:', newEmployee);
        setModalVisible(false);
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

                    {/* Table */}
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
                                    <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Aksi</Text>
                                </View>
                            </View>

                            {/* Table Body */}
                            {filteredEmployees.map((employee, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={[styles.tableCell, { flex: 1.5, backgroundColor: '#F5EFE7', alignItems: 'flex-start' }]}>
                                        <Text style={styles.employeeName}>{employee.namaLengkap}</Text>
                                    </View>

                                    <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                                        <Text style={styles.employeeRole}>{employee.role}</Text>
                                    </View>

                                    <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                                        <Text style={styles.employeePhone}>{employee.noTelp}</Text>
                                    </View>

                                    <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1.5, backgroundColor: '#F5EFE7' }]}>
                                        <Text style={styles.employeeEmail}>{employee.email}</Text>
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
                                            <Text style={styles.label}>Nama Lengkap</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={namaLengkap}
                                                onChangeText={setNamaLengkap}
                                                placeholder="Eggy Johns"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Email</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={email}
                                                onChangeText={setEmail}
                                                placeholder="Eggy10@gmail.com"
                                                placeholderTextColor="#999"
                                                keyboardType="email-address"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Tempat Lahir</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={tempatLahir}
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
                                            {/* Manual Input with Optional Picker */}
                                            <View style={styles.dateInputContainer}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1, paddingRight: 10 }]}
                                                    value={tanggalLahir}
                                                    onChangeText={setTanggalLahir}
                                                    placeholder="17/10/1999"
                                                    placeholderTextColor="#999"
                                                    keyboardType="numeric"
                                                />
                                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                                    <Calendar color="#F59E0B" size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Role</Text>
                                            {/* Custom Dropdown untuk Role */}
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowRoleDropdown(true)}
                                            >
                                                <Text style={styles.selectText}>{role}</Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>No. Telp</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={noTelp}
                                                onChangeText={setNoTelp}
                                                placeholder="0172631291286821"
                                                placeholderTextColor="#999"
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                        <View style={styles.formGroup} />
                                    </View>
                                </View>
                            </ScrollView>

                            {/* DateTimePicker */}
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                            )}

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
                            </View>
                        </TouchableOpacity>
                    </Modal>
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
    },
    formRow: {
        flexDirection: 'row',
        gap: 20,
    },
    formGroup: {
        flex: 1,
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
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
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
    // Styles baru untuk Custom Dropdown
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