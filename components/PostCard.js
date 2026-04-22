import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Trophy, TrendingUp, Target, HelpCircle } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikePostAsync } from '../slices/postsSlice';
import { selectUser } from '../slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { IconRenderer } from './IconRenderer';

const TYPE_CONFIG = {
  achievement: { label: 'Achievement', icon: Trophy, bg: '#FEF3C7', text: '#92400E' },
  progress: { label: 'Progress', icon: TrendingUp, bg: '#DBEAFE', text: '#1E40AF' },
  milestone: { label: 'Milestone', icon: Target, bg: '#F3E8FF', text: '#6B21A8' },
  question: { label: 'Question', icon: HelpCircle, bg: '#FEE2E2', text: '#991B1B' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(0, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PostCard({ post }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector(state => state.hobbies.items);

  const hobby = post.hobbyId ? hobbies.find(h => h.id === post.hobbyId) : null;
  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG.progress;
  const isLikedByMe = post.likedBy?.includes(user?.uid) || false;

  const handleTap = () => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const handleAuthorTap = () => {
    // Don't navigate if this is the current user's own post
    if (post.userId && post.userId !== user?.uid) {
      navigation.navigate('UserProfile', { userId: post.userId });
    }
  };

  const handleLike = () => {
    dispatch(toggleLikePostAsync({ postId: post.id, userId: user?.uid, isCurrentlyLiked: isLikedByMe }));
  };

  return (
    <TouchableOpacity onPress={handleTap} style={styles.card} activeOpacity={0.9}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleAuthorTap} style={styles.authorTap}>
          {post.userAvatarUrl ? (
            <Image source={{ uri: post.userAvatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: hobby ? `${hobby.color}20` : '#F3F4F6' }]}>
              <Text style={styles.avatarText}>{post.userAvatar || '😊'}</Text>
            </View>
          )}
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

      {hobby && (
        <View style={[styles.hobbyPill, { backgroundColor: `${hobby.color}15`, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <IconRenderer iconName={hobby.icon} size={12} color={hobby.color} />
          <Text style={[styles.hobbyPillText, { color: hobby.color }]}>
            {hobby.name}
          </Text>
        </View>
      )}

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>

      {post.image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={styles.postImage} />
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart size={18} color={isLikedByMe ? '#EF4444' : '#9CA3AF'} fill={isLikedByMe ? '#EF4444' : 'transparent'} />
          <Text style={[styles.actionText, isLikedByMe && styles.actionTextLiked]}>{post.likes}</Text>
        </TouchableOpacity>
        <View style={styles.actionButton}>
          <MessageCircle size={18} color="#9CA3AF" />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
  avatarText: {
    fontSize: 16,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  hobbyPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },
  hobbyPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  actionTextLiked: {
    color: '#EF4444',
  },
});