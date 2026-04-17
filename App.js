import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { store } from './store';
import { BottomNav } from './components/BottomNav';
import { selectIsLoggedIn } from './slices/authSlice';

// ── Screens ───────────────────────────────────────────────────────────────────
import LoginScreen      from './screens/LoginScreen';
import HomeScreen       from './screens/HomeScreen';
import SocialFeedScreen from './screens/SocialFeedScreen';
import AddScreen        from './screens/AddScreen';
import CalendarScreen   from './screens/CalendarScreen';
import ProfileScreen    from './screens/ProfileScreen';

// Stack-only screens
import HobbiesListScreen  from './screens/HobbiesListScreen';
import HobbyDetailScreen  from './screens/HobbyDetailScreen';
import GoalsScreen        from './screens/GoalsScreen';
import CollectionScreen   from './screens/CollectionScreen';
import MediaDetailScreen  from './screens/MediaDetailScreen';
import PostDetailScreen   from './screens/PostDetailScreen';
import GuidesScreen       from './screens/GuidesScreen';
import GuideDetailScreen  from './screens/GuideDetailScreen';
import LogSessionScreen   from './screens/LogSessionScreen';

// ── Navigators ────────────────────────────────────────────────────────────────
const Tab        = createBottomTabNavigator();
const HomeStack  = createNativeStackNavigator();
const SocialStack = createNativeStackNavigator();
const RootStack  = createNativeStackNavigator();
const AuthStack  = createNativeStackNavigator();

// ── Auth Navigator (unauthenticated) ──────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// ── Home Stack ────────────────────────────────────────────────────────────────
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home"         component={HomeScreen} />
      <HomeStack.Screen name="HobbiesList"  component={HobbiesListScreen} />
      <HomeStack.Screen name="Goals"        component={GoalsScreen} />
      <HomeStack.Screen name="Collection"   component={CollectionScreen} />
    </HomeStack.Navigator>
  );
}

// ── Social Stack ──────────────────────────────────────────────────────────────
function SocialStackNavigator() {
  return (
    <SocialStack.Navigator screenOptions={{ headerShown: false }}>
      <SocialStack.Screen name="SocialFeed"   component={SocialFeedScreen} />
      <SocialStack.Screen name="Guides"       component={GuidesScreen} />
    </SocialStack.Navigator>
  );
}

// ── Tab Navigator ─────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab"     component={HomeStackNavigator} />
      <Tab.Screen name="SocialTab"   component={SocialStackNavigator} />
      <Tab.Screen name="CalendarTab" component={CalendarScreen} />
      <Tab.Screen name="ProfileTab"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Root Navigator (authenticated) ────────────────────────────────────────────
function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={TabNavigator} />

      {/* Detail screens (hides tab bar) */}
      <RootStack.Screen name="HobbyDetail"  component={HobbyDetailScreen} />
      <RootStack.Screen name="MediaDetail"  component={MediaDetailScreen} />
      <RootStack.Screen name="PostDetail"   component={PostDetailScreen} />
      <RootStack.Screen name="GuideDetail"  component={GuideDetailScreen} />

      <RootStack.Screen
        name="Add"
        component={AddScreen}
        options={{ presentation: 'modal' }}
      />
      <RootStack.Screen
        name="LogSession"
        component={LogSessionScreen}
        options={{ presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
}

// ── Navigation root — reads Redux auth state ──────────────────────────────────
function NavigationRoot() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <NavigationRoot />
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});