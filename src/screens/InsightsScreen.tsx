import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Modal, Share } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { TrendingDown, TrendingUp, TriangleAlert, DollarSign, Calendar, FileText, X } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { getWasteLog } from '../utils/database';
import { formatToDisplayDate } from '../utils/dateUtils';

const InsightsScreen: React.FC = () => {
  const { purchaseHistory, totalWaste, pantryItems } = usePantry();
  const { colors, dark } = useTheme();
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  
  const stats = useMemo(() => {
    const itemStats: { [name: string]: { purchases: number, wasteCost: number, totalCost: number } } = {};
    
    purchaseHistory.forEach(p => {
      if (!itemStats[p.name]) itemStats[p.name] = { purchases: 0, wasteCost: 0, totalCost: 0 };
      itemStats[p.name].purchases += 1;
      itemStats[p.name].totalCost += p.price;
    });

    const mostPurchased = Object.entries(itemStats)
      .sort((a, b) => b[1].purchases - a[1].purchases)
      .slice(0, 5);

    return { mostPurchased };
  }, [purchaseHistory]);

  const generateReport = () => {
    let csv = 'Type,Item Name,Price,Date\n';
    purchaseHistory.forEach(p => { csv += `Purchase,${p.name},${p.price.toFixed(2)},${formatToDisplayDate(p.datePurchased.split('T')[0])}\n`; });
    const wasteLog = getWasteLog();
    wasteLog.forEach(w => { csv += `Waste,${w.name},${w.price.toFixed(2)},${formatToDisplayDate(w.dateWasted.split('T')[0])}\n`; });
    setCsvContent(csv);
    setExportModalVisible(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: csvContent, title: 'StockSync Financial Report' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Most Purchased Items</Text>
          <TouchableOpacity style={styles.exportBtnInline} onPress={generateReport}>
            <FileText size={16} color="#3b82f6" />
            <Text style={styles.exportBtnTextInline}>Report</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {stats.mostPurchased.length > 0 ? stats.mostPurchased.map(([name, data], index) => (
            <View key={name} style={[styles.statRow, { borderBottomColor: dark ? '#1e293b' : '#f1f5f9' }, index === stats.mostPurchased.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.statInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{name}</Text>
                <Text style={styles.itemSub}>{data.purchases} times purchased</Text>
              </View>
              <Text style={[styles.itemValue, { color: colors.text }]}>${data.totalCost.toFixed(2)}</Text>
            </View>
          )) : (
            <Text style={styles.emptyText}>Not enough data yet. Keep using StockSync!</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <DollarSign size={20} color="#ef4444" />
          <Text style={styles.sectionTitle}>Financial Summary</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.miniCard, { backgroundColor: dark ? '#2d1a1a' : '#fef2f2', borderColor: dark ? '#451a1a' : '#e2e8f0' }]}>
            <Text style={styles.miniLabel}>Total Waste</Text>
            <Text style={[styles.miniValue, { color: '#ef4444' }]}>${totalWaste.toFixed(2)}</Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: dark ? '#1a2233' : '#eff6ff', borderColor: dark ? '#1e293b' : '#e2e8f0' }]}>
            <Text style={styles.miniLabel}>Avg. Item Price</Text>
            <Text style={[styles.miniValue, { color: '#3b82f6' }]}>
              ${purchaseHistory.length > 0 ? (purchaseHistory.reduce((s, p) => s + p.price, 0) / purchaseHistory.length).toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color="#64748b" />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {purchaseHistory.slice(0, 5).map((p, i) => (
            <View key={i} style={[styles.statRow, { borderBottomColor: dark ? '#1e293b' : '#f1f5f9' }, i === 4 && { borderBottomWidth: 0 }]}>
              <View style={styles.statInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{p.name}</Text>
                <Text style={styles.itemSub}>{formatToDisplayDate(p.datePurchased.split('T')[0])}</Text>
              </View>
              <Text style={[styles.itemValue, { color: colors.text }]}>+${p.price.toFixed(2)}</Text>
            </View>
          ))}
          {purchaseHistory.length === 0 && (
            <Text style={styles.emptyText}>No recent purchases logged.</Text>
          )}
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Financial CSV Report</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <X size={24} color={dark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={[styles.csvPreview, { backgroundColor: dark ? '#0f172a' : '#f1f5f9' }]}>
              <Text style={[styles.csvText, { color: dark ? '#94a3b8' : '#475569' }]}>{csvContent}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share / Export Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  exportBtnInline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  exportBtnTextInline: { color: '#3b82f6', fontWeight: 'bold', fontSize: 12 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  statInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  itemValue: { fontSize: 15, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 12 },
  miniCard: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  miniLabel: { fontSize: 11, color: '#64748b', fontWeight: '800', textTransform: 'uppercase' },
  miniValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  csvPreview: { padding: 16, borderRadius: 12, marginBottom: 20 },
  csvText: { fontFamily: 'monospace', fontSize: 12 },
  shareBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  shareBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#94a3b8', padding: 20 },
  footerSpacer: { height: 40 }
});

export default InsightsScreen;
