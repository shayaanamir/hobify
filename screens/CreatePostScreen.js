import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { X, Check } from 'lucide-react-native';
import { selectUser, updateProfileAsync } from '../slices/authSlice';

const AVATAR_OPTIONS = [
  { emoji: '😊', bg: '#FEF3C7' },
  { emoji: '🧑‍💻', bg: '#DBEAFE' },
  { emoji: '🎨', bg: '#F3E8FF' },
  { emoji: '🎸', bg: '#FEE2E2' },
  { emoji: '📚', bg: '#D1FAE5' },
  { emoji: '🏃', bg: '#FFF7ED' },
  { emoji: '🍳', bg: '#FEF9C3' },
  { emoji: '🎹', bg: '#EDE9FE' },
  { emoji: '📷', bg: '#E0F2FE' },
  { emoji: '🧘', bg: '#FCE7F3' },
  { emoji: '🚴', bg: '#ECFDF5' },
  { emoji: '✍️', bg: '#FFF1F2' },
  { emoji: '🎤', bg: '#F0FDF4' },
  { emoji: '🧩', bg: '#FDF4FF' },
  { emoji: '🌿', bg: '#D1FAE5' },
  { emoji: '⚡', bg: '#FEF08A' },
];

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || AVATAR_OPTIONS[0].emoji
  );
  const [saving, setSaving] = useState(false);

  const currentBg = AVATAR_OPTIONS.find(a => a.emoji === selectedAvatar)?.bg || '#F3F4F6';

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a display name.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(updateProfileAsync({
        uid: user.uid,
        updates: {
          name: name.trim(),
          bio: bio.trim(),
          avatar: selectedAvatar,
        },
      }));
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          >
            {saving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarPreview, { backgroundColor: currentBg }]}>
              <Text style={styles.avatarPreviewEmoji}>{selectedAvatar}</Text>
            </View>
            <Text style={styles.avatarHint}>Choose your avatar</Text>
          </View>

          {/* Avatar Grid */}
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = selectedAvatar === opt.emoji;
              return (
                <TouchableOpacity
                  key={opt.emoji}
                  onPress={() => setSelectedAvatar(opt.emoji)}
                  style={[
                    styles.avatarOption,
                    { backgroundColor: opt.bg },
                    isSelected && styles.avatarOptionSelected,
                  ]}
                >
                  <Text style={styles.avatarOptionEmoji}>{opt.emoji}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Check size={8} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Name */}
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />

          {/* Bio */}
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself and your hobbies..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            maxLength={160}
          />
          <Text style={styles.charCount}>{bio.length}/160</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  headerBtn: { padding: 4 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  body: { padding: 24, paddingBottom: 60 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPreview: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarPreviewEmoji: { fontSize: 42 },
  avatarHint: { fontSize: 13, color: '#9CA3AF' },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 32,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    borderWidth: 2.5,
    borderColor: '#111827',
  },
  avatarOptionEmoji: { fontSize: 26 },
  selectedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FAF8F5',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bioInput: {
    height: 120,
    paddingTop: 13,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
});