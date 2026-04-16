import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { Clock, Flame, Trophy, ChevronRight, Library } from 'lucide-react-native';

import { HobbyCard, WeeklyChart, StatCard } from '../components';
import { selectAllHobbies } from '../slices/hobbiesSlice';
// If today stats aren't complex, we use mock numbers for layout
// In the future they will be calculated via selectors

export default function HomeScreen({ navigation }) {
  // We use the Redux state to grab our hobbies
  const hobbies = useSelector(selectAllHobbies);
  const activeHobbies = hobbies.slice(0, 4);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleHobbyClick = (id) => {
    navigation.navigate('HobbyDetail', { hobbyId: id });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{today}</Text>
        <Text style={styles.greeting}>Good morning, Shayaan</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon={Clock} label="Today" value="1.5h" color="#3B82F6" bgColor="#EFF6FF" />
        <StatCard icon={Flame} label="Streak" value="12" color="#F97316" bgColor="#FFF7ED" />
        <Pressable onPress={() => navigation.navigate('Goals')} style={{ flex: 1 }}>
          <StatCard icon={Trophy} label="Goals" value="3/5" color="#A855F7" bgColor="#FAF5FF" />
        </Pressable>
      </View>

      {/* Weekly Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <Text style={styles.sectionSubtitle}>Last 7 days</Text>
        </View>
        <View style={styles.chartContainer}>
          <WeeklyChart data={[2, 4, 1.5, 3, 5, 2, 1.5]} color="#111827" height={120} />
        </View>
      </View>

      {/* Jump Back In */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Jump Back In</Text>
          <Pressable onPress={() => navigation.navigate('HobbiesList')} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={14} color="#9CA3AF" />
          </Pressable>
        </View>
        <View style={styles.hobbiesContainer}>
          {activeHobbies.map(hobby => (
            <HobbyCard
              key={hobby.id}
              hobby={hobby}
              onPress={() => handleHobbyClick(hobby.id)}
            />
          ))}
        </View>
      </View>

      {/* Collection Quick Access */}
      <Pressable
        style={styles.collectionButton}
        onPress={() => navigation.navigate('Collection')}
      >
        <View style={styles.collectionIconBg}>
          <Library size={20} color="#4B5563" />
        </View>
        <View style={styles.collectionTextContainer}>
          <Text style={styles.collectionTitle}>My Collection</Text>
          <Text style={styles.collectionSubtitle}>Books, games, movies & more</Text>
        </View>
        <ChevronRight size={18} color="#D1D5DB" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 120, // Accommodate the floating bottom nav
    backgroundColor: '#FAF8F5',
  },
  header: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  hobbiesContainer: {
    gap: 0,
  },
  collectionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  collectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionTextContainer: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  collectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
