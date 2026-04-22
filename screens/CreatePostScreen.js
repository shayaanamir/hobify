import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, KeyboardAvoidingView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { X, Trophy, TrendingUp, Target, HelpCircle, MessageSquare, BookOpen } from 'lucide-react-native';
import { IconRenderer } from '../components';
import { addPostAsync } from '../slices/postsSlice';
import { selectUser } from '../slices/authSlice';

const POST_TYPES = [
  { id: 'progress', label: 'Progress', icon: TrendingUp, color: '#1E40AF' },
  { id: 'achievement', label: 'Achievement', icon: Trophy, color: '#92400E' },
  { id: 'milestone', label: 'Milestone', icon: Target, color: '#6B21A8' },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare, color: '#059669' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: '#991B1B' },
];

export default function CreatePostScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector((state) => state.hobbies.items);
  const sessions = useSelector((state) => state.sessions.items);

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState(POST_TYPES[0].id);
  const [postHobbyId, setPostHobbyId] = useState('');
  const [taggedMedia, setTaggedMedia] = useState(null);

  const selectedHobby = hobbies.find(h => h.id === postHobbyId);
  const isMediaHobby = selectedHobby?.type === 'media';

  const hobbyMediaItems = React.useMemo(() => {
    if (!isMediaHobby) return [];
    const uniqueTitles = new Set();
    sessions.forEach(s => {
      if (s.hobbyId === postHobbyId && s.mediaTitle) {
        uniqueTitles.add(s.mediaTitle);
      }
    });
    return Array.from(uniqueTitles);
  }, [sessions, postHobbyId, isMediaHobby]);

  const handlePostSubmit = () => {
    if (!postTitle.trim() || !postContent.trim() || !user) return;

    dispatch(addPostAsync({
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar || null,
      userAvatarUrl: user.avatarUrl || null,
      post: {
        title: postTitle.trim(),
        content: postContent.trim(),
        type: postType,
        hobbyId: postHobbyId || null,
        hobbyName: selectedHobby?.name || null,
        hobbyColor: selectedHobby?.color || null,
        hobbyIcon: selectedHobby?.icon || null,
        hobbyCategory: selectedHobby?.category || null,
        mediaTitle: isMediaHobby ? taggedMedia : null,
      }
    }));

    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
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
                style={[
                  styles.typeSelectorBtn,
                  postType === type.id && { borderColor: type.color, backgroundColor: `${type.color}10` }
                ]}
                onPress={() => setPostType(type.id)}
              >
                <type.icon size={14} color={postType === type.id ? type.color : '#9CA3AF'} />
                <Text style={[
                  styles.typeSelectorText,
                  postType === type.id && { color: type.color, fontWeight: '700' }
                ]}>
                  {type.label}
                </Text>
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
                onPress={() => {
                  setPostHobbyId(hobby.id);
                  setTaggedMedia(null); // Reset tagged media when hobby changes
                }}
              >
                <View style={[
                  styles.hobbyPill,
                  postHobbyId === hobby.id && { backgroundColor: `${hobby.color}15`, borderColor: hobby.color, flexDirection: 'row', alignItems: 'center', gap: 4 }
                ]}>
                  {postHobbyId === hobby.id && <IconRenderer iconName={hobby.icon} size={14} color={hobby.color} />}
                  <Text style={[styles.hobbyPillText, postHobbyId === hobby.id && { color: hobby.color, fontWeight: '700' }]}>
                    {hobby.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isMediaHobby && hobbyMediaItems.length > 0 && (
            <>
              <Text style={styles.inputLabel}>Tag Media</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hobbyRow}>
                <TouchableOpacity
                  style={[styles.hobbyPill, taggedMedia === null && styles.hobbyPillActive]}
                  onPress={() => setTaggedMedia(null)}
                >
                  <Text style={[styles.hobbyPillText, taggedMedia === null && styles.hobbyPillTextActive]}>None</Text>
                </TouchableOpacity>
                {hobbyMediaItems.map(title => (
                  <TouchableOpacity
                    key={title}
                    onPress={() => setTaggedMedia(title)}
                  >
                    <View style={[
                      styles.hobbyPill,
                      taggedMedia === title && { backgroundColor: `${selectedHobby.color}15`, borderColor: selectedHobby.color, flexDirection: 'row', alignItems: 'center', gap: 6 }
                    ]}>
                      {taggedMedia === title && <BookOpen size={14} color={selectedHobby.color} />}
                      <Text style={[styles.hobbyPillText, taggedMedia === title && { color: selectedHobby.color, fontWeight: '700' }]}>
                        {title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.bottomPostBtn,
              (!postTitle.trim() || !postContent.trim()) && styles.bottomPostBtnDisabled
            ]}
            onPress={handlePostSubmit}
            disabled={!postTitle.trim() || !postContent.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.bottomPostBtnText}>Post to Community</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  body: { flex: 1, padding: 20 },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  bottomPostBtn: {
    backgroundColor: '#111827',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomPostBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  bottomPostBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
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
  tabTextActive: { color: '#6366F1', fontWeight: '700' },
  hobbyRow: {
    gap: 10,
    paddingBottom: 20,
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