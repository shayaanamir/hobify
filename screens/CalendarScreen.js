import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Clock, Plus, Minus, X, Check } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SessionItem } from '../components';
import { addPlannedActivity, togglePlannedActivityComplete } from '../slices/plannedActivitiesSlice';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function CalendarScreen() {
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.sessions.items);
  const hobbies = useSelector((state) => state.hobbies.items);
  const plannedActivities = useSelector((state) => state.plannedActivities.items);

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planHobbyId, setPlanHobbyId] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planDuration, setPlanDuration] = useState(30);
  const [planNotes, setPlanNotes] = useState('');

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [viewMonth, viewYear]);

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      const hobby = hobbies.find((h) => h.id === s.hobbyId);
      if (hobby && !map[key].find((x) => x.hobbyId === s.hobbyId)) {
        map[key].push({
          hobbyId: hobby.id,
          color: hobby.color,
        });
      }
    });
    return map;
  }, [sessions, hobbies]);

  const plannedByDate = useMemo(() => {
    const map = {};
    plannedActivities.forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = true;
    });
    return map;
  }, [plannedActivities]);

  const daySessions = sessions
    .filter((s) => isSameDay(new Date(s.date), selectedDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const dayPlanned = plannedActivities.filter((a) =>
    isSameDay(new Date(a.date), selectedDate)
  );

  const checkIsToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const checkIsSelected = (day) =>
    day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();

  const handleSavePlan = () => {
    if (!planTitle.trim() || !planHobbyId) return;

    // Generate date for selected day but roughly default time
    const targetDate = new Date(selectedDate);
    targetDate.setHours(today.getHours(), today.getMinutes());

    dispatch(addPlannedActivity({
      hobbyId: planHobbyId,
      title: planTitle.trim(),
      date: targetDate.toISOString(),
      duration: planDuration,
      notes: planNotes.trim(),
    }));

    setShowPlanForm(false);
    setPlanTitle('');
    setPlanDuration(30);
    setPlanNotes('');
    setPlanHobbyId('');
  };

  const selectedHobbyObj = hobbies.find(h => h.id === planHobbyId);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarCard}>
          <View style={styles.weekDaysRow}>
            {DAYS_OF_WEEK.map((d) => (
              <Text key={d} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <View key={`empty-${i}`} style={styles.dayCell} />;
              }

              const isToday = checkIsToday(day);
              const isSelected = checkIsSelected(day);
              const dateKey = `${viewYear}-${viewMonth}-${day}`;
              const dayHobbyDots = sessionsByDate[dateKey] || [];
              const hasPlanned = plannedByDate[dateKey] || false;

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => {
                    setSelectedDate(new Date(viewYear, viewMonth, day));
                    setShowPlanForm(false);
                  }}
                >
                  <View style={[styles.dayCircle, isToday && !isSelected && styles.dayCircleToday]}>
                    <Text style={[
                      styles.dayText,
                      isToday && styles.dayTextToday,
                      isSelected && styles.dayTextSelected
                    ]}>
                      {day}
                    </Text>
                  </View>

                  {/* Dots */}
                  <View style={styles.dotsRow}>
                    {dayHobbyDots.slice(0, 3).map((dot, idx) => (
                      <View
                        key={idx}
                        style={[styles.dot, { backgroundColor: dot.color }]}
                      />
                    ))}
                    {hasPlanned && dayHobbyDots.length === 0 && (
                      <View style={[styles.dot, { backgroundColor: '#9CA3AF', opacity: 0.5 }]} />
                    )}
                    {hasPlanned && dayHobbyDots.length > 0 && (
                      <View style={[styles.dot, { backgroundColor: '#9CA3AF', opacity: 0.6 }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Detail */}
        <View style={styles.historySection}>
          <View style={styles.selectedDayHeader}>
            <Text style={styles.historyTitle}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <View style={styles.selectedDayActions}>
              {checkIsToday(selectedDate.getDate()) && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Today</Text>
                </View>
              )}
              {!showPlanForm && (
                <TouchableOpacity
                  onPress={() => setShowPlanForm(true)}
                  style={styles.planBtn}
                >
                  <Plus size={14} color="#FFF" />
                  <Text style={styles.planBtnText}>Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Plan Form */}
          {showPlanForm && (
            <View style={styles.planFormCard}>
              <View style={styles.planFormHeader}>
                <Text style={styles.planFormTitle}>Plan a Session</Text>
                <TouchableOpacity onPress={() => setShowPlanForm(false)}>
                  <X size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Hobby</Text>
              <View style={styles.hobbyChips}>
                {hobbies.map(hobby => {
                  const isSelected = planHobbyId === hobby.id;
                  return (
                    <TouchableOpacity
                      key={hobby.id}
                      onPress={() => setPlanHobbyId(hobby.id)}
                      style={[
                        styles.hobbyChip,
                        {
                          backgroundColor: isSelected ? `${hobby.color}20` : '#F3F4F6',
                          borderColor: isSelected ? `${hobby.color}40` : 'transparent',
                          borderWidth: isSelected ? 1.5 : 0,
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 12 }}>{hobby.icon}</Text>
                      <Text style={[styles.hobbyChipText, { color: isSelected ? hobby.color : '#6B7280' }]}>
                        {hobby.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>What are you planning?</Text>
              <TextInput
                style={styles.textInput}
                value={planTitle}
                onChangeText={setPlanTitle}
                placeholder={selectedHobbyObj ? `e.g. ${selectedHobbyObj.name} practice` : "Session title"}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.formLabel}>Duration</Text>
              <View style={styles.durationControl}>
                <TouchableOpacity
                  onPress={() => setPlanDuration(Math.max(5, planDuration - 15))}
                  style={styles.durBtn}
                >
                  <Minus size={18} color="#4B5563" />
                </TouchableOpacity>
                <View style={styles.durTextWrap}>
                  <Text style={styles.durTextVal}>{planDuration}</Text>
                  <Text style={styles.durTextUnit}>min</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPlanDuration(Math.min(480, planDuration + 15))}
                  style={styles.durBtn}
                >
                  <Plus size={18} color="#4B5563" />
                </TouchableOpacity>
              </View>
              <View style={styles.durChips}>
                {[15, 30, 45, 60, 90, 120].map(d => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setPlanDuration(d)}
                    style={[styles.durChip, planDuration === d ? styles.durChipSelected : null]}
                  >
                    <Text style={[styles.durChipText, planDuration === d ? styles.durChipTextSelected : null]}>
                      {d >= 60 ? `${d / 60}h` : `${d}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={planNotes}
                onChangeText={setPlanNotes}
                placeholder="Any details or goals for this session"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                onPress={handleSavePlan}
                disabled={!planTitle.trim() || !planHobbyId}
                style={[
                  styles.savePlanBtn,
                  (planTitle.trim() && planHobbyId) ? styles.savePlanBtnActive : styles.savePlanBtnDisabled
                ]}
              >
                <Text style={styles.savePlanBtnText}>Save Plan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Completed Sessions */}
          {daySessions.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listHeader}>Completed</Text>
              <View style={styles.listContainer}>
                {daySessions.map((session) => {
                  const hobby = hobbies.find((h) => h.id === session.hobbyId);
                  if (!hobby) return null;
                  return (
                    <View key={session.id} style={styles.completedCard}>
                      <View style={[styles.completedIconWrap, { backgroundColor: `${hobby.color}15` }]}>
                        <Text style={styles.completedIcon}>{hobby.icon}</Text>
                      </View>
                      <View style={styles.completedContent}>
                        <Text style={styles.completedTitle} numberOfLines={1}>
                          {session.mediaTitle || hobby.name}
                        </Text>
                        {session.notes ? (
                          <Text style={styles.completedNotes} numberOfLines={1}>{session.notes}</Text>
                        ) : null}
                      </View>
                      <View style={styles.completedMeta}>
                        <Clock size={12} color="#9CA3AF" />
                        <Text style={styles.completedDuration}>{session.duration}m</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Planned Activities List */}
          {dayPlanned.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listHeader}>Planned</Text>
              <View style={styles.listContainer}>
                {dayPlanned.map((activity) => {
                  const hobby = hobbies.find((h) => h.id === activity.hobbyId);
                  if (!hobby) return null;
                  return (
                    <View key={activity.id} style={styles.plannedCard}>
                      <TouchableOpacity
                        onPress={() => dispatch(togglePlannedActivityComplete(activity.id))}
                        style={[
                          styles.plannedCheckBtn,
                          {
                            backgroundColor: activity.completed ? hobby.color : 'transparent',
                            borderColor: activity.completed ? hobby.color : `${hobby.color}40`,
                            borderWidth: activity.completed ? 0 : 2,
                          }
                        ]}
                      >
                        {activity.completed && <Check size={14} color="#FFF" />}
                      </TouchableOpacity>
                      <View style={styles.plannedContent}>
                        <Text
                          style={[
                            styles.plannedTitle,
                            activity.completed ? styles.plannedTitleComplete : null
                          ]}
                          numberOfLines={1}
                        >
                          {activity.title}
                        </Text>
                        <View style={styles.plannedMetaWrap}>
                          <Text style={[styles.plannedHobby, { color: hobby.color }]}>
                            {hobby.icon} {hobby.name}
                          </Text>
                          <Text style={styles.plannedMetaDuration}> · {activity.duration}m</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Empty State */}
          {(daySessions.length === 0 && dayPlanned.length === 0 && !showPlanForm) && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyText}>Nothing here yet</Text>
              <TouchableOpacity onPress={() => setShowPlanForm(true)} style={styles.planBtnBase}>
                <Plus size={14} color="#FFF" />
                <Text style={styles.planBtnTextBase}>Plan a session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff6e8ff' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: { padding: 8 },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderRadius: 12,
  },
  dayCellSelected: { backgroundColor: '#1F2937' },
  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dayCircleToday: { backgroundColor: '#F3F4F6' },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  dayTextToday: { color: '#111827', fontWeight: '500' },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '500' },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  historySection: {
    marginTop: 8,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  selectedDayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planFormCard: {
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
  planFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  hobbyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  hobbyChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durTextWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  durTextVal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  durTextUnit: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  durChips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  durChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
  },
  durChipSelected: {
    backgroundColor: '#111827',
  },
  durChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  durChipTextSelected: {
    color: '#FFFFFF',
  },
  savePlanBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  savePlanBtnActive: { backgroundColor: '#111827' },
  savePlanBtnDisabled: { backgroundColor: '#E5E7EB' },
  savePlanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listSection: { marginBottom: 16 },
  listHeader: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  listContainer: { gap: 8 },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  completedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedIcon: { fontSize: 14 },
  completedContent: { flex: 1 },
  completedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  completedNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  completedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  plannedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  plannedCheckBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plannedContent: { flex: 1 },
  plannedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  plannedTitleComplete: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  plannedMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  plannedHobby: {
    fontSize: 12,
  },
  plannedMetaDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  planBtnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  planBtnTextBase: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
