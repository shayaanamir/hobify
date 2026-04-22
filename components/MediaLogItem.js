import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';

export function MediaLogItem({
  title,
  rating,
  status,
  sessionCount,
  totalMinutes,
  color = '#3B82F6',
  onClick,
}) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeString =
    hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;

  const RootComponent = onClick ? Pressable : View;

  return (
    <RootComponent
      onPress={onClick}
      style={({ pressed }) => [
        styles.card,
        onClick && pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: color }]} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {status && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: status === 'completed' ? '#DCFCE7' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: status === 'completed' ? '#16A34A' : '#D97706' }
              ]}>
                {status === 'completed' ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                color={rating && star <= rating ? color : '#D1D5DB'}
                fill={rating && star <= rating ? color : 'transparent'}
              />
            ))}
          </View>
          <Text style={styles.metaText}>
            {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} · {timeString}
          </Text>
        </View>
      </View>
    </RootComponent>
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
  content: {
    padding: 16,
    paddingLeft: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
    paddingRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
