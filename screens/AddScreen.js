import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { X, Check } from 'lucide-react-native';
import { addHobby } from '../slices/hobbiesSlice';

const EMOJIS = ['🎸','📚','🏃','🎨','🍳','🎹','📷','🧶','🪴','🧘','🏊','🚴','✍️','🎭','🧩','🎤'];
const COLORS = ['#F97066','#2DD4BF','#FBBF24','#A78BFA','#34D399','#60A5FA','#F472B6','#FB923C'];
const CATEGORIES = ['Creative','Sports','Music','Learning','Cooking','Other'];

/**
 * AddScreen — Full-screen modal for creating hobbies.
 */
export default function AddScreen({ navigation }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Creative');
  const [icon, setIcon] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch(addHobby({
      id: `h${Date.now()}`,
      type: 'activity', // default type; could be chosen if media mapping is required
      name: name.trim(),
      category,
      icon,
      color,
      streak: 0,
      totalHours: 0,
      totalSessions: 0,
    }));
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Hobby</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.previewIconWrapper, { backgroundColor: color }]}>
            <Text style={styles.previewIconText}>{icon}</Text>
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Piano, Gardening..."
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.chip, category === cat ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipText, category === cat ? styles.chipTextSelected : null]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color */}
        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorBubble,
                  { backgroundColor: c },
                  color === c && styles.colorBubbleSelected
                ]}
              />
            ))}
          </View>
        </View>

        {/* Icon */}
        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => setIcon(e)}
                style={[styles.emojiButton, icon === e && styles.emojiButtonSelected]}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!name.trim()}
          style={[
            styles.saveButton,
            name.trim() ? styles.saveButtonActive : styles.saveButtonDisabled
          ]}
        >
          <Check size={20} color="#FFFFFF" strokeWidth={3} />
          <Text style={styles.saveButtonText}>Create Hobby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 24,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  previewIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  previewIconText: {
    fontSize: 48,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#111827',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  colorBubbleSelected: {
    borderWidth: 3,
    borderColor: '#E5E7EB',
    transform: [{ scale: 1.15 }],
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emojiButtonSelected: {
    backgroundColor: '#E5E7EB',
  },
  emojiText: {
    fontSize: 20,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 10,
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonActive: {
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
