import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Plus, X } from 'lucide-react-native';
import { PostCard } from '../components';
import { fetchPosts, selectPostsStatus, addPostAsync } from '../slices/postsSlice';
import { selectUser } from '../slices/authSlice';

const POST_TYPES = [
  { id: 'progress', label: 'Progress', emoji: '📈' },
  { id: 'achievement', label: 'Achievement', emoji: '🏆' },
  { id: 'milestone', label: 'Milestone', emoji: '🎯' },
  { id: 'question', label: 'Question', emoji: '❓' },
];

export default function SocialFeedScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const posts = useSelector((state) => state.posts.items) || [];
  const postsStatus = useSelector(selectPostsStatus);
  const hobbies = useSelector((state) => state.hobbies.items);

  const [isModalVisible, setModalVisible] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState(POST_TYPES[0].id);
  const [postHobbyId, setPostHobbyId] = useState('');

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

  const handlePostSubmit = () => {
    if (!postTitle.trim() || !postContent.trim() || !user) return;

    dispatch(addPostAsync({
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      post: {
        title: postTitle.trim(),
        content: postContent.trim(),
        type: postType,
        hobbyId: postHobbyId || null,
      }
    }));

    setModalVisible(false);
    setPostTitle('');
    setPostContent('');
    setPostType(POST_TYPES[0].id);
    setPostHobbyId('');
  };

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
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Create Post</Text>
            <TouchableOpacity onPress={handlePostSubmit} disabled={!postTitle.trim() || !postContent.trim()}>
              <Text style={[styles.modalSubmitBtn, (!postTitle.trim() || !postContent.trim()) && styles.modalSubmitDisabled]}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#9CA3AF"
              value={postTitle}
              onChangeText={setPostTitle}
            />

            <Text style={styles.inputLabel}>Details</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Share more details about your progress..."
              placeholderTextColor="#9CA3AF"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Post Type</Text>
            <View style={styles.typeSelectorRow}>
              {POST_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeSelectorBtn, postType === type.id && styles.typeSelectorBtnActive]}
                  onPress={() => setPostType(type.id)}
                >
                  <Text style={[styles.typeSelectorEmoji, postType === type.id && styles.typeSelectorEmojiActive]}>{type.emoji}</Text>
                  <Text style={[styles.typeSelectorText, postType === type.id && styles.typeSelectorTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Tag a Hobby (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hobbyRow}>
              <TouchableOpacity
                style={[styles.hobbyPill, postHobbyId === '' && styles.hobbyPillActive]}
                onPress={() => setPostHobbyId('')}
              >
                <Text style={[styles.hobbyPillText, postHobbyId === '' && styles.hobbyPillTextActive]}>None</Text>
              </TouchableOpacity>
              {hobbies.map(hobby => (
                <TouchableOpacity
                  key={hobby.id}
                  style={[
                    styles.hobbyPill,
                    postHobbyId === hobby.id && { backgroundColor: hobby.color, borderColor: hobby.color }
                  ]}
                  onPress={() => setPostHobbyId(hobby.id)}
                >
                  <Text style={[styles.hobbyPillText, postHobbyId === hobby.id && { color: '#FFFFFF' }]}>
                    {hobby.icon} {hobby.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>
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
  modalRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCloseBtn: { padding: 4 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalSubmitBtn: { fontSize: 16, fontWeight: '700', color: '#3B82F6', padding: 4 },
  modalSubmitDisabled: { color: '#9CA3AF' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: { height: 120 },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    gap: 6,
  },
  typeSelectorBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  typeSelectorEmoji: { fontSize: 14, opacity: 0.8 },
  typeSelectorEmojiActive: { opacity: 1 },
  typeSelectorText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  typeSelectorTextActive: { color: '#6366F1', fontWeight: '700' },
  hobbyRow: {
    gap: 10,
    paddingBottom: 40,
  },
  hobbyPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  hobbyPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  hobbyPillText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  hobbyPillTextActive: { color: '#FFFFFF' },
});
