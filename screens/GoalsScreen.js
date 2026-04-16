import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, TextInput,
} from 'react-native';
import { Trophy, TrendingUp, Plus, X } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { GoalCard } from '../components';
import { addGoal } from '../slices/goalsSlice';

// ── Progress Ring ──────────────────────────────────────────────────────────────
function ProgressRing({ progress, size = 100, color = '#10B981', trackColor = '#374151' }) {
  const stroke = 8;
  const pct = Math.min(Math.max(progress, 0), 1);
  const pctLabel = Math.round(pct * 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: trackColor,
      }} />
      {pct > 0 && (
        <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
          <View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: stroke, borderColor: 'transparent',
            borderTopColor: color,
            borderRightColor: pct > 0.25 ? color : 'transparent',
            borderBottomColor: pct > 0.5 ? color : 'transparent',
            borderLeftColor: pct > 0.75 ? color : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }} />
        </View>
      )}
      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{pctLabel}%</Text>
    </View>
  );
}

// ── Goal types config ──────────────────────────────────────────────────────────
const GOAL_TYPES = [
  { type: 'weekly_hours',      label: 'Weekly Hours',    unit: 'hours',   defaultTarget: 5 },
  { type: 'sessions_per_week', label: 'Sessions / Week', unit: 'sessions', defaultTarget: 3 },
  { type: 'streak_days',       label: 'Streak Days',     unit: 'days',    defaultTarget: 7 },
];

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function GoalsScreen() {
  const dispatch = useDispatch();
  const goals  = useSelector((state) => state.goals.items);
  const hobbies = useSelector((state) => state.hobbies.items);

  const [showForm, setShowForm]       = useState(false);
  const [formHobbyId, setFormHobbyId] = useState('');
  const [formType, setFormType]       = useState(GOAL_TYPES[0].type);
  const [formTarget, setFormTarget]   = useState('');

  const totalGoals     = goals.length;
  const completedGoals = goals.filter((g) => g.current >= g.target).length;
  const consistency    = totalGoals > 0 ? completedGoals / totalGoals : 0;

  const selectedGoalType = GOAL_TYPES.find((t) => t.type === formType) || GOAL_TYPES[0];
  const canSave = formHobbyId && formTarget && Number(formTarget) > 0;

  const handleSave = () => {
    if (!canSave) return;
    dispatch(addGoal({
      hobbyId: formHobbyId,
      type:    formType,
      target:  Number(formTarget),
      unit:    selectedGoalType.unit,
    }));
    setShowForm(false);
    setFormHobbyId('');
    setFormType(GOAL_TYPES[0].type);
    setFormTarget('');
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Your Goals</Text>
          {!showForm && (
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn}>
              <Plus size={16} color="#FFF" />
              <Text style={styles.addBtnText}>New Goal</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Consistency Card */}
        <View style={styles.consistencyCard}>
          <View style={styles.consistencyLeft}>
            <Text style={styles.consistencyTitle}>Consistency</Text>
            <Text style={styles.consistencySubtitle}>You're crushing it this week!</Text>
            <View style={styles.topBadge}>
              <TrendingUp size={12} color="#4ADE80" />
              <Text style={styles.topBadgeText}>Top 10%</Text>
            </View>
          </View>
          <ProgressRing progress={consistency} size={96} color="#10B981" trackColor="#374151" />
        </View>

        {/* ── New Goal Form ────────────────────────────────────────── */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>New Goal</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Hobby picker */}
            <Text style={styles.formLabel}>Hobby</Text>
            <View style={styles.chipWrap}>
              {hobbies.map((hobby) => {
                const selected = formHobbyId === hobby.id;
                return (
                  <TouchableOpacity
                    key={hobby.id}
                    onPress={() => setFormHobbyId(hobby.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? `${hobby.color}20` : '#F3F4F6',
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? `${hobby.color}60` : 'transparent',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 13 }}>{hobby.icon}</Text>
                    <Text style={[styles.chipText, { color: selected ? hobby.color : '#6B7280' }]}>
                      {hobby.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Goal type */}
            <Text style={styles.formLabel}>Goal Type</Text>
            <View style={styles.chipWrap}>
              {GOAL_TYPES.map((gt) => {
                const selected = formType === gt.type;
                return (
                  <TouchableOpacity
                    key={gt.type}
                    onPress={() => {
                      setFormType(gt.type);
                      setFormTarget(String(gt.defaultTarget));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? '#111827' : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : '#6B7280' }]}>
                      {gt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Target value */}
            <Text style={styles.formLabel}>
              Target ({selectedGoalType.unit})
            </Text>
            <View style={styles.targetRow}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setFormTarget(String(Math.max(1, Number(formTarget || 0) - 1)))}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.targetInput}
                value={formTarget}
                onChangeText={(v) => setFormTarget(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder={String(selectedGoalType.defaultTarget)}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setFormTarget(String(Number(formTarget || 0) + 1))}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick presets */}
            <View style={styles.presetRow}>
              {(formType === 'weekly_hours'
                ? [2, 5, 8, 10]
                : formType === 'sessions_per_week'
                  ? [2, 3, 5, 7]
                  : [3, 7, 14, 30]
              ).map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setFormTarget(String(v))}
                  style={[styles.preset, Number(formTarget) === v && styles.presetSelected]}
                >
                  <Text style={[styles.presetText, Number(formTarget) === v && styles.presetTextSelected]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              style={[styles.saveBtn, canSave ? styles.saveBtnActive : styles.saveBtnDisabled]}
            >
              <Text style={styles.saveBtnText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Active Goals ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Trophy size={18} color="#EAB308" />
          <Text style={styles.sectionTitle}>Active Goals</Text>
        </View>

        {goals.map((goal) => {
          const hobby = hobbies.find((h) => h.id === goal.hobbyId);
          if (!hobby) return null;
          return (
            <View key={goal.id} style={styles.goalGroupWrapper}>
              <View style={[styles.colorBar, { backgroundColor: hobby.color }]} />
              <View style={styles.goalGroupContent}>
                <Text style={styles.hobbyLabel}>{hobby.icon} {hobby.name}</Text>
                <GoalCard goal={goal} color={hobby.color} />
              </View>
            </View>
          );
        })}

        {goals.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No active goals yet</Text>
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.emptyBtn}>
              <Plus size={14} color="#FFF" />
              <Text style={styles.emptyBtnText}>Set your first goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },

  // Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  // Consistency card
  consistencyCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  consistencyLeft: { flex: 1, marginRight: 16 },
  consistencyTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  consistencySubtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
    alignSelf: 'flex-start',
  },
  topBadgeText: { fontSize: 11, fontWeight: '700', color: '#4ADE80' },

  // Form card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  formLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  chipText: { fontSize: 12, fontWeight: '500' },

  // Target input row
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 20, fontWeight: '300', color: '#374151', lineHeight: 24 },
  targetInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },

  // Presets
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
  },
  presetSelected: { backgroundColor: '#111827' },
  presetText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  presetTextSelected: { color: '#FFFFFF' },

  // Save button
  saveBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnActive: { backgroundColor: '#111827' },
  saveBtnDisabled: { backgroundColor: '#E5E7EB' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  // Goal items
  goalGroupWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  goalGroupContent: { flex: 1 },
  hobbyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginBottom: 16 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
