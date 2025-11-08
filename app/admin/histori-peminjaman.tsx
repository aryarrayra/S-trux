import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from "react-native";
import { Clock4, History, X, Phone, FileText } from "lucide-react-native";
import SideBar from "@/components/admin/SideBar";
import { Stack } from "expo-router";

const HISTORY_DATA = [
    {
        alat: "Excavator CAT 3200D",
        perusahaan: "PT. Maulana Raya",
        penyewa: "Santoso Merogo",
        tanggal: "17/10/2025",
        berakhir: "30/10/2025",
        lokasi: "Tebak dong mniez",
        telp: "087219234973434",
        dokumen: "yTd097232932732893",
        kondisi: "baik/rusak",
        status: "Disewa",
        statusTime: "2h menit yang lalu",
        kategori: "Excavator",
        series: "Caterpillar CAT 3200D",
    },
    {
        alat: "Dump Truck R900",
        perusahaan: "PT. Cipta Karya",
        penyewa: "Budi Prakoso",
        tanggal: "05/11/2025",
        berakhir: "20/11/2025",
        lokasi: "Jakarta Selatan",
        telp: "081234567890",
        dokumen: "xAb908123981273",
        kondisi: "baik",
        status: "Disewa",
        statusTime: "5 jam yang lalu",
        kategori: "Dump Truck",
        series: "Hino R900",
    },
    {
        alat: "Bulldozer X390 CTX",
        perusahaan: "PT. Sinarjayalita",
        penyewa: "Rendi Kusuma",
        tanggal: "02/11/2025",
        berakhir: "10/11/2025",
        lokasi: "Surabaya",
        telp: "082198765432",
        dokumen: "dEw1239812739182",
        kondisi: "baik",
        status: "Selesai",
        statusTime: "6 jam yang lalu",
        kategori: "Bulldozer",
        series: "Komatsu X390 CTX",
    },
    {
        alat: "Dump Truck R991",
        perusahaan: "PT. Berkah Nusara",
        penyewa: "Ahmad Yani",
        tanggal: "01/11/2025",
        berakhir: "15/11/2025",
        lokasi: "Bandung",
        telp: "081298765432",
        dokumen: "aXz123456789012",
        kondisi: "baik",
        status: "Disewa",
        statusTime: "8 jam yang lalu",
        kategori: "Dump Truck",
        series: "Hino R991",
    },
    {
        alat: "Excavator CAT 3500D",
        perusahaan: "PT. Sejahtera Abadi",
        penyewa: "Bambang Sutrisno",
        tanggal: "28/10/2025",
        berakhir: "12/11/2025",
        lokasi: "Semarang",
        telp: "085612345678",
        dokumen: "bCd987654321098",
        kondisi: "baik",
        status: "Disewa",
        statusTime: "1d menit yang lalu",
        kategori: "Excavator",
        series: "Caterpillar CAT 3500D",
    },
    {
        alat: "Dump Truck R900",
        perusahaan: "PT. Maulana Raya",
        penyewa: "Susilo Wibowo",
        tanggal: "25/10/2025",
        berakhir: "08/11/2025",
        lokasi: "Yogyakarta",
        telp: "082187654321",
        dokumen: "cDe456789012345",
        kondisi: "baik",
        status: "Disewa",
        statusTime: "2 jam yang lalu",
        kategori: "Dump Truck",
        series: "Hino R900",
    },
    {
        alat: "Bulldozer X380 CTX",
        perusahaan: "PT. Sinarjayalita",
        penyewa: "Hendra Gunawan",
        tanggal: "20/10/2025",
        berakhir: "05/11/2025",
        lokasi: "Malang",
        telp: "081234876543",
        dokumen: "dEf789012345678",
        kondisi: "baik",
        status: "Selesai",
        statusTime: "3 jam yang lalu",
        kategori: "Bulldozer",
        series: "Komatsu X380 CTX",
    },
];

type HistoryItem = {
    alat: string;
    perusahaan: string;
    penyewa: string;
    tanggal: string;
    berakhir: string;
    lokasi: string;
    telp: string;
    dokumen: string;
    kondisi: string;
    status: string;
    statusTime: string;
    kategori: string;
    series: string;
};

export default function HistoriPeminjaman() {
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    const getCurrentDate = () => {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember",
        ];
        const now = new Date();
        const dayName = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return {
            full: `${dayName}, ${date} ${month} ${year}`,
            time: `${hours}:${minutes} WIB`,
        };
    };

    const currentDate = getCurrentDate();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Histori Pinjaman</Text>
                            <Text style={styles.subtitle}>
                                Riwayat Penyewaan Dan Pengembalian Alat Berat
                            </Text>
                        </View>

                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                        </View>
                    </View>

                    <View style={styles.historyBox}>
                        <View style={styles.historyHeader}>
                            <History size={20} color="#F59E0B" />
                            <Text style={styles.historyTitle}>Histori Aktivitas</Text>
                        </View>

                        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                            {HISTORY_DATA.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedItem(item)}
                                    style={styles.historyItem}
                                >
                                    <View style={styles.bullet} />
                                    <View style={styles.historyContent}>
                                        <Text style={styles.alatText}>{item.alat}</Text>
                                        <Text style={styles.companyText}>{item.perusahaan}</Text>
                                        <View style={styles.timeContainer}>
                                            <Clock4 size={12} color="#F59E0B" />
                                            <Text style={styles.timeAgo}>{item.statusTime}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Modal Detail */}
                <Modal
                    visible={selectedItem !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSelectedItem(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalWrapper}>
                            <View style={styles.gradientLayer1} />
                            <View style={styles.gradientLayer2} />
                            <View style={styles.gradientLayer3} />
                            <View style={styles.gradientLayer4} />
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                                    <X size={24} color="#EF4444" />
                                </TouchableOpacity>

                                <Text style={styles.modalTitle}>{selectedItem?.alat}</Text>

                                <View style={styles.divider} />

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
                                    <Text style={styles.sectionTitle}>Informasi Sewa</Text>

                                    <View style={styles.fieldContainer}>
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Tanggal Sewa</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.tanggal}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Nama Penyewa</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.penyewa}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Sewa Berakhir</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.berakhir}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Nama Perusahaan</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.perusahaan}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Lokasi</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.lokasi}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Nomor Telepon</Text>
                                                <View style={[styles.input, styles.inputWithIcon]}>
                                                    <Text style={styles.inputText}>{selectedItem?.telp}</Text>
                                                    <Phone size={18} color="#F59E0B" strokeWidth={2.5} />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.rightColumnOnly}>
                                            <Text style={styles.label}>Dokumen Persetujuan Pinjaman</Text>
                                            <View style={[styles.input, styles.inputWithIcon]}>
                                                <Text style={styles.inputText}>{selectedItem?.dokumen}</Text>
                                                <FileText size={18} color="#F59E0B" strokeWidth={2.5} />
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.sectionTitle}>Informasi Unit</Text>

                                    <View style={styles.fieldContainer}>
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Kategori Unit</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.kategori}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Status Unit</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.status}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.leftColumnOnly}>
                                            <Text style={styles.label}>Series</Text>
                                            <View style={styles.input}>
                                                <Text style={styles.inputText}>{selectedItem?.series}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.leftColumnOnly}>
                                            <Text style={styles.label}>Kondisi</Text>
                                            <View style={styles.input}>
                                                <Text style={styles.inputText}>{selectedItem?.kondisi}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
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
        flexDirection: "row",
        backgroundColor: "#F9F9F9"
    },
    mainContent: {
        flex: 1,
        padding: 40
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B"
    },
    subtitle: {
        fontSize: 14,
        color: "#555",
        fontFamily: "Poppins_400Regular"
    },
    dateContainer: {
        alignItems: "flex-end"
    },
    dateText: {
        fontSize: 14,
        fontFamily: "Poppins_500Medium",
        color: "#F59E0B"
    },
    timeText: {
        fontSize: 16,
        fontFamily: "Poppins_500Medium",
        color: "#333"
    },
    historyBox: {
        backgroundColor: "#FFF6E5",
        borderWidth: 1.5,
        borderColor: "#F6C76F",
        borderRadius: 12,
        padding: 20,
        flex: 1,
    },
    historyHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F6C76F",
        paddingBottom: 8,
    },
    historyTitle: {
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        marginLeft: 8,
    },
    historyList: {
        marginTop: 10
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: "#F6C76F",
        paddingVertical: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#F59E0B",
        marginTop: 6,
        marginRight: 10,
    },
    historyContent: {
        flex: 1
    },
    alatText: {
        fontSize: 14,
        fontFamily: "Poppins_500Medium",
        color: "#333"
    },
    companyText: {
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: "#F59E0B",
        marginTop: 2,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },
    timeAgo: {
        fontSize: 11,
        color: "#666",
        marginLeft: 4
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalWrapper: {
        width: "50%",
        maxWidth: 600,
        maxHeight: "90%",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
    },
    gradientBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60%",
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer1: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60%",
        backgroundColor: "#EA580C",
        opacity: 0.15,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer2: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        backgroundColor: "#EA580C",
        opacity: 0.25,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer3: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "30%",
        backgroundColor: "#EA580C",
        opacity: 0.4,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer4: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "15%",
        backgroundColor: "#EA580C",
        opacity: 0.6,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    modalContent: {
        flex: 1,
        backgroundColor: "#FFFEF8",
        borderRadius: 16,
        padding: 28,
        paddingTop: 20,
        paddingBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 1,
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 4,
        marginBottom: 6,
        zIndex: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        textAlign: "center",
        marginBottom: 12,
    },
    divider: {
        height: 2,
        backgroundColor: "#F59E0B",
        marginBottom: 20,
    },
    scrollContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        marginBottom: 14,
        marginTop: 4,
        marginLeft: 0,
    },
    fieldContainer: {
        paddingLeft: 30,
        paddingRight: 30,
        marginBottom: 8,
    },
    twoColumnRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 16,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 16,
    },
    leftColumnOnly: {
        width: "50%",
        paddingRight: 16,
        marginBottom: 16,
    },
    rightColumnOnly: {
        width: "50%",
        paddingLeft: 16,
        marginBottom: 16,
        alignSelf: "flex-end",
    },
    label: {
        fontSize: 11,
        fontFamily: "Poppins_500Medium",
        color: "#000",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#FFF",
        borderWidth: 1.5,
        borderColor: "#F59E0B",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 42,
        justifyContent: "center",
    },
    inputWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 10,
    },
    inputText: {
        fontSize: 11,
        fontFamily: "Poppins_400Regular",
        color: "#000",
        flex: 1,
    },
});