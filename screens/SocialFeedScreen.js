import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, RefreshControl, Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, SquarePen, Users, Globe } from 'lucide-react-native';
import { PostCard } from '../components';
import { fetchPosts, fetchPostsByUserIds, selectAllPosts, selectFollowingPosts } from '../slices/postsSlice';
import { fetchFollowing, selectFollowing } from '../slices/followsSlice';
import { selectUser } from '../slices/authSlice';

const HOBBY_CATEGORIES = ['All', 'Creative', 'Sports', 'Music', 'Learning', 'Cooking', 'Media', 'Other'];

export default function SocialFeedScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allPosts = useSelector(selectAllPosts);
  const followingPosts = useSelector(selectFollowingPosts);
  const following = useSelector(selectFollowing);

  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'following'
  const [activeCategory, setActiveCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts());
    if (user?.uid) {
      dispatch(fetchFollowing(user.uid));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'following' && following.length > 0) {
      dispatch(fetchPostsByUserIds(following));
    }
  }, [activeTab, following]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchPosts());
    if (activeTab === 'following' && following.length > 0) {
      await dispatch(fetchPostsByUserIds(following));
    }
    setIsRefreshing(false);
  }, [dispatch, activeTab, following]);

  // Determine which post list to use
  const basePosts = activeTab === 'following' ? followingPosts : allPosts;

  const filteredPosts = useMemo(() => {
    const sorted = [...basePosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeCategory === 'All') return sorted;
    // Only show posts that have a matching hobbyCategory
    return sorted.filter(p => p.hobbyCategory === activeCategory);
  }, [basePosts, activeCategory]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6B7280" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Guides')}
            style={styles.guidesBtn}
          >
            <BookOpen size={14} color="#FFFFFF" />
            <Text style={styles.guidesBtnText}>Guides</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('forYou')}
            style={[styles.tab, activeTab === 'forYou' && styles.tabActive]}
          >
            <Globe size={14} color={activeTab === 'forYou' ? '#111827' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>
              For You
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('following')}
            style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          >
            <Users size={14} color={activeTab === 'following' ? '#111827' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hobby Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {HOBBY_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.filterPill, activeCategory === cat && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, activeCategory === cat && styles.filterPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed */}
        <View style={styles.feedContainer}>
          {activeTab === 'following' && following.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No one followed yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap on someone's name in the For You feed to visit their profile and follow them!
              </Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No posts here</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'following'
                  ? 'The people you follow haven\'t posted yet.'
                  : 'No posts match this category yet.'
                }
              </Text>
            </View>
          ) : (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <SquarePen size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff6e8ff' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#111827' },
  guidesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  guidesBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#111827' },

  // Filter pills
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterPillText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterPillTextActive: { color: '#FFFFFF' },

  feedContainer: { paddingHorizontal: 20, gap: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
