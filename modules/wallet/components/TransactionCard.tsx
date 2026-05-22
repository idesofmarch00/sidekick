import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {FetchCompletedRidesQuery} from '@/generated/graphql';
import {H3, P3} from '@/components';
import {DateTime} from 'luxon';
import {showCredits} from '@/utils/user';
import {useThemeStore} from '@/globalStore';

interface TransactionCardProps {
  /**
   * Transaction data
   */
  transaction: FetchCompletedRidesQuery['ride_details'][0];
  /**
   * Click handler to open stats watermarker modal
   */
  onPress?: () => void;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Card displaying transaction details
 */
const getDate = (timestamp: string) => {
  return DateTime.fromISO(timestamp).toFormat('dd MMMM yyyy');
};

const getTime = (timestamp: string) => {
  return DateTime.fromISO(timestamp).toFormat('HH:mm');
};

const TransactionCard: React.FC<TransactionCardProps> = ({transaction, onPress, testID}) => {
  const {colors} = useThemeStore(state => state.theme);

  return (
    <TouchableOpacity 
      style={[styles.container, {borderColor: colors.border || '#E2E8F0', backgroundColor: colors.background || '#FFFFFF'}]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.leftContent}>
        <H3>{transaction.hubByStartHubId?.name || 'Ride Completed'}</H3>
        <P3 textColor="textSecondary">{getDate(transaction.start_time)}</P3>
        <P3 textColor="textSecondary">{getTime(transaction.start_time)}</P3>
      </View>
      <View style={styles.rightContent}>
        {showCredits() ? (
          <H3 textColor="highlight" customStyles={{fontWeight: 'bold'}}>{transaction.total_cost || 0} Credits</H3>
        ) : (
          <H3 textColor="highlight" customStyles={{fontWeight: 'bold'}}>₹ {transaction.total_cost || 0}</H3>
        )}
        <Text style={[styles.chevron, {color: colors.textSecondary || '#64748B'}]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 2,
  },
  leftContent: {
    flex: 1,
    marginRight: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  chevron: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default TransactionCard;
