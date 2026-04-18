import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { User, Settings, Bell, Download, Info, ChevronRight, LogOut } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { signOutThunk, selectUser } from '../slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hobbies = useSelector((state) => state.hobbies.items);

  const totalHours = hobbies.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalSessions = hobbies.reduce((acc, curr) => acc + curr.totalSessions, 0);

  const SETTINGS_OPTS = [
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'General Settings' },
    { icon: Download, label: 'Export Data' },
    { icon: Info, label: 'About Hobify' },
  ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <User size={40} color="#9CA3AF" />
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || 'Hobbyist'}</Text>
            <Text style={styles.userSince}>Hobbyist since 2026</Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{totalHours}</Text>
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
                  index < SETTINGS_OPTS.length - 1 && styles.settingsRowBorder
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff6e8ff' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 24,
    paddingBottom: 120, // tab bar allowance
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  userSince: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
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
  statVal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 4,
  },
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
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconWrapper: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  versionWrapper: {
    marginTop: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
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
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
