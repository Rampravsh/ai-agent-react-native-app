/**
 * Settings Tab Screen ('/(tabs)/settings')
 *
 * Clean settings & account management:
 * - Free Plan progress card
 * - Settings items (Connectors, Pricing, Notifications, Appearance, Help & Feedback, Sign Out)
 * - Simple on-click Toast triggers without complex modal logic
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Grid02Icon,
  Tag01Icon,
  Notification01Icon,
  PaintBrush01Icon,
  ArrowRight01Icon,
  HelpCircleIcon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/colors';
import { SETTINGS_PLAN_DATA } from '@/constants/dummyData';
import { showToast } from '@/context/ToastContext';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* 1. Free Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeaderRow}>
            <Text style={styles.planTitle}>{SETTINGS_PLAN_DATA.planName}</Text>
            <Text style={styles.planUsageText}>{SETTINGS_PLAN_DATA.percentUsed}% used</Text>
          </View>
          <Text style={styles.planResetText}>{SETTINGS_PLAN_DATA.resetText}</Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${SETTINGS_PLAN_DATA.percentUsed}%` },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => showToast('Upgrade to Pro')}
            activeOpacity={0.7}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Primary Group: Connectors & Pricing */}
        <View style={styles.groupCard}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => showToast('Connectors')}
            activeOpacity={0.65}>
            <View style={styles.listIconCol}>
              <HugeiconsIcon icon={Grid02Icon} size={22} color={Colors.iconDark} strokeWidth={2} />
            </View>
            <Text style={styles.listLabel}>Connectors</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={Colors.iconMuted} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => showToast('Pricing & Plans')}
            activeOpacity={0.65}>
            <View style={styles.listIconCol}>
              <HugeiconsIcon icon={Tag01Icon} size={22} color={Colors.iconDark} strokeWidth={2} />
            </View>
            <Text style={styles.listLabel}>Pricing</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={Colors.iconMuted} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* 3. Secondary Group: Preferences & Support */}
        <View style={styles.groupCard}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => showToast('Notifications')}
            activeOpacity={0.65}>
            <View style={styles.listIconCol}>
              <HugeiconsIcon icon={Notification01Icon} size={22} color={Colors.iconDark} strokeWidth={2} />
            </View>
            <Text style={styles.listLabel}>Notifications</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={Colors.iconMuted} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => showToast('Appearance')}
            activeOpacity={0.65}>
            <View style={styles.listIconCol}>
              <HugeiconsIcon icon={PaintBrush01Icon} size={22} color={Colors.iconDark} strokeWidth={2} />
            </View>
            <Text style={styles.listLabel}>Appearance</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={Colors.iconMuted} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => showToast('Help & Feedback')}
            activeOpacity={0.65}>
            <View style={styles.listIconCol}>
              <HugeiconsIcon icon={HelpCircleIcon} size={22} color={Colors.iconDark} strokeWidth={2} />
            </View>
            <Text style={styles.listLabel}>Help & Feedback</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={Colors.iconMuted} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => showToast('Signed Out')}
            activeOpacity={0.65}>
            <View style={styles.listIconCol}>
              <HugeiconsIcon icon={Logout01Icon} size={22} color={Colors.error} strokeWidth={2} />
            </View>
            <Text style={[styles.listLabel, { color: Colors.error }]}>Sign Out</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={Colors.iconMuted} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.iconDark,
    letterSpacing: -0.5,
  },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FAFAFB',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF0',
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.iconDark,
    letterSpacing: -0.2,
  },
  planUsageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0066FF',
  },
  planResetText: {
    fontSize: 12.5,
    color: '#707070',
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E6E8EA',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 3,
  },
  upgradeBtn: {
    alignSelf: 'flex-start',
  },
  upgradeBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0066FF',
  },
  groupCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FAFAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEEF0',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  listIconCol: {
    width: 32,
    alignItems: 'flex-start',
  },
  listLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.iconDark,
    letterSpacing: -0.2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginLeft: 48,
  },
});
