import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';

export function HobbyCard({ hobby, onPress, compact = false }) {
  if (!hobby) return null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.98 : 1 }] }
      ]}
      onPress={onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: hobby.color || '#3B82F6' }]} />
      
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${hobby.color || '#3B82F6'}20` }]}>
            <Text style={styles.icon}>{hobby.icon}</Text>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{hobby.name}</Text>
            {!compact && (
              <View style={styles.statsContainer}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.statsText}>{hobby.totalHours || 0}h total</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          {hobby.streak > 0 && (
            <View style={styles.streakBadge}>
               <Text style={styles.streakText}>🔥 {hobby.streak}</Text>
            </View>
          )}
          {compact ? (
            <ChevronRight size={20} color="#D1D5DB" />
          ) : (
            <View style={styles.progressPlaceholder}>
              <Text style={styles.progressText}>65%</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingLeft: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  progressPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
});
