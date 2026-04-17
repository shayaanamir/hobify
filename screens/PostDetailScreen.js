import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Image,
} from 'react-native';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikePost, incrementCommentCount } from '../slices/postsSlice';
import { addComment } from '../slices/commentsSlice';
import { CommentItem } from '../components/CommentItem';

const TYPE_CONFIG = {
  achievement: { label: 'Achievement', emoji: '🏆', bg: '#FEF3C7', text: '#92400E' },
  progress:    { label: 'Progress',    emoji: '📈', bg: '#DBEAFE', text: '#1E40AF' },
  milestone:   { label: 'Milestone',   emoji: '🎯', bg: '#F3E8FF', text: '#6B21A8' },
  question:    { label: 'Question',    emoji: '❓', bg: '#FEE2E2', text: '#991B1B' },
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

  const postId = route?.params?.postId;
  const posts = useSelector((state) => state.posts.items);
  const selectedPostId = useSelector((state) => state.posts.selectedPostId);
  const comments = useSelector((state) => state.comments.items);
  const hobbies = useSelector((state) => state.hobbies.items);

  const post = posts.find((p) => p.id === (postId || selectedPostId));
  if (!post) return null;

  const hobby = post.hobbyId ? hobbies.find((h) => h.id === post.hobbyId) : null;
  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG.progress;
  const postComments = comments
    .filter((c) => c.postId === post.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSend = () => {
    if (!newComment.trim()) return;
    dispatch(addComment({ postId: post.id, content: newComment.trim() }));
    dispatch(incrementCommentCount(post.id));
    setNewComment('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

        {/* Post content */}
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Image */}
        {post.image && (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => dispatch(toggleLikePost(post.id))}
            style={styles.actionBtn}
          >
            <Heart
              size={20}
              color={post.likedByMe ? '#EF4444' : '#9CA3AF'}
              fill={post.likedByMe ? '#EF4444' : 'none'}
            />
            <Text style={[styles.actionCount, post.likedByMe && styles.likedCount]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            <MessageCircle size={20} color="#9CA3AF" />
            <Text style={styles.actionCount}>{post.commentCount}</Text>
          </View>
        </View>

        {/* Comments */}
        <Text style={styles.commentsHeader}>Comments</Text>
        <View style={styles.commentsList}>
          {postComments.length > 0 ? (
            postComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
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
});
