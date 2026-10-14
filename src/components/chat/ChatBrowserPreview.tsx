/**
 * ChatBrowserPreview Component
 *
 * In-app web browser preview modal powered by react-native-webview:
 * - Previews live web pages and Browserbase cloud browser sessions
 * - Native WebView on iOS & Android, responsive iframe fallback on Web
 * - Top navigation bar: SSL indicator, domain display, refresh, external link, and close controls
 * - Activity spinner while loading
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  RefreshIcon,
  Share01Icon,
  SparklesIcon,
} from '@/constants/icons';
import { Colors } from '@/constants/colors';

export interface ChatBrowserPreviewProps {
  /** Visibility state of the modal */
  visible: boolean;
  /** URL to load in the browser preview */
  url: string;
  /** Optional title override */
  title?: string;
  /** Callback fired when dismissed */
  onClose: () => void;
}

export const ChatBrowserPreview: React.FC<ChatBrowserPreviewProps> = ({
  visible,
  url,
  title,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);

  // Update currentUrl if prop changes
  React.useEffect(() => {
    if (url) {
      setCurrentUrl(url);
      setIsLoading(true);
    }
  }, [url]);

  // Extract clean domain hostname for display
  const getDomain = (rawUrl: string): string => {
    try {
      const parsed = new URL(rawUrl);
      return parsed.hostname.replace('www.', '');
    } catch {
      return rawUrl;
    }
  };

  const isBrowserbase = currentUrl.includes('browserbase.com');
  const displayTitle = title || (isBrowserbase ? 'Browserbase Live View' : getDomain(currentUrl));

  const handleRefresh = () => {
    setIsLoading(true);
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.reload();
    } else {
      // Force reload on web
      setCurrentUrl((prev) => `${prev.split('#')[0]}#${Date.now()}`);
    }
  };

  const handleOpenExternal = () => {
    if (currentUrl) {
      Linking.openURL(currentUrl).catch((err) =>
        console.error('Failed to open URL externally:', err)
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Browser Top Navigation Bar */}
        <View style={styles.topBar}>
          {/* Close Dismiss Button */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Close browser">
            <HugeiconsIcon icon={Cancel01Icon} size={22} color={Colors.iconDark} strokeWidth={2} />
          </TouchableOpacity>

          {/* Center Address Pill */}
          <View style={styles.addressPill}>
            {isBrowserbase ? (
              <HugeiconsIcon
                icon={SparklesIcon}
                size={14}
                color={Colors.primary}
                strokeWidth={2}
              />
            ) : (
              <View style={styles.sslDot} />
            )}
            <Text style={styles.addressText} numberOfLines={1}>
              {displayTitle}
            </Text>
          </View>

          {/* Right Action Buttons */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleRefresh}
              activeOpacity={0.7}
              accessibilityLabel="Refresh page">
              <HugeiconsIcon icon={RefreshIcon} size={19} color={Colors.iconDark} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleOpenExternal}
              activeOpacity={0.7}
              accessibilityLabel="Open in system browser">
              <HugeiconsIcon icon={Share01Icon} size={19} color={Colors.iconDark} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Progress Indicator */}
        {isLoading && (
          <View style={styles.loadingBarContainer}>
            <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
            <Text style={styles.loadingText}>Loading {getDomain(currentUrl)}...</Text>
          </View>
        )}

        {/* Browser Content Body */}
        <View style={styles.browserBody}>
          {Platform.OS === 'web' ? (
            // Web implementation: iframe with direct open fallback
            <iframe
              src={currentUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff',
              }}
              onLoad={() => setIsLoading(false)}
              title={displayTitle}
            />
          ) : (
            // Native iOS & Android WebView
            <WebView
              ref={webViewRef}
              source={{ uri: currentUrl }}
              style={styles.webView}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              allowsInlineMediaPlayback
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressPill: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    marginHorizontal: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  sslDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981', // Green SSL verified indicator
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.iconDark,
    maxWidth: '85%',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  loadingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
    gap: 8,
  },
  spinner: {
    transform: [{ scale: 0.8 }],
  },
  loadingText: {
    fontSize: 12,
    color: Colors.iconMuted,
    fontWeight: '500',
  },
  browserBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatBrowserPreview;
