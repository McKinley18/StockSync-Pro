import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView as HorizontalScroll } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { Trash2, Edit2, CircleAlert, CircleCheckBig, CircleX, Search, Clock, DollarSign, Type, ShoppingCart } from 'lucide-react-native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler'; // Removed
// import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated'; // Removed
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { PantryItem } from '../utils/database';
import { formatToDisplayDate } from '../utils/dateUtils';
import { CATEGORY_ICONS } from '../utils/constants';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import AppText from '../components/AppText';
// import AnimatedPressable from '../components/AnimatedPressable'; // Removed
import { PackageSearch } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Pantry'>;
type SortType = 'name' | 'expiry' | 'price' | 'lastPurchased';

const PantryListScreen: React.FC<Props> = ({ navigation }) => {
  const { pantryItems, consumeItem, wasteItem, categories, purchaseHistory } = usePantry();
  const { colors, dark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleAction = (id: number, name: string, type: 'consume' | 'waste') => {
    if (multiSelectMode) {
      // Toggle selection for multi-select mode
      setSelectedItems(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
      return;
    }

    Alert.alert(
      type === 'consume' ? 'Consume Item' : 'Discard as Waste',
      `Are you sure you want to mark ${name} as ${type === 'consume' ? 'consumed' : 'wasted'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: type === 'consume' ? 'Consumed' : 'Wasted', style: type === 'consume' ? 'default' : 'destructive', onPress: () => type === 'consume' ? consumeItem(id) : wasteItem(id) },
      ]
    );
  };

  const handleBulkAction = (type: 'consume' | 'waste') => {
    Alert.alert(
      `Bulk ${type === 'consume' ? 'Consume' : 'Waste'}`,
      `Are you sure you want to ${type} ${selectedItems.length} items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: type === 'consume' ? 'Consume All' : 'Waste All', style: type === 'consume' ? 'default' : 'destructive', onPress: () => {
          selectedItems.forEach(id => type === 'consume' ? consumeItem(id) : wasteItem(id));
          setSelectedItems([]);
          setMultiSelectMode(false);
        }},
      ]
    );
  };

  const sections = useMemo(() => {
    let filtered = pantryItems.map(item => {
      const lastPurchase = purchaseHistory
        .filter(p => p.name === item.name)
        .sort((a, b) => new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime())[0];
      return { ...item, lastPurchased: lastPurchase ? lastPurchase.datePurchased : null };
    });

    filtered = filtered.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'expiry') {
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return a.expirationDate.localeCompare(b.expirationDate);
      }
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'lastPurchased') {
        if (!a.lastPurchased) return 1;
        if (!b.lastPurchased) return -1;
        return new Date(b.lastPurchased).getTime() - new Date(a.lastPurchased).getTime();
      }
      return 0;
    });

    const grouped: { [key: string]: (PantryItem & { lastPurchased: string | null })[] } = {};
    filtered.forEach(item => {
      const cat = item.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const catList = ['All', ...categories.map(c => c.name)];
    return catList.filter(cat => grouped[cat] && grouped[cat].length > 0)
      .map(cat => ({ title: cat, data: grouped[cat] }));
  }, [pantryItems, searchQuery, sortBy, selectedCategory, categories, purchaseHistory]);

  const SortButton = ({ type, label, icon: Icon }: { type: SortType, label: string, icon: any }) => (
    <TouchableOpacity style={[styles.sortBtn, sortBy === type && styles.sortBtnActive]} onPress={() => setSortBy(type)}>
      <Icon size={14} color={sortBy === type ? 'white' : '#64748b'} />
      <AppText weight="bold" style={[styles.sortBtnText, sortBy === type && { color: 'white' }]}>{label}</AppText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.controls, { borderColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color="#64748b" />
          <TextInput style={[styles.searchInput, { color: colors.text, fontFamily: 'Roboto-Regular' }]} placeholder="Search My Pantry..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <HorizontalScroll horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
          {['All', ...categories.map(c => c.name)].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }, selectedCategory === cat && styles.filterBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <AppText weight="bold" style={[styles.filterBtnText, { color: dark ? '#94a3b8' : '#475569' }, selectedCategory === cat && { color: 'white' }]}>{cat}</AppText>
            </TouchableOpacity>
          ))}
        </HorizontalScroll>

        <View style={styles.sortContainer}>
          <SortButton type="name" label="Name" icon={Type} />
          <SortButton type="expiry" label="Expires" icon={Clock} />
          <SortButton type="lastPurchased" label="Purchased" icon={ShoppingCart} />
          <SortButton type="price" label="Value" icon={DollarSign} />
        </View>
      </View>

      {multiSelectMode && (
        <View style={[styles.bulkActionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText weight="bold" style={[styles.bulkActionsText, { color: colors.text }]}>{selectedItems.length} items selected</AppText>
          <View style={styles.bulkActionButtons}>
            <TouchableOpacity onPress={() => handleBulkAction('consume')} style={[styles.bulkActionButton, { backgroundColor: '#10b981' }]}>
              <CircleCheckBig size={20} color="white" />
              <AppText weight="bold" style={styles.bulkActionButtonText}>Consume</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBulkAction('waste')} style={[styles.bulkActionButton, { backgroundColor: '#ef4444' }]}>
              <CircleX size={20} color="white" />
              <AppText weight="bold" style={styles.bulkActionButtonText}>Waste</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.multiSelectToggle, { backgroundColor: multiSelectMode ? '#3b82f6' : colors.card, borderColor: colors.border }]}
        onPress={() => {
          setMultiSelectMode(prev => !prev);
          setSelectedItems([]);
        }}
      >
        <AppText weight="bold" style={[styles.multiSelectToggleText, { color: multiSelectMode ? 'white' : colors.text }]}>
          {multiSelectMode ? 'Exit Multi-Select' : 'Select Items'}
        </AppText>
      </TouchableOpacity>


      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => {
          return (
            <View style={[styles.itemCardContainer, multiSelectMode && { marginLeft: 40 }]}>
              {multiSelectMode && (
                <TouchableOpacity style={styles.multiSelectCheckbox} onPress={() => handleAction(item.id!, item.name, 'consume')}>
                  {selectedItems.includes(item.id!) ? (
                    <CircleCheckBig size={24} color="#3b82f6" />
                  ) : (
                    <CircleCheckBig size={24} color={dark ? '#64748b' : '#94a3b8'} style={{ opacity: 0.5 }} />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('AddItem', { itemId: item.id })}
              >
                <View style={styles.itemInfo}>
                  <AppText weight="bold" style={[styles.itemName, { color: colors.text }]}>{item.name}</AppText>
                  <View style={styles.itemDetailsRow}>
                    <AppText style={styles.itemDetail}>QTY: {item.quantity} {item.unit}</AppText>
                    {item.lastPurchased && <AppText style={styles.itemDetail}>Bought: {formatToDisplayDate(item.lastPurchased)}</AppText>}
                    {item.expirationDate && <AppText style={styles.itemDetail}>Expires: {formatToDisplayDate(item.expirationDate)}</AppText>}
                  </View>
                  {item.quantity <= item.threshold && (
                    <View style={styles.lowStock}>
                      <CircleAlert size={14} color="#f59e0b" />
                      <AppText weight="bold" style={styles.lowStockText}>Low stock</AppText>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => navigation.navigate('AddItem', { itemId: item.id })} style={styles.actionBtn}>
                    <Edit2 size={18} color={dark ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleAction(item.id!, item.name, 'consume')} style={styles.actionBtn}>
                    <CircleCheckBig size={18} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleAction(item.id!, item.name, 'waste')} style={styles.actionBtn}>
                    <CircleX size={18} color="#ef4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { alert('Remove clicked for ID ' + item.id); console.log('PantryListScreen: Remove button pressed for ID:', item.id); removeItem(item.id!); }} style={styles.actionBtn}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <AppText weight="bold" style={styles.sectionTitle}>{title}</AppText>
          </View>
        )}
        ListEmptyComponent={
          pantryItems.length === 0 && searchQuery === '' && selectedCategory === 'All' ? (
            <EmptyState 
              icon={<PackageSearch size={40} color="#3b82f6" />}
              title="Pantry is Empty"
              description="You haven't added any items to your inventory yet."
              actionLabel="Add First Item"
              onAction={() => navigation.navigate('AddItem', {})}
            />
          ) : (
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <SkeletonLoader width="100%" height={80} marginBottom={10} />
              <SkeletonLoader width="100%" height={80} marginBottom={10} />
              <SkeletonLoader width="100%" height={80} marginBottom={10} />
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { padding: 16, borderBottomWidth: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 48 },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 8, fontFamily: 'Roboto-Regular' },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filterBtnText: { fontSize: 13, fontFamily: 'Roboto-Bold' },
  sortContainer: { flexDirection: 'row', gap: 8, paddingTop: 12 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  sortBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sortBtnText: { fontSize: 12, color: '#64748b', fontFamily: 'Roboto-Bold' },
  sectionHeader: { paddingHorizontal: 4, paddingTop: 24, paddingBottom: 8 },
  sectionTitle: { fontSize: 13, color: '#64748b', textTransform: 'uppercase' },
  itemCardContainer: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16 },
  itemDetailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  itemDetail: { fontSize: 13, color: '#64748b' },
  lowStock: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  lowStockText: { color: '#f59e0b', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 16, alignItems: 'center', position: 'absolute', right: 16, top: 16 },
  actionBtn: { padding: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18 },

  multiSelectToggle: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  multiSelectToggleText: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  bulkActionsText: {
    fontFamily: 'Roboto-Bold',
  },
  bulkActionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkActionButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  multiSelectCheckbox: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
});

export default PantryListScreen;