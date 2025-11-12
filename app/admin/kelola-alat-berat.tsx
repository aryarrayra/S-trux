import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, Image } from 'react-native';
import { Search, Edit2, Trash2, X, Camera, Plus } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Mock data untuk Alat Berat
const INITIAL_ALAT_BERAT = [
    {
        id: '1',
        namaUnit: 'Excavator Caterpillar 320DD',
        jumlahUnit: 8,
        deskripsi: 'Your description here....\nLorem ipsum dolor sit amet consectetur',
        harga: 800000,
        status: 'Tersedia',
        jenis: 'Excavator',
        foto: 'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=400',
    },
    {
        id: '2',
        namaUnit: 'Tower Crane Leibherr',
        jumlahUnit: 5,
        deskripsi: 'Your description here....\nLorem ipsum dolor sit amet consectetur',
        harga: 1500000,
        status: 'Tidak Tersedia',
        jenis: 'Crane',
        foto: 'https://images.unsplash.com/photo-1431219658633-5d23b4e4d9f5?w=400',
    },
    {
        id: '3',
        namaUnit: 'Bulldozer Komatsu',
        jumlahUnit: 5,
        deskripsi: 'Your description here....\nLorem ipsum dolor sit amet consectetur',
        harga: 500000,
        status: 'Tersedia',
        jenis: 'Bulldozer',
        foto: 'https://images.unsplash.com/photo-1675439171730-9a3d3e1f9c1d?w=400',
    },
    {
        id: '4',
        namaUnit: 'Dump Truck Hino',
        jumlahUnit: 5,
        deskripsi: 'Your description here....\nLorem ipsum dolor sit amet consectetur',
        harga: 750000,
        status: 'Tersedia',
        jenis: 'Dump Truck',
        foto: 'https://images.unsplash.com/photo-1517423440422-9a8c0c2f4e1a?w=400',
    },
];

type AlatBerat = {
    id: string;
    namaUnit: string;
    jumlahUnit: number;
    deskripsi: string;
    harga: number;
    status: string;
    jenis: string;
    foto: string;
};

export default function KelolaAlatBerat() {
    const [searchQuery, setSearchQuery] = useState('');
    const [alatBeratList, setAlatBeratList] = useState<AlatBerat[]>(INITIAL_ALAT_BERAT);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedAlatBerat, setSelectedAlatBerat] = useState<AlatBerat | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showJenisDropdown, setShowJenisDropdown] = useState(false);

    // Form states
    const [namaUnit, setNamaUnit] = useState('');
    const [jumlahUnit, setJumlahUnit] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [harga, setHarga] = useState('');
    const [status, setStatus] = useState('Tersedia/Tidak Tersedia');
    const [jenis, setJenis] = useState('Excavator/Crane/bulldozer/....');
    const [foto, setFoto] = useState('');

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

    const filteredAlatBerat = alatBeratList.filter(item =>
        item.namaUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenis.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number).replace('Rp', 'RP.');
    };

    const handleEdit = (item: AlatBerat) => {
        setSelectedAlatBerat(item);
        setIsAddMode(false);
        setNamaUnit(item.namaUnit);
        setJumlahUnit(String(item.jumlahUnit));
        setDeskripsi(item.deskripsi);
        setHarga(String(item.harga));
        setStatus(item.status);
        setJenis(item.jenis);
        setFoto(item.foto);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedAlatBerat(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setNamaUnit('');
        setJumlahUnit('');
        setDeskripsi('');
        setHarga('');
        setStatus('Tersedia/Tidak Tersedia');
        setJenis('Excavator/Crane/bulldozer/....');
        setFoto('');
    };

    const handleDelete = (item: AlatBerat) => {
        setSelectedAlatBerat(item);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = (confirmed: boolean) => {
        if (confirmed && selectedAlatBerat) {
            setAlatBeratList(prev => prev.filter(item => item.id !== selectedAlatBerat.id));
            console.log('Unit Alat Berat dihapus:', selectedAlatBerat.id);
            if (!isAddMode) {
                setModalVisible(false);
            }
        }
        setDeleteModalVisible(false);
        setSelectedAlatBerat(null);
    };

    const validateForm = (): boolean => {
        if (!namaUnit.trim() || !jumlahUnit.trim() || !deskripsi.trim() || !harga.trim() || status === 'Tersedia/Tidak Tersedia' || jenis === 'Excavator/Crane/bulldozer/....') {
            Alert.alert('Error', 'Semua field harus diisi dengan benar!');
            return false;
        }
        return true;
    };

    const handleUpdate = () => {
        if (!validateForm()) return;
        if (selectedAlatBerat) {
            setAlatBeratList(prev => prev.map(item =>
                item.id === selectedAlatBerat.id
                    ? {
                        ...item,
                        namaUnit,
                        jumlahUnit: parseInt(jumlahUnit),
                        deskripsi,
                        harga: parseInt(harga),
                        status,
                        jenis,
                        foto,
                    }
                    : item
            ));
            console.log('Data diupdate:', selectedAlatBerat.id);
        }
        setModalVisible(false);
    };

    const handleSave = () => {
        if (!validateForm()) return;
        const newItem: AlatBerat = {
            id: String(alatBeratList.length + 1),
            namaUnit,
            jumlahUnit: parseInt(jumlahUnit),
            deskripsi,
            harga: parseInt(harga),
            status,
            jenis,
            foto: foto || 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400',
        };
        setAlatBeratList(prev => [...prev, newItem]);
        console.log('Data baru ditambahkan:', newItem);
        setModalVisible(false);
    };

    const handleClear = () => {
        handleDelete(selectedAlatBerat!);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const selectStatus = (selectedStatus: string) => {
        setStatus(selectedStatus);
        setShowStatusDropdown(false);
    };

    const selectJenis = (selectedJenis: string) => {
        setJenis(selectedJenis);
        setShowJenisDropdown(false);
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
                            <Text style={styles.pageTitle}>Kelola Alat Berat</Text>
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
                                placeholder="Cari berdasarkan nama atau jenis alat berat..."
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

                    {/* Card Grid */}
                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.cardGrid}>
                            {filteredAlatBerat.map((item) => (
                                <View key={item.id} style={styles.card}>
                                    {/* Status Badge */}
                                    <View style={[
                                        styles.statusBadge,
                                        item.status === 'Tersedia' ? styles.statusAvailable : styles.statusUnavailable
                                    ]}>
                                        <Text style={styles.statusText}>{item.status}</Text>
                                    </View>

                                    {/* Image */}
                                    <Image source={{ uri: item.foto }} style={styles.cardImage} />

                                    {/* Content */}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{item.namaUnit}</Text>
                                        <Text style={styles.cardDescription} numberOfLines={2}>
                                            {item.deskripsi}
                                        </Text>

                                        {/* Info Row */}
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoIcon}>🏗️</Text>
                                                <Text style={styles.infoText}>{item.jenis}</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoIcon}>📦</Text>
                                                <Text style={styles.infoText}>{item.jumlahUnit} unit</Text>
                                            </View>
                                        </View>

                                        {/* Price & Actions */}
                                        <View style={styles.cardFooter}>
                                            <View>
                                                <Text style={styles.priceLabel}>Harga per hari:</Text>
                                                <Text style={styles.priceValue}>{formatRupiah(item.harga)}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.editIconButton}
                                                onPress={() => handleEdit(item)}
                                            >
                                                <Edit2 color="#FDB022" size={20} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Add/Edit Modal */}
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
                                <Text style={styles.modalTitle}>
                                    {isAddMode ? 'Tambah Unit Alat Berat' : 'Update Data Alat Berat'}
                                </Text>
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
                                            <Text style={styles.label}>Nama Unit</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={namaUnit}
                                                onChangeText={setNamaUnit}
                                                placeholder="Excavator Volvo"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Jumlah Unit</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={jumlahUnit}
                                                onChangeText={setJumlahUnit}
                                                placeholder="8"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Deskripsi</Text>
                                            <TextInput
                                                style={[styles.input, styles.textArea]}
                                                value={deskripsi}
                                                onChangeText={setDeskripsi}
                                                placeholder="Your description here....&#10;Lorem ipsum dolor sit amet consectetur"
                                                placeholderTextColor="#999"
                                                multiline
                                                numberOfLines={4}
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Harga (RP)</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={harga}
                                                onChangeText={setHarga}
                                                placeholder="800.000"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Status</Text>
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowStatusDropdown(true)}
                                            >
                                                <Text style={[
                                                    styles.selectText,
                                                    status === 'Tersedia/Tidak Tersedia' && styles.placeholderText
                                                ]}>
                                                    {status}
                                                </Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Jenis</Text>
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowJenisDropdown(true)}
                                            >
                                                <Text style={[
                                                    styles.selectText,
                                                    jenis === 'Excavator/Crane/bulldozer/....' && styles.placeholderText
                                                ]}>
                                                    {jenis}
                                                </Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Foto</Text>
                                            <View style={styles.fotoInputContainer}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1, paddingRight: 10 }]}
                                                    value={foto}
                                                    onChangeText={setFoto}
                                                    placeholder="img_08283_8823827_23848329"
                                                    placeholderTextColor="#999"
                                                />
                                                <TouchableOpacity>
                                                    <Camera color="#F59E0B" size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.formGroup} />
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
                                        <View style={styles.buttonIconContainer}>
                                            <Plus color={COLORS.white} size={18} />
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.updateButton}
                                            onPress={handleUpdate}
                                        >
                                            <Text style={styles.updateButtonText}>Update</Text>
                                            <View style={styles.buttonIconContainer}>
                                                <Edit2 color={COLORS.white} size={18} />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={handleClear}
                                        >
                                            <Text style={styles.clearButtonText}>Hapus</Text>
                                            <View style={styles.buttonIconContainer}>
                                                <Trash2 color={COLORS.white} size={18} />
                                            </View>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Dropdown Modal untuk Status */}
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
                                    onPress={() => selectStatus('Tersedia')}
                                >
                                    <Text style={styles.dropdownText}>Tersedia</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                    onPress={() => selectStatus('Tidak Tersedia')}
                                >
                                    <Text style={styles.dropdownText}>Tidak Tersedia</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {/* Dropdown Modal untuk Jenis */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showJenisDropdown}
                        onRequestClose={() => setShowJenisDropdown(false)}
                    >
                        <TouchableOpacity
                            style={styles.dropdownOverlay}
                            activeOpacity={1}
                            onPress={() => setShowJenisDropdown(false)}
                        >
                            <View style={styles.dropdownContent}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Excavator')}
                                >
                                    <Text style={styles.dropdownText}>Excavator</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Crane')}
                                >
                                    <Text style={styles.dropdownText}>Crane</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Bulldozer')}
                                >
                                    <Text style={styles.dropdownText}>Bulldozer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                    onPress={() => selectJenis('Dump Truck')}
                                >
                                    <Text style={styles.dropdownText}>Dump Truck</Text>
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
                                    <Trash2 color="#EF4444" size={64} />
                                </View>
                            </View>
                            <View style={styles.dividerLine} />
                            <Text style={styles.confirmTitle}>Anda Yakin Menghapus Unit Ini?</Text>
                            <View style={styles.confirmButtons}>
                                <TouchableOpacity
                                    style={styles.confirmYesButton}
                                    onPress={() => handleConfirmDelete(true)}
                                >
                                    <Text style={styles.confirmButtonText}>Ya</Text>
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
        backgroundColor: '#F5F5F5',
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
        color: '#F59E0B',
    },
    timeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 18,
        color: '#333',
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
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#333',
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
    scrollContainer: {
        flex: 1,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    card: {
        width: '23%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        zIndex: 1,
    },
    statusAvailable: {
        backgroundColor: '#3B82F6',
    },
    statusUnavailable: {
        backgroundColor: '#EF4444',
    },
    statusText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 11,
        color: COLORS.white,
    },
    cardImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#E5E5E5',
    },
    cardContent: {
        padding: 15,
    },
    cardTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 15,
        color: '#333',
        marginBottom: 8,
    },
    cardDescription: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
        lineHeight: 18,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    infoIcon: {
        fontSize: 14,
    },
    infoText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    priceLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 11,
        color: '#666',
        marginBottom: 3,
    },
    priceValue: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#F59E0B',
    },
    editIconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFF4E6',
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
        color: '#333',
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
        color: '#333',
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
        color: '#333',
    },
    textArea: {
        minHeight: 100,
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
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    selectArrow: {
        fontSize: 12,
        color: '#F59E0B',
    },
    fotoInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
        borderRadius: 8,
        gap: 10,
    },
    saveButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    buttonIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        borderRadius: 4,
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
        color: '#333',
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
        maxWidth: 400,
        padding: 40,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    dividerLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#F59E0B',
        marginVertical: 20,
    },
    confirmTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#F59E0B',
        textAlign: 'center',
        marginBottom: 30,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    confirmYesButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmNoButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
});