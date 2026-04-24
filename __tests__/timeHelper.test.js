import { timeAgo } from '../utils/timeHelper';

describe('timeHelper utils', () => {
  beforeAll(() => {
    // Mock Date.now to have consistent results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-24T14:20:45Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('returns "just now" for very recent time', () => {
    const now = new Date('2026-04-24T14:20:40Z');
    expect(timeAgo(now)).toBe('just now');
  });

  test('returns minutes ago', () => {
    const fiveMinsAgo = new Date('2026-04-24T14:15:45Z');
    expect(timeAgo(fiveMinsAgo)).toBe('5m ago');
  });

  test('returns hours ago', () => {
    const twoHoursAgo = new Date('2026-04-24T12:20:45Z');
    expect(timeAgo(twoHoursAgo)).toBe('2h ago');
  });

  test('returns days ago', () => {
    const threeDaysAgo = new Date('2026-04-21T14:20:45Z');
    expect(timeAgo(threeDaysAgo)).toBe('3d ago');
  });

  test('returns date string for older dates', () => {
    const lastYear = new Date('2025-04-24T14:20:45Z');
    // toLocaleDateString might vary by environment, but it should be a string
    expect(typeof timeAgo(lastYear)).toBe('string');
    expect(timeAgo(lastYear)).not.toContain('ago');
  });

  test('returns empty string for null input', () => {
    expect(timeAgo(null)).toBe('');
  });
});
