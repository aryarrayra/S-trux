import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';
import SectionTitle from './SectionTitle';

const CTA = () => (
    <LinearGradient colors={[COLORS.darkGray, COLORS.darkBrown]} style={styles.section}>
        <TouchableOpacity style={styles.tagButton}>
            <Text style={styles.tagButtonText}>Mulai Proyek Anda</Text>
        </TouchableOpacity>
        <SectionTitle
            title="Siap Memulai Proyek Anda?"
            subtitle="Dapatkan konsultasi gratis dan penawaran terbaik untuk kebutuhan alat berat proyek Anda. Tim kami siap membantu 24/7."
        />
        <TouchableOpacity style={[styles.ctaButton, {alignSelf: 'center'}]}>
            <Text style={styles.ctaButtonText}>Hubungi kami</Text>
        </TouchableOpacity>
    </LinearGradient>
);

const styles = StyleSheet.create({
    section: {
        padding: 20,
        alignItems: 'center',
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
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        gap: 8,
        backgroundColor: COLORS.primaryLight,
    },
    ctaButtonText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 14,
        color: COLORS.white,
    },
});

export default CTA;
