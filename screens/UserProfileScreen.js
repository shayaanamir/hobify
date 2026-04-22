import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Platform, ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPostsByUser, selectUserPosts } from '../slices/postsSlice';
import { PostCard, IconRenderer } from '../components';
import { queryCollection } from '../services/firestoreService';
import { Clock, Trophy, Flame, BookOpen, ArrowLeft, UserCheck, UserPlus } from 'lucide-react-native';
import { getUserProfile } from '../services/authService';
import { selectUser } from '../slices/authSlice';
import {
  fetchFollowing,
  followUserAsync, unfollowUserAsync,
  selectIsFollowing,
} from '../slices/followsSlice';

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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function UserProfileScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { userId } = route.params;
  const currentUser = useSelector(selectUser);
  const isFollowing = useSelector(selectIsFollowing(userId));
  const userPosts = useSelector(selectUserPosts);

  const [profile, setProfile] = useState(null);
  const [userHobbies, setUserHobbies] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [guidesCount, setGuidesCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, h, s, g] = await Promise.all([
        getUserProfile(userId),
        queryCollection('hobbies', [{ field: 'userId', op: '==', value: userId }]),
        queryCollection('sessions', [{ field: 'userId', op: '==', value: userId }]),
        queryCollection('guides', [{ field: 'authorId', op: '==', value: userId }]),
        dispatch(fetchPostsByUser(userId)),
        dispatch(fetchFollowing(currentUser.uid)),
      ]);
      setProfile(p);
      setUserHobbies(h);
      setUserSessions(s);
      setGuidesCount(g.length);

      // Fetch follower/following counts for this profile user
      const { db } = await import('../firebaseConfig');
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const [followersSnap, followingSnap] = await Promise.all([
        getDocs(query(collection(db, 'follows'), where('followingId', '==', userId))),
        getDocs(query(collection(db, 'follows'), where('followerId', '==', userId))),
      ]);
      setFollowerCount(followersSnap.size);
      setFollowingCount(followingSnap.size);
      setLoading(false);
    };
    load();
  }, [userId, currentUser?.uid, dispatch]);

  const handleFollow = async () => {
    setFollowLoading(true);
    if (isFollowing) {
      await dispatch(unfollowUserAsync({ followerId: currentUser.uid, followingId: userId }));
      setFollowerCount((c) => Math.max(0, c - 1));
    } else {
      await dispatch(followUserAsync({ followerId: currentUser.uid, followingId: userId }));
      setFollowerCount((c) => c + 1);
    }
    setFollowLoading(false);
  };

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {profile?.name || 'Profile'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar — real photo or initials fallback */}
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <InitialsAvatar name={profile?.name} size={88} />
          )}

          <Text style={styles.name}>{profile?.name}</Text>
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          {/* Social Stats Row */}
          <View style={styles.socialStatsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followingCount}</Text>
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

          {/* Follow Button */}
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={handleFollow}
              disabled={followLoading}
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
            >
              {followLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowing ? '#111827' : '#FFFFFF'}
                />
              ) : (
                <>
                  {isFollowing
                    ? <UserCheck size={16} color="#111827" />
                    : <UserPlus size={16} color="#FFFFFF" />
                  }
                  <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
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

        {/* Posts */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {userPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 16,
    backgroundColor: '#FAF8F5',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: '#111827',
    flex: 1, textAlign: 'center',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  initialsAvatar: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  initialsText: { fontWeight: '700', color: '#6B7280' },

  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  bio: {
    fontSize: 14, color: '#6B7280',
    textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },

  socialStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    width: '100%',
    justifyContent: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: {
    fontSize: 11, color: '#9CA3AF', fontWeight: '600',
    marginTop: 2, textTransform: 'uppercase',
  },
  statDivider: { width: 1, height: 24, backgroundColor: '#F3F4F6' },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardValue: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statCardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', marginTop: 4 },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 9999,
    minWidth: 120, justifyContent: 'center',
    marginTop: 24,
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  followBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  followingBtnText: { color: '#111827' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16, paddingHorizontal: 20 },
  hobbiesList: { paddingHorizontal: 20, gap: 12 },
  profileHobbyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  hobbyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  hobbyInfo: { flex: 1 },
  profileHobbyName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  profileHobbyStats: { fontSize: 13, fontWeight: '500', flexDirection: 'row', alignItems: 'center' },
  hobbyAccentBar: {
    position: 'absolute',
    right: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },

  postsSection: { paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});