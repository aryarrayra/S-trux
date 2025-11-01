import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';

type Feature = {
    icon: React.ElementType;
    text: string;
};

type FleetItem = {
    name: string;
    category: string;
    image: string;
    features: Feature[];
    price: string;
};

interface FleetCardProps {
    item: FleetItem;
}

const FleetCard = ({ item }: FleetCardProps) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <View style={[styles.fleetCard, isMobile && { width: width * 0.85, height: 'auto' }]}>
            <Image source={{uri: item.image}} style={styles.fleetImage} />
            <LinearGradient colors={['transparent', 'rgba(15,14,14,1)']} style={StyleSheet.absoluteFill} />
            <View style={styles.fleetCardContent}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View>
                        <Text style={styles.fleetTitle}>{item.name}</Text>
                        <Text style={styles.fleetCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.availableTag}>
                        <Text style={styles.availableTagText}>Tersedia</Text>
                    </View>
                </View>
                <View style={styles.fleetFeatures}>
                    {item.features.map((feature, fIndex) => (
                        <View key={fIndex} style={styles.featureItem}>
                            <feature.icon color={COLORS.primaryLight} size={12} />
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.fleetFooter}>
                    <View>
                        <Text style={styles.priceLabel}>Harga Sewa</Text>
                        <Text style={styles.priceValue}>{item.price}</Text>
                    </View>
                    <TouchableOpacity style={styles.detailButton}>
                        <Text style={styles.detailButtonText}>Detail</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fleetCard: {
        width: 406,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 22,
        borderWidth: 0.3,
        borderColor: COLORS.primaryLight,
        overflow: 'hidden',
    },
    fleetImage: {
        width: '100%',
        height: 268,
    },
    fleetCardContent: {
        padding: 20,
        flex: 1,
        justifyContent: 'space-between',
    },
    availableTag: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 13,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    availableTagText: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: COLORS.black,
    },
    fleetTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 13,
        color: COLORS.white,
    },
    fleetCategory: {
        fontFamily: 'Helvetica',
        fontSize: 13,
        color: COLORS.primary,
        marginTop: 4,
    },
    fleetFeatures: {
        marginTop: 20,
        gap: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: COLORS.white,
    },
    fleetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: COLORS.primaryLight,
        paddingTop: 15,
        marginTop: 15,
    },
    priceLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 12,
        color: COLORS.primary,
    },
    priceValue: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: COLORS.white,
        marginTop: 4,
    },
    detailButton: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    detailButtonText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 12,
        color: COLORS.black,
    },
});

export default FleetCard;
