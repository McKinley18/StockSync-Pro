import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { BookOpen, Plus, Trash2, X } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { UNITS } from '../utils/database';
import { Picker } from '@react-native-picker/picker';

type InstructionMode = 'paragraph' | 'steps';

const RecipeBookScreen: React.FC = () => {
  const { savedRecipes, saveRecipe, removeRecipe } = usePantry();
  const { colors } = useTheme();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [recipeName, setMealName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<{ name: string, quantity: string, unit: string }[]>([]);
  const [ingName, setIngName] = useState('');
  const [ingQty, setIngQty] = useState('1');
  const [ingUnit, setIngUnit] = useState('unit');
  
  const [instructionMode, setInstructionMode] = useState<InstructionMode>('paragraph');
  const [instructions, setInstructions] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);

  const handleAddIngredient = () => {
    if (ingName.trim()) {
      setIngredients([...ingredients, { name: ingName.trim(), quantity: ingQty, unit: ingUnit }]);
      setIngName('');
      setIngQty('1');
      setIngUnit('unit');
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleStepChange = (text: string, index: number) => {
    const newSteps = [...steps];
    newSteps[index] = text;
    setSteps(newSteps);
  };
  
  const handleSaveRecipe = () => {
    if (!recipeName.trim() || ingredients.length === 0) {
      Alert.alert("Missing Info", "Please provide a recipe name and at least one ingredient.");
      return;
    }
    
    const finalInstructions = instructionMode === 'steps' ? JSON.stringify({ type: 'steps', content: steps.filter(s => s.trim() !== '') }) : instructions;

    saveRecipe(
      { name: recipeName, instructions: finalInstructions, category },
      ingredients.map(ing => ({ name: ing.name, quantity: parseFloat(ing.quantity) || 1, unit: ing.unit }))
    );
    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setMealName('');
    setInstructions('');
    setCategory('');
    setIngredients([]);
    setSteps(['']);
    setInstructionMode('paragraph');
  };

  const groupedRecipes = useMemo(() => {
    return savedRecipes.reduce((acc, recipe) => {
      const cat = recipe.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(recipe);
      return acc;
    }, {} as Record<string, typeof savedRecipes>);
  }, [savedRecipes]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.list}>
        <TouchableOpacity style={styles.addBtnLarge} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#3b82f6" />
          <Text style={styles.addBtnTextLarge}>Add New Recipe</Text>
        </TouchableOpacity>

        {Object.entries(groupedRecipes).map(([cat, recipes]) => (
          <View key={cat}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>{cat}</Text>
            {recipes.map((recipe) => (
              <View key={recipe.id} style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.recipeHeader}>
                  <View style={styles.recipeTitleGroup}>
                    <BookOpen size={18} color="#3b82f6" />
                    <Text style={[styles.recipeName, { color: colors.text }]}>{recipe.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeRecipe(recipe.id!)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {recipe.instructions ? (
                  <Text style={styles.recipeInstructions} numberOfLines={2}>{recipe.instructions}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        {savedRecipes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recipes saved yet.</Text>
            <Text style={styles.emptySubtext}>Add your favorites manually or save them from the &apos;Recipes&apos; discovery tab.</Text>
          </View>
        )}
        <View style={styles.footerSpacer} />
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Recipe</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Recipe Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                placeholder="e.g. Grandma&apos;s Pasta" 
                placeholderTextColor="#64748b"
                value={recipeName} 
                onChangeText={setMealName} 
              />

              <Text style={styles.inputLabel}>Category</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                placeholder="e.g. Italian, Chicken, Pasta" 
                placeholderTextColor="#64748b"
                value={category} 
                onChangeText={setCategory} 
              />

              <Text style={styles.inputLabel}>Ingredients</Text>
              <View style={styles.ingForm}>
                <TextInput 
                  style={[styles.ingInput, { flex: 3, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                  placeholder="Item" 
                  placeholderTextColor="#64748b"
                  value={ingName} 
                  onChangeText={setIngName} 
                />
                <TextInput 
                  style={[styles.ingInput, { flex: 1, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                  placeholder="Qty" 
                  placeholderTextColor="#64748b"
                  value={ingQty} 
                  onChangeText={setIngQty} 
                  keyboardType="numeric"
                />
                <View style={[styles.pickerContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Picker
                    selectedValue={ingUnit}
                    onValueChange={(itemValue) => setIngUnit(itemValue)}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {UNITS.map(unit => <Picker.Item key={unit} label={unit} value={unit} />)}
                  </Picker>
                </View>
                <TouchableOpacity style={styles.ingAddBtn} onPress={handleAddIngredient}>
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.ingList}>
                {ingredients.map((ing, i) => (
                  <View key={i} style={styles.ingBadge}>
                    <Text style={styles.ingBadgeText}>{ing.quantity} {ing.unit} {ing.name}</Text>
                    <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}>
                      <X size={12} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={styles.inputLabel}>Instructions</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={() => setInstructionMode('paragraph')} style={[styles.toggleButton, instructionMode === 'paragraph' && styles.toggleActive]}>
                  <Text style={[styles.toggleText, instructionMode === 'paragraph' && styles.toggleActiveText]}>Paragraph</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setInstructionMode('steps')} style={[styles.toggleButton, instructionMode === 'steps' && styles.toggleActive]}>
                  <Text style={[styles.toggleText, instructionMode === 'steps' && styles.toggleActiveText]}>Steps</Text>
                </TouchableOpacity>
              </View>

              {instructionMode === 'paragraph' ? (
                <TextInput 
                  style={[styles.input, { height: 120, textAlignVertical: 'top', backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                  placeholder="How do you cook it?" 
                  placeholderTextColor="#64748b"
                  multiline 
                  value={instructions} 
                  onChangeText={setInstructions} 
                />
              ) : (
                <>
                  {steps.map((step, index) => (
                    <TextInput
                      key={index}
                      style={[styles.input, { marginBottom: 10, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      placeholder={`Step ${index + 1}`}
                      placeholderTextColor="#64748b"
                      value={step}
                      onChangeText={(text) => handleStepChange(text, index)}
                    />
                  ))}
                  <TouchableOpacity onPress={handleAddStep} style={styles.addStepBtn}>
                    <Plus size={16} color="#3b82f6" />
                    <Text style={styles.addStepText}>Add Step</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.saveFullBtn} onPress={handleSaveRecipe}>
                <Text style={styles.saveFullBtnText}>Add to Recipe Book</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtnLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#3b82f6', marginBottom: 20 },
  addBtnTextLarge: { color: '#3b82f6', fontWeight: 'bold', fontSize: 15 },
  list: { padding: 20 },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  recipeCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recipeTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recipeName: { fontSize: 17, fontWeight: 'bold' },
  recipeInstructions: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#64748b' },
  emptySubtext: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 15 },
  ingForm: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ingInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  ingAddBtn: { backgroundColor: '#3b82f6', width: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ingList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  ingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#dbeafe' },
  ingBadgeText: { fontSize: 12, fontWeight: '600', color: '#3b82f6' },
  saveFullBtn: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  saveFullBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footerSpacer: { height: 40 },
  pickerContainer: { flex: 2, borderWidth: 1, borderRadius: 12, justifyContent: 'center' },
  picker: { height: 44 },
  toggleContainer: { flexDirection: 'row', marginBottom: 10, backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4 },
  toggleButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: 'white' },
  toggleText: { fontWeight: '600', color: '#64748b' },
  toggleActiveText: { color: '#3b82f6' },
  addStepBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, },
  addStepText: { color: '#3b82f6', fontWeight: 'bold' }
});

export default RecipeBookScreen;
