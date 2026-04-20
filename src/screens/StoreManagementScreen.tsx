import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { Store, CircleCheckBig, Circle } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

const AVAILABLE_STORES = [
  'Walmart', 'Target', 'ALDI', 'Kroger', 'Whole Foods', 'Costco', 'Trader Joe\'s', 'Publix', 'Safeway'
];

const StoreManagementScreen: React.FC = () => {
  const { preferredStores, toggleStorePreference } = usePantry();
  const { colors, dark } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.heroBanner, { backgroundColor: dark ? '#1e293b' : '#1e293b' }]}>
        <Text style={styles.heroTitle}>Store Management</Text>
        <Text style={styles.heroSubtitle}>Select stores you want to monitor for sales.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local Chains</Text>
        <View style={styles.grid}>
          {AVAILABLE_STORES.map((store) => {
            const isSelected = preferredStores.includes(store);
            return (
              <TouchableOpacity 
                key={store} 
                style={[styles.storeCard, { backgroundColor: colors.card, borderColor: isSelected ? '#3b82f6' : colors.border }, isSelected && { backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}
                onPress={() => toggleStorePreference(store)}
              >
                <View style={styles.storeInfo}>
                  <Store size={20} color={isSelected ? '#3b82f6' : '#64748b'} />
                  <Text style={[styles.storeName, { color: isSelected ? (dark ? '#60a5fa' : '#1e40af') : colors.text }]}>{store}</Text>
                </View>
                {isSelected ? (
                  <CircleCheckBig size={20} color="#3b82f6" />
                ) : (
                  <Circle size={20} color={colors.border} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={styles.infoText}>
          Selecting stores helps StockSync personalize your smart sales alerts on the shopping list.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBanner: { padding: 30, marginBottom: 10 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  grid: { gap: 12 },
  storeCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
  },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeName: { fontSize: 16, fontWeight: '600' },
  infoBox: { margin: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed' },
  infoText: { color: '#64748b', textAlign: 'center', fontSize: 14, lineHeight: 20 }
});

export default StoreManagementScreen;
