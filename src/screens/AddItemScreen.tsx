import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { Camera, Scan, DollarSign, Calendar, Ruler, CircleAlert } from 'lucide-react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { UNITS } from '../utils/database';
import { formatToDisplayDate, formatToISODate } from '../utils/dateUtils';
import { CATEGORY_ICONS, ITEM_PREDICTIONS } from '../utils/constants';
import AppText from '../components/AppText';
// import AnimatedPressable from '../components/AnimatedPressable'; // Removed

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

const AddItemScreen: React.FC<Props> = ({ route, navigation }) => {
  const { addItem, updateItem, pantryItems, categories } = usePantry();
  const { colors, dark } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('items');
  const [threshold, setThreshold] = useState('1');
  const [price, setPrice] = useState('0.00');
  const [category, setCategory] = useState('Other');
  const [expirationDate, setExpirationDate] = useState('');
  const [barcode, setBarcode] = useState('');
  
  // Validation State
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const itemId = route.params?.itemId;

  useEffect(() => {
    if (itemId) {
      const item = pantryItems.find(i => i.id === itemId);
      if (item) {
        setName(item.name);
        setQuantity(item.quantity.toString());
        setUnit(item.unit || 'items');
        setThreshold(item.threshold.toString());
        setPrice(item.price.toString());
        setCategory(item.category || 'Other');
        setExpirationDate(item.expirationDate ? formatToDisplayDate(item.expirationDate) : '');
        setBarcode(item.barcode || '');
      }
    }
  }, [itemId, pantryItems]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) < 0) newErrors.quantity = 'Invalid quantity';
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) newErrors.price = 'Invalid price';
    if (expirationDate && !/^\d{2}-\d{2}-\d{4}$/.test(expirationDate)) newErrors.date = 'Use MM-DD-YYYY';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) setErrors({...errors, name: ''});
    const lower = val.toLowerCase().trim();
    if (ITEM_PREDICTIONS[lower]) {
      const prediction = ITEM_PREDICTIONS[lower];
      setCategory(prediction.category);
      setUnit(prediction.unit);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setIsScanning(false);
    setBarcode(data);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();
      if (result.status === 1 && result.product.product_name) {
        handleNameChange(result.product.product_name);
      }
    } catch (error) { console.error(error); }
  };

  const startScanning = async () => {
    if (Platform.OS === 'web') { Alert.alert('Not Supported', 'Barcode scanning is not supported on web preview.'); return; }
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') { setIsScanning(true); setScanned(false); }
  };

  const handleSave = () => {
    if (!validate()) return;
    const isoDate = expirationDate ? formatToISODate(expirationDate) : '';
    const itemData = { name, quantity: parseFloat(quantity) || 0, unit, threshold: parseFloat(threshold) || 0, price: parseFloat(price) || 0, category, expirationDate: isoDate, barcode };
    if (itemId) { updateItem({ ...itemData, id: itemId }); } else { addItem(itemData); }
    navigation.goBack();
  };

  if (isScanning) {
    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
        <View style={styles.overlay}>
          <AppText weight="medium" style={styles.scanText}>Scan the item barcode</AppText>
          <TouchableOpacity style={styles.cancelScan} onPress={() => setIsScanning(false)}>
            <AppText weight="bold" style={styles.cancelScanText}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.formGroup}>
        <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Item Name {errors.name && <AppText style={styles.errorLabel}>*</AppText>}</AppText>
        <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: errors.name ? '#ef4444' : colors.border, color: colors.text, fontFamily: 'Roboto-Regular' }]} value={name} onChangeText={handleNameChange} placeholder="e.g. Milk, Rice" placeholderTextColor="#64748b" />
        {errors.name && <AppText weight="medium" style={styles.errorHint}>{errors.name}</AppText>}
      </View>

      <TouchableOpacity style={[styles.scanButton, { backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: dark ? '#1e293b' : '#dbeafe' }]} onPress={startScanning}>
        <Scan size={20} color="#3b82f6" />
        <AppText weight="bold" style={styles.scanButtonText}>{barcode ? `Barcode: ${barcode}` : 'Scan Barcode'}</AppText>
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Category</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || CATEGORY_ICONS['Other'];
            return (
              <TouchableOpacity key={cat.id} style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }, category === cat.name && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]} onPress={() => setCategory(cat.name)}>
                <Icon size={14} color={category === cat.name ? 'white' : '#3b82f6'} style={{ marginRight: 6 }} />
                <AppText weight="medium" style={[styles.badgeText, { color: dark ? '#94a3b8' : '#64748b' }, category === cat.name && { color: 'white' }]}>{cat.name}</AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Unit of Measurement</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {UNITS.map((u) => (
            <TouchableOpacity key={u} style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }, unit === u && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]} onPress={() => setUnit(u)}>
              <AppText weight="medium" style={[styles.badgeText, { color: dark ? '#94a3b8' : '#64748b' }, unit === u && { color: 'white' }]}>{u}</AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Qty ({unit}) {errors.quantity && <AppText style={styles.errorLabel}>*</AppText>}</AppText>
          <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: errors.quantity ? '#ef4444' : colors.border, color: colors.text, fontFamily: 'Roboto-Regular' }]} value={quantity} onChangeText={(v) => { setQuantity(v); if(errors.quantity) setErrors({...errors, quantity: ''}); }} keyboardType="numeric" />
          {errors.quantity && <AppText weight="medium" style={styles.errorHint}>{errors.quantity}</AppText>}
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Restock At</AppText>
          <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontFamily: 'Roboto-Regular' }]} value={threshold} onChangeText={setThreshold} keyboardType="numeric" placeholder="Min" placeholderTextColor="#64748b" />
        </View>
      </View>

      <View style={styles.formGroup}>
        <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Price per {unit.replace(/s$/, '')} ($) {errors.price && <AppText style={styles.errorLabel}>*</AppText>}</AppText>
        <View style={styles.iconInputContainer}>
          <DollarSign size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput style={[styles.input, { flex: 1, paddingLeft: 40, backgroundColor: colors.background, borderColor: errors.price ? '#ef4444' : colors.border, color: colors.text, fontFamily: 'Roboto-Regular' }]} value={price} onChangeText={(v) => { setPrice(v); if(errors.price) setErrors({...errors, price: ''}); }} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#64748b" />
        </View>
        {errors.price && <AppText weight="medium" style={styles.errorHint}>{errors.price}</AppText>}
      </View>

      <View style={styles.formGroup}>
        <AppText weight="bold" style={[styles.label, { color: dark ? '#94a3b8' : '#475569' }]}>Expiration Date {errors.date && <AppText style={styles.errorLabel}>*</AppText>}</AppText>
        <View style={styles.iconInputContainer}>
          <Calendar size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput style={[styles.input, { flex: 1, paddingLeft: 40, backgroundColor: colors.background, borderColor: errors.date ? '#ef4444' : colors.border, color: colors.text, fontFamily: 'Roboto-Regular' }]} value={expirationDate} onChangeText={(v) => { setExpirationDate(v); if(errors.date) setErrors({...errors, date: ''}); }} placeholder="MM-DD-YYYY" placeholderTextColor="#64748b" />
        </View>
        {errors.date && <AppText weight="medium" style={styles.errorHint}>{errors.date}</AppText>}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <AppText weight="bold" style={styles.saveButtonText}>{itemId ? 'Update Inventory' : 'Add to Inventory'}</AppText>
      </TouchableOpacity>
      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  errorLabel: { color: '#ef4444' },
  errorHint: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  horizontalScroll: { flexDirection: 'row', marginBottom: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  badgeText: { fontSize: 13 },
  iconInputContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  row: { flexDirection: 'row' },
  scanButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 24, justifyContent: 'center', borderWidth: 1 },
  scanButtonText: { marginLeft: 8, color: '#3b82f6' },
  saveButton: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10,  boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)' },
  saveButtonText: { color: 'white', fontSize: 17 },
  scannerContainer: { flex: 1, backgroundColor: 'black' },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  scanText: { color: 'white', fontSize: 17, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 20, fontFamily: 'Roboto-Medium' },
  cancelScan: { backgroundColor: 'white', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  cancelScanText: { color: 'black', fontFamily: 'Roboto-Bold' },
  footerSpacer: { height: 60 }
});

export default AddItemScreen;