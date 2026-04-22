import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Comment Author Avatar ────────────────────────────────────────────────────
// Priority: network photo → initials
function CommentAvatar({ comment }) {
  if (comment.userAvatarUrl) {
    return <Image source={{ uri: comment.userAvatarUrl }} style={styles.avatarImage} />;
  }

  const initials = (comment.userName || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CommentItem({ comment }) {
  return (
    <View style={styles.row}>
      <CommentAvatar comment={comment} />
      <View style={styles.bubble}>
        <View style={styles.bubbleHeader}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  bubble: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  userName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  time: { fontSize: 10, color: '#9CA3AF' },
  content: { fontSize: 13, color: '#374151', lineHeight: 18 },
});