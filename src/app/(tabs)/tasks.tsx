/**
 * Tasks Tab Screen ('/(tabs)/tasks')
 *
 * Minimalist Autonomous Agent Scheduler & Goal Manager:
 * - Simple, clean UI displaying scheduled routines and goals
 * - On-click triggers simple Toast notifications
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Target01Icon,
  Clock01Icon,
  PlayIcon,
} from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/colors';
import { TASK_GOALS } from '@/constants/dummyData';
import { TaskGoalItem } from '@/types';
import { showToast } from '@/context/ToastContext';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<TaskGoalItem[]>(TASK_GOALS);

  const handleToggle = (id: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t))
    );
    showToast(`${title} status updated`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page Title & "+ New" Button */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Scheduled Agents & Goals</Text>
          <TouchableOpacity
            style={styles.newGoalBtn}
            onPress={() => showToast('Create New Goal')}
            activeOpacity={0.8}>
            <HugeiconsIcon icon={Add01Icon} size={15} color={Colors.white} strokeWidth={2.4} />
            <Text style={styles.newGoalText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Task Rows */}
        {tasks.map((task, index) => {
          const isActive = task.status === 'active';

          return (
            <View key={task.id}>
              <TouchableOpacity
                style={styles.taskRow}
                onPress={() => showToast(task.title)}
                activeOpacity={0.75}>
                {/* Left Target Icon Badge */}
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: isActive ? Colors.primarySubtle : Colors.surfaceMuted },
                  ]}>
                  <HugeiconsIcon
                    icon={Target01Icon}
                    size={20}
                    color={isActive ? Colors.primary : Colors.textMuted}
                    strokeWidth={2}
                  />
                </View>

                {/* Center Content */}
                <View style={styles.textContainer}>
                  <Text style={[styles.taskTitle, !isActive && styles.pausedText]}>
                    {task.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.scheduleItem}>
                      <HugeiconsIcon icon={Clock01Icon} size={12} color={Colors.textMuted} />
                      <Text style={styles.taskSchedule}>{task.schedule}</Text>
                    </View>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.executionsText}>{task.runsCount} runs</Text>
                  </View>
                </View>

                {/* Right Controls: Switch & Run Button */}
                <View style={styles.actionsCol}>
                  <Switch
                    value={isActive}
                    onValueChange={() => handleToggle(task.id, task.title)}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={isActive ? Colors.primary : Colors.surfaceMuted}
                  />

                  <TouchableOpacity
                    style={styles.runManualBtn}
                    onPress={() => showToast(`Running ${task.title}`)}
                    activeOpacity={0.75}>
                    <HugeiconsIcon
                      icon={PlayIcon}
                      size={12}
                      color={Colors.primary}
                      strokeWidth={2.4}
                    />
                    <Text style={styles.runManualText}>Run</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {index < tasks.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.iconDark,
    letterSpacing: -0.5,
    flex: 1,
    paddingRight: 12,
  },
  newGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  newGoalText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.iconDark,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  pausedText: {
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskSchedule: {
    fontSize: 13,
    color: '#707070',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  metaDot: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  executionsText: {
    fontSize: 13,
    color: '#707070',
    fontWeight: '500',
  },
  actionsCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  runManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  runManualText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginHorizontal: 20,
  },
});
