import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, Image,
} from 'react-native';
import { Settings, Bell, Download, Info, ChevronRight, LogOut, Pencil } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { signOutThunk, selectUser } from '../slices/authSlice';
import { fetchFollowing, fetchFollowers, selectFollowing, selectFollowers } from '../slices/followsSlice';
import { formatDuration } from '../utils/formatDuration';

// ─── Initials Avatar ──────────────────────────────────────────────────────────
function InitialsAvatar({ name, size = 80 }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.initialsAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector((state) => state.hobbies.items);
  const following = useSelector(selectFollowing);
  const followers = useSelector(selectFollowers);

  const totalHours = hobbies.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalSessions = hobbies.reduce((acc, curr) => acc + curr.totalSessions, 0);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFollowing(user.uid));
      dispatch(fetchFollowers(user.uid));
    }
  }, [user?.uid]);

  const SETTINGS_OPTS = [
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'General Settings' },
    { icon: Download, label: 'Export Data' },
    { icon: Info, label: 'About Hobify' },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editBtn}
          >
            <Pencil size={15} color="#111827" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <InitialsAvatar name={user?.name} size={80} />
            )}
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Hobbyist'}</Text>
            {user?.bio ? (
              <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>
            ) : (
              <Text style={styles.userSince}>Hobbyist since 2026</Text>
            )}
          </View>
        </View>

        {/* Social Stats */}
        <View style={styles.socialStats}>
          <View style={styles.socialStat}>
            <Text style={styles.socialStatVal}>{followers.length}</Text>
            <Text style={styles.socialStatLabel}>Followers</Text>
          </View>
          <View style={styles.socialStatDivider} />
          <View style={styles.socialStat}>
            <Text style={styles.socialStatVal}>{following.length}</Text>
            <Text style={styles.socialStatLabel}>Following</Text>
          </View>
          <View style={styles.socialStatDivider} />
          <View style={styles.socialStat}>
            <Text style={styles.socialStatVal}>{hobbies.length}</Text>
            <Text style={styles.socialStatLabel}>Hobbies</Text>
          </View>
        </View>

        {/* Activity Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{formatDuration(totalHours, 'hours')}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsCard}>
          {SETTINGS_OPTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.settingsRow,
                  index < SETTINGS_OPTS.length - 1 && styles.settingsRowBorder,
                ]}
              >
                <View style={styles.settingsRowLeft}>
                  <View style={styles.settingsIconWrapper}>
                    <Icon size={18} color="#4B5563" />
                  </View>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color="#D1D5DB" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.versionWrapper}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <TouchableOpacity
          onPress={() => dispatch(signOutThunk())}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff6e8ff' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#111827' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  initialsAvatar: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  initialsText: { fontWeight: '700', color: '#6B7280' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  userBio: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  userSince: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  // Social stats
  socialStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  socialStat: { flex: 1, alignItems: 'center' },
  socialStatVal: { fontSize: 20, fontWeight: '700', color: '#111827' },
  socialStatLabel: {
    fontSize: 11, fontWeight: '600', color: '#9CA3AF',
    marginTop: 2, textTransform: 'uppercase',
  },
  socialStatDivider: { width: 1, backgroundColor: '#F3F4F6' },

  // Activity stats
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statVal: { fontSize: 24, fontWeight: '700', color: '#111827' },
  statLabel: {
    fontSize: 10, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', marginTop: 4,
  },

  // Settings
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconWrapper: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 },
  settingsLabel: { fontSize: 16, fontWeight: '500', color: '#111827' },

  versionWrapper: { marginTop: 32, alignItems: 'center', marginBottom: 16 },
  versionText: { fontSize: 12, color: '#9CA3AF' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  logoutBtnText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});