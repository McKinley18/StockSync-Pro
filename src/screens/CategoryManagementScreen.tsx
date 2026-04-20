import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { Tag, Trash2, Plus, LayoutGrid, LayoutGrid as GridIcon } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

const CategoryManagementScreen: React.FC = () => {
  const { categories, addCategory, removeCategory, isDark } = usePantry();
  const { colors } = useTheme();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete '${name}'? Items in this category will remain but their category will be unassigned.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeCategory(id) }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.heroBanner, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}>
        <Text style={styles.heroTitle}>Manage Categories</Text>
        <Text style={styles.heroSubtitle}>Organize your inventory with custom zones.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Category</Text>
        <View style={styles.addCard}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Camping Gear, Pet Food"
            placeholderTextColor="#64748b"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Plus size={20} color="white" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Existing Categories</Text>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <View key={cat.id} style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.catInfo}>
                <GridIcon size={18} color="#3b82f6" />
                <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete(cat.id!, cat.name)}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBanner: { padding: 30, backgroundColor: '#1e293b', marginBottom: 10 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  addCard: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { flex: 1, height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  addBtn: { height: 50, backgroundColor: '#3b82f6', paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  grid: { gap: 8 },
  categoryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catName: { fontSize: 16, fontWeight: '600' },
  footerSpacer: { height: 40 }
});

export default CategoryManagementScreen;
