import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { X, Check, Zap, Clapperboard } from 'lucide-react-native';
import { addHobbyAsync } from '../slices/hobbiesSlice';
import { selectUser } from '../slices/authSlice';
import { HOBBY_ICONS, IconRenderer } from '../components';

const COLORS = ['#F97066', '#2DD4BF', '#FBBF24', '#A78BFA', '#34D399', '#60A5FA', '#F472B6', '#FB923C'];
const CATEGORIES = ['Creative', 'Sports', 'Music', 'Learning', 'Cooking', 'Entertainment', 'Other'];

const TYPE_OPTIONS = [
  {
    value: 'activity',
    label: 'Activity',
    icon: Zap,
    description: 'Track time & sessions for things you practice or do regularly.',
  },
  {
    value: 'media',
    label: 'Media',
    icon: Clapperboard,
    description: 'Log books, shows, films or games — track titles, ratings & progress.',
  },
];

/**
 * AddScreen — Full-screen modal for creating hobbies.
 */
export default function AddScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [name, setName] = useState('');
  const [type, setType] = useState('activity');
  const [category, setCategory] = useState('Creative');
  const [icon, setIcon] = useState(HOBBY_ICONS[0].icon);
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!name.trim() || !user) return;
    dispatch(addHobbyAsync({
      userId: user.uid,
      hobby: {
        type,
        name: name.trim(),
        category,
        icon,
        color,
      },
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
            <IconRenderer iconName={icon} size={48} color="#FFFFFF" />
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

        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => {
              const selected = type === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setType(opt.value)}
                  style={[styles.typeCard, selected && styles.typeCardSelected]}
                >
                  <View style={styles.typeCardTop}>
                    <opt.icon size={16} color={selected ? '#111827' : '#9CA3AF'} />
                    <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                      {opt.label}
                    </Text>
                    <View style={[styles.typeRadio, selected && styles.typeRadioSelected]}>
                      {selected && <View style={styles.typeRadioDot} />}
                    </View>
                  </View>
                  <Text style={[styles.typeDescription, selected && styles.typeDescriptionSelected]}>
                    {opt.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
            {HOBBY_ICONS.map((item) => (
              <TouchableOpacity
                key={item.icon}
                onPress={() => setIcon(item.icon)}
                style={[styles.emojiButton, icon === item.icon && styles.emojiButtonSelected]}
              >
                <IconRenderer iconName={item.icon} size={24} color={icon === item.icon ? '#111827' : '#9CA3AF'} />
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
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#111827',
  },
  typeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  typeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  typeLabelSelected: {
    color: '#111827',
  },
  typeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeRadioSelected: {
    borderColor: '#111827',
  },
  typeRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  typeDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  typeDescriptionSelected: {
    color: '#4B5563',
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