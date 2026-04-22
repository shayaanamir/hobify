/**
 * formatDuration — shared duration formatter
 *
 * @param {number} value    — minutes (integer) OR hours (float, e.g. 1.5)
 * @param {'minutes'|'hours'} unit — which unit `value` is in (default: 'minutes')
 * @returns {string}  e.g. "30 min", "1h", "1h 30m"
 */
export function formatDuration(value, unit = 'minutes') {
    const totalMinutes = unit === 'hours' ? Math.round(value * 60) : Math.round(value);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}