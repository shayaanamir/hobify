import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, CheckCircle2, Trash2 } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export function GoalCard({ goal, color = '#3B82F6', onDelete }) {
  if (!goal) return null;
  
  const progress = Math.min(goal.current / goal.target, 1);
  const percentage = Math.round(progress * 100);
  const isCompleted = progress >= 1;

  let goalTypeLabel = 'Goal';
  if (goal.type === 'weekly_hours') goalTypeLabel = 'Weekly Hours';
  if (goal.type === 'sessions_per_week') goalTypeLabel = 'Weekly Sessions';
  if (goal.type === 'streak_days') goalTypeLabel = 'Streak Goal';
  if (goal.type === 'completed_items_per_week') goalTypeLabel = 'Items Completed';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, isCompleted ? styles.iconCompleted : styles.iconPending]}>
            {isCompleted ? (
              <CheckCircle2 size={16} color="#16A34A" />
            ) : (
              <Target size={16} color="#6B7280" />
            )}
          </View>
          <Text style={styles.title}>{goalTypeLabel}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={styles.progressText}>
            {goal.current} / {goal.target} {goal.unit}
          </Text>
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(goal.id)} style={styles.deleteBtn}>
              <Trash2 size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${percentage}%`, backgroundColor: isCompleted ? '#22C55E' : color }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
  },
  iconCompleted: {
    backgroundColor: '#DCFCE7',
  },
  iconPending: {
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  }
});
