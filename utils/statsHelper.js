/** Build weekly activity data (hours per day, mapped to M-S index) */
export function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sun, 1 is Mon
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeeklyData(sessions = []) {
  const days = Array(7).fill(0);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(todayStart.getDate() - 6);

  sessions.forEach((s) => {
    if (!s.date) return;
    const sessionDate = new Date(s.date);
    const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

    if (sessionDateOnly >= sevenDaysAgo && sessionDateOnly <= todayStart) {
      const dayOfWeek = sessionDate.getDay(); // 0 (Sun) to 6 (Sat)
      const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Map to 0 (Mon) to 6 (Sun)
      days[index] += (s.duration || 0) / 60;
    }
  });
  return days.map((h) => +h.toFixed(2));
}

/** Weekly goal progress (0–100) for a hobby, based on its goals */
export function getWeeklyGoalProgress(hobby, goals = [], sessions = []) {
  const hobbyGoals = goals.filter((g) => g.hobbyId === hobby.id);
  if (!hobbyGoals.length) return null;

  // Use the first goal as the primary indicator
  const goal = hobbyGoals[0];
  if (!goal.target) return null;

  // For session-count / hours goals derive current from this week's sessions
  const startOfWeek = getStartOfWeek();
  const weekSessions = sessions.filter(
    (s) => s.hobbyId === hobby.id && s.date && new Date(s.date) >= startOfWeek
  );

  let current = 0;
  if (goal.type === 'sessions_per_week') {
    current = weekSessions.length;
  } else if (goal.type === 'weekly_hours') {
    current = +weekSessions.reduce((a, s) => a + (s.duration || 0) / 60, 0).toFixed(1);
  } else if (goal.type === 'completed_items_per_week') {
    current = weekSessions.filter(s => s.status === 'completed').length;
  } else if (goal.type === 'streak_days') {
    current = hobby.streak || 0;
  }

  return Math.min(100, Math.round((current / goal.target) * 100));
}
