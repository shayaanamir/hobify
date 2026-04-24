import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HobbyCard } from '../components/HobbyCard';

describe('HobbyCard Component', () => {
  const mockHobby = {
    id: '1',
    name: 'Reading',
    icon: 'book',
    color: '#3B82F6',
    totalHours: 120,
    streak: 5,
  };

  test('renders correctly with hobby data', () => {
    const { getByText } = render(
      <HobbyCard hobby={mockHobby} onPress={jest.fn()} />
    );

    expect(getByText('Reading')).toBeTruthy();
    expect(getByText('120h')).toBeTruthy(); // 120 totalHours = 120h
    expect(getByText(/5/)).toBeTruthy(); // Streak
  });

  test('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <HobbyCard hobby={mockHobby} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Reading'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('renders compact mode correctly', () => {
    const { queryByText } = render(
      <HobbyCard hobby={mockHobby} onPress={jest.fn()} compact={true} />
    );

    expect(queryByText('120h')).toBeNull(); // Stats should be hidden in compact mode
  });

  test('displays progress percentage when goalProgress is provided', () => {
    const { getByText } = render(
      <HobbyCard hobby={mockHobby} onPress={jest.fn()} goalProgress={45} />
    );

    expect(getByText('45%')).toBeTruthy();
  });

  test('displays checkmark when goal is completed', () => {
    const { getByText } = render(
      <HobbyCard hobby={mockHobby} onPress={jest.fn()} goalProgress={100} />
    );

    expect(getByText('✓')).toBeTruthy();
  });
});
