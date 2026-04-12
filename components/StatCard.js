import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function StatCard({ icon: Icon, label, value, color = '#111827', bgColor = '#F3F4F6' }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    flex: 1,
  },
  iconContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 9999,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
