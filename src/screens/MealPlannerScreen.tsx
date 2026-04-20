import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { ChevronLeft, ChevronRight, Plus, Trash2, ShoppingBasket, Lightbulb, BookOpen, CircleCheckBig, Sparkles, X, Edit2 } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { formatToDisplayDate } from '../utils/dateUtils';
import { MealPlanItem } from '../utils/database';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const MealPlannerScreen: React.FC = () => {
  const { mealPlan, addMeal, removeMeal, updateMeal, pantryItems, savedRecipes, syncRecipeToShoppingList, isDark } = usePantry();
  const { colors } = useTheme();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncResults, setSyncResults] = useState<{ added: string[], alreadyHave: string[] } | null>(null);
  
  const [selectedSlot, setSelectedSlot] = useState<{ date: string, type: string, meal?: MealPlanItem } | null>(null);
  const [mealName, setMealName] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const weekDates = useMemo(() => {
    const dates = [];
    const first = currentDate.getDate() - currentDate.getDay();
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate);
      d.setDate(first + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [currentDate]);

  const navigateWeek = (direction: number) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(next);
  };

  const handleSaveMeal = () => {
    if (selectedSlot && (mealName.trim() || selectedRecipeId)) {
      const finalName = selectedRecipeId 
        ? savedRecipes.find(r => r.id === selectedRecipeId)?.name || ''
        : mealName.trim();

      if (selectedSlot.meal) { // Editing existing meal
        updateMeal({ ...selectedSlot.meal, name: finalName });
      } else { // Adding new meal
        addMeal({
          date: selectedSlot.date,
          mealType: selectedSlot.type,
          name: finalName
        });
      }
      
      if (selectedRecipeId) {
        const results = syncRecipeToShoppingList(selectedRecipeId);
        setSyncResults(results);
        setSyncModalVisible(true);
      }

      setMealName('');
      setSelectedRecipeId(null);
      setModalVisible(false);
      setSelectedSlot(null);
    }
  };

  const handleManualSync = (mealName: string) => {
    const recipe = savedRecipes.find(r => r.name.toLowerCase() === mealName.toLowerCase());
    if (recipe) {
      const results = syncRecipeToShoppingList(recipe.id!);
      setSyncResults(results);
      setSyncModalVisible(true);
    } else {
      Alert.alert("Manual Meal", "This meal isn't in your Recipe Book, so we can't auto-sync ingredients yet.");
    }
  };

  const openModal = (date: string, type: string, meal?: MealPlanItem) => {
    setSelectedSlot({ date, type, meal });
    if (meal) {
      const recipe = savedRecipes.find(r => r.name.toLowerCase() === meal.name.toLowerCase());
      setMealName(recipe ? '' : meal.name);
      setSelectedRecipeId(recipe ? recipe.id! : null);
    } else {
      setMealName('');
      setSelectedRecipeId(null);
    }
    setModalVisible(true);
  };

  const inventorySuggestion = useMemo(() => {
    if (pantryItems.length === 0) return null;
    const items = pantryItems.filter(i => i.quantity > 0);
    if (items.length === 0) return null;
    const random = items[Math.floor(Math.random() * items.length)];
    return `Try something with ${random.name}`;
  }, [pantryItems, modalVisible]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} style={[styles.navBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <ChevronLeft size={20} color={isDark ? 'white' : '#64748b'} />
        </TouchableOpacity>
        <Text style={[styles.weekRange, { color: colors.text }]}>
          {new Date(weekDates[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(weekDates[6]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => navigateWeek(1)} style={[styles.navBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <ChevronRight size={20} color={isDark ? 'white' : '#64748b'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.calendar}>
        {weekDates.map((date, index) => (
          <View key={date} style={[styles.dayRow, { borderColor: colors.border }, index === weekDates.length - 1 && { borderBottomWidth: 0, marginBottom: 0 }]}>
            <View style={styles.dayLabel}>
              <Text style={styles.dayName}>{new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}</Text>
              <Text style={[styles.dayDate, { color: colors.text }]}>{new Date(date).getDate()}</Text>
            </View>
            <View style={styles.slots}>
              {MEAL_TYPES.map((type) => {
                const meal = mealPlan.find(m => m.date === date && m.mealType === type);
                return (
                  <View key={type} style={styles.mealSlot}>
                    <Text style={styles.slotType}>{type}</Text>
                    <View style={[styles.slotContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {meal ? (
                        <View style={styles.mealCard}>
                          <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>{meal.name}</Text>
                          <View style={styles.mealActions}>
                            <TouchableOpacity onPress={() => openModal(date, type, meal)}>
                              <Edit2 size={18} color="#64748b" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleManualSync(meal.name)}>
                              <ShoppingBasket size={18} color="#3b82f6" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeMeal(meal.id!)}>
                              <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.addSlot} onPress={() => openModal(date, type)}>
                          <Plus size={16} color="#94a3b8" />
                          <Text style={styles.addText}>Plan</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Add/Edit Meal Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedSlot?.meal ? 'Edit' : 'Plan'} {selectedSlot?.type}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#64748b" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Custom Name</Text>
              <TextInput style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: colors.border, color: colors.text }]} placeholder="What are you cooking?" placeholderTextColor="#64748b" value={mealName} onChangeText={(val) => { setMealName(val); setSelectedRecipeId(null); }} />

              <Text style={styles.label}>- OR - Pick from Recipe Book</Text>
              <View style={styles.recipeGrid}>
                {savedRecipes.map(r => (
                  <TouchableOpacity key={r.id} style={[styles.recipeOption, selectedRecipeId === r.id && styles.recipeOptionActive]} onPress={() => { setSelectedRecipeId(r.id!); setMealName(''); }}>
                    <BookOpen size={16} color={selectedRecipeId === r.id ? 'white' : '#3b82f6'} />
                    <Text style={[styles.recipeOptionText, selectedRecipeId === r.id && { color: 'white' }]}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
                {savedRecipes.length === 0 && <Text style={styles.emptyRecipes}>Your Recipe Book is empty.</Text>}
              </View>

              {inventorySuggestion && !selectedSlot?.meal && (
                <View style={[styles.suggestionBox, { backgroundColor: isDark ? '#2d2d1a' : '#fffbeb' }]}>
                  <Lightbulb size={16} color="#f59e0b" />
                  <Text style={[styles.suggestionText, { color: isDark ? '#fbbf24' : '#92400e' }]}>{inventorySuggestion}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMeal}>
                <Text style={styles.saveBtnText}>Confirm Plan</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sync Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={syncModalVisible} onRequestClose={() => setSyncModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, alignItems: 'center' }]}>
            <Sparkles size={48} color="#8b5cf6" style={{ marginBottom: 16 }} />
            <Text style={[styles.modalTitle, { textAlign: 'center', color: colors.text }]}>Ingredients Synced!</Text>
            <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 8, marginBottom: 20 }}>
              StockSync checked your pantry for ingredients.
            </Text>

            <View style={styles.syncReport}>
              <View style={styles.reportRow}>
                <CircleCheckBig size={16} color="#10b981" />
                <Text style={styles.reportText}>{syncResults?.alreadyHave.length} items already in pantry</Text>
              </View>
              <View style={styles.reportRow}>
                <ShoppingBasket size={16} color="#3b82f6" />
                <Text style={styles.reportText}>{syncResults?.added.length} items added to Shopping List</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSyncModalVisible(false)}>
              <Text style={styles.closeBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  navContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  navBtn: { padding: 8, borderRadius: 10 },
  weekRange: { fontSize: 15, fontWeight: '700' },
  calendar: { flex: 1, padding: 16 },
  dayRow: { flexDirection: 'row', gap: 12, paddingBottom: 24, borderBottomWidth: 1, marginBottom: 24 },
  dayLabel: { width: 45, alignItems: 'center', paddingTop: 4 },
  dayName: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  dayDate: { fontSize: 20, fontWeight: '800' },
  slots: { flex: 1, gap: 16 },
  mealSlot: { },
  slotContainer: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, minHeight: 40, justifyContent: 'center' },
  slotType: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
  addSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  mealCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealName: { flex: 1, fontSize: 15, fontWeight: '700' },
  mealActions: { flexDirection: 'row', gap: 14, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 15, marginBottom: 16 },
  recipeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  recipeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  recipeOptionActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  recipeOptionText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  emptyRecipes: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic' },
  suggestionBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 24 },
  suggestionText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  syncReport: { width: '100%', gap: 12, marginBottom: 30 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  reportText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  closeBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  closeBtnText: { color: 'white', fontWeight: 'bold' },
  footerSpacer: { height: 40 }
});

export default MealPlannerScreen;
