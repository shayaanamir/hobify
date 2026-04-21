/** Build weekly activity data (hours per day, mapped to M-S index) */
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
