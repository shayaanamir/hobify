import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Platform, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ChevronRight, Library, Star, Clock } from 'lucide-react-native';
import { IconRenderer } from '../components';
import { MediaLogItem } from '../components';
import { selectMedia } from '../slices/sessionsSlice';

export default function CollectionScreen({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const hobbies = useSelector((state) => state.hobbies.items);
  const sessions = useSelector((state) => state.sessions.items);

  const allMediaItems = useMemo(() => {
    const itemsMap = new Map();
    
    sessions.forEach((session) => {
      if (!session.mediaTitle) return;
      const key = `${session.mediaTitle}-${session.hobbyId}`;
      const existing = itemsMap.get(key);
      
      if (existing) {
        itemsMap.set(key, {
          ...existing,
          rating: session.rating || existing.rating,
          status: session.status === 'completed' ? 'completed' : existing.status,
          coverUrl: session.mediaCoverUrl || existing.coverUrl,
          mediaId: session.mediaId || existing.mediaId,
          tmdbMediaType: session.tmdbMediaType || existing.tmdbMediaType,
          sessionCount: existing.sessionCount + 1,
          totalMinutes: existing.totalMinutes + session.duration,
          lastDate: session.date > existing.lastDate ? session.date : existing.lastDate,
        });
      } else {
        itemsMap.set(key, {
          title: session.mediaTitle,
          hobbyId: session.hobbyId,
          rating: session.rating,
          status: session.status,
          coverUrl: session.mediaCoverUrl,
          mediaId: session.mediaId,
          tmdbMediaType: session.tmdbMediaType,
          sessionCount: 1,
          totalMinutes: session.duration,
          lastDate: session.date,
        });
      }
    });
    
    return Array.from(itemsMap.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );
  }, [sessions]);

  const filteredItems = allMediaItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const hobby = hobbies.find((h) => h.id === item.hobbyId);
      if (!hobby) return;
      
      const groupName = hobby.name;
      if (!groups[groupName]) {
        groups[groupName] = { hobby, items: [] };
      }
      groups[groupName].items.push(item);
    });
    return Object.values(groups);
  }, [filteredItems, hobbies]);

  const handleItemClick = (title, hobbyId, mediaId) => {
    dispatch(selectMedia({ title, hobbyId }));
    navigation.navigate('MediaDetail', { mediaTitle: title, hobbyId, mediaId });
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Collection</Text>
          <View style={styles.headerIconWrapper}>
            <Library size={20} color="#6B7280" />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search style={styles.searchIcon} size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your collection..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          {groupedItems.length > 0 ? (
            groupedItems.map((group) => (
              <View key={group.hobby.id} style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupHeaderText}>
                    <IconRenderer iconName={group.hobby.icon} size={14} color={group.hobby.color} />
                    <Text style={[styles.hobbyPillText, { color: group.hobby.color }]}>
                      {group.hobby.name}
                    </Text>
                  </Text>
                </View>
                <View style={styles.gridContainer}>
                  {group.items.map((item) => (
                    <TouchableOpacity 
                      key={`${item.title}-${item.hobbyId}`} 
                      style={styles.gridItem}
                      onPress={() => handleItemClick(item.title, item.hobbyId, item.id)}
                    >
                      <View style={styles.coverWrapper}>
                        {item.coverUrl ? (
                          <Image 
                            source={{ uri: item.coverUrl }} 
                            style={styles.coverImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.placeholderCover}>
                            <Library size={32} color="#9CA3AF" />
                          </View>
                        )}
                        {item.status === 'completed' && (
                          <View style={styles.completedBadge}>
                            <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                        <View style={styles.ratingRow}>
                          <Star size={10} color={item.rating ? '#F59E0B' : '#D1D5DB'} fill={item.rating ? '#F59E0B' : 'transparent'} />
                          <Text style={styles.ratingText}>{item.rating || '—'}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No media items found</Text>
              <Text style={styles.emptySubtitle}>Log a session in a media hobby to see it here.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 24,
    paddingBottom: 120, // Tab bar padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -9 }],
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14,
    color: '#111827',
  },
  listContainer: {
    gap: 12,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupHeader: {
    marginBottom: 12,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9CA3AF',
  },
  itemWrapper: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyTitle: {
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingLeft: 4,
  },
  gridItem: {
    width: '30%', // Roughly 3 columns
    marginBottom: 20,
  },
  coverWrapper: {
    width: '100%',
    aspectRatio: 2/3,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  completedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  itemInfo: {
    paddingHorizontal: 2,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 16,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  hobbyPillText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
