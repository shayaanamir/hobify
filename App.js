import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { store } from './store';

// ── Screens ──────────────────────────────────────────────────────────────────
import HomeScreen from './screens/HomeScreen';
import SocialFeedScreen from './screens/SocialFeedScreen';
import AddScreen from './screens/AddScreen';
import CalendarScreen from './screens/CalendarScreen';
import ProfileScreen from './screens/ProfileScreen';

// Stack-only screens (pushed on top of tabs)
import HobbiesListScreen from './screens/HobbiesListScreen';
import HobbyDetailScreen from './screens/HobbyDetailScreen';
import LogSessionScreen from './screens/LogSessionScreen';
import GoalsScreen from './screens/GoalsScreen';
import CollectionScreen from './screens/CollectionScreen';
import MediaDetailScreen from './screens/MediaDetailScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import GuidesScreen from './screens/GuidesScreen';
import GuideDetailScreen from './screens/GuideDetailScreen';

// ── Navigators ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SocialStack = createNativeStackNavigator();

/**
 * HomeStack: Home → Hobbies List → Hobby Detail → Log Session
 *                                              → Goals
 *                                              → Collection → Media Detail
 */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="HobbiesList" component={HobbiesListScreen} />
      <HomeStack.Screen name="HobbyDetail" component={HobbyDetailScreen} />
      <HomeStack.Screen name="LogSession" component={LogSessionScreen} />
      <HomeStack.Screen name="Goals" component={GoalsScreen} />
      <HomeStack.Screen name="Collection" component={CollectionScreen} />
      <HomeStack.Screen name="MediaDetail" component={MediaDetailScreen} />
    </HomeStack.Navigator>
  );
}

/**
 * SocialStack: Social Feed → Post Detail
 *                          → Guides → Guide Detail
 */
function SocialStackNavigator() {
  return (
    <SocialStack.Navigator screenOptions={{ headerShown: false }}>
      <SocialStack.Screen name="SocialFeed" component={SocialFeedScreen} />
      <SocialStack.Screen name="PostDetail" component={PostDetailScreen} />
      <SocialStack.Screen name="Guides" component={GuidesScreen} />
      <SocialStack.Screen name="GuideDetail" component={GuideDetailScreen} />
    </SocialStack.Navigator>
  );
}

/**
 * Root bottom-tab navigator.
 * The "Add" tab is a full-screen modal (no tab bar shown inside it).
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Custom tab bar will be built as a component
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="SocialTab" component={SocialStackNavigator} />
      <Tab.Screen name="AddTab" component={AddScreen} />
      <Tab.Screen name="CalendarTab" component={CalendarScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <TabNavigator />
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
