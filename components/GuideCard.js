import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/authSlice';

export function GuideCard({ guide, onPress }) {
  const navigation = useNavigation();
  const currentUser = useSelector(selectUser);

  const handleAuthorTap = (e) => {
    // If we are already on a profile or it's our own, optional check:
    // For simplicity, just navigate if it's not us or always navigate
    if (guide.userId) {
      navigation.navigate('UserProfile', { userId: guide.userId });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleAuthorTap} 
          style={styles.authorRow}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            {guide.userAvatarUrl ? (
              <Image source={{ uri: guide.userAvatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarEmoji}>{guide.userAvatar || '👤'}</Text>
            )}
          </View>
          <Text style={styles.authorName}>{guide.userName}</Text>
        </TouchableOpacity>
        <View style={styles.metaRow}>
          <Clock size={12} color="#9CA3AF" />
          <Text style={styles.metaText}>{guide.readTime} min</Text>
          <Heart size={12} color="#9CA3AF" />
          <Text style={styles.metaText}>{guide.likes}</Text>
        </View>
      </View>
      <Text style={styles.title}>{guide.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{guide.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: { fontSize: 13 },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
