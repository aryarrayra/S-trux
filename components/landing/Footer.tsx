import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';

const Footer = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <View style={styles.footer}>
            <View style={[styles.footerContent, isMobile && styles.mobileFooterContent]}>
                <View style={[styles.footerLeft, isMobile && styles.mobileFooterLeft]}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>ST</Text>
                        </View>
                        <Text style={styles.headerLogoBrand}>S`Trux</Text>
                    </View>
                    <Text style={styles.footerDescription}>Solusi penyewaan alat berat terpercaya untuk mendukung kesuksesan proyek konstruksi Anda</Text>
                    <View style={styles.socialIcons}>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Facebook color={COLORS.lightGray} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Instagram color={COLORS.lightGray} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.footerRight, isMobile && styles.mobileFooterRight]}>
                    <View style={styles.footerContactItem}>
                        <MapPin color={COLORS.primary} size={18} />
                        <Text style={styles.footerContactText}>Jl. Merdeka No. 123, Jakarta</Text>
                    </View>
                    <View style={styles.footerContactItem}>
                        <Phone color={COLORS.primary} size={18} />
                        <Text style={styles.footerContactText}>+62 812 3456 7890</Text>
                    </View>
                    <View style={styles.footerContactItem}>
                        <Mail color={COLORS.primary} size={18} />
                        <Text style={styles.footerContactText}>contact@strux.com</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        paddingVertical: 60,
        paddingHorizontal: 40,
        backgroundColor: COLORS.cardGradientEnd,
        alignItems: 'center',
    },
    footerContent: {
        width: '100%',
        maxWidth: 1200,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    mobileFooterContent: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 40,
    },
    footerLeft: {
        maxWidth: 250,
        alignItems: 'flex-start',
    },
    mobileFooterLeft: {
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        color: COLORS.darkGray,
    },
    headerLogoBrand: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        color: COLORS.white,
    },
    footerDescription: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 11,
        color: COLORS.white,
        textAlign: 'left',
        marginTop: 15,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    socialIcon: {
        width: 30,
        height: 30,
        borderRadius: 4,
        backgroundColor: COLORS.footerText,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerRight: {
        alignItems: 'flex-start',
        gap: 15,
    },
    mobileFooterRight: {
        alignItems: 'center',
    },
    footerContactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    footerContactText: {
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: COLORS.white,
    }
});

export default Footer;
