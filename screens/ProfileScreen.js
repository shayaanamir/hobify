import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Platform, ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPostsByUser, selectUserPosts } from '../slices/postsSlice';
import { PostCard, IconRenderer } from '../components';
import { queryCollection } from '../services/firestoreService';
import { Clock, Trophy, Flame, BookOpen, User, LogOut, ChevronRight, MessageSquare } from 'lucide-react-native';
import { selectUser, signOutThunk } from '../slices/authSlice';
import { fetchFollowing, fetchFollowers, selectFollowing, selectFollowers } from '../slices/followsSlice';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <View style={styles.statCard}>
      <Icon size={20} color={color} style={{ marginBottom: 8 }} />
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

// ─── Profile Hobby Card ────────────────────────────────────────────────────────
function ProfileHobbyCard({ hobby, sessions }) {
  const totalMinutes = sessions
    .filter(s => s.hobbyId === hobby.id)
    .reduce((sum, s) => sum + s.duration, 0);
  const hours = Math.round(totalMinutes / 60);

  return (
    <View style={styles.profileHobbyCard}>
      <View style={[styles.hobbyIconBox, { backgroundColor: `${hobby.color}10` }]}>
        <IconRenderer iconName={hobby.icon} size={22} color={hobby.color} />
      </View>
      <View style={styles.hobbyInfo}>
        <Text style={styles.profileHobbyName}>{hobby.name}</Text>
        <Text style={styles.profileHobbyStats}>
          <Text style={{ color: '#9CA3AF' }}>{hours}h logged</Text>
          {hobby.streak > 0 && (
            <>
              <Text style={{ color: '#9CA3AF' }}>  •  </Text>
              <Flame size={12} color="#F97066" />
              <Text style={{ color: '#F97066' }}> {hobby.streak} day streak</Text>
            </>
          )}
        </Text>
      </View>
      <View style={[styles.hobbyAccentBar, { backgroundColor: hobby.color }]} />
    </View>
  );
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────
function InitialsAvatar({ name, size = 88 }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.initialsAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userPosts = useSelector(selectUserPosts);
  const following = useSelector(selectFollowing);
  const followers = useSelector(selectFollowers);
  
  const [userHobbies, setUserHobbies] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [guidesCount, setGuidesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFollowing(user.uid));
      dispatch(fetchFollowers(user.uid));
      dispatch(fetchPostsByUser(user.uid));
      
      const loadData = async () => {
        try {
          const [h, s, g] = await Promise.all([
            queryCollection('hobbies', [{ field: 'userId', op: '==', value: user.uid }]),
            queryCollection('sessions', [{ field: 'userId', op: '==', value: user.uid }]),
            queryCollection('guides', [{ field: 'userId', op: '==', value: user.uid }]),
          ]);
          setUserHobbies(h);
          setUserSessions(s);
          setGuidesCount(g.length);
        } catch (err) {
          console.error("Error loading profile data:", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user?.uid, dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <InitialsAvatar name={user?.name} size={88} />
          )}

          <Text style={styles.name}>{user?.name}</Text>
          {user?.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : (
            <Text style={styles.bio}>Hobbyist since 2026</Text>
          )}

          {/* Social Stats Row */}
          <View style={styles.socialStatsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statGrid}>
            <StatCard
              icon={Clock}
              value={Math.round(userSessions.reduce((sum, s) => sum + s.duration, 0) / 60)}
              label="HOURS"
              color="#3B82F6"
            />
            <StatCard
              icon={Trophy}
              value={userSessions.length}
              label="SESSIONS"
              color="#A78BFA"
            />
            <StatCard
              icon={Flame}
              value={Math.max(0, ...userHobbies.map(h => h.streak || 0))}
              label="BEST STREAK"
              color="#F97066"
            />
            <StatCard
              icon={BookOpen}
              value={guidesCount}
              label="GUIDES"
              color="#2DD4BF"
            />
          </View>
        </View>

        {/* Hobbies Section */}
        {userHobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            <View style={styles.hobbiesList}>
              {userHobbies.map((hobby) => (
                <ProfileHobbyCard
                  key={hobby.id}
                  hobby={hobby}
                  sessions={userSessions}
                />
              ))}
            </View>
          </View>
        )}

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={[styles.settingsRow, styles.settingsRowBorder]}
            >
              <View style={styles.settingsRowLeft}>
                <View style={styles.settingsIconWrapper}>
                  <User size={18} color="#4B5563" />
                </View>
                <Text style={styles.settingsLabel}>Edit Profile</Text>
              </View>
              <ChevronRight size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('MyPosts')}
              style={[styles.settingsRow, styles.settingsRowBorder]}
            >
              <View style={styles.settingsRowLeft}>
                <View style={styles.settingsIconWrapper}>
                  <MessageSquare size={18} color="#4B5563" />
                </View>
                <Text style={styles.settingsLabel}>My Posts</Text>
              </View>
              <ChevronRight size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => dispatch(signOutThunk())}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                  <LogOut size={18} color="#EF4444" />
                </View>
                <Text style={[styles.settingsLabel, { color: '#EF4444' }]}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
  },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
  },
  initialsAvatar: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initialsText: {
    fontWeight: '700',
    color: '#9CA3AF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  socialStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    width: '46%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  hobbiesList: {
    gap: 12,
  },
  profileHobbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  hobbyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hobbyInfo: {
    flex: 1,
  },
  profileHobbyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  profileHobbyStats: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hobbyAccentBar: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  postsSection: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});