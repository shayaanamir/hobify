import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

// ─── Mini circular progress ring ─────────────────────────────────────────────

function ProgressRing({ progress = 0, color = '#3B82F6', size = 40, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress arc — rotated so it starts at 12 o'clock */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

/**
 * HobbyCard
 *
 * Props:
 *  - hobby        {object}        Hobby data from Redux
 *  - onPress      {function}
 *  - compact      {boolean}       Compact mode (no stats, chevron only)
 *  - goalProgress {number|null}   0–100 weekly goal progress; null = no goal set
 */
export function HobbyCard({ hobby, onPress, compact = false, goalProgress = null }) {
  if (!hobby) return null;

  const accentColor = hobby.color || '#3B82F6';

  // Label shown inside the ring
  const progressLabel =
    goalProgress === null ? null : goalProgress >= 100 ? '✓' : `${goalProgress}%`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      onPress={onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.cardContent}>
        {/* Left: icon + name */}
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
            <Text style={styles.icon}>{hobby.icon}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{hobby.name}</Text>
            {!compact && (
              <View style={styles.statsContainer}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.statsText}>{hobby.totalHours || 0}h total</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: streak + progress / chevron */}
        <View style={styles.rightSection}>
          {hobby.streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {hobby.streak}</Text>
            </View>
          )}

          {compact ? (
            <ChevronRight size={20} color="#D1D5DB" />
          ) : goalProgress !== null ? (
            // Weekly goal ring
            <View style={styles.ringWrapper}>
              <ProgressRing
                progress={goalProgress}
                color={goalProgress >= 100 ? '#22C55E' : accentColor}
                size={40}
                strokeWidth={3}
              />
              <View style={styles.ringLabelContainer}>
                <Text
                  style={[
                    styles.ringLabel,
                    goalProgress >= 100 && styles.ringLabelComplete,
                  ]}
                >
                  {progressLabel}
                </Text>
              </View>
            </View>
          ) : (
            // No goal set — muted placeholder ring
            <View style={styles.progressPlaceholder}>
              <Text style={styles.progressPlaceholderText}>—</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingLeft: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  // Goal ring
  ringWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  ringLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
  },
  ringLabelComplete: {
    fontSize: 12,
    color: '#22C55E',
  },
  // Fallback when no goal exists
  progressPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPlaceholderText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
  },
});