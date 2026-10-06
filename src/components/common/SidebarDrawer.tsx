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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  Delete02Icon,
  Settings01Icon,
  Search01Icon,
  Edit02Icon,
} from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/colors';
import { SIDE_CHATS } from '@/constants/dummyData';
import { SideChatItem } from '@/types';
import { showToast } from '@/context/ToastContext';

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
  onSelectChat: (chatTitle: string) => void;
  /** Callback fired to initiate a clean chat session */
  onNewChat: () => void;
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
  const [sideChats] = useState<SideChatItem[]>(SIDE_CHATS);

  // Filter side chat topics by active search query
  const filteredChats = sideChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


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
              style={styles.mainChatCapsule}
              onPress={() => {
                showToast('Main chat');
                onSelectChat('Main chat');
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

              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => {
                  showToast('Side chats cleared');
                  onClearSideChats?.();
                }}
                activeOpacity={0.7}
                accessibilityLabel="Clear side chats">
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={20}
                  color={Colors.iconMuted}
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            </View>

            {/* Side Chats List */}
            {filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatRow}
                onPress={() => {
                  showToast(chat.title);
                  onSelectChat(chat.title);
                  onClose();
                }}
                activeOpacity={0.7}>
                <Text style={styles.chatRowText} numberOfLines={1}>
                  {chat.title}
                </Text>

                {/* Blue Indicator Dot if unread */}
                {chat.hasUnreadDot && <View style={styles.blueDot} />}
              </TouchableOpacity>
            ))}
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
              onPress={() => {
                showToast('New chat');
                onClose();
                onNewChat();
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
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  chatRowText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.iconDark,
    flex: 1,
    paddingRight: 10,
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
