import React from 'react';
import {View, StyleSheet} from 'react-native';
import {FetchCompletedRidesQuery} from '@/generated/graphql';
import {H3, P3} from '@/components';
import {DateTime} from 'luxon';
import {showCredits} from '@/utils/user';

interface TransactionCardProps {
  /**
   * Transaction data
   */
  transaction: FetchCompletedRidesQuery['ride_details'][0];
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Card displaying transaction details
 */
const getDate = (timestamp: string) => {
  return DateTime.fromISO(timestamp).toFormat('dd MMMM');
};

const getTime = (timestamp: string) => {
  return DateTime.fromISO(timestamp).toFormat('HH:mm');
};

const TransactionCard: React.FC<TransactionCardProps> = ({transaction}) => {
  return (
    <View style={{flexDirection: 'row'}}>
      <View style={styles.leftContent}>
        <H3>{transaction.hubByStartHubId.name}</H3>
        <P3 textColor="textSecondary">{getDate(transaction.start_time)}</P3>
        <P3 textColor="textSecondary">{getTime(transaction.start_time)}</P3>
      </View>
      {showCredits() ? (
        <H3 textColor="highlight">{transaction.total_cost || 0} Credits</H3>
      ) : (
        <H3 textColor="highlight">₹ {transaction.total_cost || 0}</H3>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContent: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontWeight: '500',
    marginBottom: 4,
  },
  dateTime: {
    fontWeight: '400',
  },
  amount: {
    fontWeight: '600',
  },
});

export default TransactionCard;
