import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Search, Edit2, Trash2, X, Check, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Mock data
const INITIAL_TRANSACTIONS = [
    {
        id: '1',
        tanggal: '15/10/2024',
        kategori: 'Pemasukan',
        keterangan: 'Penjualan produk',
        jumlah: 'Rp 5.000.000',
    },
    {
        id: '2',
        tanggal: '16/10/2024',
        kategori: 'Pengeluaran',
        keterangan: 'Pembelian bahan baku',
        jumlah: 'Rp 2.500.000',
    },
    {
        id: '3',
        tanggal: '17/10/2024',
        kategori: 'Pemasukan',
        keterangan: 'Penjualan jasa',
        jumlah: 'Rp 3.000.000',
    },
    {
        id: '4',
        tanggal: '18/10/2024',
        kategori: 'Pengeluaran',
        keterangan: 'Gaji karyawan',
        jumlah: 'Rp 4.000.000',
    },
    {
        id: '5',
        tanggal: '19/10/2024',
        kategori: 'Pemasukan',
        keterangan: 'Penjualan produk',
        jumlah: 'Rp 6.500.000',
    },
];

type Transaction = {
    id: string;
    tanggal: string;
    kategori: string;
    keterangan: string;
    jumlah: string;
    deskripsi?: string;
};

export default function LaporanKeuangan() {
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form states
    const [tanggal, setTanggal] = useState('');
    const [date, setDate] = useState(new Date());
    const [kategori, setKategori] = useState('Pemasukan');
    const [keterangan, setKeterangan] = useState('');
    const [jumlah, setJumlah] = useState('');
    const [deskripsi, setDeskripsi] = useState('');

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

    // Update tanggal string saat date berubah
    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setTanggal(formatDate(currentDate));
    };

    const filteredTransactions = transactions.filter(transaction =>
        transaction.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.tanggal.includes(searchQuery)
    );

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsAddMode(false);
        setTanggal(transaction.tanggal);
        setKategori(transaction.kategori);
        setKeterangan(transaction.keterangan);
        setJumlah(transaction.jumlah);
        setDeskripsi(transaction.deskripsi || '');
        const parsedDate = transaction.tanggal ? new Date(transaction.tanggal.split('/').reverse().join('-')) : new Date();
        setDate(parsedDate);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedTransaction(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setTanggal('');
        setKategori('Pemasukan');
        setKeterangan('');
        setJumlah('');
        setDeskripsi('');
        const defaultDate = new Date();
        setDate(defaultDate);
    };

    const handleDelete = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = (confirmed: boolean) => {
        if (confirmed && selectedTransaction) {
            setTransactions(prev => prev.filter(trans => trans.id !== selectedTransaction.id));
            console.log('Transaksi dihapus:', selectedTransaction.id);
        }
        setDeleteModalVisible(false);
        setSelectedTransaction(null);
    };

    const validateForm = (): boolean => {
        if (!tanggal.trim() || !kategori.trim() || !keterangan.trim() || !jumlah.trim()) {
            Alert.alert('Error', 'Semua field harus diisi!');
            return false;
        }
        return true;
    };

    const handleUpdate = () => {
        if (!validateForm()) return;
        if (selectedTransaction) {
            setTransactions(prev => prev.map(trans =>
                trans.id === selectedTransaction.id
                    ? {
                        ...trans,
                        tanggal,
                        kategori,
                        keterangan,
                        jumlah,
                        deskripsi,
                    }
                    : trans
            ));
            console.log('Data diupdate:', selectedTransaction.id);
        }
        setModalVisible(false);
    };

    const handleSave = () => {
        if (!validateForm()) return;
        const newTransaction: Transaction = {
            id: String(transactions.length + 1),
            tanggal,
            kategori,
            keterangan,
            jumlah,
            deskripsi,
        };
        setTransactions(prev => [...prev, newTransaction]);
        console.log('Data baru ditambahkan:', newTransaction);
        setModalVisible(false);
    };

    const handleClear = () => {
        resetForm();
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    // Handler untuk pilih kategori dari dropdown
    const selectKategori = (selectedKategori: string) => {
        setKategori(selectedKategori);
        setShowKategoriDropdown(false);
    };

    return (
        <View style={styles.container}>
            <SideBar />

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.pageTitle}>Laporan Keuangan</Text>
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
                            placeholder="Cari berdasarkan keterangan, kategori, atau tanggal..."
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
                            <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                                <Text style={styles.tableHeaderText}>Tanggal</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}>
                                <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Kategori</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1.5 }]}>
                                <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Keterangan</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}>
                                <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Jumlah</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.8 }]}>
                                <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Aksi</Text>
                            </View>
                        </View>

                        {/* Table Body */}
                        {filteredTransactions.map((transaction, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={[styles.tableCell, { flex: 1, backgroundColor: '#F5EFE7', alignItems: 'flex-start' }]}>
                                    <Text style={styles.transactionDate}>{transaction.tanggal}</Text>
                                </View>

                                <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                                    <Text style={styles.transactionKategori}>{transaction.kategori}</Text>
                                </View>

                                <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1.5, backgroundColor: '#F5EFE7' }]}>
                                    <Text style={styles.transactionKeterangan}>{transaction.keterangan}</Text>
                                </View>

                                <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                                    <Text style={styles.transactionJumlah}>{transaction.jumlah}</Text>
                                </View>

                                <View style={[styles.tableCell, styles.tableCellBorder, { flex: 0.8, backgroundColor: '#F5EFE7' }]}>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => handleEdit(transaction)}
                                        >
                                            <Edit2 color={COLORS.white} size={16} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDelete(transaction)}
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
                            <Text style={styles.modalTitle}>{isAddMode ? 'Tambah Laporan Keuangan' : 'Update Laporan Keuangan'}</Text>
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
                                        <Text style={styles.label}>Tanggal</Text>
                                        {/* Manual Input with Optional Picker */}
                                        <View style={styles.dateInputContainer}>
                                            <TextInput
                                                style={[styles.input, { flex: 1, paddingRight: 10 }]}
                                                value={tanggal}
                                                onChangeText={setTanggal}
                                                placeholder="17/10/2024"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                            />
                                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                                <Calendar color="#F59E0B" size={20} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Kategori</Text>
                                        {/* Custom Dropdown untuk Kategori */}
                                        <TouchableOpacity
                                            style={styles.selectInput}
                                            onPress={() => setShowKategoriDropdown(true)}
                                        >
                                            <Text style={styles.selectText}>{kategori}</Text>
                                            <Text style={styles.selectArrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Keterangan</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={keterangan}
                                            onChangeText={setKeterangan}
                                            placeholder="Penjualan produk"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Jumlah</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={jumlah}
                                            onChangeText={setJumlah}
                                            placeholder="Rp 5.000.000"
                                            placeholderTextColor="#999"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Deskripsi (Opsional)</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            value={deskripsi}
                                            onChangeText={setDeskripsi}
                                            placeholder="Tambahkan deskripsi tambahan..."
                                            placeholderTextColor="#999"
                                            multiline
                                            numberOfLines={3}
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

                {/* Custom Modal untuk Dropdown Kategori */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showKategoriDropdown}
                    onRequestClose={() => setShowKategoriDropdown(false)}
                >
                    <TouchableOpacity
                        style={styles.dropdownOverlay}
                        activeOpacity={1}
                        onPress={() => setShowKategoriDropdown(false)}
                    >
                        <View style={styles.dropdownContent}>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectKategori('Pemasukan')}
                            >
                                <Text style={styles.dropdownText}>Pemasukan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => selectKategori('Pengeluaran')}
                            >
                                <Text style={styles.dropdownText}>Pengeluaran</Text>
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
                        <Text style={styles.confirmTitle}>Anda Yakin Menghapus Transaksi Ini?</Text>
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
    transactionDate: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    transactionKategori: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    transactionKeterangan: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.darkGray,
    },
    transactionJumlah: {
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