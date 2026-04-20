import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, Flame, Trophy, ChevronRight, Library } from 'lucide-react-native';

import { HobbyCard, WeeklyChart, StatCard } from '../components';
import { selectAllHobbies, selectHobbiesStatus, fetchHobbies } from '../slices/hobbiesSlice';
import { fetchSessions, selectAllSessions } from '../slices/sessionsSlice';
import { fetchGoals, selectAllGoals, selectGoalsStatus } from '../slices/goalsSlice';
import { selectUser } from '../slices/authSlice';

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
function getGoalsSummary(goals = []) {
  const total = goals.length;
  const done = goals.filter((g) => (g.current || 0) >= (g.target || 1)).length;
  return { done, total };
}

/** Build weekly activity data (hours per day, last 7 days oldest→newest) */
function getWeeklyData(sessions = []) {
  const days = Array(7).fill(0);
  const now = new Date();
  sessions.forEach((s) => {
    if (!s.date) return;
    const diff = Math.floor((now - new Date(s.date)) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      days[6 - diff] += (s.duration || 0) / 60;
    }
  });
  return days.map((h) => +h.toFixed(2));
}

/** Weekly goal progress (0–100) for a hobby, based on its goals */
export function getWeeklyGoalProgress(hobby, goals = [], sessions = []) {
  const hobbyGoals = goals.filter((g) => g.hobbyId === hobby.id);
  if (!hobbyGoals.length) return null;

  // Use the first goal as the primary indicator
  const goal = hobbyGoals[0];
  if (!goal.target) return null;

  // For session-count / hours goals derive current from this week's sessions
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter(
    (s) => s.hobbyId === hobby.id && s.date && new Date(s.date) >= weekAgo
  );

  let current = goal.current ?? 0;

  if (goal.type === 'sessions') {
    current = weekSessions.length;
  } else if (goal.type === 'hours') {
    current = +weekSessions.reduce((a, s) => a + (s.duration || 0) / 60, 0).toFixed(2);
  }

  return Math.min(100, Math.round((current / goal.target) * 100));
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

  useEffect(() => {
    if (!user?.uid) return;
    if (hobbiesStatus === 'idle') {
      dispatch(fetchHobbies(user.uid));
      dispatch(fetchSessions(user.uid));
    }
    if (goalsStatus === 'idle') {
      dispatch(fetchGoals(user.uid));
    }
  }, [user?.uid, hobbiesStatus, goalsStatus, dispatch]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const todayHours = getTodayHours(sessions);
  const topStreak = getTopStreak(hobbies);
  const { done: goalsDone, total: goalsTotal } = getGoalsSummary(goals);
  const weeklyData = getWeeklyData(sessions);
  const activeHobbies = hobbies.slice(0, 4);

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
          value={`${todayHours}h`}
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
  hobbiesContainer: {
    gap: 0,
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