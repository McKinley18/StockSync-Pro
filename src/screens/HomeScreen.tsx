import React, { useMemo, Fragment } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native'; 
import { usePantry } from '../context/PantryContext';
import { TriangleAlert, PackageSearch, TrendingDown, Clock, CloudCheck, DollarSign, CircleCheckBig, ShoppingCart, BookOpen } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

import EmptyState from '../components/EmptyState';
import AppText from '../components/AppText';
// import AnimatedPressable from '../components/AnimatedPressable'; // Removed

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { pantryItems, totalWaste, isDark, consumeItem, getCookableRecipes } = usePantry();
  const { colors } = useTheme(); // Only colors are destructured from useTheme

  const handleQuickRestock = () => {
    // Implement quick restock logic, e.g., navigate to Add Item with pre-filled data or add to shopping list
    // For now, let's just show an alert
    Alert.alert('Quick Restock', 'Functionality to quickly restock this item will be implemented here.');
  };

  const lowStockItems = pantryItems.filter(item => item.quantity <= item.threshold).length;
  
  const expiringSoon = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    return pantryItems.filter(item => {
      if (!item.expirationDate) return false;
      const exp = new Date(item.expirationDate);
      return exp <= sevenDaysFromNow && exp >= now;
    }).sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime());
  }, [pantryItems]);

  const totalInventoryValue = useMemo(() => {
    return pantryItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [pantryItems]);

  const cookableRecipes = getCookableRecipes();

  // Define styles inside the component to access isDark and colors
  const styles = StyleSheet.create({
    container: { flex: 1 },
    statsContainer: { flexDirection: 'row', padding: 16, justifyContent: 'space-between', gap: 10, marginTop: 8 },
    statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, backgroundColor: '#ffffff', borderColor: colors.border },
    statNumber: { fontSize: 20, marginVertical: 4, color: colors.text },
    statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' },
    section: { paddingHorizontal: 16, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 13, color: '#64748b', textTransform: 'uppercase' },
    expiringList: { borderRadius: 16, borderWidth: 1, backgroundColor: '#ffffff', borderColor: colors.border },
    expiringItem: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }, // Correctly using isDark
    expiringItemActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    actionBtn: { padding: 5 },
    alertItemName: { fontSize: 15, color: colors.text },
    alertDate: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
    quantity: { fontSize: 14, color: '#64748b' },
    infoCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, backgroundColor: '#ffffff', borderColor: colors.border },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    infoLabel: { color: colors.text, fontSize: 14 },
    infoValue: { fontSize: 14 },
    quickTip: { paddingHorizontal: 16, marginBottom: 20, padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#3b82f6', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }, // Using isDark
    quickTipTitle: { marginBottom: 4 },
    quickTipText: { lineHeight: 20, fontSize: 13, color: isDark ? '#94a3b8' : '#475569' },
    emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    emptyStateText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
    progressBarContainer: {
      height: 10,
      backgroundColor: '#10b981', // Green for inventory
      borderRadius: 5,
      marginTop: 10,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#ef4444', // Red for waste
      borderRadius: 5,
    },
    progressBarLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
    },
    progressBarLabelLeft: {
      fontSize: 12,
      color: '#10b981',
      fontWeight: 'bold',
    },
    progressBarLabelRight: {
      fontSize: 12,
      color: '#ef4444',
      fontWeight: 'bold',
    },
  });


  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#ffffff', borderColor: colors.border }]}>
            <PackageSearch size={22} color="#3b82f6" />
            <AppText weight="bold" style={[styles.statNumber, { color: colors.text }]}>{pantryItems.length}</AppText>
            <AppText weight="bold" style={styles.statLabel}>Total Items</AppText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ffffff', borderColor: colors.border }]}>
            <TriangleAlert size={22} color="#ef4444" />
            <AppText weight="bold" style={[styles.statNumber, { color: '#ef4444' }]}>{lowStockItems}</AppText>
            <AppText weight="bold" style={styles.statLabel}>Low Stock</AppText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ffffff', borderColor: colors.border }]}>
            <TrendingDown size={22} color="#64748b" />
            <AppText weight="bold" style={[styles.statNumber, { color: '#64748b' }]}>${totalWaste.toFixed(0)}</AppText>
            <AppText weight="bold" style={styles.statLabel}>Total Waste</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color="#f59e0b" />
            <AppText weight="bold" style={styles.sectionTitle}>Expiring Soon</AppText>
          </View>
          <View style={[styles.expiringList, { backgroundColor: '#ffffff', borderColor: colors.border }]}>
            {expiringSoon.length > 0 ? (
              expiringSoon.map((item, index) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.expiringItem, { borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }, index === expiringSoon.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => navigation.navigate('AddItem', { itemId: item.id })}
                >
                  <View>
                    <AppText weight="bold" style={[styles.alertItemName, { color: colors.text }]}>{item.name}</AppText>
                    <AppText weight="medium" style={[styles.alertDate, { color: '#f59e0b' }]}>
                      Expires in {Math.round((new Date(item.expirationDate!).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                    </AppText>
                  </View>
                  <View style={styles.expiringItemActions}>
                    <TouchableOpacity onPress={() => consumeItem(item.id!)} style={styles.actionBtn}>
                      <CircleCheckBig size={20} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleQuickRestock()} style={styles.actionBtn}>
                      <ShoppingCart size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState 
                icon={<Clock size={40} color="#3b82f6" />}
                title="All Clear!"
                description="No items are expiring within the next 7 days."
              />
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color="#f59e0b" />
            <AppText weight="bold" style={styles.sectionTitle}>Cookable Now</AppText>
          </View>
          <View style={[styles.expiringList, { backgroundColor: '#ffffff', borderColor: colors.border }]}>
            {cookableRecipes.length > 0 ? (
              cookableRecipes.map((recipe, index) => (
                <TouchableOpacity 
                  key={recipe.id} 
                  style={[styles.expiringItem, { borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }, index === cookableRecipes.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id! })}
                >
                  <AppText weight="bold" style={[styles.alertItemName, { color: colors.text }]}>{recipe.name}</AppText>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState 
                icon={<BookOpen size={40} color="#3b82f6" />}
                title="No Cookable Recipes"
                description="Add recipes and pantry items to see what you can cook."
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={16} color="#64748b" />
            <AppText weight="bold" style={styles.sectionTitle}>Financial Summary</AppText>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#ffffff', borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <AppText weight="medium" style={[styles.infoLabel, { color: colors.text }]}>Total Inventory Value:</AppText>
              <AppText weight="bold" style={styles.infoValue}>
                ${totalInventoryValue.toFixed(2)}
              </AppText>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <AppText weight="medium" style={[styles.infoLabel, { color: colors.text }]}>Total Sunk Cost (Waste):</AppText>
              <AppText weight="bold" style={[styles.infoValue, { color: totalWaste > 0 ? '#ef4444' : '#10b981' }]}>
                ${totalWaste.toFixed(2)}
              </AppText>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${(totalWaste / (totalWaste + (totalInventoryValue === 0 ? 1 : totalInventoryValue))) * 100}%` }]} />
            </View>
            <View style={styles.progressBarLabels}>
              <AppText weight="bold" style={styles.progressBarLabelLeft}>Inventory</AppText>
              <AppText weight="bold" style={styles.progressBarLabelRight}>Waste</AppText>
            </View>
          </View>
        </View>

        <View style={[styles.quickTip, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
          <AppText weight="bold" style={[styles.quickTipTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>System Tip:</AppText>
          <AppText style={[styles.quickTipText, { color: isDark ? '#94a3b8' : '#475569' }]}>Use the &apos;Meal Planner&apos; to get recipe suggestions based on items you already have in your pantry.</AppText>
        </View>
      </ScrollView>
  );
};

export default HomeScreen;
