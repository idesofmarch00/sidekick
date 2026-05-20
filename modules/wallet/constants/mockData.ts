// Transaction types
export type TransactionType = 'credit' | 'debit';

// Transaction interface
export interface Transaction {
  id: string;
  name: string;
  date: string;
  time: string;
  amount: number;
  type: TransactionType;
  description?: string;
}

// Wallet data interface
export interface WalletData {
  currentBalance: number;
  securityDeposit: number;
  transactions: Transaction[];
}

// Mock wallet data
export const mockWalletData: WalletData = {
  currentBalance: 436.5,
  securityDeposit: 200,
  transactions: [
    {
      id: '1',
      name: 'Christ University',
      date: '15th February',
      time: '14:34',
      amount: 54.0,
      type: 'debit',
      description: 'Ride fare'
    },
    {
      id: '2',
      name: 'Christ University',
      date: '15th February',
      time: '12:21',
      amount: 54.0,
      type: 'debit',
      description: 'Ride fare'
    },
    {
      id: '3',
      name: 'Christ University',
      date: '15th February',
      time: '10:15',
      amount: 54.0,
      type: 'debit',
      description: 'Ride fare'
    },
    {
      id: '4',
      name: 'Christ University',
      date: '14th February',
      time: '16:45',
      amount: 54.0,
      type: 'debit',
      description: 'Ride fare'
    },
    {
      id: '5',
      name: 'Added via UPI',
      date: '13th February',
      time: '09:30',
      amount: 200.0,
      type: 'credit',
      description: 'Wallet recharge'
    },
    {
      id: '6',
      name: 'Refund - Cancelled Ride',
      date: '12th February',
      time: '18:22',
      amount: 45.5,
      type: 'credit',
      description: 'Refund for cancelled ride'
    },
    {
      id: '7',
      name: 'MG Road',
      date: '12th February',
      time: '14:10',
      amount: 62.0,
      type: 'debit',
      description: 'Ride fare'
    },
    {
      id: '8',
      name: 'Added via Credit Card',
      date: '10th February',
      time: '20:15',
      amount: 500.0,
      type: 'credit',
      description: 'Wallet recharge'
    }
  ]
}; 