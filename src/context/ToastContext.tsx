/**
 * Toast Context & Provider
 *
 * Provides a simple, universal, lightweight toast notification system
 * across iOS, Android, and Web without complex setup.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

// Standalone global trigger support
let globalToastHandler: ((message: string, duration?: number) => void) | null = null;

export const showToast = (message: string, duration?: number) => {
  if (globalToastHandler) {
    globalToastHandler(message, duration);
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = useCallback((message: string, duration = 2000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToastMessage(message);
    setVisible(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -15,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }, duration);
  }, [fadeAnim, translateYAnim]);

  // Connect global handler
  React.useEffect(() => {
    globalToastHandler = triggerToast;
    return () => {
      globalToastHandler = null;
    };
  }, [triggerToast]);

  return (
    <ToastContext.Provider value={{ showToast: triggerToast }}>
      {children}
      {visible && (
        <View pointerEvents="none" style={styles.toastWrapper}>
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}>
            <View style={styles.indicatorDot} />
            <Text style={styles.toastText} numberOfLines={2}>
              {toastMessage}
            </Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2022',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    maxWidth: '85%',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2563EB',
  },
  toastText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.1,
  },
});
