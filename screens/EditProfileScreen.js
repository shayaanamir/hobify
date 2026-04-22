import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Platform, ActivityIndicator, Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Camera, X, User, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { selectUser, updateProfileAsync } from '../slices/authSlice';
import { uploadAvatarImage } from '../services/authService';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a display name.');
      return;
    }
    setUploading(true);
    try {
      let avatarUrl = user?.avatarUrl || null;

      // If user picked a new local image, upload it to Firebase Storage
      if (avatarUri && avatarUri !== user?.avatarUrl) {
        avatarUrl = await uploadAvatarImage(user.uid, avatarUri);
      }

      await dispatch(updateProfileAsync({
        uid: user.uid,
        updates: { name: name.trim(), bio: bio.trim(), avatarUrl },
      }));

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setUploading(false);
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
            disabled={uploading}
            style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
          >
            {uploading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Avatar Picker */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
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
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 8 },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHint: { fontSize: 13, color: '#9CA3AF' },
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
