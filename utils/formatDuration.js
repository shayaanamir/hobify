/**
 * formatDuration — shared duration formatter
 *
 * @param {number} value    — minutes (integer) OR hours (float, e.g. 1.5)
 * @param {'minutes'|'hours'} unit — which unit `value` is in (default: 'minutes')
 * @param {Object} options  — { numberOnly: boolean }
 * @returns {string|number}  e.g. "30 min", "1h", "1h 30m" OR 1.5
 */
export function formatDuration(value, unit = 'minutes', options = {}) {
    if (options.numberOnly) {
        return unit === 'hours' ? +Number(value).toFixed(1) : +(value / 60).toFixed(1);
    }
    const totalMinutes = unit === 'hours' ? Math.round(value * 60) : Math.round(value);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}