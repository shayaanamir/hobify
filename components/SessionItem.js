import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Star } from 'lucide-react-native';

export function SessionItem({ session, color = '#3B82F6' }) {
  if (!session) return null;

  const date = new Date(session.date);
  const isToday = new Date().toDateString() === date.toDateString();
  const dateStr = isToday
    ? 'Today'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateCol}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <View style={[styles.timelineLine, { backgroundColor: color }]} />
      </View>

      <View style={styles.card}>
        {session.mediaTitle && (
          <View style={styles.mediaRow}>
            <Text style={styles.mediaTitle} numberOfLines={2} ellipsizeMode="tail">{session.mediaTitle}</Text>
            <View style={styles.ratingRow}>
              {session.rating && (
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={10}
                      color={star <= session.rating ? color : '#D1D5DB'}
                      fill={star <= session.rating ? color : 'transparent'}
                    />
                  ))}
                </View>
              )}
              {session.status && (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: session.status === 'completed' ? '#22C55E' : '#F59E0B' }
                  ]}
                />
              )}
            </View>
          </View>
        )}

        <View style={styles.timeRow}>
          <View style={styles.duration}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.durationText}>{formatDuration(session.duration)}</Text>
          </View>
          <Text style={styles.timeText}>
            {new Date(session.createdAt || session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {session.notes && (
          <Text style={styles.notes}>{session.notes}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 12,
  },
  dateCol: {
    alignItems: 'center',
    gap: 4,
    minWidth: 48,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  timelineLine: {
    width: 4,
    height: 32,
    borderRadius: 2,
    opacity: 0.2,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mediaTitle: {
    flex: 1,
    fontWeight: '700',
    color: '#111827',
    fontSize: 14,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notes: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 4,
  },
});