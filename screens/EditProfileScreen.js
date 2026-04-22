import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
  KeyboardAvoidingView, Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, ImageIcon } from 'lucide-react-native';
import { selectUser, updateProfileAsync } from '../slices/authSlice';
import { uploadAvatarToCloudinary } from '../services/authService';

// ─── Initials Avatar ──────────────────────────────────────────────────────────
// Shown as a placeholder when the user has no avatar yet.
function InitialsAvatar({ name, size = 88 }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.initialsAvatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  // localUri is a temporary preview URI; cleared after save
  const [localUri, setLocalUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // The avatar to display in the preview: local pick > existing URL > null (shows initials)
  const previewUri = localUri || user?.avatarUrl || null;

  // ── Pickers ──────────────────────────────────────────────────────────────────

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalUri(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalUri(result.assets[0].uri);
    }
  };

  const showPickerOptions = () => {
    Alert.alert('Change Photo', 'Choose a source', [
      { text: 'Camera', onPress: pickFromCamera },
      { text: 'Photo Library', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a display name.');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = user?.avatarUrl ?? null;

      // Only upload if the user picked a new image this session
      if (localUri) {
        setUploading(true);
        avatarUrl = await uploadAvatarToCloudinary(localUri, user.uid);
        setUploading(false);
      }

      await dispatch(updateProfileAsync({
        uid: user.uid,
        updates: {
          name: name.trim(),
          bio: bio.trim(),
          avatarUrl,
        },
      }));

      navigation.goBack();
    } catch (err) {
      setUploading(false);
      Alert.alert('Error', err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={showPickerOptions}
              style={styles.avatarTouchable}
              activeOpacity={0.85}
            >
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.avatarImage} />
              ) : (
                <InitialsAvatar name={name || user?.name} size={100} />
              )}

              {/* Camera overlay badge */}
              <View style={styles.cameraBadge}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.avatarHint}>Tap to change photo</Text>

            {/* Quick-access buttons */}
            <View style={styles.photoActions}>
              <TouchableOpacity
                onPress={pickFromCamera}
                style={styles.photoActionBtn}
              >
                <Camera size={14} color="#374151" />
                <Text style={styles.photoActionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickFromGallery}
                style={styles.photoActionBtn}
              >
                <ImageIcon size={14} color="#374151" />
                <Text style={styles.photoActionText}>Library</Text>
              </TouchableOpacity>
            </View>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },

  // Header
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
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

  // Body
  body: { padding: 24, paddingBottom: 60 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 36 },
  avatarTouchable: { position: 'relative', marginBottom: 10 },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  initialsAvatar: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  initialsText: { fontWeight: '700', color: '#6B7280' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FAF8F5',
  },
  avatarHint: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  photoActions: { flexDirection: 'row', gap: 10 },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  photoActionText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Form
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
  bioInput: { height: 120, paddingTop: 13 },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
});