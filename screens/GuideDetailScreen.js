import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Clock, Heart } from 'lucide-react-native';
import { IconRenderer } from '../components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikeGuideAsync } from '../slices/guidesSlice';
import { selectUser } from '../slices/authSlice';

function renderContent(content) {
  return content.split('\n').map((line, i) => {
    if (!line.trim()) {
      return <View key={i} style={{ height: 10 }} />;
    }
    // Full-line bold header: **Header**
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <Text key={i} style={styles.contentHeading}>
          {line.replace(/\*\*/g, '')}
        </Text>
      );
    }
    // Inline bold spans: mix of **bold** and normal
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/);
      return (
        <Text key={i} style={styles.contentBody}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <Text key={j} style={styles.contentBold}>{part}</Text>
              : <Text key={j}>{part}</Text>
          )}
        </Text>
      );
    }
    // Bullet / dash
    if (line.startsWith('•') || line.startsWith('- ')) {
      return <Text key={i} style={[styles.contentBody, styles.bullet]}>{line}</Text>;
    }
    // Numbered
    if (/^\d+\./.test(line.trim())) {
      return <Text key={i} style={[styles.contentBody, styles.bullet]}>{line}</Text>;
    }
    return <Text key={i} style={styles.contentBody}>{line}</Text>;
  });
}

export default function GuideDetailScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const guideId = route?.params?.guideId;
  const guides = useSelector((state) => state.guides.items);
  const selectedGuideId = useSelector((state) => state.guides.selectedGuideId);
  const hobbies = useSelector((state) => state.hobbies.items);

  const guide = guides.find((g) => g.id === (guideId || selectedGuideId));
  if (!guide) return null;

  const isLikedByMe = guide.likedBy?.includes(user?.uid) || false;
  const hobby = guide.hobbyId ? hobbies.find((h) => h.id === guide.hobbyId) : null;

  const handleLike = () => {
    if (!user) return;
    dispatch(toggleLikeGuideAsync({ guideId: guide.id, userId: user.uid, isCurrentlyLiked: isLikedByMe }));
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Hobby Tag */}
        {hobby && (
          <View style={[styles.hobbyTag, { backgroundColor: `${hobby.color}15`, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <IconRenderer iconName={hobby.icon} size={12} color={hobby.color} />
            <Text style={[styles.hobbyTagText, { color: hobby.color }]}>
              {hobby.name}
            </Text>
          </View>
        )}

        {/* Title & Description */}
        <Text style={styles.guideTitle}>{guide.title}</Text>
        <Text style={styles.guideDescription}>{guide.description}</Text>

        {/* Author & Meta */}
        <View style={styles.metaRow}>
          <TouchableOpacity 
            onPress={() => guide.userId && navigation.navigate('UserProfile', { userId: guide.userId })}
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
          <View style={styles.metaStat}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.metaStatText}>{guide.readTime} min read</Text>
          </View>
          <TouchableOpacity onPress={handleLike} style={styles.metaStat}>
            <Heart size={14} color={isLikedByMe ? '#EF4444' : '#9CA3AF'} fill={isLikedByMe ? '#EF4444' : 'transparent'} />
            <Text style={[styles.metaStatText, isLikedByMe && { color: '#EF4444' }]}>{guide.likes}</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Guide Content */}
        <View style={styles.contentBlock}>
          {renderContent(guide.content)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 70 : 48,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  hobbyTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 10,
  },
  hobbyTagText: { fontSize: 12, fontWeight: '600' },
  guideTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 28,
  },
  guideDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: { fontSize: 14 },
  authorName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  metaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaStatText: { fontSize: 12, color: '#9CA3AF' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  contentBlock: { gap: 2 },
  contentHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 4,
  },
  contentBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  contentBold: {
    fontWeight: '600',
    color: '#111827',
  },
  bullet: {
    paddingLeft: 8,
  },
});
