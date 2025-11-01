import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { FLEET } from '@/constants/data';
import FleetCard from './FleetCard';
import SectionTitle from './SectionTitle';

const Fleet = () => (
    <View style={styles.section}>
        <TouchableOpacity style={styles.tagButton}>
            <Text style={styles.tagButtonText}>Armada Kami</Text>
        </TouchableOpacity>
        <SectionTitle
            title="Pilihan Alat Berat Untuk Anda"
            subtitle="Dari excavator hingga tower crane, kami menyediakan berbagai jenis alat berat dengan kondisi prima untuk mendukung kesuksesan proyek konstruksi Anda"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fleetScroll}>
            {FLEET.map((item, index) => (
                <FleetCard key={index} item={item} />
            ))}
        </ScrollView>
    </View>
);

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
    fleetScroll: {
        paddingVertical: 20,
        gap: 20,
    },
});

export default Fleet;
