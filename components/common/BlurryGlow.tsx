import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';

interface BlurryGlowProps {
  style?: object;
  color?: string;
}

const BlurryGlow = ({ style, color = COLORS.primary }: BlurryGlowProps) => {
  return (
    <View style={[styles.container, style]}>
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient
            id="grad"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 800,
    height: 800,
    opacity: 0.6,
  },
});

export default BlurryGlow;
