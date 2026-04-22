import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { Heart, MessageCircle, Trophy, TrendingUp, Target, HelpCircle, MessageSquare, BookOpen, ChevronRight } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikePostAsync } from '../slices/postsSlice';
import { selectUser } from '../slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { IconRenderer } from './IconRenderer';
import { timeAgo } from '../utils/timeHelper';

const TYPE_CONFIG = {
  achievement: { label: 'Achievement', icon: Trophy, bg: '#FEF3C7', text: '#92400E' },
  progress: { label: 'Progress', icon: TrendingUp, bg: '#DBEAFE', text: '#1E40AF' },
  milestone: { label: 'Milestone', icon: Target, bg: '#F3E8FF', text: '#6B21A8' },
  discussion: { label: 'Discussion', icon: MessageSquare, bg: '#ECFDF5', text: '#059669' },
  question: { label: 'Question', icon: HelpCircle, bg: '#FEE2E2', text: '#991B1B' },
};

// ─── Post Author Avatar ───────────────────────────────────────────────────────
// Priority: network photo → initials
function PostAvatar({ post, hobby }) {
  if (post.userAvatarUrl) {
    return <Image source={{ uri: post.userAvatarUrl }} style={styles.avatarImg} />;
  }

  const initials = (post.userName || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.avatar, { backgroundColor: hobby ? `${hobby.color}20` : '#F3F4F6' }]}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PostCard({ post }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector((state) => state.hobbies.items);

  const hobby = post.hobbyId ? hobbies.find((h) => h.id === post.hobbyId) : null;
  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG.progress;
  const isLikedByMe = post.likedBy?.includes(user?.uid) || false;

  const handleTap = () => navigation.navigate('PostDetail', { postId: post.id });

  const handleAuthorTap = () => {
    if (post.userId && post.userId !== user?.uid) {
      navigation.navigate('UserProfile', { userId: post.userId });
    }
  };

  const handleLike = () => {
    dispatch(toggleLikePostAsync({
      postId: post.id,
      userId: user?.uid,
      isCurrentlyLiked: isLikedByMe,
    }));
  };

  const handleMediaTap = () => {
    if (post.mediaTitle) {
      navigation.navigate('MediaDetail', {
        mediaTitle: post.mediaTitle,
        hobbyId: post.hobbyId,
        mediaId: post.mediaId,
        tmdbMediaType: post.tmdbMediaType
      });
    }
  };

  return (
    <Pressable onPress={handleTap} style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleAuthorTap} style={styles.authorTap}>
          <PostAvatar post={post} hobby={hobby} />
          <View style={styles.headerInfo}>
            <Text style={styles.userName} numberOfLines={1}>{post.userName}</Text>
            <Text style={styles.timeAgo}>{timeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
          <typeConfig.icon size={10} color={typeConfig.text} />
          <Text style={[styles.typeBadgeText, { color: typeConfig.text }]}>
            {typeConfig.label}
          </Text>
        </View>
      </View>

      {/* Hobby & Media tags */}
      {(post.hobbyName || hobby) && (
        <View style={styles.tagsRow}>
          <View style={[
            styles.hobbyPill,
            { 
              backgroundColor: `${post.hobbyColor || hobby?.color || '#6B7280'}15`, 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 4 
            },
          ]}>
            <IconRenderer 
              iconName={post.hobbyIcon || hobby?.icon || 'activity'} 
              size={12} 
              color={post.hobbyColor || hobby?.color || '#6B7280'} 
            />
            <Text style={[styles.hobbyPillText, { color: post.hobbyColor || hobby?.color || '#6B7280' }]}>
              {post.hobbyName || hobby?.name}
            </Text>
          </View>

        </View>
      )}

      {/* Content */}
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>

      {post.image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={styles.postImage} />
        </View>
      ) : null}

      {/* Media Preview (if tagged) */}
      {post.mediaTitle && (
        <TouchableOpacity 
          onPress={handleMediaTap} 
          style={styles.mediaPreviewContainer}
          activeOpacity={0.7}
        >
          <View style={styles.mediaPreviewCoverWrapper}>
            {post.mediaCoverUrl ? (
              <Image 
                source={{ uri: post.mediaCoverUrl }} 
                style={styles.mediaPreviewCover} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.mediaPreviewPlaceholder}>
                <BookOpen size={16} color="#9CA3AF" />
              </View>
            )}
          </View>
          <View style={styles.mediaPreviewInfo}>
            <Text style={styles.mediaPreviewTitle} numberOfLines={1}>{post.mediaTitle}</Text>
            <Text style={styles.mediaPreviewSubtitle}>Tagged Media</Text>
          </View>
          <ChevronRight size={16} color="#D1D5DB" />
        </TouchableOpacity>
      )}

      {/* Footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart
            size={18}
            color={isLikedByMe ? '#EF4444' : '#9CA3AF'}
            fill={isLikedByMe ? '#EF4444' : 'transparent'}
          />
          <Text style={[styles.actionText, isLikedByMe && styles.actionTextLiked]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionButton}>
          <MessageCircle size={18} color="#9CA3AF" />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorTap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  headerInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  timeAgo: { fontSize: 12, color: '#9CA3AF' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  mediaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  mediaPillText: {
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
  hobbyPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },
  hobbyPillText: { fontSize: 12, fontWeight: '600' },
  postTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  postContent: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 12 },
  imageContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  postImage: { width: '100%', height: 180, resizeMode: 'cover' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 16,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, fontWeight: '500', color: '#9CA3AF' },
  actionTextLiked: { color: '#EF4444' },
  mediaPreviewContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mediaPreviewCoverWrapper: {
    width: 40,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  mediaPreviewCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  mediaPreviewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPreviewInfo: {
    flex: 1,
  },
  mediaPreviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  mediaPreviewSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});