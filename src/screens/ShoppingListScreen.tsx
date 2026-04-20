import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { Trash2, CheckSquare, Square, RefreshCcw, Sparkles, Plus, Flame, Store } from 'lucide-react-native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler'; // Removed
// import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated'; // Removed
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { addShoppingListItem } from '../utils/database';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import AppText from '../components/AppText';
// import AnimatedPressable from '../components/AnimatedPressable'; // Removed
import { ShoppingBasket } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Shopping'>;

const ShoppingListScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    shoppingList, 
    toggleShoppingStatus, 
    removeShoppingItem, 
    checkAndGenerateShoppingList,
    predictions,
    refreshData,
    deals
  } = usePantry();
  const { colors, dark } = useTheme();

  const handleAddPrediction = (name: string) => {
    addShoppingListItem({ name, quantityNeeded: 1, unit: 'items', isPurchased: false });
    refreshData();
  };

  // Group items by Store
  const sections = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    shoppingList.forEach(item => {
      const sale = deals.find(d => item.name.toLowerCase().includes(d.itemName.toLowerCase()));
      const storeName = (sale && !item.isPurchased) ? sale.store : 'General / Other';
      
      if (!groups[storeName]) groups[storeName] = [];
      groups[storeName].push({ ...item, sale });
    });

    // Sort so "General" is last, and sales are first
    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === 'General / Other') return 1;
        if (b === 'General / Other') return -1;
        return a.localeCompare(b);
      })
      .map(([title, data]) => ({ title, data }));
  }, [shoppingList, deals]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }, item.isPurchased && styles.purchasedCard]}>
        
        <View style={styles.itemInfo}>
          <AppText weight="bold" style={[styles.itemName, { color: colors.text }, item.isPurchased && styles.purchasedText]}>{item.name}</AppText>
          <View style={styles.detailsRow}>
            <AppText style={styles.itemDetails}>Restock: {item.quantityNeeded} {item.unit}</AppText>
            {item.sale && !item.isPurchased && (
              <View style={styles.saleBadge}>
                <Flame size={12} color="#ef4444" fill="#ef4444" />
                <AppText weight="bold" style={styles.saleText}>SALE - ${item.sale.salePrice}</AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: item.isPurchased ? '#e2e8f0' : '#10b981' }]} onPress={() => toggleShoppingStatus(item.id!, !item.isPurchased)}>
            {item.isPurchased ? <Square size={16} color={dark ? '#64748b' : '#475569'} /> : <CheckSquare size={16} color="white" />}
            <AppText weight="bold" style={[styles.actionBtnText, { color: item.isPurchased ? (dark ? '#64748b' : '#475569') : 'white' }]}>
              {item.isPurchased ? 'Unpurchase' : 'Purchase'}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => removeShoppingItem(item.id!)}>
            <Trash2 size={16} color="white" />
            <AppText weight="bold" style={styles.actionBtnText}>Remove</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <AppText weight="medium" style={styles.subtitle}>{shoppingList.length} items to buy</AppText>
        <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]} onPress={checkAndGenerateShoppingList}>
          <RefreshCcw size={18} color="#3b82f6" />
          <AppText weight="bold" style={styles.refreshBtnText}>Sync Needs</AppText>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Store size={14} color="#64748b" />
            <AppText weight="bold" style={styles.sectionTitle}>{title}</AppText>
          </View>
        )}
        ListEmptyComponent={
          shoppingList.length === 0 && predictions.length === 0 ? (
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <SkeletonLoader width="100%" height={80} marginBottom={10} />
              <SkeletonLoader width="100%" height={80} marginBottom={10} />
              <SkeletonLoader width="100%" height={80} marginBottom={10} />
            </View>
          ) : (
            <EmptyState 
              icon={<ShoppingBasket size={40} color="#3b82f6" />}
              title="Stock is Optimized"
              description="Your inventory levels are above threshold. No restocks needed."
              actionLabel="Sync Needs"
              onAction={checkAndGenerateShoppingList}
            />
          )
        }
        ListFooterComponent={
          predictions.length > 0 ? (
            <View style={[styles.suggestionsContainer, { backgroundColor: dark ? '#1e1b4b' : '#f5f3ff', borderColor: dark ? '#312e81' : '#ddd6fe' }]}>
              <View style={styles.suggestionHeader}>
                <Sparkles size={16} color="#a78bfa" />
                <AppText weight="bold" style={[styles.suggestionTitle, { color: '#a78bfa' }]}>Smart Suggestions</AppText>
              </View>
              <AppText style={[styles.suggestionSubtitle, { color: '#818cf8' }]}>Based on your purchase routines:</AppText>
              {predictions.map(name => (
                <TouchableOpacity key={name} style={[styles.suggestionCard, { backgroundColor: colors.card, borderColor: dark ? '#312e81' : '#ddd6fe' }]} onPress={() => handleAddPrediction(name)}>
                  <AppText weight="medium" style={[styles.suggestionName, { color: colors.text }]}>{name}</AppText>
                  <Plus size={18} color="#a78bfa" />
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subtitle: { fontSize: 15, color: '#64748b' },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  refreshBtnText: { color: '#3b82f6', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  itemCard: { padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1 },
  purchasedCard: { opacity: 0.6 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16 },
  purchasedText: { textDecorationLine: 'line-through', color: '#94a3b8' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8, flexWrap: 'wrap' },
  itemDetails: { fontSize: 13, color: '#64748b' },
  saleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#fee2e2' },
  saleText: { fontSize: 11, color: '#ef4444' },
  emptyContainer: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  emptyText: { fontSize: 19 },
  emptySubtext: { fontSize: 15, marginTop: 8, textAlign: 'center' },
  suggestionsContainer: { marginTop: 20, padding: 20, borderRadius: 20, borderWidth: 1 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  suggestionTitle: { fontSize: 14, textTransform: 'uppercase' },
  suggestionSubtitle: { fontSize: 13, marginBottom: 12 },
  suggestionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  suggestionName: { fontSize: 15 },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 16, // Match itemCard borderRadius
    overflow: 'hidden', // Ensure swipe actions don't spill
  },
  itemCardWrapper: {
    // This Animated.View now wraps the itemCard and moves
    width: '100%',
    zIndex: 1, // Ensure it's above the swipe actions
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
  },
  rightSwipeAction: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#10b981', // Green for purchase
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 16, // Moved to swipeableContainer
    flexDirection: 'column',
    gap: 5,
  },
  rightSwipeText: {
    color: 'white',
    fontSize: 10,
  },
  leftSwipeAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#ef4444', // Red for remove
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 16, // Moved to swipeableContainer
    flexDirection: 'column',
    gap: 5,
  },
  leftSwipeText: {
    color: 'white',
    fontSize: 10,
  },
});

export default ShoppingListScreen;