import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { X, Check, Clock, Calendar as CalendarIcon, Star, BookOpen, Gamepad2, Clapperboard } from 'lucide-react-native';
import { IconRenderer, MediaSearchInput } from '../components';
import { logSessionAsync } from '../slices/sessionsSlice';
import { updateHobbyStatsAsync } from '../slices/hobbiesSlice';
import { selectUser } from '../slices/authSlice';
import { updateGoalProgressAsync } from '../slices/goalsSlice';
import { getMediaDetails } from '../services/mediaSearchService';


export default function LogSessionScreen({ route, navigation }) {
  const { hobbyId, preSelectedMedia } = route.params || {};
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const hobby = useSelector((state) =>
    state.hobbies.items.find((h) => h.id === hobbyId)
  );

  const goals = useSelector((state) =>
    state.goals.items.filter((g) => g.hobbyId === hobbyId)
  );
  const sessions = useSelector((state) => state.sessions.items);

  const libraryItems = React.useMemo(() => {
    const isMedia = hobby?.type === 'media';
    if (!isMedia) return [];
    
    // Sort sessions by date descending to get most recent first
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const itemsMap = new Map();
    sortedSessions.forEach(s => {
      if (s.hobbyId === hobbyId && s.mediaTitle) {
        // Use mediaId as key, or title if ID is missing
        const key = s.mediaId || s.mediaTitle;
        const existing = itemsMap.get(key);
        if (!existing || (!existing.coverUrl && s.mediaCoverUrl)) {
          itemsMap.set(key, {
            id: s.mediaId,
            title: s.mediaTitle,
            coverUrl: s.mediaCoverUrl,
            tmdbMediaType: s.tmdbMediaType
          });
        }
      }
    });
    return Array.from(itemsMap.values());
  }, [sessions, hobbyId, hobby]);

  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Media specific state
  const [mediaTitle, setMediaTitle] = useState(preSelectedMedia?.title || '');
  const [mediaCoverUrl, setMediaCoverUrl] = useState(preSelectedMedia?.coverUrl || null);
  const [mediaId, setMediaId] = useState(preSelectedMedia?.id || null);
  const [tmdbMediaType, setTmdbMediaType] = useState(preSelectedMedia?.tmdbMediaType || null);
  const [rating, setRating] = useState(undefined);
  const [status, setStatus] = useState('in-progress');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  React.useEffect(() => {
    if (preSelectedMedia?.id && String(preSelectedMedia.id).startsWith('tmdb_')) {
      handleSelectMedia(preSelectedMedia);
    }
  }, []);

  if (!hobby) return null;

  const isMediaHobby = hobby.type === 'media';

  const handleSave = async () => {
    if (!user) return;

    const sessionData = {
      hobbyId: hobby.id,
      date: new Date(date).toISOString(),
      duration,
    };
    if (notes.trim()) sessionData.notes = notes.trim();
    if (isMediaHobby) {
      if (mediaTitle.trim()) {
        sessionData.mediaTitle = mediaTitle.trim();
        if (mediaCoverUrl) sessionData.mediaCoverUrl = mediaCoverUrl;
        if (mediaId) sessionData.mediaId = mediaId;
        if (tmdbMediaType) sessionData.tmdbMediaType = tmdbMediaType;
      }
      if (rating !== undefined) sessionData.rating = rating;
      if (status) sessionData.status = status;
    }

    await dispatch(logSessionAsync({ 
      userId: user.uid, 
      session: sessionData,
      userName: user.name,
      userAvatarUrl: user.photoURL || user.avatarUrl,
      hobbyName: hobby.name,
      hobbyIcon: hobby.icon,
      hobbyColor: hobby.color
    }));
    await dispatch(
      updateHobbyStatsAsync({ hobbyId: hobby.id, durationMinutes: duration, currentHobby: hobby })
    );

    navigation.goBack();
  };

  const getMediaLabel = () => {
    if (hobby.name.toLowerCase().includes('reading')) return 'Book Title';
    if (hobby.name.toLowerCase().includes('gaming')) return 'Game Title';
    if (hobby.name.toLowerCase().includes('movie')) return 'Movie Title';
    return 'Title';
  };

  const getSearchType = () => {
    if (hobby.name.toLowerCase().includes('reading') || hobby.name.toLowerCase().includes('book')) return 'book';
    if (hobby.name.toLowerCase().includes('gaming') || hobby.name.toLowerCase().includes('game')) return 'game';
    if (hobby.name.toLowerCase().includes('movie') || hobby.name.toLowerCase().includes('show') || hobby.name.toLowerCase().includes('tv')) return 'movie';
    return 'book'; // Default
  };

  const getMediaPlaceholder = () => {
    if (hobby.name.toLowerCase().includes('reading')) return 'What are you reading?';
    if (hobby.name.toLowerCase().includes('gaming')) return 'What are you playing?';
    if (hobby.name.toLowerCase().includes('movie')) return 'What did you watch?';
    return 'What are you doing?';
  };

  const getMediaIcon = () => {
    if (hobby.name.toLowerCase().includes('reading')) return <BookOpen size={16} color="#9CA3AF" />;
    if (hobby.name.toLowerCase().includes('gaming')) return <Gamepad2 size={16} color="#9CA3AF" />;
    if (hobby.name.toLowerCase().includes('movie')) return <Clapperboard size={16} color="#9CA3AF" />;
    return <Star size={16} color="#9CA3AF" />;
  };

  const handleSelectMedia = async (media) => {
    if (media) {
      setMediaTitle(media.title);
      setMediaCoverUrl(media.coverUrl);
      setMediaId(media.id);
      setTmdbMediaType(media.mediaType);

      // If it's a movie/tv show, fetch details for runtime
      if (media.id && String(media.id).startsWith('tmdb_')) {
        setIsLoadingDetails(true);
        try {
          const details = await getMediaDetails(media.id, 'movie', media.mediaType);
          if (details?.runtime) {
            setDuration(details.runtime);
          }
        } catch (error) {
          console.error('Error fetching media runtime:', error);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    } else {
      setMediaTitle('');
      setMediaCoverUrl(null);
      setMediaId(null);
      setTmdbMediaType(null);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Activity</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hobby Indicator */}
        <View style={styles.hobbyIndicator}>
          <View style={[styles.hobbyIconWrapper, { backgroundColor: `${hobby.color}20` }]}>
            <IconRenderer iconName={hobby.icon} size={24} color={hobby.color} />
          </View>
          <View>
            <Text style={styles.hobbyLabel}>HOBBY</Text>
            <Text style={styles.hobbyName}>{hobby.name}</Text>
          </View>
        </View>

        {/* Media Logging Section */}
        {isMediaHobby && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              {getMediaIcon()}
              <Text style={styles.label}>{getMediaLabel()}</Text>
            </View>
            <MediaSearchInput
              value={mediaTitle}
              onChangeText={(text) => {
                setMediaTitle(text);
                setMediaCoverUrl(null);
                setMediaId(null);
                setTmdbMediaType(null);
              }}
              onSelectMedia={handleSelectMedia}
              searchType={getSearchType()}
              placeholder={getMediaPlaceholder()}
              icon={null} // Don't pass icon so it uses default Search icon
            />

            {/* Library / Quick Select */}
            {libraryItems.length > 0 && (
              <View style={styles.libraryContainer}>
                <Text style={styles.libraryTitle}>FROM YOUR LIBRARY</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.libraryScroll}
                >
                  {libraryItems.map((item, index) => (
                    <TouchableOpacity 
                      key={item.id || index} 
                      style={[
                        styles.libraryItem,
                        mediaId === item.id && mediaTitle === item.title && styles.libraryItemActive
                      ]}
                      onPress={() => {
                        handleSelectMedia({
                          title: item.title,
                          coverUrl: item.coverUrl,
                          id: item.id,
                          mediaType: item.tmdbMediaType
                        });
                      }}
                    >
                      <View style={styles.libraryCoverWrapper}>
                        {item.coverUrl ? (
                          <Image source={{ uri: item.coverUrl }} style={styles.libraryCover} />
                        ) : (
                          <View style={styles.libraryPlaceholder}>
                            <Star size={16} color="#9CA3AF" />
                          </View>
                        )}
                        {mediaId === item.id && mediaTitle === item.title && (
                          <View style={styles.activeCheck}>
                            <Check size={12} color="#FFFFFF" strokeWidth={4} />
                          </View>
                        )}
                      </View>
                      <Text style={styles.libraryItemTitle} numberOfLines={1}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.mediaRow}>
              <View style={styles.mediaCol}>
                <Text style={styles.subLabel}>RATING</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Star
                        size={24}
                        fill={rating && star <= rating ? hobby.color : 'transparent'}
                        stroke={rating && star <= rating ? hobby.color : '#D1D5DB'}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.mediaCol}>
                <Text style={styles.subLabel}>STATUS</Text>
                <View style={styles.statusContainer}>
                  <TouchableOpacity
                    onPress={() => setStatus('in-progress')}
                    style={[styles.statusButton, status === 'in-progress' && styles.statusButtonActive]}
                  >
                    <Text style={[styles.statusButtonText, status === 'in-progress' && styles.statusButtonTextActive]}>
                      In Progress
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus('completed')}
                    style={[styles.statusButton, status === 'completed' && styles.statusButtonActive]}
                  >
                    <Text style={[styles.statusButtonText, status === 'completed' && styles.statusButtonTextActive]}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Duration Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Clock size={16} color="#9CA3AF" />
            <Text style={styles.label}>Duration (minutes)</Text>
          </View>
          <View style={styles.durationRow}>
            <TouchableOpacity
              onPress={() => setDuration(Math.max(5, duration - 5))}
              style={styles.durationButton}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.durationText}>{duration}</Text>
            <TouchableOpacity
              onPress={() => setDuration(duration + 5)}
              style={styles.durationButton}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <CalendarIcon size={16} color="#9CA3AF" />
            <Text style={styles.label}>Date</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Notes Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it go?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: hobby.color, shadowColor: hobby.color }]}
        >
          <Check size={20} color="#FFFFFF" strokeWidth={3} />
          <Text style={styles.saveButtonText}>Save Session</Text>
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
    marginTop: 50,
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
  hobbyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  hobbyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  hobbyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hobbyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 32,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  textInput: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  textArea: {
    height: 120,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  mediaCol: {
    flex: 1,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 4,
    borderRadius: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  statusButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  statusButtonTextActive: {
    color: '#111827',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B7280',
  },
  durationText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    width: 100,
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  libraryContainer: {
    marginTop: 20,
  },
  libraryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  libraryScroll: {
    paddingRight: 24,
    gap: 16,
  },
  libraryItem: {
    width: 80,
    alignItems: 'center',
  },
  libraryItemActive: {
    opacity: 1,
  },
  libraryCoverWrapper: {
    width: 80,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  libraryCover: {
    width: '100%',
    height: '100%',
  },
  libraryPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryItemTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    width: '100%',
  },
  activeCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});