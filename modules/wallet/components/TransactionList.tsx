import React, {useCallback, memo} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useThemeStore} from '@/globalStore';
import TransactionCard from './TransactionCard';
import {FetchCompletedRidesQuery} from '@/generated/graphql';
import {Divider} from '@/components';

interface TransactionListProps {
  /**
   * Array of transactions to display
   */
  transactions: FetchCompletedRidesQuery['ride_details'];
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

// Memoized transaction card component for performance
const MemoizedTransactionCard = memo(TransactionCard);

// separator component
const ItemSeparatorComponent = () => {
  return <Divider height={10} />;
};

/**
 * Optimized list of transaction cards
 */
const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  testID = 'transaction-list',
}) => {
  const {colors} = useThemeStore(state => state.theme);

  // Optimized render function
  const renderItem = useCallback(
    ({item}: {item: FetchCompletedRidesQuery['ride_details'][0]}) => (
      <MemoizedTransactionCard transaction={item} />
    ),
    [],
  );

  // Optimized key extractor
  const keyExtractor = useCallback(
    (item: FetchCompletedRidesQuery['ride_details'][0]) => item.id,
    [],
  );

  // Empty list component
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, {color: colors.textPrimary}]}>
          No transactions yet
        </Text>
      </View>
    ),
    [colors.textPrimary],
  );

  return (
    <FlatList
      data={transactions || []}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      initialNumToRender={8}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default TransactionList;
