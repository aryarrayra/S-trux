import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { MILESTONES } from '@/constants/data';

const Milestones = () => (
    <View style={styles.section}>
        {MILESTONES.map((item, index) => (
            <View key={index} style={styles.milestoneCard}>
                <Text style={styles.milestoneValue}>{item.value}</Text>
                <Text style={styles.milestoneLabel}>{item.label}</Text>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    section: {
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        backgroundColor: COLORS.darkGray,
    },
    milestoneCard: {
        width: 268,
        height: 127,
        backgroundColor: COLORS.cardBackground,
        borderWidth: 0.3,
        borderColor: COLORS.primaryLight,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    milestoneValue: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 36,
        color: COLORS.primary,
    },
    milestoneLabel: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: COLORS.white,
        marginTop: 5,
    },
});

export default Milestones;
