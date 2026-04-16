import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, Pressable } from 'react-native';
import { Home, MessageCircle, Plus, CalendarDays, User } from 'lucide-react-native';

const ICONS = {
  HomeTab: Home,
  SocialTab: MessageCircle,
  CalendarTab: CalendarDays,
  ProfileTab: User,
};

const LABELS = {
  HomeTab: 'Home',
  SocialTab: 'Social',
  CalendarTab: 'Calendar',
  ProfileTab: 'Profile',
};

export function BottomNav({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const IconComponent = ICONS[route.name] || Home;
          const label = LABELS[route.name] || route.name;

          const tabUI = (
            <Pressable
              key={route.key}
              testID={options.tabBarTestID}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {isFocused && (
                  <View style={styles.indicator} />
                )}
                <IconComponent 
                  size={24} 
                  color={isFocused ? '#111827' : '#9CA3AF'} 
                  strokeWidth={isFocused ? 2.5 : 2} 
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                {label}
              </Text>
            </Pressable>
          );

          if (index === 1) {
            return (
              <React.Fragment key={route.key}>
                {tabUI}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Add')}
                  style={styles.fabContainer}
                >
                  <View style={styles.fabButton}>
                    <Plus size={24} color="#FFF" strokeWidth={3} />
                  </View>
                </Pressable>
              </React.Fragment>
            );
          }

          return tabUI;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#111827',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FAF8F5',
  },
});
