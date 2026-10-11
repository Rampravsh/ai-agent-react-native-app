/**
 * SidebarDrawer Component
 *
 * Fullscreen sliding drawer interface providing session management:
 * 1. Top bar: Agent title & right arrow dismissal button
 * 2. Main Chat: Quick jump capsule back to primary conversation
 * 3. Side Chats: Filterable list of parallel conversation threads with unread indicators
 * 4. Bottom Toolbar: Settings gear shortcut, search filter input, and compose new chat button
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  Delete02Icon,
  Settings01Icon,
  Search01Icon,
  Edit02Icon,
} from '@/constants/icons';
import { Colors } from '@/constants/colors';
import { showToast } from '@/context/ToastContext';
import { useChat } from '@/context/ChatContext';

export interface SidebarDrawerProps {
  /** Visibility state of the drawer modal */
  visible: boolean;
  /** Active chat session identifier */
  activeChatId?: string;
  /** Active agent name displayed in drawer header */
  agentName?: string;
  /** Callback fired to close the drawer */
  onClose: () => void;
  /** Callback fired when a conversation item is tapped */
  onSelectChat?: (chatTitle: string) => void;
  /** Callback fired to initiate a clean chat session */
  onNewChat?: () => void;
  /** Callback fired to navigate directly to settings */
  onOpenSettings?: () => void;
  /** Callback fired to clear all side chat topics */
  onClearSideChats?: () => void;
}

/**
 * Slide-in Session History Drawer
 */
export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  activeChatId,
  agentName = 'Cooper',
  onClose,
  onSelectChat,
  onNewChat,
  onOpenSettings,
  onClearSideChats,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    threads,
    activeThread,
    selectThread,
    createNewChat,
    deleteChatById,
    clearAllSideChats,
  } = useChat();

  const mainThread = threads.find((t) => t.type === 'main');
  const sideThreads = threads.filter((t) => t.type === 'side');

  // Filter side chat topics by active search query
  const filteredChats = sideThreads.filter((chat) =>
    (chat.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle single chat deletion with confirmation
  const handleDeleteChat = (threadId: string, title: string) => {
    const performDelete = async () => {
      try {
        await deleteChatById(threadId);
      } catch (err) {
        console.error('SidebarDrawer: Error deleting chat:', err);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete "${title}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Chat',
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // Handle clearing all side chats with confirmation
  const handleClearAll = () => {
    if (sideThreads.length === 0) {
      showToast('No side chats to clear');
      return;
    }

    const performClearAll = async () => {
      try {
        await clearAllSideChats();
        onClearSideChats?.();
      } catch (err) {
        console.error('SidebarDrawer: Error clearing all side chats:', err);
      }
    };

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('Are you sure you want to delete all side chats? This cannot be undone.')
      ) {
        performClearAll();
      }
    } else {
      Alert.alert(
        'Clear Side Chats',
        'Are you sure you want to delete all side chat conversations? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete All', style: 'destructive', onPress: performClearAll },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Fullscreen white sidebar with safe area */}
        <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom', 'left', 'right']}>
          {/* Top Bar: Center Name + Right Arrow Button */}
          <View style={styles.header}>
            <View style={styles.headerSideSpacer} />

            <Text style={styles.headerTitle}>{agentName}</Text>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close sidebar">
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={22}
                color={Colors.iconDark}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </View>

          {/* Main Chat Capsule Button */}
          <View style={styles.mainChatWrapper}>
            <TouchableOpacity
              style={[
                styles.mainChatCapsule,
                activeThread?.type === 'main' && { backgroundColor: Colors.tabActiveBg },
              ]}
              onPress={() => {
                if (mainThread) {
                  selectThread(mainThread.id);
                }
                showToast('Main chat');
                onSelectChat?.('Main chat');
                onClose();
              }}
              activeOpacity={0.8}>
              <Text style={styles.mainChatText}>Main chat</Text>
            </TouchableOpacity>
          </View>

          {/* Thin Divider Line */}
          <View style={styles.divider} />

          {/* Side Chats Section */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>Side chats</Text>

              {sideThreads.length > 0 && (
                <TouchableOpacity
                  style={styles.trashBtn}
                  onPress={handleClearAll}
                  activeOpacity={0.7}
                  accessibilityLabel="Clear side chats">
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={20}
                    color={Colors.iconMuted}
                    strokeWidth={1.8}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Side Chats List */}
            {filteredChats.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? 'No matching conversations'
                    : 'No side chats yet. Tap + to start a new chat.'}
                </Text>
              </View>
            ) : (
              filteredChats.map((chat) => {
                const isActive = activeThread?.id === chat.id;
                return (
                  <View
                    key={chat.id}
                    style={[
                      styles.chatRowContainer,
                      isActive && styles.chatRowContainerActive,
                    ]}>
                    <TouchableOpacity
                      style={styles.chatRowMain}
                      onPress={() => {
                        selectThread(chat.id);
                        showToast(chat.title || 'Chat');
                        onSelectChat?.(chat.title || 'Chat');
                        onClose();
                      }}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.chatRowText,
                          isActive && { fontWeight: '600', color: Colors.iconDark },
                        ]}
                        numberOfLines={1}>
                        {chat.title || 'New Chat'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.chatDeleteBtn}
                      onPress={() => handleDeleteChat(chat.id, chat.title || 'Chat')}
                      activeOpacity={0.5}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={`Delete ${chat.title || 'chat'}`}>
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={17}
                        color={Colors.iconMuted}
                        strokeWidth={1.7}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Bottom Toolbar: Settings Gear (Left) + Search (Center) + Compose (Right) */}
          <View style={styles.bottomToolbar}>
            {/* Settings Gear Button */}
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => {
                showToast('Settings');
                onClose();
                onOpenSettings?.();
              }}
              activeOpacity={0.7}
              accessibilityLabel="Settings">
              <HugeiconsIcon
                icon={Settings01Icon}
                size={22}
                color={Colors.iconDark}
                strokeWidth={2}
              />
            </TouchableOpacity>

            {/* Search Capsule Input */}
            <View style={styles.searchCapsule}>
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                color={Colors.iconMuted}
                strokeWidth={2}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={Colors.iconMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* New Chat Compose Button */}
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={async () => {
                onClose();
                await createNewChat();
                onNewChat?.();
              }}
              activeOpacity={0.7}
              accessibilityLabel="New chat">
              <HugeiconsIcon
                icon={Edit02Icon}
                size={20}
                color={Colors.iconDark}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerSideSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.iconDark,
    letterSpacing: -0.2,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F2',
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  mainChatWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  mainChatCapsule: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.tabActiveBg, // #E6E8EA
    borderRadius: 27,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainChatText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.iconDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    width: '100%',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.iconMuted, // #8E8E93 / #9E9E9E
  },
  trashBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.iconMuted,
    textAlign: 'center',
  },
  chatRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  chatRowContainerActive: {
    backgroundColor: '#F0F2F5',
  },
  chatRowMain: {
    flex: 1,
    paddingVertical: 6,
    paddingRight: 8,
  },
  chatRowText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.iconDark,
  },
  chatDeleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066FF',
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: Colors.white,
  },
  searchCapsule: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.iconDark,
    paddingVertical: 0,
  },
});

export default SidebarDrawer;
