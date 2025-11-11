import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Timer, Check, ChevronRight, XCircle } from 'lucide-react-native';
import { SimpleLineIcons } from '@expo/vector-icons';

const StatCard = ({ icon, count, label }) => (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const ActiveRentalCard = ({ image, title, project, date, progress }) => (
    <View style={styles.rentalCard}>
        <Image source={{ uri: image }} style={styles.rentalImage} />
        <View style={styles.rentalInfo}>
            <Text style={styles.rentalTitle}>{title}</Text>
            <Text style={styles.rentalProject}>{project}</Text>
            <Text style={styles.rentalDate}>{date}</Text>
        </View>
        <Text style={styles.rentalProgress}>{progress}</Text>
    </View>
);

const RecentActivityItem = ({ icon, title, subtitle, time, status }) => (
    <View style={styles.activityItem}>
        <View style={[styles.activityIconContainer, status === 'approved' ? styles.approvedBg : styles.rejectedBg]}>
            {icon}
        </View>
        <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>{title}</Text>
            <Text style={styles.activitySubtitle}>{subtitle}</Text>
            <Text style={styles.activityTime}>{time}</Text>
        </View>
    </View>
);


export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Image 
                source={{ uri: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/33f0/c75a/47eabbba22aaa62621dea29c2361007f?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=C~CJj6a0StCy0Ead0mPL-37afjxjtLddDumGkAQbUiiHuyQnxzir20YVScZPsEq7Q2hjbmeCwnOf14o6Qw886~LeBgdAjlRb8Z~rvEZbGHBtaidb0Zu14IU0Q6adYpRLDpU~rnI55tQlku13uH6-fJ3qStNV9rkD5ZypQV~7qKZ7K3dOAGlGzyHWpy3VStskVffrkg5r8qX7BRJXGpEcls4KHnjhOToZd8I-azwef3TMuCyN9uij2xV2y3KlXmoix6wfAhOJHHYZKvqQ3RmBHPJiagXyen7VkHgEGFHHfzI~bYcJmMUp5dKiEg0RCDJ95VrPtDzJV9Jvt6RMn1kKag__' }} 
                style={styles.logo}
            />
            <Text style={styles.logoText}>S`Trux</Text>
        </View>

        <View style={styles.content}>
            <LinearGradient
                colors={['#F39F29', '#FDCB41']}
                style={styles.welcomeCard}
            >
                <View>
                    <Text style={styles.welcomeGreeting}>Selamat Datang,</Text>
                    <Text style={styles.welcomeName}>Acong Jayaraya</Text>
                    <Text style={styles.welcomeMessage}>Anda memiliki 2 sewa aktif, mohon jaga alat berat dengan baik</Text>
                </View>
                <Image 
                    source={{ uri: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/be7e/389b/c8db882c474b7f5585b46df9d5a35c58?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=M8MJocKl7g96LpvLhk9FLDvA-Bx-rvNA~qqSAsKl5BgaNJw~XZcx4QCOKynIpqGW4f7W7khBssKh5IarPhhOAD-B1xOvM1TzAyGUVBx5JEb7Cc4KPs5el6Oe7pQ-ZjYug0iTASZ0od-zzOI3QZx8rUxhveD0nMCk8YArotnEo2~HZ0ZBFElajYjTPHPcNpPDRZ1BEwCCTp7dkJ4u5h4Z-W4OtfTxaFRf7RNCE2f6I7cWQEaQGbLEF6tMD7apOMlM4Z8HaNKt-28-X1ZamgTO7L9EhPf9USUSpQyg7JAMaqSoQlM05vbpDQF4FtRPDpzZbgljPiizIrVy49OI6CtSJg__' }}
                    style={styles.profilePic}
                />
            </LinearGradient>

            <View style={styles.statsContainer}>
                <StatCard icon={<Box size={24} color="#F39F29" />} count="10" label="Total Sewa" />
                <StatCard icon={<Timer size={24} color="#F39F29" />} count="2" label="Berlangsung" />
                <StatCard icon={<Check size={24} color="#F39F29" />} count="8" label="Selesai" />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Penyewaan Aktif</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>Lihat Semua</Text>
                    <ChevronRight size={16} color="#F39F29" />
                </TouchableOpacity>
            </View>

            <ActiveRentalCard 
                image="https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__"
                title="Excavator Caterpillar 3200D"
                project="Proyek Penggalian Gorong Gorong Bambu Hitam"
                date="08 Nov 2025 - 23 Nov 2025"
                progress="10%"
            />
            <ActiveRentalCard 
                image="https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/1e63/0454/f5783981978bf165967877321ad5d638?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=pwX8jTSTs-54SwNtdfcXL~oScysuz~z3SjaZ~3CaDsPlx-27Z1MheHbDocuSh2YlVJw98N-e6zPWfi~JTtOpr9yE~eyhcUJwXD-R~mpTKV8FGXa6kbu7U-PSaNRGXbtvagFqa94~RJRUT4eiKIZQFNeAz7PDqaQwRIjkWyWiqWG7Gr4aqN2WvhNAwmd5m8pdTa7TIN2wjzxgSlYE9Grrs~8xo-z1CNPe0ZAYvfV6hy4WxoJf9J9mkVBhoOBL5YfGMaHjsEsGHeV3KHArfvRV-2eXKDVNqG~dcGNzMVw0e~R0vbL4wiKg2np0y4L~7TgIA~8WD2aidd5~G~iOlEcA-w__"
                title="Dump Truck Hino D7000"
                project="Proyek Penggalian Gorong Gorong Bambu Hitam"
                date="08 Nov 2025 - 23 Nov 2025"
                progress="10%"
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            </View>

            <RecentActivityItem
                icon={<SimpleLineIcons name="check" size={24} color="#03CF00" />}
                title="Pengajuan Sewa Disetujui"
                subtitle="Excavator Caterpillar 3200D"
                time="5 Jam lalu"
                status="approved"
            />
             <RecentActivityItem
                icon={<XCircle size={28} color="#CF0000" strokeWidth={1.5} />}
                title="Pengajuan Sewa Ditolak (Dokumen Tidak Sesuai)"
                subtitle="Excavator Caterpillar 3200D"
                time="7 Jam lalu"
                status="rejected"
            />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    logo: {
        width: 34,
        height: 35,
    },
    logoText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#000000',
        marginLeft: 5,
    },
    content: {
        paddingHorizontal: 20,
    },
    welcomeCard: {
        borderRadius: 10,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeGreeting: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 10,
        color: '#4B4B4B',
    },
    welcomeName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#FFFFFF',
        marginVertical: 4,
    },
    welcomeMessage: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: '#4B4B4B',
        maxWidth: '90%',
    },
    profilePic: {
        width: 59,
        height: 59,
        borderRadius: 29.5,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '31%',
        height: 128,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3,
    },
    statCount: {
        fontFamily: 'Poppins-Medium',
        fontSize: 32,
        color: '#323232',
    },
    statLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: '#323232',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        color: '#000000',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#F39F29',
        marginRight: 2,
    },
    rentalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 11,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        shadowColor: 'rgba(253, 203, 65, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3,
    },
    rentalImage: {
        width: 85,
        height: 85,
        borderRadius: 5,
    },
    rentalInfo: {
        flex: 1,
        marginLeft: 13,
    },
    rentalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        color: '#000000',
        marginBottom: 6,
    },
    rentalProject: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: '#000000',
        marginBottom: 2,
    },
    rentalDate: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: '#978D8D',
    },
    rentalProgress: {
        fontFamily: 'Poppins-Medium',
        fontSize: 10,
        color: '#F39F29',
        position: 'absolute',
        bottom: 10,
        right: 15,
    },
    activityItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    approvedBg: {
        backgroundColor: 'rgba(3, 207, 0, 0.1)',
    },
    rejectedBg: {
        backgroundColor: 'rgba(207, 0, 0, 0.1)',
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        color: '#000000',
        flexShrink: 1,
    },
    activitySubtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: '#000000',
        marginTop: 2,
    },
    activityTime: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: '#978D8D',
        marginTop: 2,
    },
});
