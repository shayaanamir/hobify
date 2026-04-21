import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Play, Calendar, Clock, Award, BookOpen } from 'lucide-react-native';

import { GoalCard, SessionItem, WeeklyChart, MediaLogItem } from '../components';
import { getWeeklyData } from '../utils/statsHelper';

export default function HobbyDetailScreen({ route, navigation }) {
  const { hobbyId } = route.params || {};

  const hobby = useSelector((state) =>
    state.hobbies.items.find((h) => h.id === hobbyId)
  );

  const sessions = useSelector((state) => {
    const s = state.sessions.items.filter((item) => item.hobbyId === hobbyId);
    return s.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const goals = useSelector((state) =>
    state.goals.items.filter((g) => g.hobbyId === hobbyId)
  );
  
  const weeklyData = useMemo(() => getWeeklyData(sessions), [sessions]);

  // Aggregate media items for "My Collection"
  const mediaItems = useMemo(() => {
    if (hobby?.type !== 'media') return [];
    const itemsMap = new Map();

    sessions.forEach((session) => {
      if (!session.mediaTitle) return;
      
      const existing = itemsMap.get(session.mediaTitle);
      if (existing) {
        itemsMap.set(session.mediaTitle, {
          ...existing,
          rating: session.rating || existing.rating,
          status: session.status === 'completed' ? 'completed' : existing.status,
          sessionCount: existing.sessionCount + 1,
          totalMinutes: existing.totalMinutes + session.duration,
          lastDate: session.date > existing.lastDate ? session.date : existing.lastDate,
        });
      } else {
        itemsMap.set(session.mediaTitle, {
          title: session.mediaTitle,
          rating: session.rating,
          status: session.status,
          sessionCount: 1,
          totalMinutes: session.duration,
          lastDate: session.date,
        });
      }
    });

    return Array.from(itemsMap.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );
  }, [sessions, hobby?.type]);

  const handleMediaClick = (title) => {
    navigation.navigate('MediaDetail', { mediaTitle: title, hobbyId: hobby.id });
  };

  if (!hobby) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Hobby not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Background Hero Layer */}
      <View style={[styles.heroBackground, { backgroundColor: hobby.color }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Content */}
        <View style={styles.heroContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.heroCenter}>
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>{hobby.icon}</Text>
            </View>
            <Text style={styles.title}>{hobby.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{hobby.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bodyContent}>
          {/* Main Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{hobby.totalHours}</Text>
                <Text style={styles.statLabel}>Hours</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{hobby.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{hobby.totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('LogSession', { hobbyId: hobby.id })}
              style={[styles.primaryButton, { backgroundColor: hobby.color, shadowColor: hobby.color }]}
            >
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Log Session</Text>
            </TouchableOpacity>
          </View>

          {/* My Collection (Media Only) */}
          {hobby.type === 'media' && mediaItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <BookOpen size={18} color="#9CA3AF" />
                  <Text style={styles.sectionTitle}>My Collection</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{mediaItems.length} titles</Text>
                </View>
              </View>
              <View style={styles.mediaContainer}>
                {mediaItems.map((item, index) => (
                  <MediaLogItem
                    key={index}
                    title={item.title}
                    rating={item.rating}
                    status={item.status}
                    sessionCount={item.sessionCount}
                    totalMinutes={item.totalMinutes}
                    color={hobby.color}
                    onClick={() => handleMediaClick(item.title)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Goals */}
          {goals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Award size={18} color="#9CA3AF" />
                  <Text style={styles.sectionTitle}>Active Goals</Text>
                </View>
              </View>
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} color={hobby.color} />
              ))}
            </View>
          )}

          {/* Weekly Chart */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={18} color="#9CA3AF" />
                <Text style={styles.sectionTitle}>This Week</Text>
              </View>
            </View>
            <View style={styles.chartCard}>
              {/* Using static mock data directly as per UI_REFERENCE */}
              <WeeklyChart data={weeklyData} color={hobby.color} height={100} />
            </View>
          </View>

          {/* Recent History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Clock size={18} color="#9CA3AF" />
                <Text style={styles.sectionTitle}>Recent History</Text>
              </View>
            </View>
            <View style={styles.historyCard}>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <SessionItem key={session.id} session={session} color={hobby.color} />
                ))
              ) : (
                <Text style={styles.emptyText}>No sessions yet. Start today!</Text>
              )}
            </View>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#6B7280',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    opacity: 0.1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: {
    paddingBottom: 120, // Bottom Tab safe area
  },
  heroContent: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  backButton: {
    position: 'absolute',
    top: 64,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  heroCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyContent: {
    paddingHorizontal: 24,
    marginTop: -32,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F3F4F6',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  mediaContainer: {
    gap: 0,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
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
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 16,
  },
});
