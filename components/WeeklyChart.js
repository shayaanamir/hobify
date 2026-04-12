import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function WeeklyChart({
  data = [0, 0, 0, 0, 0, 0, 0],
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  color = '#3B82F6',
  height = 100,
}) {
  const max = Math.max(...data, 1);
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <View style={[styles.container, { height }]}>
      {data.map((value, index) => {
        const isToday = index === todayIndex;
        const percentage = (value / max) * 100;
        
        return (
          <ChartBar 
            key={index} 
            index={index} 
            percentage={percentage} 
            label={labels[index]} 
            isToday={isToday} 
            color={color} 
          />
        );
      })}
    </View>
  );
}

function ChartBar({ index, percentage, label, isToday, color }) {
  return (
    <View style={styles.barColumn}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: color, height: `${percentage}%` },
            isToday ? { opacity: 1 } : { opacity: 0.7 }
          ]}
        />
      </View>
      <Text style={[styles.label, isToday && styles.labelToday]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 10,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barBackground: {
    width: '100%',
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 8,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  labelToday: {
    color: '#111827',
    fontWeight: '700',
  },
});
