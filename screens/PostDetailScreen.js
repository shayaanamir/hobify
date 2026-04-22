import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Image,
  ActivityIndicator
} from 'react-native';
import {
  ArrowLeft, Heart, MessageCircle, Send,
  Trophy, TrendingUp, Target, HelpCircle, MessageSquare, BookOpen
} from 'lucide-react-native';
import { IconRenderer } from '../components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikePostAsync, incrementCommentCountAsync } from '../slices/postsSlice';
import { addCommentAsync, fetchCommentsByPost } from '../slices/commentsSlice';
import { selectUser } from '../slices/authSlice';
import { CommentItem } from '../components/CommentItem';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  achievement: { label: 'Achievement', icon: Trophy, bg: '#FEF3C7', text: '#92400E' },
  progress: { label: 'Progress', icon: TrendingUp, bg: '#DBEAFE', text: '#1E40AF' },
  milestone: { label: 'Milestone', icon: Target, bg: '#F3E8FF', text: '#6B21A8' },
  discussion: { label: 'Discussion', icon: MessageSquare, bg: '#ECFDF5', text: '#059669' },
  question: { label: 'Question', icon: HelpCircle, bg: '#FEE2E2', text: '#991B1B' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Tiny inline avatar used in the comment input bar ─────────────────────────
// Shows the user's photo if available, otherwise their initials.
function CommentInputAvatar({ user }) {
  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user?.avatarUrl) {
    return <Image source={{ uri: user.avatarUrl }} style={styles.inputAvatarImage} />;
  }

  return (
    <View style={styles.inputAvatarPlaceholder}>
      <Text style={styles.inputAvatarInitials}>{initials}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
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

  // ── Post author avatar ───────────────────────────────────────────────────────
  // Posts store either a userAvatarUrl (photo) or a legacy userAvatar (emoji).
  // We support both so existing posts continue to render correctly.
  const renderPostAvatar = () => {
    if (post.userAvatarUrl) {
      return (
        <Image
          source={{ uri: post.userAvatarUrl }}
          style={[styles.avatar, { borderRadius: 20 }]}
        />
      );
    }
    if (post.userAvatar) {
      return (
        <View style={[styles.avatar, { backgroundColor: hobby?.color ? `${hobby.color}20` : '#F3F4F6' }]}>
          <Text style={styles.avatarEmoji}>{post.userAvatar}</Text>
        </View>
      );
    }
    // Initials fallback
    const initials = (post.userName || '?')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    return (
      <View style={[styles.avatar, { backgroundColor: '#E5E7EB' }]}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B7280' }}>{initials}</Text>
      </View>
    );
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
        <>
          {/* Author row */}
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => {
              if (post.userId && post.userId !== user?.uid) {
                navigation.navigate('UserProfile', { userId: post.userId });
              }
            }}
          >
            {renderPostAvatar()}
            <View style={styles.authorInfo}>
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
              <typeConfig.icon size={10} color={typeConfig.text} />
              <Text style={[styles.typeBadgeText, { color: typeConfig.text }]}>
                {typeConfig.label}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Hobby & Media tags */}
          {hobby && (
            <View style={styles.tagsRow}>
              <View style={[styles.hobbyTag, { backgroundColor: `${hobby.color}15`, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <IconRenderer iconName={hobby.icon} size={10} color={hobby.color} />
                <Text style={[styles.hobbyTagText, { color: hobby.color }]}>{hobby.name}</Text>
              </View>

              {post.mediaTitle && (
                <View style={styles.mediaTag}>
                  <BookOpen size={10} color="#6B7280" />
                  <Text style={styles.mediaTagText}>{post.mediaTitle}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Post image */}
          {post.image && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
            </View>
          )}
        </>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() =>
              dispatch(toggleLikePostAsync({
                postId: post.id,
                userId: user?.uid,
                isCurrentlyLiked: isLikedByMe,
              }))
            }
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
        </View>

        {/* Comment Input */}
        <View style={styles.inputBar}>
          {/* Use the real user avatar instead of a hardcoded emoji */}
          <CommentInputAvatar user={user} />
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

        {/* Comments */}
        <Text style={styles.commentsHeader}>Comments</Text>
        <View style={styles.commentsList}>
          {commentsStatus === 'loading' ? (
            <ActivityIndicator
              size="small"
              color="#111827"
              style={{ marginVertical: 20 }}
            />
          ) : commentsStatus === 'failed' ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error loading comments: {commentsError}
              </Text>
              <TouchableOpacity
                onPress={() => dispatch(fetchCommentsByPost(resolvedPostId))}
              >
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20,
  },
  backText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },

  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: { fontSize: 18 },
  authorInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF' },

  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },

  mediaTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  hobbyTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 9999, marginBottom: 10,
  },
  hobbyTagText: { fontSize: 12, fontWeight: '500' },

  postTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 16 },

  imageWrapper: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: 200 },

  actions: {
    flexDirection: 'row', gap: 20,
    paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, fontWeight: '500', color: '#9CA3AF' },
  likedCount: { color: '#EF4444' },

  commentsHeader: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 },
  commentsList: { gap: 0 },
  noComments: {
    fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 24,
  },

  // Comment input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, marginBottom: 20,
  },
  inputAvatarImage: {
    width: 32, height: 32, borderRadius: 16,
  },
  inputAvatarPlaceholder: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  inputAvatarInitials: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 9999,
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },

  errorContainer: { paddingVertical: 20, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 8 },
  retryText: { fontSize: 14, fontWeight: '600', color: '#111827', textDecorationLine: 'underline' },
});