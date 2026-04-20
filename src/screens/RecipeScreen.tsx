import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { ExternalLink, RefreshCw, CircleCheckBig, BookmarkPlus } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { RecipeIngredient } from '../utils/database';

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface RecipeWithMatch extends Recipe {
  matchPercentage: number;
  missingCount: number;
}

const RecipeScreen: React.FC = () => {
  const { pantryItems, saveRecipe } = usePantry();
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
          let matchCount = 0;
          ingredients.forEach(ing => {
            const hasIt = pantryItems.some(p => ing.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(ing));
            if (hasIt) matchCount++;
          });
          const percentage = ingredients.length > 0 ? Math.round((matchCount / ingredients.length) * 100) : 0;
          return { ...meal, matchPercentage: percentage, missingCount: ingredients.length - matchCount };
        }));
        setRecipes(detailedMeals.sort((a, b) => b.matchPercentage - a.matchPercentage));
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
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const data = await response.json();
      const fullMeal = data.meals[0];
      
      const ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[] = [];
      for (let i = 1; i <= 20; i++) {
        const name = fullMeal[`strIngredient${i}`];
        const measure = fullMeal[`strMeasure${i}`];
        if (name && name.trim()) {
          ingredients.push({ 
            name, 
            quantity: 1,
            unit: measure || 'unit'
          });
        }
      }
      
      saveRecipe(
        { name: meal.strMeal, instructions: fullMeal.strInstructions },
        ingredients
      );
      Alert.alert("Success", `${meal.strMeal} added to your Recipe Book!`);
    } catch (error) {
      console.error(error);
    }
  };

  const openRecipe = (id: string) => {
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
              <Text style={[styles.emptyText, { color: colors.text }]}>No recipes identified.</Text>
              <Text style={[styles.emptySubtext, { color: dark ? '#64748b' : '#94a3b8' }]}>Add common pantry items like rice, flour, or chicken to see matches.</Text>
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
  matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  matchText: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  saveBtnText: { color: '#10b981', fontSize: 12, fontWeight: '700' },
  linkContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 20 },
  emptyText: { fontSize: 19, fontWeight: 'bold', textAlign: 'center' },
  emptySubtext: { fontSize: 15, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
});

export default RecipeScreen;
