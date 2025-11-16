// components/Toast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

type ToastProps = {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
  onHide: () => void;
  duration?: number;
};

export const Toast: React.FC<ToastProps> = ({ 
  visible, 
  message, 
  type, 
  onHide, 
  duration = 3000 
}) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'warning':
        return styles.warningToast;
      default:
        return styles.successToast;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color="#fff" size={24} />;
      case 'error':
        return <XCircle color="#fff" size={24} />;
      case 'warning':
        return <AlertCircle color="#fff" size={24} />;
      default:
        return <CheckCircle color="#fff" size={24} />;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.toastContainer,
        getToastStyle(),
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        {getIcon()}
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  successToast: {
    backgroundColor: '#10B981',
  },
  errorToast: {
    backgroundColor: '#EF4444',
  },
  warningToast: {
    backgroundColor: '#F59E0B',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastText: {
    color: '#fff',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    flex: 1,
  },
});