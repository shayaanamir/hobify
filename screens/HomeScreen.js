import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, Flame, Trophy, ChevronRight, Library, Calendar, Check, BookOpen } from 'lucide-react-native';

import { HobbyCard, WeeklyChart, StatCard } from '../components';
import { selectAllHobbies, selectHobbiesStatus, fetchHobbies } from '../slices/hobbiesSlice';
import { fetchSessions, selectAllSessions, fetchSessionsByUserIds, selectFollowingSessions } from '../slices/sessionsSlice';
import { fetchGoals, selectAllGoals, selectGoalsStatus } from '../slices/goalsSlice';
import { fetchPlannedActivities, selectAllPlannedActivities, toggleCompleteAsync } from '../slices/plannedActivitiesSlice';
import { selectUser } from '../slices/authSlice';
import { fetchFollowing, selectFollowing } from '../slices/followsSlice';
import { getWeeklyData, getStartOfWeek, getWeeklyGoalProgress } from '../utils/statsHelper';
import { formatDuration } from '../utils/formatDuration';
import { timeAgo } from '../utils/timeHelper';
import { IconRenderer } from '../components';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sum session durations (minutes) for today → return hours (1 dp) */
function getTodayHours(sessions = []) {
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const mins = sessions
    .filter((s) => s.date?.slice(0, 10) === todayStr)
    .reduce((acc, s) => acc + (s.duration || 0), 0);
  return +(mins / 60).toFixed(1);
}

/** Highest streak across all hobbies */
function getTopStreak(hobbies = []) {
  return hobbies.reduce((max, h) => Math.max(max, h.streak || 0), 0);
}

/** Completed vs total goals */
function getGoalsSummary(goals = [], hobbies = [], sessions = []) {
  const startOfWeek = getStartOfWeek();
  const total = goals.length;
  const done = goals.filter((goal) => {
    const hobby = hobbies.find((h) => h.id === goal.hobbyId);
    const weekSessions = sessions.filter((s) =>
      s.hobbyId === goal.hobbyId &&
      s.date && new Date(s.date) >= startOfWeek
    );

    let current = 0;
    if (goal.type === 'sessions_per_week') {
      current = weekSessions.length;
    } else if (goal.type === 'weekly_hours') {
      current = +weekSessions.reduce((acc, s) => acc + (s.duration || 0) / 60, 0).toFixed(1);
    } else if (goal.type === 'completed_items_per_week') {
      current = weekSessions.filter((s) => s.status === 'completed').length;
    } else if (goal.type === 'streak_days') {
      current = hobby?.streak || 0;
    }

    return current >= (goal.target || 1);
  }).length;

  return { done, total };
}



// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector(selectAllHobbies);
  const hobbiesStatus = useSelector(selectHobbiesStatus);
  const sessions = useSelector(selectAllSessions);
  const goals = useSelector(selectAllGoals);
  const goalsStatus = useSelector(selectGoalsStatus);
  const plannedActivities = useSelector(selectAllPlannedActivities);
  const followingSessions = useSelector(selectFollowingSessions);
  const following = useSelector(selectFollowing);

  useEffect(() => {
    if (!user?.uid) return;
    if (hobbiesStatus === 'idle') {
      dispatch(fetchHobbies(user.uid));
      dispatch(fetchSessions(user.uid));
    }
    if (goalsStatus === 'idle') {
      dispatch(fetchGoals(user.uid));
    }
    dispatch(fetchPlannedActivities(user.uid));
    dispatch(fetchFollowing(user.uid));
  }, [user?.uid, hobbiesStatus, goalsStatus, dispatch]);

  useEffect(() => {
    if (user?.uid && following.length > 0) {
      dispatch(fetchSessionsByUserIds(following));
    }
  }, [user?.uid, following, dispatch]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const todayHours = getTodayHours(sessions);
  const topStreak = getTopStreak(hobbies);
  const { done: goalsDone, total: goalsTotal } = getGoalsSummary(goals, hobbies, sessions);
  const weeklyData = getWeeklyData(sessions);
  const activeHobbies = hobbies.slice(0, 4);

  const upcomingPlans = plannedActivities
    .filter(a => {
      const d = new Date(a.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today && !a.completed;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const recentActivity = followingSessions
    .slice(0, 5);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleHobbyClick = (id) => {
    navigation.navigate('HobbyDetail', { hobbyId: id });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{today}</Text>
        <Text style={styles.greeting}>Good morning, {user?.name || 'there'}</Text>
      </View>

      {/* Stats Grid — real data */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={Clock}
          label="Today"
          value={formatDuration(todayHours, 'hours')}
          color="#3B82F6"
          bgColor="#EFF6FF"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={String(topStreak)}
          color="#F97316"
          bgColor="#FFF7ED"
        />
        <Pressable onPress={() => navigation.navigate('Goals')} style={{ flex: 1 }}>
          <StatCard
            icon={Trophy}
            label="Goals"
            value={goalsTotal > 0 ? `${goalsDone}/${goalsTotal}` : '—'}
            color="#A855F7"
            bgColor="#FAF5FF"
          />
        </Pressable>
      </View>

      {/* Recent Activity Section */}
      {recentActivity.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => navigation.navigate('SocialTab')}>
              <Text style={styles.seeAllLink}>See Feed</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activityScroll}
          >
            {recentActivity.map((session) => {
              return (
                <View
                  key={session.id}
                  style={styles.activityCard}
                >
                  <Pressable
                    style={styles.activityHeader}
                    onPress={() => session.userId && navigation.navigate('UserProfile', { userId: session.userId })}
                  >
                    {session.userAvatarUrl ? (
                      <Image source={{ uri: session.userAvatarUrl }} style={styles.activityAvatar} />
                    ) : (
                      <View style={styles.activityAvatarPlaceholder}>
                        <Text style={styles.activityAvatarText}></Text>
                      </View>
                    )}
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityUser} numberOfLines={1}>{session.userName || 'A fellow hobbyist'}</Text>
                      <Text style={styles.activityTime}>{timeAgo(session.createdAt || session.date)}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.activityActionRow}>
                    <IconRenderer iconName={session.hobbyIcon || 'activity'} size={14} color={session.hobbyColor || '#6B7280'} />
                    <Text style={styles.activityActionText}>
                      Logged <Text style={styles.boldText}>{formatDuration(session.duration)}</Text> {session.hobbyName ? `of ${session.hobbyName}` : 'in their hobby'}
                    </Text>
                  </View>

                  {session.mediaTitle && (
                    <Pressable
                      style={styles.activityMediaBadge}
                      onPress={() => navigation.navigate('MediaDetail', {
                        mediaTitle: session.mediaTitle,
                        mediaId: session.mediaId,
                        hobbyId: session.hobbyId,
                        tmdbMediaType: session.tmdbMediaType
                      })}
                    >
                      <BookOpen size={10} color="#6B7280" />
                      <Text style={styles.activityMediaText} numberOfLines={1}>{session.mediaTitle}</Text>
                    </Pressable>
                  )}

                  {session.notes && (
                    <Text style={styles.activityNotes} numberOfLines={2}>"{session.notes}"</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Upcoming Plans */}
      {upcomingPlans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Plans</Text>
            <Pressable onPress={() => navigation.navigate('CalendarTab')} style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Calendar</Text>
              <ChevronRight size={14} color="#9CA3AF" />
            </Pressable>
          </View>
          <View style={styles.plansContainer}>
            {upcomingPlans.map((plan) => {
              const hobby = hobbies.find(h => h.id === plan.hobbyId);
              if (!hobby) return null;
              const planDate = new Date(plan.date);
              const isToday = planDate.toDateString() === new Date().toDateString();

              return (
                <View key={plan.id} style={styles.planCard}>
                  <Pressable
                    onPress={() => dispatch(toggleCompleteAsync({ activityId: plan.id, completed: false }))}
                    style={[styles.planCheck, { borderColor: hobby.color }]}
                  >
                    {plan.completed && <Check size={12} color={hobby.color} />}
                  </Pressable>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
                    <View style={styles.planMeta}>
                      <IconRenderer iconName={hobby.icon} size={10} color={hobby.color} />
                      <Text style={[styles.planHobby, { color: hobby.color }]}>{hobby.name}</Text>
                      <Text style={styles.planTime}>
                        {isToday ? 'Today' : planDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}{formatDuration(plan.duration)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Weekly Activity — real session data */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <Text style={styles.sectionSubtitle}>Last 7 days</Text>
        </View>
        <View style={styles.chartContainer}>
          <WeeklyChart data={weeklyData} color="#111827" height={120} />
        </View>
      </View>

      {/* Jump Back In */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Jump Back In</Text>
          <Pressable onPress={() => navigation.navigate('HobbiesList')} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={14} color="#9CA3AF" />
          </Pressable>
        </View>
        <View style={styles.hobbiesContainer}>
          {activeHobbies.map((hobby) => (
            <HobbyCard
              key={hobby.id}
              hobby={hobby}
              goalProgress={getWeeklyGoalProgress(hobby, goals, sessions)}
              onPress={() => handleHobbyClick(hobby.id)}
            />
          ))}
        </View>
      </View>

      {/* Collection Quick Access */}
      <Pressable
        style={styles.collectionButton}
        onPress={() => navigation.navigate('Collection')}
      >
        <View style={styles.collectionIconBg}>
          <Library size={20} color="#4B5563" />
        </View>
        <View style={styles.collectionTextContainer}>
          <Text style={styles.collectionTitle}>My Collection</Text>
          <Text style={styles.collectionSubtitle}>Books, games, movies & more</Text>
        </View>
        <ChevronRight size={18} color="#D1D5DB" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 120,
    backgroundColor: '#fff6e8ff',
  },
  header: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  hobbiesContainer: {
    gap: 0,
  },
  plansContainer: {
    gap: 8,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  planCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planHobby: {
    fontSize: 11,
    fontWeight: '600',
  },
  planTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  activityScroll: {
    paddingRight: 20,
    paddingBottom: 4,
  },
  activityCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  activityAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarText: {
    fontSize: 14,
  },
  activityInfo: {
    marginLeft: 8,
    flex: 1,
  },
  activityUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  activityTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  activityActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityActionText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 6,
  },
  boldText: {
    fontWeight: '700',
  },
  activityNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#F3F4F6',
    paddingLeft: 8,
  },
  activityMediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  activityMediaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    maxWidth: 120,
  },
  collectionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  collectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionTextContainer: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  collectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});