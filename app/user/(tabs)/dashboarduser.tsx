import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Timer, Check, ChevronRight, XCircle, LucideIcon } from 'lucide-react-native';
import { SimpleLineIcons } from '@expo/vector-icons';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StatCardProps {
    icon: React.ReactNode;
    count: string | number;
    label: string;
}

interface ActiveRentalCardProps {
    image: string;
    title: string;
    project: string;
    date: string;
    progress: string;
}

interface RecentActivityItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    time: string;
    status: 'approved' | 'rejected';
}

interface UserProfile {
    name: string;
    avatarUrl: string;
    activeRentals: number;
}

interface RentalStats {
    total: number;
    ongoing: number;
    completed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    background: '#F4F4F4',
    white: '#FFFFFF',
    black: '#000000',
    textGray: '#978D8D',
    darkGray: '#4B4B4B',
    mediumGray: '#323232',
    orange: '#F39F29',
    yellow: '#FDCB41',
    green: '#03CF00',
    red: '#CF0000',
};

const MOCK_USER: UserProfile = {
    name: 'Acong Jayaraya',
    avatarUrl: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/be7e/389b/c8db882c474b7f5585b46df9d5a35c58?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=M8MJocKl7g96LpvLhk9FLDvA-Bx-rvNA~qqSAsKl5BgaNJw~XZcx4QCOKynIpqGW4f7W7khBssKh5IarPhhOAD-B1xOvM1TzAyGUVBx5JEb7Cc4KPs5el6Oe7pQ-ZjYug0iTASZ0od-zzOI3QZx8rUxhveD0nMCk8YArotnEo2~HZ0ZBFElajYjTPHPcNpPDRZ1BEwCCTp7dkJ4u5h4Z-W4OtfTxaFRf7RNCE2f6I7cWQEaQGbLEF6tMD7apOMlM4Z8HaNKt-28-X1ZamgTO7L9EhPf9USUSpQyg7JAMaqSoQlM05vbpDQF4FtRPDpzZbgljPiizIrVy49OI6CtSJg__',
    activeRentals: 2,
};

const MOCK_STATS: RentalStats = {
    total: 10,
    ongoing: 2,
    completed: 8,
};

const MOCK_ACTIVE_RENTALS: ActiveRentalCardProps[] = [
    {
        image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
        title: 'Excavator Caterpillar 3200D',
        project: 'Proyek Penggalian Gorong Gorong Bambu Hitam',
        date: '08 Nov 2025 - 23 Nov 2025',
        progress: '10%',
    },
    {
        image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/1e63/0454/f5783981978bf165967877321ad5d638?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=pwX8jTSTs-54SwNtdfcXL~oScysuz~z3SjaZ~3CaDsPlx-27Z1MheHbDocuSh2YlVJw98N-e6zPWfi~JTtOpr9yE~eyhcUJwXD-R~mpTKV8FGXa6kbu7U-PSaNRGXbtvagFqa94~RJRUT4eiKIZQFNeAz7PDqaQwRIjkWyWiqWG7Gr4aqN2WvhNAwmd5m8pdTa7TIN2wjzxgSlYE9Grrs~8xo-z1CNPe0ZAYvfV6hy4WxoJf9J9mkVBhoOBL5YfGMaHjsEsGHeV3KHArfvRV-2eXKDVNqG~dcGNzMVw0e~R0vbL4wiKg2np0y4L~7TgIA~8WD2aidd5~G~iOlEcA-w__',
        title: 'Dump Truck Hino D7000',
        project: 'Proyek Penggalian Gorong Gorong Bambu Hitam',
        date: '08 Nov 2025 - 23 Nov 2025',
        progress: '10%',
    },
];

const MOCK_ACTIVITIES: RecentActivityItemProps[] = [
    {
        icon: <SimpleLineIcons name="check" size={24} color={COLORS.green} />,
        title: 'Pengajuan Sewa Disetujui',
        subtitle: 'Excavator Caterpillar 3200D',
        time: '5 Jam lalu',
        status: 'approved',
    },
    {
        icon: <XCircle size={28} color={COLORS.red} strokeWidth={1.5} />,
        title: 'Pengajuan Sewa Ditolak (Dokumen Tidak Sesuai)',
        subtitle: 'Excavator Caterpillar 3200D',
        time: '7 Jam lalu',
        status: 'rejected',
    },
];

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const StatCard: React.FC<StatCardProps> = ({ icon, count, label }) => (
    <View style={styles.statCard}>
        {icon}
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const ActiveRentalCard: React.FC<ActiveRentalCardProps> = ({
    image,
    title,
    project,
    date,
    progress
}) => (
    <TouchableOpacity
        style={styles.rentalCard}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${project}`}
        accessibilityHint="Tap untuk melihat detail penyewaan"
    >
        <Image
            source={{ uri: image }}
            style={styles.rentalImage}
            accessibilityLabel={title}
        />
        <View style={styles.rentalInfo}>
            <Text style={styles.rentalTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.rentalProject} numberOfLines={2}>{project}</Text>
            <Text style={styles.rentalDate}>{date}</Text>
        </View>
        <Text style={styles.rentalProgress}>{progress}</Text>
    </TouchableOpacity>
);

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
    icon,
    title,
    subtitle,
    time,
    status
}) => (
    <View
        style={styles.activityItem}
        accessibilityLabel={`${title}, ${subtitle}, ${time}`}
    >
        <View
            style={[
                styles.activityIconContainer,
                status === 'approved' ? styles.approvedBg : styles.rejectedBg
            ]}
        >
            {icon}
        </View>
        <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.activitySubtitle} numberOfLines={1}>{subtitle}</Text>
            <Text style={styles.activityTime}>{time}</Text>
        </View>
    </View>
);

const WelcomeCard: React.FC<{ user: UserProfile }> = ({ user }) => (
    <LinearGradient
        colors={[COLORS.orange, COLORS.yellow]}
        style={styles.welcomeCard}
    >
        <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>Selamat Datang,</Text>
            <Text style={styles.welcomeName}>{user.name}</Text>
            <Text style={styles.welcomeMessage}>
                Anda memiliki {user.activeRentals} sewa aktif, mohon jaga alat berat dengan baik
            </Text>
        </View>
        <Image
            source={{ uri: user.avatarUrl }}
            style={styles.profilePic}
            accessibilityLabel={`Foto profil ${user.name}`}
        />
    </LinearGradient>
);

const StatsSection: React.FC<{ stats: RentalStats }> = ({ stats }) => (
    <View style={styles.statsContainer}>
        <StatCard
            icon={<Box size={24} color={COLORS.orange} />}
            count={stats.total}
            label="Total Sewa"
        />
        <StatCard
            icon={<Timer size={24} color={COLORS.orange} />}
            count={stats.ongoing}
            label="Berlangsung"
        />
        <StatCard
            icon={<Check size={24} color={COLORS.orange} />}
            count={stats.completed}
            label="Selesai"
        />
    </View>
);

const SectionHeader: React.FC<{
    title: string;
    onSeeAll?: () => void;
    showSeeAll?: boolean;
}> = ({ title, onSeeAll, showSeeAll = false }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && (
            <TouchableOpacity
                style={styles.seeAllButton}
                onPress={onSeeAll}
                accessibilityRole="button"
                accessibilityLabel="Lihat semua"
            >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <ChevronRight size={16} color={COLORS.orange} />
            </TouchableOpacity>
        )}
    </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardScreen() {
    const handleSeeAllRentals = () => {
        // Navigate to rentals list
        console.log('Navigate to all rentals');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={{
                            uri: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/33f0/c75a/47eabbba22aaa62621dea29c2361007f?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=C~CJj6a0StCy0Ead0mPL-37afjxjtLddDumGkAQbUiiHuyQnxzir20YVScZPsEq7Q2hjbmeCwnOf14o6Qw886~LeBgdAjlRb8Z~rvEZbGHBtaidb0Zu14IU0Q6adYpRLDpU~rnI55tQlku13uH6-fJ3qStNV9rkD5ZypQV~7qKZ7K3dOAGlGzyHWpy3VStskVffrkg5r8qX7BRJXGpEcls4KHnjhOToZd8I-azwef3TMuCyN9uij2xV2y3KlXmoix6wfAhOJHHYZKvqQ3RmBHPJiagXyen7VkHgEGFHHfzI~bYcJmMUp5dKiEg0RCDJ95VrPtDzJV9Jvt6RMn1kKag__'
                        }}
                        style={styles.logo}
                        accessibilityLabel="Logo S'Trux"
                    />
                    <Text style={styles.logoText}>S'Trux</Text>
                </View>

                <View style={styles.content}>
                    {/* Welcome Card */}
                    <WelcomeCard user={MOCK_USER} />

                    {/* Stats Section */}
                    <StatsSection stats={MOCK_STATS} />

                    {/* Active Rentals Section */}
                    <SectionHeader
                        title="Penyewaan Aktif"
                        showSeeAll={true}
                        onSeeAll={handleSeeAllRentals}
                    />

                    {MOCK_ACTIVE_RENTALS.map((rental, index) => (
                        <ActiveRentalCard
                            key={index}
                            image={rental.image}
                            title={rental.title}
                            project={rental.project}
                            date={rental.date}
                            progress={rental.progress}
                        />
                    ))}

                    {/* Recent Activity Section */}
                    <SectionHeader title="Aktivitas Terbaru" />

                    {MOCK_ACTIVITIES.map((activity, index) => (
                        <RecentActivityItem
                            key={index}
                            icon={activity.icon}
                            title={activity.title}
                            subtitle={activity.subtitle}
                            time={activity.time}
                            status={activity.status}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        color: COLORS.black,
        marginLeft: 5,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    welcomeCard: {
        borderRadius: 10,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    welcomeGreeting: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 10,
        color: COLORS.darkGray,
    },
    welcomeName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: COLORS.white,
        marginVertical: 4,
    },
    welcomeMessage: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: COLORS.darkGray,
        lineHeight: 14,
    },
    profilePic: {
        width: 59,
        height: 59,
        borderRadius: 29.5,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: COLORS.white,
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
        color: COLORS.mediumGray,
    },
    statLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: COLORS.mediumGray,
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
        color: COLORS.black,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: COLORS.orange,
        marginRight: 2,
    },
    rentalCard: {
        backgroundColor: COLORS.white,
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
        marginRight: 10,
    },
    rentalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        color: COLORS.black,
        marginBottom: 6,
    },
    rentalProject: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: COLORS.black,
        marginBottom: 2,
    },
    rentalDate: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: COLORS.textGray,
    },
    rentalProgress: {
        fontFamily: 'Poppins-Medium',
        fontSize: 10,
        color: COLORS.orange,
        position: 'absolute',
        bottom: 10,
        right: 15,
    },
    activityItem: {
        backgroundColor: COLORS.white,
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
        color: COLORS.black,
    },
    activitySubtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: COLORS.black,
        marginTop: 2,
    },
    activityTime: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: COLORS.textGray,
        marginTop: 2,
    },
});