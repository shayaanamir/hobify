import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { formatDuration } from '../utils/formatDuration';

export function WeeklyChart({
  data = [0, 0, 0, 0, 0, 0, 0],
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  color = '#3B82F6',
  height = 100,
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const max = Math.max(...data, 1);
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const handleBarPress = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <View style={[styles.container, { height: height + 28 }]}>
      {/* Tooltip row — fixed height above bars */}
      <View style={styles.tooltipRow}>
        {data.map((value, index) => (
          <View key={index} style={styles.tooltipCell}>
            {activeIndex === index && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  {value > 0 ? formatDuration(value, 'hours') : '0 min'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Bars row */}
      <View style={[styles.barsRow, { height }]}>
        {data.map((value, index) => {
          const isToday = index === todayIndex;
          const isActive = index === activeIndex;
          const percentage = (value / max) * 100;

          return (
            <ChartBar
              key={index}
              percentage={percentage}
              label={labels[index]}
              isToday={isToday}
              isActive={isActive}
              color={color}
              onPress={() => handleBarPress(index)}
            />
          );
        })}
      </View>
    </View>
  );
}

function ChartBar({ percentage, label, isToday, isActive, color, onPress }) {
  return (
    <Pressable style={styles.barColumn} onPress={onPress}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              height: `${percentage}%`,
              opacity: isActive ? 1 : isToday ? 0.85 : 0.45,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, isToday && styles.labelToday, isActive && styles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
  tooltipRow: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  tooltipCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  tooltip: {
    backgroundColor: '#111827',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  tooltipText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
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
  labelActive: {
    color: '#111827',
    fontWeight: '700',
  },
});