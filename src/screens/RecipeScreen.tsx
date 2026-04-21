import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import Fuse from 'fuse.js';
import { usePantry } from '../context/PantryContext';
import { useProfile } from '../context/ProfileContext';
import { UsageAuditor } from '../utils/analytics';
import { ExternalLink, RefreshCw, CircleCheckBig, BookmarkPlus, AlertTriangle } from 'lucide-react-native';
import { normalizeIngredient } from '../utils/ingredientParser';
import { useTheme } from '@react-navigation/native';
import { RecipeIngredient } from '../utils/database';

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
}

interface RecipeWithMatch extends Recipe {
  matchPercentage: number;
  missingCount: number;
  isAllergySafe: boolean;
  hasDislike: boolean;
  ingredientList: string[];
}

const RecipeScreen: React.FC = () => {
  const { pantryItems, saveRecipe } = usePantry();
  const { profile, isSafe, checkLiability } = useProfile();
  const { colors, dark } = useTheme();
  const [recipes, setRecipes] = useState<RecipeWithMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    if (pantryItems.length === 0) return;
    setLoading(true);
    try {
      const randomIndex = Math.floor(Math.random() * pantryItems.length);
      const searchItem = pantryItems[randomIndex].name;
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchItem}`);
      const data = await response.json();
      if (data.meals) {
        const topMeals = data.meals.slice(0, 8);
        const detailedMeals = await Promise.all(topMeals.map(async (meal: Recipe) => {
          const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const detailData = await detailRes.json();
          const fullMeal = detailData.meals[0];
          const ingredients: string[] = [];
          for (let i = 1; i <= 20; i++) {
            const ing = fullMeal[`strIngredient${i}`];
            if (ing && ing.trim()) ingredients.push(ing.toLowerCase());
          }
          
          const normalizedPantryItems = pantryItems.map(item => ({
            ...item,
            normalizedName: normalizeIngredient(item.name),
          }));

          const fuse = new Fuse(normalizedPantryItems, {
            keys: ['normalizedName'],
            threshold: 0.3,
            ignoreLocation: true,
          });

          let matchCount = 0;
          ingredients.forEach(ing => {
            const normalizedIng = normalizeIngredient(ing);
            if (normalizedIng) {
              const result = fuse.search(normalizedIng);
              if (result.length > 0) {
                matchCount++;
              }
            }
          });

          const percentage = ingredients.length > 0 ? Math.round((matchCount / ingredients.length) * 100) : 0;
          
          const isAllergySafe = ingredients.every(ing => isSafe(ing));
          const dislikes = profile?.dislikes?.split(',').map(d => d.trim().toLowerCase()) || [];
          const hasDislike = ingredients.some(ing => dislikes.some(d => ing.includes(d)));

          return { 
            ...fullMeal, 
            matchPercentage: percentage, 
            missingCount: ingredients.length - matchCount,
            isAllergySafe,
            hasDislike,
            ingredientList: ingredients
          };
        }));
        
        // Filter out allergy risks
        const filtered = detailedMeals.filter(m => m.isAllergySafe);
        
        // Sorting by preference logic placeholder (requires pantry analytics conversion)
        setRecipes(filtered.sort((a, b) => b.matchPercentage - a.matchPercentage));
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [pantryItems]);

  const handleSaveToBook = async (meal: RecipeWithMatch) => {
    if (!checkLiability()) {
      Alert.alert("Liability Agreement Required", "Please accept the Liability Agreement in Settings to proceed.");
      return;
    }
    
    try {
      const ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[] = meal.ingredientList.map(name => ({ 
        name, 
        quantity: 1,
        unit: 'unit'
      }));
      
      const finalInstructions = meal.strInstructions.split('\n').filter((s: string) => s.trim() !== '');

      saveRecipe(
        { name: meal.strMeal, instructions: JSON.stringify({ type: 'steps', content: finalInstructions }) },
        ingredients
      );
      Alert.alert("Success", `${meal.strMeal} added to your Recipe Book!`);
    } catch (error) {
      console.error(error);
    }
  };

  const openRecipe = (id: string) => {
    if (!checkLiability()) {
      Alert.alert("Liability Agreement Required", "Please accept the Liability Agreement in Settings to proceed.");
      return;
    }
    Linking.openURL(`https://www.themealdb.com/meal/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Recipe Matcher</Text>
          <Text style={styles.subtitle}>Deep matching with your inventory</Text>
        </View>
        <TouchableOpacity onPress={fetchRecipes} disabled={loading} style={[styles.refreshBtn, { backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
          <RefreshCw size={20} color={loading ? "#cbd5e1" : "#3b82f6"} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Analyzing ingredients...</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <View style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
              <View style={styles.recipeInfo}>
                <View>
                  <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={1}>{item.strMeal}</Text>
                  {item.hasDislike && (
                    <View style={styles.dislikeWarning}>
                      <AlertTriangle size={12} color="#ef4444" />
                      <Text style={styles.dislikeText}>Contains your disliked items</Text>
                    </View>
                  )}
                  <View style={[styles.matchBadge, { backgroundColor: dark ? '#1e293b' : '#f8fafc' }]}>
                    <CircleCheckBig size={12} color={item.matchPercentage > 70 ? "#10b981" : "#f59e0b"} />
                    <Text style={[styles.matchText, { color: item.matchPercentage > 70 ? "#059669" : "#d97706" }]}>
                      {item.matchPercentage}% Match ({item.missingCount} missing)
                    </Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveToBook(item)}>
                    <BookmarkPlus size={16} color="#10b981" />
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkContainer} onPress={() => openRecipe(item.idMeal)}>
                    <Text style={styles.linkText}>Steps</Text>
                    <ExternalLink size={14} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>No safe recipes identified.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  refreshBtn: { padding: 10, borderRadius: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#64748b', fontWeight: '500' },
  recipeCard: { borderRadius: 20, flexDirection: 'row', marginBottom: 16, overflow: 'hidden', borderWidth: 1 },
  recipeImage: { width: 110, height: 110 },
  recipeInfo: { flex: 1, padding: 16, justifyContent: 'space-between' },
  recipeName: { fontSize: 16, fontWeight: 'bold' },
  dislikeWarning: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dislikeText: { fontSize: 11, color: '#ef4444' },
  matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  matchText: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  saveBtnText: { color: '#10b981', fontSize: 12, fontWeight: '700' },
  linkContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 20 },
  emptyText: { fontSize: 19, fontWeight: 'bold', textAlign: 'center' },
});

export default RecipeScreen;
