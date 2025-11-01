import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface SectionTitleProps {
    title: React.ReactNode;
    subtitle: string;
    centered?: boolean;
}

const SectionTitle = ({ title, subtitle, centered = true }: SectionTitleProps) => (
  <View style={{ alignItems: centered ? 'center' : 'flex-start', marginVertical: 20 }}>
    <Text style={[styles.sectionTitle, !centered && {textAlign: 'left'}]}>{title}</Text>
    <Text style={[styles.sectionSubtitle, !centered && {textAlign: 'left'}]}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
    sectionTitle: {
        fontFamily: 'Helvetica',
        fontWeight: '400',
        fontSize: 32,
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionSubtitle: {
        fontFamily: 'Helvetica',
        fontSize: 16,
        color: COLORS.lightGray,
        textAlign: 'center',
        maxWidth: 715,
        lineHeight: 22,
    },
});

export default SectionTitle;
