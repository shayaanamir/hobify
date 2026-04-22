import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, TextInput, Alert, KeyboardAvoidingView
} from 'react-native';
import { ArrowLeft, Check, BookOpen, Layout, MessageSquare, Clock } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../slices/authSlice';
import { selectAllHobbies } from '../slices/hobbiesSlice';
import { createGuideAsync } from '../slices/guidesSlice';
import { IconRenderer } from '../components';

export default function CreateGuideScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector(selectAllHobbies);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedHobbyId, setSelectedHobbyId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Fields', 'Please provide at least a title and some content.');
      return;
    }

    setLoading(true);
    try {
      // Estimate read time: ~200 words per minute
      const wordCount = content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      const guideData = {
        title: title.trim(),
        description: description.trim() || 'A helpful guide for this hobby.',
        content: content.trim(),
        readTime,
        hobbyId: selectedHobbyId,
      };

      await dispatch(createGuideAsync({
        userId: user.uid,
        userName: user.name,
        userAvatar: user.avatar || null,
        userAvatarUrl: user.avatarUrl || null,
        guideData
      })).unwrap();

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err || 'Failed to create guide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Guide</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveBtn, loading && styles.disabledBtn]}
        >
          <Check size={20} color={loading ? '#9CA3AF' : '#2DD4BF'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="How to master..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Hobby Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Related Hobby (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hobbyScroll}>
            <TouchableOpacity
              onPress={() => setSelectedHobbyId(null)}
              style={[
                styles.hobbyChip,
                !selectedHobbyId && styles.hobbyChipSelected
              ]}
            >
              <Layout size={14} color={!selectedHobbyId ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.hobbyChipText, !selectedHobbyId && styles.hobbyChipTextSelected]}>General</Text>
            </TouchableOpacity>
            {hobbies.map((h) => (
              <TouchableOpacity
                key={h.id}
                onPress={() => setSelectedHobbyId(h.id)}
                style={[
                  styles.hobbyChip,
                  selectedHobbyId === h.id && { backgroundColor: h.color }
                ]}
              >
                <IconRenderer iconName={h.icon} size={14} color={selectedHobbyId === h.id ? '#FFFFFF' : h.color} />
                <Text style={[styles.hobbyChipText, selectedHobbyId === h.id && styles.hobbyChipTextSelected]}>{h.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Short Summary</Text>
          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={setDescription}
            placeholder="A brief overview of what this guide covers."
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        {/* Content */}
        <View style={styles.inputGroup}>
          <View style={styles.contentLabelRow}>
            <Text style={styles.label}>Content</Text>
            <Text style={styles.hint}>Supports **Bold** and - Bullets</Text>
          </View>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing your guide here..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 70 : 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  backBtn: { padding: 4 },
  saveBtn: { padding: 4 },
  disabledBtn: { opacity: 0.5 },
  scrollContent: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },
  hobbyScroll: { flexDirection: 'row', marginTop: 4 },
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  hobbyChipSelected: { backgroundColor: '#111827' },
  hobbyChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  hobbyChipTextSelected: { color: '#FFFFFF' },
  descInput: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 20,
    padding: 0,
  },
  contentLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hint: { fontSize: 11, color: '#9CA3AF' },
  contentInput: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    minHeight: 300,
    padding: 0,
  },
});
