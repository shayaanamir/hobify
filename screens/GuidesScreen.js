import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, TextInput,
} from 'react-native';
import { ArrowLeft, Search, SquarePen } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectGuide, fetchGuides, selectGuidesStatus } from '../slices/guidesSlice';
import { GuideCard } from '../components/GuideCard';

export default function GuidesScreen({ navigation }) {
  const dispatch = useDispatch();
  const guides = useSelector((state) => state.guides.items);
  const guidesStatus = useSelector(selectGuidesStatus);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (guidesStatus === 'idle') {
      dispatch(fetchGuides());
    }
  }, [guidesStatus, dispatch]);

  const filtered = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpen = (guide) => {
    dispatch(selectGuide(guide.id));
    navigation.navigate('GuideDetail', { guideId: guide.id });
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Guides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateGuide')} style={styles.writeBtn}>
            <SquarePen size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search guides..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* List */}
        <View style={styles.list}>
          {filtered.length > 0 ? (
            filtered.map((guide) => (
              <GuideCard key={guide.id} guide={guide} onPress={() => handleOpen(guide)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyText}>No guides found</Text>
            </View>
          )}
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
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backBtn: { padding: 4 },
  writeBtn: { padding: 4 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  list: { gap: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
