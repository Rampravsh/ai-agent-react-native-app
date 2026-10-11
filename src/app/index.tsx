/**
 * Sign In Screen Route ('/')
 *
 * All-in-one onboarding & Google Sign-in screen:
 * - Center: Glowing blue Muse AI brand emblem hero
 * - Bottom: Full-width Google Sign-in action button with SVG brand mark & press feedback
 */

import { Colors } from '@/constants/colors';
import { supabase } from "@/lib/supabase";
import { AiSparklesIcon } from '@/constants/icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

/**
 * 4-Color Official Google Brand SVG Icon
 */
const GoogleBrandIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

import { AnimatedSplashScreen } from '@/components/common';

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasSession(true);
        // Instant redirect without blocking navigation on network sync
        router.replace('/(tabs)/chat');
        const email = data.session.user.email;
        if (email) {
          (async () => {
            try {
              await supabase.from('user').upsert({
                email,
                name: data.session.user.user_metadata?.name ?? email.split('@')[0],
              }, { onConflict: 'email' });
            } catch (_) {}
          })();
        }
      } else {
        // User is not signed in
        setHasSession(false);
      }
    }).catch(() => {
      setHasSession(false);
    });
  }, [router]);

  const handleGoogleSignIn = async () => {
    const redirectTo = Linking.createURL('auth/callback')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true
      }
    })

    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo)

    if (result.type !== "success") return null

    const params = new URLSearchParams(result.url.split("#")[1])
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (!accessToken || !refreshToken) return null
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (sessionError) throw sessionError

    if (sessionData.session) {
      const email = sessionData.session.user.email;
      if (email) {
        await supabase
          .from("user")
          .upsert({
            email,
            name: sessionData.session.user.user_metadata?.name ?? email.split('@')[0],
          }, { onConflict: 'email' });
      }
      router.replace('/(tabs)/chat')
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        {/* Center Hero: Muse AI Brand Emblem & Wordmark */}
        <View style={styles.logoWrapper}>
          {/* Ambient Glow Halo */}
          <View style={styles.glowRing} />

          {/* Elevated Circular Emblem */}
          <View style={styles.iconContainer}>
            <HugeiconsIcon
              icon={AiSparklesIcon}
              size={40}
              color={Colors.white}
              strokeWidth={1.75}
            />
          </View>

          {/* Brand Wordmark */}
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Muse</Text>
            <Text style={styles.aiText}> AI</Text>
          </View>
        </View>

        {/* Bottom Action: Google Sign-In Button */}
        <View style={styles.actionContainer}>
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google">
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={styles.buttonContent}>
                <View style={styles.iconWrapper}>
                  <GoogleBrandIcon size={22} />
                </View>
                <Text style={styles.buttonText}>Sign in with Google</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>

      {/* Seamless Animated Splash Overlay */}
      {showSplash && (
        <AnimatedSplashScreen
          isReady={hasSession === false}
          onAnimationComplete={() => setShowSplash(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    top: -10,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.primaryGlow,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  aiText: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.6,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    height: 54,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonPressed: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderFocus,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
});
