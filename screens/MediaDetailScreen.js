import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Star, Clock, CheckCircle2, Calendar, Layout, User, BookOpen } from 'lucide-react-native';
import { SessionItem, IconRenderer } from '../components';
import { getMediaDetails } from '../services/mediaSearchService';

export default function MediaDetailScreen({ route, navigation }) {
  const { mediaTitle, hobbyId, mediaId } = route.params || {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const hobby = useSelector((state) =>
    state.hobbies.items.find((h) => h.id === hobbyId)
  );

  const sessions = useSelector((state) => state.sessions.items);

  // Find mediaId from sessions if not in params
  const resolvedMediaId = mediaId || sessions.find(s => s.mediaTitle === mediaTitle && s.hobbyId === hobbyId)?.mediaId;
  const tmdbMediaType = sessions.find(s => s.mediaTitle === mediaTitle && s.hobbyId === hobbyId)?.tmdbMediaType;

  useEffect(() => {
    async function fetchDetails() {
      if (!resolvedMediaId) return;
      setLoading(true);
      try {
        const searchType = hobby?.name.toLowerCase().includes('game') ? 'game' 
                         : hobby?.name.toLowerCase().includes('book') || hobby?.name.toLowerCase().includes('reading') ? 'book' 
                         : 'movie';
        
        const data = await getMediaDetails(resolvedMediaId, searchType, tmdbMediaType);
        if (data) {
          setDetails(data);
        }
      } catch (error) {
        console.error('Error fetching media details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [resolvedMediaId, hobby, tmdbMediaType]);

  if (!mediaTitle || !hobby) return null;

  // Filter sessions for this specific media
  const mediaSessions = sessions
    .filter((s) => s.hobbyId === hobbyId && s.mediaTitle === mediaTitle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate stats
  const totalMinutes = mediaSessions.reduce((acc, s) => acc + s.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Get latest status and rating
  const latestSession = mediaSessions[0];
  const status =
    mediaSessions.find((s) => s.status === 'completed')?.status ||
    latestSession?.status ||
    'in-progress';
  const rating = mediaSessions.find((s) => s.rating)?.rating;

  const coverUrl = details?.cover?.image_id 
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${details.cover.image_id}.jpg`
    : details?.poster_path 
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : details?.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${details.covers[0]}-L.jpg`
        : mediaSessions.find(s => s.mediaCoverUrl)?.mediaCoverUrl;

  const description = details?.summary || details?.overview || details?.description || '';
  const releaseYear = details?.first_release_date 
    ? new Date(details.first_release_date * 1000).getFullYear()
    : details?.release_date?.split('-')[0] || details?.first_publish_year || details?.created?.value?.split('-')[0] || '';

  const subtitle = details?.involved_companies?.find(c => c.company?.name)?.company?.name 
                 || (details?.author_name ? details.author_name[0] : null)
                 || (details?.media_type === 'tv' ? 'TV Series' : details?.release_date ? 'Movie' : details?.title ? 'Book' : '');

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.heroImage} blurRadius={Platform.OS === 'ios' ? 20 : 10} />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: hobby.color }]} />
          )}
          <View style={styles.heroOverlay} />
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <View style={styles.topInfoRow}>
            <View style={styles.mainCoverWrapper}>
              {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.mainCover} />
              ) : (
                <View style={[styles.mainCoverPlaceholder, { backgroundColor: `${hobby.color}20` }]}>
                  <IconRenderer iconName={hobby.icon} size={40} color={hobby.color} />
                </View>
              )}
            </View>
            
            <View style={styles.mainInfo}>
              <Text style={styles.titleText}>{mediaTitle}</Text>
              {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
              
              <View style={styles.badgesWrapper}>
                <View style={[styles.badge, { backgroundColor: `${hobby.color}15` }]}>
                  <Text style={[styles.badgeText, { color: hobby.color }]}>{hobby.name}</Text>
                </View>
                {releaseYear && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{releaseYear}</Text>
                  </View>
                )}
              </View>

              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={rating && star <= rating ? '#FBBF24' : 'transparent'}
                    stroke={rating && star <= rating ? '#FBBF24' : '#D1D5DB'}
                    strokeWidth={2}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{mediaSessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{timeString}</Text>
              <Text style={styles.statLabel}>Logged</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statusIndicator, { backgroundColor: status === 'completed' ? '#10B981' : '#3B82F6' }]} />
              <Text style={styles.statLabel}>{status === 'completed' ? 'Done' : 'Playing'}</Text>
            </View>
          </View>

          {/* Description */}
          {description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText} numberOfLines={6}>
                {description}
              </Text>
            </View>
          ) : loading ? (
            <ActivityIndicator size="small" color={hobby.color} style={{ marginVertical: 20 }} />
          ) : null}

          {/* Session History */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <Clock size={16} color="#9CA3AF" />
            </View>
            
            <View style={styles.historyContainer}>
              {mediaSessions.length > 0 ? (
                mediaSessions.map((session) => (
                  <SessionItem key={session.id} session={session} color={hobby.color} />
                ))
              ) : (
                <Text style={styles.noSessionsText}>No sessions logged yet.</Text>
              )}
            </View>
          </View>
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
    paddingBottom: 40,
  },
  heroContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  contentCard: {
    flex: 1,
    marginTop: -60,
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  topInfoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  mainCoverWrapper: {
    width: 120,
    aspectRatio: 2/3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -80,
    overflow: 'hidden',
  },
  mainCover: {
    width: '100%',
    height: '100%',
  },
  mainCoverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: {
    flex: 1,
    paddingTop: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  noSessionsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 20,
  },
});
