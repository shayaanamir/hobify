import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Star, Clock, CheckCircle2 } from 'lucide-react-native';
import { SessionItem } from '../components';

export default function MediaDetailScreen({ route, navigation }) {
  const { mediaTitle, hobbyId } = route.params || {};

  const hobby = useSelector((state) =>
    state.hobbies.items.find((h) => h.id === hobbyId)
  );

  const sessions = useSelector((state) => state.sessions.items);

  if (!mediaTitle || !hobby) return null;

  // Filter sessions for this specific media
  const mediaSessions = sessions
    .filter((s) => s.hobbyId === hobbyId && s.mediaTitle === mediaTitle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate stats
  const totalMinutes = mediaSessions.reduce((acc, s) => acc + s.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Get latest status and rating
  const latestSession = mediaSessions[0];
  const status =
    mediaSessions.find((s) => s.status === 'completed')?.status ||
    latestSession?.status ||
    'in-progress';
  const rating = mediaSessions.find((s) => s.rating)?.rating;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={[styles.hobbyIconWrapper, { backgroundColor: hobby.color }]}>
              <Text style={styles.hobbyIconText}>{hobby.icon}</Text>
            </View>

            <Text style={styles.titleText}>{mediaTitle}</Text>

            <View style={styles.badgesWrapper}>
              <View style={styles.badgeLabel}>
                <Text style={styles.badgeLabelText}>{hobby.name}</Text>
              </View>
              {status === 'completed' && (
                <View style={styles.completedBadge}>
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
            </View>

            {/* Rating */}
            <View style={styles.starsWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <View key={star} style={{ marginHorizontal: 2 }}>
                  <Star
                    size={24}
                    fill={rating && star <= rating ? '#FBBF24' : 'transparent'}
                    stroke={rating && star <= rating ? '#FBBF24' : '#D1D5DB'}
                    strokeWidth={2}
                  />
                </View>
              ))}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{mediaSessions.length}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{timeString}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sessions History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Clock size={18} color="#9CA3AF" />
            <Text style={styles.historyHeaderText}>Session History</Text>
          </View>

          <View style={styles.historyCard}>
            {mediaSessions.length > 0 ? (
              mediaSessions.map((session) => (
                <SessionItem key={session.id} session={session} color={hobby.color} />
              ))
            ) : (
              <Text style={styles.noSessionsText}>No sessions found.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    paddingBottom: 120, // tab bar allowance
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 32,
    left: 24,
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  hobbyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  hobbyIconText: {
    fontSize: 40,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  badgesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badgeLabel: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  badgeLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
    width: '100%',
    gap: 32,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F3F4F6',
  },
  historySection: {
    paddingHorizontal: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  historyHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  noSessionsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    paddingVertical: 16,
    fontSize: 14,
  },
});
