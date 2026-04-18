import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Image,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikePostAsync, incrementCommentCountAsync } from '../slices/postsSlice';
import { addCommentAsync, fetchCommentsByPost } from '../slices/commentsSlice';
import { selectUser } from '../slices/authSlice';
import { CommentItem } from '../components/CommentItem';

const TYPE_CONFIG = {
  achievement: { label: 'Achievement', emoji: '🏆', bg: '#FEF3C7', text: '#92400E' },
  progress: { label: 'Progress', emoji: '📈', bg: '#DBEAFE', text: '#1E40AF' },
  milestone: { label: 'Milestone', emoji: '🎯', bg: '#F3E8FF', text: '#6B21A8' },
  question: { label: 'Question', emoji: '❓', bg: '#FEE2E2', text: '#991B1B' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostDetailScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState('');
  const user = useSelector(selectUser);

  const postId = route?.params?.postId;
  const posts = useSelector((state) => state.posts.items);
  const selectedPostId = useSelector((state) => state.posts.selectedPostId);
  const comments = useSelector((state) => state.comments.items);
  const commentsStatus = useSelector((state) => state.comments.status);
  const commentsError = useSelector((state) => state.comments.error);
  const hobbies = useSelector((state) => state.hobbies.items);

  const resolvedPostId = postId || selectedPostId;
  const post = posts.find((p) => String(p.id) === String(resolvedPostId));

  // If we have comments in state, but the post itself is missing from the global list,
  // we can still try to show comments if the postId matches.
  const postComments = (comments || [])
    .filter((c) => c && String(c.postId) === String(resolvedPostId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const hobby = post?.hobbyId ? hobbies.find((h) => h.id === post.hobbyId) : null;
  const typeConfig = post ? (TYPE_CONFIG[post.type] || TYPE_CONFIG.progress) : TYPE_CONFIG.progress;

  useEffect(() => {
    if (resolvedPostId) {
      dispatch(fetchCommentsByPost(resolvedPostId));
    }
  }, [resolvedPostId, dispatch]);

  if (!post) return null;



  const isLikedByMe = post.likedBy?.includes(user?.uid) || false;

  const handleSend = () => {
    if (!newComment.trim() || !user) return;
    dispatch(addCommentAsync({ postId: post.id, content: newComment.trim(), user }));
    dispatch(incrementCommentCountAsync({ postId: post.id, currentCount: post.commentCount || 0 }));
    setNewComment('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Post content */}
        {post ? (
          <>
            {/* Author row */}
            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: hobby?.color ? `${hobby.color}20` : '#F3F4F6' }]}>
                <Text style={styles.avatarEmoji}>{post.userAvatar}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
                <Text style={[styles.typeBadgeText, { color: typeConfig.text }]}>
                  {typeConfig.emoji} {typeConfig.label}
                </Text>
              </View>
            </View>

            {/* Hobby tag */}
            {hobby && (
              <View style={[styles.hobbyTag, { backgroundColor: `${hobby.color}15` }]}>
                <Text style={[styles.hobbyTagText, { color: hobby.color }]}>
                  {hobby.icon} {hobby.name}
                </Text>
              </View>
            )}

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Image */}
            {post.image && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
              </View>
            )}
          </>
        ) : (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color="#111827" />
            <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading post details...</Text>
          </View>
        )}

        {/* Actions */}
        {post && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => dispatch(toggleLikePostAsync({ postId: post.id, userId: user?.uid, isCurrentlyLiked: isLikedByMe }))}
              style={styles.actionBtn}
            >
              <Heart
                size={20}
                color={isLikedByMe ? '#EF4444' : '#9CA3AF'}
                fill={isLikedByMe ? '#EF4444' : 'none'}
              />
              <Text style={[styles.actionCount, isLikedByMe && styles.likedCount]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionBtn}>
              <MessageCircle size={20} color="#9CA3AF" />
              <Text style={styles.actionCount}>{post.commentCount}</Text>
            </View>
          </View>)}
        {/* Comment Input */}
        {post && (
          <View style={styles.inputBar}>
            <View style={styles.inputAvatar}>
              <Text style={{ fontSize: 14 }}>😊</Text>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity onPress={handleSend}>
                <Send size={18} color={newComment.trim() ? '#111827' : '#D1D5DB'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Comments */}
        <Text style={styles.commentsHeader}>Comments</Text>
        <View style={styles.commentsList}>
          {commentsStatus === 'loading' ? (
            <ActivityIndicator size="small" color="#111827" style={{ marginVertical: 20 }} />
          ) : commentsStatus === 'failed' ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading comments: {commentsError}</Text>
              <TouchableOpacity onPress={() => dispatch(fetchCommentsByPost(resolvedPostId))}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : postComments.length > 0 ? (
            postComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          )}
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 18 },
  authorInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF' },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  hobbyTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: 10,
  },
  hobbyTagText: { fontSize: 12, fontWeight: '500' },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: { width: '100%', height: 200 },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: { fontSize: 14, fontWeight: '500', color: '#9CA3AF' },
  likedCount: { color: '#EF4444' },
  commentsHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  commentsList: { gap: 0 },
  noComments: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  errorContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textDecorationLine: 'underline',
  },
});
