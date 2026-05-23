import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TransactionCard from '../modules/wallet/components/TransactionCard';
import { showCredits } from '../utils/user';

// Mock the dependencies to isolate TransactionCard
jest.mock('../utils/user', () => ({
  showCredits: jest.fn(),
}));

jest.mock('../globalStore', () => ({
  useThemeStore: (cb: any) => cb({
    theme: {
      colors: {
        border: '#E2E8F0',
        background: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        highlight: '#F97316',
      },
    },
  }),
}));

jest.mock('../components', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    H3: ({ children, style, ...props }: any) => React.createElement(Text, { style, ...props }, children),
    P3: ({ children, style, ...props }: any) => React.createElement(Text, { style, ...props }, children),
  };
});

describe('TransactionCard Component RNTL Test Suite', () => {
  const mockTransaction = {
    id: 'ride_123',
    hubByStartHubId: {
      name: 'Sector 62 Hub Noida',
    },
    start_time: '2026-05-20T10:30:00.000Z',
    total_cost: 45,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the start hub name correctly when provided', () => {
    (showCredits as jest.Mock).mockReturnValue(true);

    const { getByText } = render(
      <TransactionCard transaction={mockTransaction} />
    );

    expect(getByText('Sector 62 Hub Noida')).toBeTruthy();
  });

  it('should fallback gracefully to "Ride Completed" if hub name is missing', () => {
    (showCredits as jest.Mock).mockReturnValue(true);

    const transactionWithoutHub = {
      ...mockTransaction,
      hubByStartHubId: null,
    };

    const { getByText } = render(
      <TransactionCard transaction={transactionWithoutHub} />
    );

    expect(getByText('Ride Completed')).toBeTruthy();
  });

  it('should correctly format start date and time using Luxon', () => {
    (showCredits as jest.Mock).mockReturnValue(true);

    const { getByText } = render(
      <TransactionCard transaction={mockTransaction} />
    );

    // In different timezones, 10:30 UTC will parse to different times locally, but Luxon's parsing is verified.
    // We check that the formatted date contains "May 2026" or "20"
    expect(getByText(/May 2026/i)).toBeTruthy();
  });

  it('should render total cost in Credits if showCredits returns true', () => {
    (showCredits as jest.Mock).mockReturnValue(true);

    const { getByText } = render(
      <TransactionCard transaction={mockTransaction} />
    );

    expect(getByText('45 Credits')).toBeTruthy();
  });

  it('should render total cost in Rupees if showCredits returns false', () => {
    (showCredits as jest.Mock).mockReturnValue(false);

    const { getByText } = render(
      <TransactionCard transaction={mockTransaction} />
    );

    expect(getByText('₹ 45')).toBeTruthy();
  });

  it('should trigger onPress callback when the card is pressed', () => {
    const mockOnPress = jest.fn();

    const { getByTestId } = render(
      <TransactionCard
        transaction={mockTransaction}
        onPress={mockOnPress}
        testID="transaction-card-touchable"
      />
    );

    const card = getByTestId('transaction-card-touchable');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
