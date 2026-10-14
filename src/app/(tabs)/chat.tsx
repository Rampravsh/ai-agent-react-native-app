/**
 * Chat Tab Screen ('/(tabs)/chat')
 *
 * Minimalist, clean conversational companion UI:
 * - Scrollable message thread
 * - Floating prompt bar (+ attachment, input box, voice mic, send action)
 * - Simple on-click Toast triggers
 */

import { Colors } from '@/constants/colors';
import {
  Add01Icon,
  Mic01Icon,
  SentIcon,
  ArrowRight01Icon,
  SparklesIcon,
} from '@/constants/icons';
import { showToast } from '@/context/ToastContext';
import { useChat } from '@/context/ChatContext';
import { ChatBrowserPreview } from '@/components/chat/ChatBrowserPreview';
import { MarkdownMessage } from '@/components/chat/MarkdownMessage';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { messages, isLoading, isFetchingMessages, sendMessage, activeThread } = useChat();
  const [inputText, setInputText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const handleOpenPreview = (url: string) => {
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const extractUrl = (text: string): string | null => {
    const match = text.match(/https?:\/\/[^\s"'<>)]+/i);
    return match ? match[0] : null;
  };

  // Calculate header height offset for iOS KeyboardAvoidingView (SafeAreaView top + AppHeader height)
  const headerOffset = Platform.OS === 'ios' ? insets.top + 98 : 0;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => sub.remove();
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await sendMessage(text);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerOffset}>
      <View style={styles.content}>
        {/* Scrollable Messages Thread */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.scrollInner}>
              {/* Centered Date Badge */}
              <View style={styles.dateBadgeContainer}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>Today</Text>
                </View>
              </View>

              {/* Loading historical messages from Supabase */}
              {isFetchingMessages && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.iconMuted} />
                  <Text style={styles.loadingHistoryText}>Loading conversation...</Text>
                </View>
              )}

              {/* Empty state greeting */}
              {!isFetchingMessages && messages.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyGreetingTitle}>
                    {activeThread?.title || 'How can Cooper help?'}
                  </Text>
                  <Text style={styles.emptyGreetingSubtitle}>
                    Ask anything or share a task. Every conversation is automatically saved.
                  </Text>
                </View>
              )}

              {/* Messages */}
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const detectedUrl = extractUrl(msg.text);
                const isBrowserbase = detectedUrl?.includes('browserbase.com');
                const isStreamingPlaceholder = msg.isStreaming && !msg.text;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.userMessageRow : styles.agentMessageRow,
                    ]}>
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.agentBubble,
                      ]}>
                      {isStreamingPlaceholder ? (
                        <View style={styles.streamingIndicatorRow}>
                          <ActivityIndicator
                            size="small"
                            color={Colors.primary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.streamingStatusText}>
                            {msg.statusMessage || 'Cooper is thinking...'}
                          </Text>
                        </View>
                      ) : (
                        <>
                          {Boolean(msg.statusMessage) && (
                            <View style={styles.liveActivityBadge}>
                              <ActivityIndicator
                                size="small"
                                color={Colors.primary}
                                style={styles.liveActivitySpinner}
                              />
                              <Text style={styles.liveActivityText} numberOfLines={1}>
                                {msg.statusMessage}
                              </Text>
                            </View>
                          )}
                          <MarkdownMessage
                            content={msg.text}
                            isUser={isUser}
                            onLinkPress={handleOpenPreview}
                            isStreaming={msg.isStreaming}
                          />
                        </>
                      )}

                      {/* In-App Browserbase / Web Preview Badge */}
                      {detectedUrl && !isUser && !isStreamingPlaceholder && (
                        <TouchableOpacity
                          style={styles.browserPreviewBadge}
                          onPress={() => handleOpenPreview(detectedUrl)}
                          activeOpacity={0.8}>
                          <View style={styles.browserBadgeLeft}>
                            <HugeiconsIcon
                              icon={SparklesIcon}
                              size={14}
                              color={Colors.primary}
                              strokeWidth={2}
                            />
                            <Text style={styles.browserBadgeText} numberOfLines={1}>
                              {isBrowserbase
                                ? 'Watch Cloud Browser Live'
                                : 'In-App Web Preview'}
                            </Text>
                          </View>
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            size={14}
                            color={Colors.primary}
                            strokeWidth={2.2}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Fallback loading bubble if no streaming message is in list */}
              {isLoading && !messages.some((m) => m.isStreaming) && (
                <View style={[styles.messageRow, styles.agentMessageRow]}>
                  <View style={[styles.bubble, styles.agentBubble, styles.loadingBubble]}>
                    <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingSpinner} />
                    <Text style={[styles.bubbleText, styles.agentBubbleText]}>Cooper is thinking...</Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Floating Input Pill */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputBar}>
            {/* Plus Attach Button */}
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => showToast('Attach file')}
              activeOpacity={0.7}>
              <HugeiconsIcon icon={Add01Icon} size={20} color={Colors.iconDark} strokeWidth={2.2} />
            </TouchableOpacity>

            {/* Prompt Text Input */}
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoading}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              placeholder={activeThread?.title ? `Message in ${activeThread.title}` : 'Message Cooper...'}
              placeholderTextColor={Colors.iconMuted}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />

            {/* Right Action: Loading Indicator, Send, or Voice */}
            {isLoading ? (
              <View style={[styles.circleBtn, styles.sendBtn, styles.disabledBtn]}>
                <ActivityIndicator size="small" color={Colors.white} />
              </View>
            ) : inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={[styles.circleBtn, styles.sendBtn]}
                onPress={handleSend}
                activeOpacity={0.8}>
                <HugeiconsIcon icon={SentIcon} size={18} color={Colors.white} strokeWidth={2.4} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => showToast('Voice input')}
                activeOpacity={0.7}>
                <HugeiconsIcon icon={Mic01Icon} size={20} color={Colors.iconDark} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* In-app Browserbase & Webview Preview Modal */}
        {previewUrl && (
          <ChatBrowserPreview
            visible={isPreviewOpen}
            url={previewUrl}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  scrollInner: {
    flexGrow: 1,
  },
  dateBadgeContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  dateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  messageRow: {
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  agentMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.chatBubbleUser,
    borderBottomRightRadius: 6,
  },
  agentBubble: {
    backgroundColor: Colors.chatBubbleAi,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 15.5,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  userBubbleText: {
    color: '#3B2318',
    fontWeight: '500',
  },
  agentBubbleText: {
    color: Colors.iconDark,
    fontWeight: '400',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    paddingTop: 6,
    backgroundColor: Colors.white,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 26,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ECEEF0',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    backgroundColor: Colors.iconDark,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.iconDark,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingHistoryText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.iconMuted,
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGreetingTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.iconDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyGreetingSubtitle: {
    fontSize: 14,
    color: Colors.iconMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  browserPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      },
    }),
  },
  browserBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  browserBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  streamingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  streamingStatusText: {
    fontSize: 14.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  liveActivityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  liveActivitySpinner: {
    transform: [{ scale: 0.65 }],
    marginRight: 4,
  },
  liveActivityText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});

