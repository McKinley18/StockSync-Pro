import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme, LayoutAnimation, Platform, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useToast } from '../components/Toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  zipcode: string;
  deals: Deal[];
  mealPlan: MealPlanItem[];
  savedRecipes: SavedRecipe[];
  themeMode: ThemeMode;
  isDark: boolean;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setZipcode: (zip: string) => void;
  refreshData: () => void;
  addItem: (item: Omit<PantryItem, 'id'>) => void;
  updateItem: (item: PantryItem) => void;
  removeItem: (id: number) => void;
  consumeItem: (id: number) => void;
  wasteItem: (id: number) => void;
  toggleShoppingStatus: (id: number, isPurchased: boolean) => void;
  removeShoppingItem: (id: number) => void;
  checkAndGenerateShoppingList: () => void;
  syncRecipeToShoppingList: (recipeId: number) => void;
  toggleStorePreference: (stores: string[]) => void;
  addMeal: (item: Omit<MealPlanItem, 'id'>) => void;
  updateMeal: (item: MealPlanItem) => void;
  removeMeal: (id: number) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: number) => void;
  saveRecipe: (recipe: Omit<SavedRecipe, 'id'>, ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[]) => void;
  removeRecipe: (id: number) => void;
  getCookableRecipes: () => SavedRecipe[];
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const systemColorScheme = useColorScheme();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [totalWaste, setTotalWaste] = useState<number>(0);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseLogItem[]>([]);
  const [preferredStores, setPreferredStores] = useState<string[]>(['BJ\'s', 'Sam\'s Club']);
  const [zipcode, setZipcode] = useState<string>('');
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedStores = await AsyncStorage.getItem('preferredStores');
        const storedZip = await AsyncStorage.getItem('zipcode');
        if (storedStores) setPreferredStores(JSON.parse(storedStores));
        if (storedZip) setZipcode(storedZip);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleStorePreference = async (stores: string[]) => {
    setPreferredStores(stores);
    await AsyncStorage.setItem('preferredStores', JSON.stringify(stores));
  };

  const setZipcodePersistent = async (zip: string) => {
    setZipcode(zip);
    await AsyncStorage.setItem('zipcode', zip);
  };

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

  // Intelligent Sales Engine
  const recommendedDeals = useMemo(() => {
    const mockDeals: Deal[] = [];
    const keywords = ['Milk', 'Bread', 'Eggs', 'Chicken', 'Rice', 'Apples', 'Coffee', 'Pasta'];
    
    preferredStores.forEach(store => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const item = keywords[Math.floor(Math.random() * keywords.length)];
        mockDeals.push({ store, itemName: item, salePrice: parseFloat((Math.random() * 5 + 1).toFixed(2)) });
      }
    });

    // Intelligent filter: Only suggest items that user buys at preferred stores
    // and aren't heavily overstocked (though for simplicity, just check pantry presence)
    const pantryItemNames = pantryItems.map(item => item.name);
    const filtered = mockDeals.filter(deal => {
      // Logic: Recommend deal if it's a staple (in keywords) 
      // and not currently in pantry (or just surface them all for now)
      return !pantryItemNames.includes(deal.itemName);
    });

    console.log('RecommendedDeals:', filtered);
    return filtered;
  }, [preferredStores, pantryItems]);

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

  const addMeal = (item: Omit<MealPlanItem, 'id'>) => { addMealPlanItem(item); refreshData(); showToast('Meal planned', 'success'); };
  const updateMeal = (item: MealPlanItem) => { updateMealPlanItem(item); refreshData(); showToast('Meal updated', 'success'); };
  const removeMeal = (id: number) => { deleteMealPlanItem(id); refreshData(); showToast('Meal removed', 'info'); };

  const addCategory = (name: string) => { addCategoryToDB(name); refreshData(); showToast('Category added', 'success'); };
  const removeCategory = (id: number) => { deleteCategoryFromDB(id); refreshData(); showToast('Category removed', 'info'); };

  const syncRecipeToShoppingList = (recipeId: number) => {
    const ingredients = getRecipeIngredients(recipeId);
    ingredients.forEach(ing => {
      const pItem = pantryItems.find(p => 
        ing.name.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(ing.name.toLowerCase())
      );
      
      const quantityNeeded = pItem ? Math.max(0, ing.quantity - pItem.quantity) : ing.quantity;
      
      if (quantityNeeded > 0) {
        addShoppingListItem({
          itemId: pItem?.id,
          name: ing.name,
          quantityNeeded,
          unit: ing.unit,
          isPurchased: false
        });
      }
    });
    setShoppingList(getShoppingList());
    showToast('Recipe ingredients added to shopping list', 'success');
  };

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

  const getCookableRecipes = useCallback(() => {
    return savedRecipes.filter(recipe => {
      const ingredients = getRecipeIngredients(recipe.id!);
      return ingredients.every(ing => {
        const pItem = pantryItems.find(p => 
          ing.name.toLowerCase().includes(p.name.toLowerCase()) || 
          p.name.toLowerCase().includes(ing.name.toLowerCase())
        );
        return pItem && pItem.quantity >= ing.quantity;
      });
    });
  }, [savedRecipes, pantryItems]);

  return (
    <PantryContext.Provider value={{ 
      pantryItems, categories, shoppingList, totalWaste, purchaseHistory, predictions, preferredStores, zipcode, deals: recommendedDeals, mealPlan, savedRecipes, themeMode, isDark, isLoading, setThemeMode, 
      setZipcode: setZipcodePersistent,
      refreshData, addItem, updateItem, removeItem, consumeItem, wasteItem, toggleShoppingStatus, removeShoppingItem, checkAndGenerateShoppingList, 
      syncRecipeToShoppingList,
      toggleStorePreference, 
      addMeal, updateMeal, removeMeal,
      addCategory, removeCategory, saveRecipe, removeRecipe, getCookableRecipes
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
