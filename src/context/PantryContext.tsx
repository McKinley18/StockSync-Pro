import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { 
  PantryItem, 
  Category,
  ShoppingListItem, 
  initDatabase, 
  getPantryItems, 
  addPantryItem, 
  updatePantryItem, 
  deletePantryItem,
  getShoppingList,
  addShoppingListItem,
  updateShoppingListItemStatus,
  deleteShoppingListItem,
  getTotalWaste,
  addToWasteLog,
  getPurchaseHistory,
  addToPurchaseHistory,
  PurchaseLogItem,
  MealPlanItem,
  getMealPlanItems,
  addMealPlanItem,
  updateMealPlanItem,
  deleteMealPlanItem,
  getCategories,
  addCategory as addCategoryToDB,
  deleteCategory as deleteCategoryFromDB,
  SavedRecipe,
  RecipeIngredient,
  getSavedRecipes,
  getRecipeIngredients,
  addRecipe as addRecipeToDB,
  deleteRecipe as deleteRecipeFromDB
} from '../utils/database';

interface Deal {
  store: string;
  itemName: string;
  salePrice: number;
}

type ThemeMode = 'system' | 'light' | 'dark';

interface PantryContextType {
  pantryItems: PantryItem[];
  categories: Category[];
  shoppingList: ShoppingListItem[];
  totalWaste: number;
  purchaseHistory: PurchaseLogItem[];
  predictions: string[];
  preferredStores: string[];
  deals: Deal[];
  mealPlan: MealPlanItem[];
  savedRecipes: SavedRecipe[];
  themeMode: ThemeMode;
  isDark: boolean;
  isLoading: boolean; // Add isLoading state
  setThemeMode: (mode: ThemeMode) => void;
  refreshData: () => void;
  addItem: (item: Omit<PantryItem, 'id'>) => void;
  updateItem: (item: PantryItem) => void;
  removeItem: (id: number) => void;
  consumeItem: (id: number) => void;
  wasteItem: (id: number) => void;
  toggleShoppingStatus: (id: number, isPurchased: boolean) => void;
  removeShoppingItem: (id: number) => void;
  checkAndGenerateShoppingList: () => void;
  toggleStorePreference: (store: string) => void;
  addMeal: (item: Omit<MealPlanItem, 'id'>) => void;
  updateMeal: (item: MealPlanItem) => void;
  removeMeal: (id: number) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: number) => void;
  saveRecipe: (recipe: Omit<SavedRecipe, 'id'>, ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[]) => void;
  removeRecipe: (id: number) => void;
  syncRecipeToShoppingList: (recipeId: number) => { added: string[], alreadyHave: string[] };
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

import { useToast } from '../components/Toast';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const systemColorScheme = useColorScheme();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [totalWaste, setTotalWaste] = useState<number>(0);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseLogItem[]>([]);
  const [preferredStores, setPreferredStores] = useState<string[]>(['Walmart', 'ALDI']);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const isDark = useMemo(() => {
    if (themeMode === 'system') return systemColorScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPantryItems(getPantryItems());
    setCategories(getCategories());
    setShoppingList(getShoppingList());
    setTotalWaste(getTotalWaste());
    setPurchaseHistory(getPurchaseHistory());
    setMealPlan(getMealPlanItems());
    setSavedRecipes(getSavedRecipes());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initDatabase();
    refreshData();
  }, [refreshData]);

  // Mock Sales Engine
  const deals = useMemo(() => {
    const mockDeals: Deal[] = [];
    const keywords = ['Milk', 'Bread', 'Eggs', 'Chicken', 'Rice', 'Apples', 'Coffee', 'Pasta'];
    preferredStores.forEach(store => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const item = keywords[Math.floor(Math.random() * keywords.length)];
        mockDeals.push({ store, itemName: item, salePrice: parseFloat((Math.random() * 5 + 1).toFixed(2)) });
      }
    });
    return mockDeals;
  }, [preferredStores]);

  const predictions = useMemo(() => {
    const itemMap: { [name: string]: number[] } = {};
    purchaseHistory.forEach(purchase => {
      if (!itemMap[purchase.name]) itemMap[purchase.name] = [];
      itemMap[purchase.name].push(new Date(purchase.datePurchased).getTime());
    });
    const results: string[] = [];
    const now = Date.now();
    Object.keys(itemMap).forEach(name => {
      const dates = itemMap[name].sort((a, b) => b - a);
      if (dates.length >= 2) {
        let totalInterval = 0;
        for (let i = 0; i < dates.length - 1; i++) { totalInterval += (dates[i] - dates[i+1]); }
        const avgInterval = totalInterval / (dates.length - 1);
        const lastPurchase = dates[0];
        if (now >= (lastPurchase + avgInterval)) {
          const inPantry = pantryItems.find(i => i.name.toLowerCase() === name.toLowerCase());
          const inList = shoppingList.find(i => i.name.toLowerCase() === name.toLowerCase() && !i.isPurchased);
          if ((!inPantry || inPantry.quantity <= inPantry.threshold) && !inList) { results.push(name); }
        }
      }
    });
    return results;
  }, [purchaseHistory, pantryItems, shoppingList]);

  const checkAndGenerateShoppingList = useCallback(() => {
    const currentItems = getPantryItems();
    const currentShoppingList = getShoppingList();
    currentItems.forEach(item => {
      if (item.quantity <= item.threshold) {
        const alreadyInList = currentShoppingList.some(si => si.itemId === item.id && !si.isPurchased);
        if (!alreadyInList) {
          addShoppingListItem({ itemId: item.id, name: item.name, quantityNeeded: item.threshold + 1 - item.quantity, unit: item.unit || 'items', isPurchased: false });
        }
      }
    });
    setShoppingList(getShoppingList());
  }, []);

  const addItem = (item: Omit<PantryItem, 'id'>) => {
    addPantryItem(item);
    addToPurchaseHistory({ name: item.name, price: item.price, datePurchased: new Date().toISOString() });
    refreshData();
    checkAndGenerateShoppingList();
    showToast(`${item.name} added to pantry`, 'success');
  };

  const updateItem = (item: PantryItem) => {
    const oldItem = pantryItems.find(i => i.id === item.id);
    if (oldItem && item.quantity > oldItem.quantity) {
      addToPurchaseHistory({ name: item.name, price: item.price, datePurchased: new Date().toISOString() });
    }
    updatePantryItem(item);
    refreshData();
    checkAndGenerateShoppingList();
    showToast(`Updated ${item.name}`, 'success');
  };

  const removeItem = (id: number) => { 
    console.log('PantryContext: Attempting to remove item with ID:', id);
    const item = pantryItems.find(i => i.id === id);
    deletePantryItem(id); 
    refreshData();
    if (item) showToast(`Removed ${item.name}`, 'info');
  };

  const consumeItem = (id: number) => { 
    const item = pantryItems.find(i => i.id === id);
    deletePantryItem(id); 
    refreshData();
    if (item) showToast(`Consumed ${item.name}`, 'success');
  };

  const wasteItem = (id: number) => {
    const item = pantryItems.find(i => i.id === id);
    if (item) { 
      addToWasteLog({ name: item.name, price: item.price, dateWasted: new Date().toISOString() }); 
      showToast(`${item.name} marked as waste`, 'warning');
    }
    deletePantryItem(id);
    refreshData();
  };

  const toggleShoppingStatus = (id: number, isPurchased: boolean) => {
    if (isPurchased) {
      const listItem = shoppingList.find(i => i.id === id);
      if (listItem && listItem.itemId) {
        const pItem = pantryItems.find(i => i.id === listItem.itemId);
        if (pItem) {
          updatePantryItem({ ...pItem, quantity: pItem.quantity + listItem.quantityNeeded });
          addToPurchaseHistory({ name: pItem.name, price: pItem.price, datePurchased: new Date().toISOString() });
        }
      }
      showToast('Item purchased & restocked', 'success');
    }
    updateShoppingListItemStatus(id, isPurchased);
    refreshData();
  };

  const removeShoppingItem = (id: number) => { 
    deleteShoppingListItem(id); 
    refreshData();
    showToast('Removed from shopping list', 'info');
  };

  const toggleStorePreference = (store: string) => { 
    const isPreferred = preferredStores.includes(store);
    setPreferredStores(prev => isPreferred ? prev.filter(s => s !== store) : [...prev, store]); 
    showToast(`${isPreferred ? 'Removed' : 'Added'} ${store} as preferred store`, 'info');
  };
  const addMeal = (item: Omit<MealPlanItem, 'id'>) => { addMealPlanItem(item); refreshData(); showToast('Meal planned', 'success'); };
  const updateMeal = (item: MealPlanItem) => { updateMealPlanItem(item); refreshData(); showToast('Meal updated', 'success'); };
  const removeMeal = (id: number) => { deleteMealPlanItem(id); refreshData(); showToast('Meal removed', 'info'); };

  const addCategory = (name: string) => { addCategoryToDB(name); refreshData(); showToast('Category added', 'success'); };
  const removeCategory = (id: number) => { deleteCategoryFromDB(id); refreshData(); showToast('Category removed', 'info'); };

  const saveRecipe = (recipe: Omit<SavedRecipe, 'id'>, ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[]) => {
    addRecipeToDB(recipe, ingredients);
    refreshData();
    showToast('Recipe saved to library', 'success');
  };

  const removeRecipe = (id: number) => {
    deleteRecipeFromDB(id);
    refreshData();
    showToast('Recipe removed', 'info');
  };

  const syncRecipeToShoppingList = (recipeId: number) => {
    const ingredients = getRecipeIngredients(recipeId);
    const currentShoppingList = getShoppingList();
    const added: string[] = [];
    const alreadyHave: string[] = [];

    ingredients.forEach(ing => {
      const pItem = pantryItems.find(p => 
        ing.name.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(ing.name.toLowerCase())
      );

      const onList = currentShoppingList.some(s => s.name.toLowerCase() === ing.name.toLowerCase() && !s.isPurchased);

      if (pItem && pItem.quantity > 0) {
        alreadyHave.push(ing.name);
      } else if (!onList) {
        addShoppingListItem({
          name: ing.name,
          quantityNeeded: ing.quantity,
          unit: ing.unit,
          isPurchased: false
        });
        added.push(ing.name);
      }
    });

    refreshData();
    if (added.length > 0) {
      showToast(`Added ${added.length} ingredients to shopping list`, 'success');
    } else {
      showToast('All ingredients already in stock', 'info');
    }
    return { added, alreadyHave };
  };

  return (
    <PantryContext.Provider value={{ 
      pantryItems, categories, shoppingList, totalWaste, purchaseHistory, predictions, preferredStores, deals, mealPlan, savedRecipes, themeMode, isDark, isLoading, setThemeMode,
      refreshData, addItem, updateItem, removeItem, consumeItem, wasteItem, toggleShoppingStatus, removeShoppingItem, checkAndGenerateShoppingList, toggleStorePreference, addMeal, updateMeal, removeMeal,
      addCategory, removeCategory, saveRecipe, removeRecipe, syncRecipeToShoppingList
    }}>
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (context === undefined) { throw new Error('usePantry must be used within a PantryProvider'); }
  return context;
};
