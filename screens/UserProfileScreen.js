import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Platform, ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, UserCheck, UserPlus } from 'lucide-react-native';
import { getUserProfile } from '../services/authService';
import { selectUser } from '../slices/authSlice';
import {
  fetchFollowing, fetchFollowers,
  followUserAsync, unfollowUserAsync,
  selectIsFollowing,
} from '../slices/followsSlice';
import { fetchPostsByUser, selectUserPosts } from '../slices/postsSlice';
import { PostCard } from '../components';

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
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p] = await Promise.all([
        getUserProfile(userId),
        dispatch(fetchPostsByUser(userId)),
        dispatch(fetchFollowing(currentUser.uid)),
      ]);
      setProfile(p);

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

          {/* Stats Row */}
          <View style={styles.statsRow}>
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
    textAlign: 'center', lineHeight: 20, marginBottom: 16,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    justifyContent: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statLabel: {
    fontSize: 11, color: '#9CA3AF', fontWeight: '600',
    marginTop: 2, textTransform: 'uppercase',
  },
  statDivider: { width: 1, height: 32, backgroundColor: '#F3F4F6' },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 9999,
    minWidth: 120, justifyContent: 'center',
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  followBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  followingBtnText: { color: '#111827' },

  postsSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});