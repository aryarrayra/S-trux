import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from "react-native";
import { Clock4, History, X } from "lucide-react-native";
import SideBar from "@/components/admin/SideBar";
import { Stack } from "expo-router";

const HISTORY_DATA = [
    {
        alat: "Excavator CAT 3200D",
        perusahaan: "PT. Sumber Makmur",
        penyewa: "Santoso Merogo",
        tanggal: "17/10/2025",
        berakhir: "30/10/2025",
        lokasi: "Tebak dong mniez",
        telp: "087219234973434",
        dokumen: "yTd097232932732893",
        kondisi: "baik/rusak",
        status: "Disewa",
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
    },
    {
        alat: "Bulldozer X390 CTX",
        perusahaan: "PT. Surya Kencana",
        penyewa: "Rendi Kusuma",
        tanggal: "02/11/2025",
        berakhir: "10/11/2025",
        lokasi: "Surabaya",
        telp: "082198765432",
        dokumen: "dEw1239812739182",
        kondisi: "baik",
        status: "Selesai",
    },
];

// ✅ Tambahkan tipe data untuk selectedItem
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

                        <ScrollView style={styles.historyList}>
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
                                            <Clock4 size={14} color="#F59E0B" />
                                            <Text style={styles.timeAgo}>{item.status}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* ✅ Modal Detail Dinamis */}
                <Modal
                    visible={selectedItem !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSelectedItem(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                                <X size={24} color="#F59E0B" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{selectedItem?.alat}</Text>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Informasi Sewa</Text>
                                <Text>Tanggal Sewa: {selectedItem?.tanggal}</Text>
                                <Text>Sewa Berakhir: {selectedItem?.berakhir}</Text>
                                <Text>Nama Penyewa: {selectedItem?.penyewa}</Text>
                                <Text>Nama Perusahaan: {selectedItem?.perusahaan}</Text>
                                <Text>Lokasi: {selectedItem?.lokasi}</Text>
                                <Text>Nomor Telepon: {selectedItem?.telp}</Text>
                                <Text>Dokumen: {selectedItem?.dokumen}</Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Informasi Unit</Text>
                                <Text>Kategori Unit: Excavator</Text>
                                <Text>Kondisi: {selectedItem?.kondisi}</Text>
                                <Text>Status Unit: {selectedItem?.status}</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "row", backgroundColor: "#F9F9F9" },
    mainContent: { flex: 1, padding: 40 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 30,
    },
    title: { fontSize: 32, fontFamily: "Poppins_600SemiBold", color: "#F59E0B" },
    subtitle: { fontSize: 14, color: "#555", fontFamily: "Poppins_400Regular" },
    dateContainer: { alignItems: "flex-end" },
    dateText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#F59E0B" },
    timeText: { fontSize: 16, fontFamily: "Poppins_500Medium", color: "#333" },

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
    historyList: { marginTop: 10 },
    historyItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: "#F6C76F",
        paddingVertical: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#F59E0B",
        marginTop: 8,
        marginRight: 10,
    },
    historyContent: { flex: 1 },
    alatText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#333" },
    companyText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#F59E0B" },
    timeContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    timeAgo: { fontSize: 12, color: "#666", marginLeft: 5 },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 20,
    },
    closeButton: { alignSelf: "flex-end" },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        textAlign: "center",
        marginBottom: 10,
    },
    section: { marginTop: 10 },
    sectionTitle: {
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        marginBottom: 4,
    },
});
