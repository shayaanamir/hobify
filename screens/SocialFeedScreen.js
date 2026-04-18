import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Plus, X } from 'lucide-react-native';
import { PostCard } from '../components';
import { fetchPosts, selectPostsStatus } from '../slices/postsSlice';

const POST_TYPES = [
  { id: 'progress', label: 'Progress', emoji: '📈' },
  { id: 'achievement', label: 'Achievement', emoji: '🏆' },
  { id: 'milestone', label: 'Milestone', emoji: '🎯' },
  { id: 'question', label: 'Question', emoji: '❓' },
];

export default function SocialFeedScreen({ navigation }) {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.items) || [];
  const postsStatus = useSelector(selectPostsStatus);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (postsStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [postsStatus, dispatch]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchPosts());
    setIsRefreshing(false);
  }, [dispatch]);

  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );



  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6B7280" />
        }
      >
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

        <View style={styles.feedContainer}>
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff6e8ff',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 20,
    paddingBottom: 120, // tab bar spacing
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  guidesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  guidesBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContainer: {
    gap: 0,
  },
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
  hobbyPillText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  hobbyPillTextActive: { color: '#FFFFFF' },
});
