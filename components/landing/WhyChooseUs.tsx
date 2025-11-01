import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { ADVANTAGES } from '@/constants/data';
import SectionTitle from './SectionTitle';

const WhyChooseUs = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <View style={styles.section}>
            <TouchableOpacity style={styles.tagButton}>
                <Text style={styles.tagButtonText}>Keunggulan Kami</Text>
            </TouchableOpacity>
            <SectionTitle
                title="Kenapa Memilih S`Trux"
                subtitle="Kami berkomitmen memberikan layanan terbaik dengan standar keamanan tinggi dan dukungan penuh untuk kesuksesan proyek Anda"
            />
            <View style={styles.advantagesGrid}>
                {ADVANTAGES.map((adv, index) => (
                    <LinearGradient key={index} colors={[COLORS.cardGradientStart, COLORS.cardGradientEnd]} style={[styles.advantageCard, isMobile && { width: '100%' }]}>
                        <View style={styles.advantageIconContainer}>
                            <Zap color={COLORS.darkGray} size={24} fill={COLORS.darkGray} />
                        </View>
                        <Text style={styles.advantageTitle}>{adv.title}</Text>
                        <Text style={styles.advantageDescription}>{adv.description}</Text>
                    </LinearGradient>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
    },
    tagButton: {
        backgroundColor: COLORS.primaryTransparent,
        borderColor: COLORS.primaryLight,
        borderWidth: 0.5,
        borderRadius: 38,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 20,
    },
    tagButtonText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 20,
        color: COLORS.white,
    },
    advantagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
        width: '100%',
        maxWidth: 1200,
    },
    advantageCard: {
        width: 389,
        height: 187,
        borderRadius: 15,
        borderWidth: 0.3,
        borderColor: COLORS.primaryLight,
        padding: 25,
    },
    advantageIconContainer: {
        width: 46,
        height: 46,
        borderRadius: 7,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    advantageTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 8,
    },
    advantageDescription: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: COLORS.white,
        lineHeight: 16,
    },
});

export default WhyChooseUs;
