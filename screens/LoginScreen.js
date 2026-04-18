import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import {
  signUpUser,
  signInUser,
  clearAuthError,
  selectAuthStatus,
  selectAuthError,
} from '../slices/authSlice';

const HOBBY_PILLS = [
  { label: '🎸 Guitar', color: '#F97316' },
  { label: '📚 Reading', color: '#8B5CF6' },
  { label: '🏃 Running', color: '#10B981' },
  { label: '🎨 Painting', color: '#EC4899' },
  { label: '🍳 Cooking', color: '#F59E0B' },
  { label: '🎮 Gaming', color: '#3B82F6' },
];

export default function LoginScreen() {
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});


  const slideAnim = useRef(new Animated.Value(0)).current;
  // Clear error when switching modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    dispatch(clearAuthError());
    Animated.spring(slideAnim, {
      toValue: newMode === 'login' ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    dispatch(clearAuthError());
    if (mode === 'signup') {
      dispatch(signUpUser({ email: email.trim(), password, name: name.trim() }));
    } else {
      dispatch(signInUser({ email: email.trim(), password }));
    }
  };

  const isLoading = authStatus === 'loading';

  const tabLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Text style={styles.appName}>Hobify</Text>
          <Text style={styles.tagline}>Track every passion.{'\n'}Master every hobby.</Text>

          {/* Hobby pills */}
          <View style={styles.pillRow}>
            {HOBBY_PILLS.map((p, i) => (
              <View key={i} style={[styles.pill, { backgroundColor: p.color + '22', borderColor: p.color + '55' }]}>
                <Text style={[styles.pillText, { color: p.color }]}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Auth Card ───────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabBar}>
            <Animated.View style={[styles.tabIndicator, { left: tabLeft }]} />
            <TouchableOpacity style={styles.tab} onPress={() => switchMode('login')}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => switchMode('signup')}>
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Name — signup only */}
            {mode === 'signup' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Your Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Alex Johnson"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.passwordRow, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword
                    ? <EyeOff size={18} color="#9CA3AF" />
                    : <Eye size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Firebase error */}
            {authError ? (
              <View style={styles.firebaseError}>
                <Text style={styles.firebaseErrorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              activeOpacity={0.88}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {mode === 'login' ? 'Log In' : 'Create Account'}
                  </Text>
                  <ArrowRight size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>


          </View>
        </View>

        {/* Bottom switch */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.switchLink}>
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ACCENT = '#111827';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // ── Hero
  hero: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 72 : 52,
    paddingBottom: 36,
    paddingHorizontal: 16,
  },
  appName: {
    fontSize: 42, fontWeight: '800', color: '#111827',
    letterSpacing: -1, marginBottom: 8,
  },
  tagline: {
    fontSize: 15, color: '#6B7280', textAlign: 'center',
    lineHeight: 22, marginBottom: 24,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },

  // ── Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
    overflow: 'hidden', marginBottom: 20, marginHorizontal: 4,
  },

  // Tab
  tabBar: {
    flexDirection: 'row', backgroundColor: '#F3F4F6',
    margin: 16, borderRadius: 14, height: 46, position: 'relative',
  },
  tabIndicator: {
    position: 'absolute', top: 4, bottom: 4, width: '48%',
    backgroundColor: ACCENT, borderRadius: 10,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#FFFFFF' },

  // Form
  form: { paddingHorizontal: 20, paddingBottom: 20 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11, fontSize: 15, color: '#111827',
  },
  inputError: { borderColor: '#FCA5A5' },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 4, marginLeft: 2 },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
  },
  passwordInput: { flex: 1, fontSize: 15, color: '#111827', padding: 0 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 16, marginTop: -4 },
  forgotText: { fontSize: 12, fontWeight: '600', color: ACCENT },

  // Firebase error
  firebaseError: {
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: '#FECACA',
  },
  firebaseErrorText: { fontSize: 13, color: '#DC2626', textAlign: 'center' },

  // Submit
  submitBtn: {
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 20, shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25,
    shadowRadius: 10, elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },


  // Bottom switch
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { fontSize: 13, color: '#6B7280' },
  switchLink: { fontSize: 13, fontWeight: '700', color: ACCENT },
});
