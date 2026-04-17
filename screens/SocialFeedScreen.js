import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { BookOpen } from 'lucide-react-native';
import { PostCard } from '../components';

export default function SocialFeedScreen({ navigation }) {
  const posts = useSelector((state) => state.posts.items) || [];

  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Guides')}
            style={styles.guidesBtn}
          >
            <BookOpen size={14} color="#FFFFFF" />
            <Text style={styles.guidesBtnText}>Guides</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedContainer}>
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff6e8ff',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 20,
    paddingBottom: 120, // tab bar spacing
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  guidesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  guidesBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContainer: {
    gap: 0,
  },
});
