/**
 * AnimatedSplashScreen.tsx
 *
 * Visually engaging animated splash screen for Android & iOS:
 * - Uses core design tokens from `src/constants/colors.ts`
 * - Staged choreographed entrance: Emblem spring -> Aura glow pulse -> Wordmark float
 * - Density and screen size responsive (compact phones to tablets)
 * - Smooth fade out transition to main interface with zero white-flash
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { AiSparklesIcon } from '@/constants/icons';
import { Colors } from '@/constants/colors';

// Prevent native splash screen from hiding prematurely
SplashScreen.preventAutoHideAsync().catch(() => {});

export interface AnimatedSplashScreenProps {
  /** Optional callback fired when the splash sequence and exit animation complete */
  onAnimationComplete?: () => void;
  /** When true, begins the smooth exit hand-off transition */
  isReady?: boolean;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
  isReady = true,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  // Shared Animation Values
  const emblemScale = useSharedValue(0.3);
  const emblemOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(22);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Hide static native splash to reveal the animated canvas
    SplashScreen.hideAsync().catch(() => {});

    // 2. Emblem Spring Reveal
    emblemOpacity.value = withTiming(1, { duration: 180 });
    emblemScale.value = withSpring(1, { damping: 13, stiffness: 160 });

    // 3. Glow Ring Pulse
    glowOpacity.value = withDelay(100, withTiming(0.18, { duration: 350 }));
    glowScale.value = withDelay(100, withSpring(1, { damping: 14, stiffness: 120 }));

    // 4. Wordmark Slide & Reveal
    textTranslateY.value = withDelay(
      240,
      withTiming(0, {
        duration: 380,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      })
    );
    textOpacity.value = withDelay(240, withTiming(1, { duration: 380 }));
  }, []);

  // 5. Exit Transition to main interface when ready
  useEffect(() => {
    if (isReady) {
      const exitDelay = 900;
      containerOpacity.value = withDelay(
        exitDelay,
        withTiming(
          0,
          {
            duration: 250,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          },
          (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          }
        )
      );
    }
  }, [isReady, onAnimationComplete]);

  const emblemAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emblemScale.value }],
    opacity: emblemOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: textOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const emblemSize = isCompact ? 68 : 80;
  const glowSize = isCompact ? 120 : 144;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.contentCenter}>
        {/* Ambient Halo Glow */}
        <Animated.View
          style={[
            styles.glowRing,
            { width: glowSize, height: glowSize, borderRadius: glowSize / 2 },
            glowAnimatedStyle,
          ]}
        />

        {/* Core Blue Brand Emblem */}
        <Animated.View
          style={[
            styles.emblem,
            { width: emblemSize, height: emblemSize, borderRadius: emblemSize / 2 },
            emblemAnimatedStyle,
          ]}
        >
          <HugeiconsIcon
            icon={AiSparklesIcon}
            size={isCompact ? 34 : 42}
            color={Colors.white}
            strokeWidth={1.8}
          />
        </Animated.View>

        {/* Brand Wordmark and Subtitle */}
        <Animated.View style={[styles.textWrapper, textAnimatedStyle]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Muse</Text>
            <Text style={styles.brandAccent}> AI</Text>
          </View>
          <Text style={styles.brandSubtitle}>Autonomous Companion</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.white,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -24 }], // Optical vertical balance
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  emblem: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  textWrapper: {
    marginTop: 22,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.iconDark,
    letterSpacing: -0.6,
  },
  brandAccent: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
});

export default AnimatedSplashScreen;
