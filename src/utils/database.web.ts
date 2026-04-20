export interface PantryItem {
  id?: number;
  name: string;
  barcode?: string;
  quantity: number;
  unit: string;
  threshold: number;
  price: number;
  category: string;
  expirationDate?: string;
}

export interface Category {
  id?: number;
  name: string;
}

export interface ShoppingListItem {
  id?: number;
  itemId?: number;
  name: string;
  quantityNeeded: number;
  unit: string;
  isPurchased: boolean;
}

export interface WasteLogItem {
  id?: number;
  name: string;
  price: number;
  dateWasted: string;
}

export interface PurchaseLogItem {
  id?: number;
  name: string;
  price: number;
  datePurchased: string;
}

export interface MealPlanItem {
  id?: number;
  date: string;
  mealType: string;
  name: string;
}

export interface SavedRecipe {
  id?: number;
  name: string;
  instructions: string;
}

export interface RecipeIngredient {
  id?: number;
  recipeId: number;
  name: string;
  quantity: number;
  unit: string;
}

export const CATEGORIES = [
  'Produce', 'Dairy', 'Meat & Seafood', 'Grains & Pasta', 'Canned Goods', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Other'
];

export const UNITS = [
  'items', 'lbs', 'oz', 'kg', 'g', 'ml', 'liters', 'cartons', 'bags', 'boxes'
];

// Helper to persist data to localStorage
const saveToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(`stocksync_${key}`, JSON.stringify(data));
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(`stocksync_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  }
  return defaultValue;
};

// In-memory mock storage with localStorage fallback
let pantryItems: PantryItem[] = loadFromStorage('pantry', []);
let shoppingList: ShoppingListItem[] = loadFromStorage('shopping', []);
let wasteLog: WasteLogItem[] = loadFromStorage('waste', []);
let purchaseHistory: PurchaseLogItem[] = loadFromStorage('purchases', []);
let mealPlan: MealPlanItem[] = loadFromStorage('mealplan', []);
let categories: Category[] = loadFromStorage('categories', CATEGORIES.map((n, i) => ({ id: i + 1, name: n })));
let savedRecipes: SavedRecipe[] = loadFromStorage('recipes', []);
let recipeIngredients: RecipeIngredient[] = loadFromStorage('ingredients', []);

let nextId: number = loadFromStorage('nextId', 1); // Centralized ID counter

const generateUniqueId = (prefix: string = '') => {
  const newId = nextId++;
  saveToStorage('nextId', nextId);
  return newId;
};

export const initDatabase = () => {
  console.log('Web: Mock Database Initialized with localStorage');
  // Populate with initial mock data if storage is empty
  if (pantryItems.length === 0 && shoppingList.length === 0 && wasteLog.length === 0 && purchaseHistory.length === 0 && mealPlan.length === 0 && savedRecipes.length === 0) {
    console.log('Populating web mock database with initial data...');
    // Reset nextId for initial population
    nextId = 1;
    saveToStorage('nextId', nextId);

    // Add some pantry items
    addPantryItem({ name: 'Milk', quantity: 1, unit: 'liters', threshold: 1, price: 2.50, category: 'Dairy', expirationDate: new Date(Date.now() + 86400000 * 7).toISOString(), barcode: '1234567890128' });
    addPantryItem({ name: 'Bread', quantity: 1, unit: 'loaves', threshold: 1, price: 3.00, category: 'Bakery', expirationDate: new Date(Date.now() + 86400000 * 3).toISOString(), barcode: '0987654321098' });
    addPantryItem({ name: 'Eggs', quantity: 12, unit: 'items', threshold: 6, price: 4.00, category: 'Dairy', expirationDate: new Date(Date.now() + 86400000 * 14).toISOString(), barcode: '1122334455667' });
    addPantryItem({ name: 'Chicken Breast', quantity: 2, unit: 'lbs', threshold: 0.5, price: 5.99, category: 'Meat & Seafood', expirationDate: new Date(Date.now() + 86400000 * 5).toISOString(), barcode: '6677889900112' });
    addPantryItem({ name: 'Rice', quantity: 5, unit: 'kg', threshold: 1, price: 8.00, category: 'Grains & Pasta', expirationDate: new Date(Date.now() + 86400000 * 365).toISOString(), barcode: '3344556677889' });

    // Add some purchase history (to generate predictions)
    addToPurchaseHistory({ name: 'Milk', price: 2.50, datePurchased: new Date(Date.now() - 86400000 * 30).toISOString() });
    addToPurchaseHistory({ name: 'Bread', price: 3.00, datePurchased: new Date(Date.now() - 86400000 * 15).toISOString() });
    addToPurchaseHistory({ name: 'Milk', price: 2.50, datePurchased: new Date(Date.now() - 86400000 * 60).toISOString() });

    // Add some shopping list items (some bought, some not)
    addShoppingListItem({ name: 'Apples', quantityNeeded: 6, unit: 'items', isPurchased: false });
    addShoppingListItem({ name: 'Bananas', quantityNeeded: 1, unit: 'bunch', isPurchased: true });

    // Save initial state to localStorage (implicitly done by add functions, but a final save is good)
    saveToStorage('pantry', pantryItems);
    saveToStorage('shopping', shoppingList);
    saveToStorage('waste', wasteLog);
    saveToStorage('purchases', purchaseHistory);
    saveToStorage('mealplan', mealPlan);
    saveToStorage('categories', categories);
    saveToStorage('recipes', savedRecipes);
    saveToStorage('ingredients', recipeIngredients);
  }
};

// Category CRUD
export const getCategories = (): Category[] => {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
};

export const addCategory = (name: string, id?: number) => {
  const newId = id ?? generateUniqueId('category');
  categories.push({ id: newId, name });
  saveToStorage('categories', categories);
  return newId;
};

export const deleteCategory = (id: number) => {
  categories = categories.filter(c => c.id !== id);
  saveToStorage('categories', categories);
};

// Pantry Item CRUD
export const getPantryItems = (): PantryItem[] => {
  return [...pantryItems].sort((a, b) => a.name.localeCompare(b.name));
};

export const addPantryItem = (item: Omit<PantryItem, 'id'>, id?: number) => {
  const newId = id ?? generateUniqueId('pantry');
  const newItem = { ...item, id: newId };
  pantryItems.push(newItem);
  saveToStorage('pantry', pantryItems);
  return newItem.id;
};

export const updatePantryItem = (item: PantryItem) => {
  pantryItems = pantryItems.map(i => i.id === item.id ? item : i);
  saveToStorage('pantry', pantryItems);
};

export const deletePantryItem = (id: number) => {
  console.log('Database: Deleting item with ID:', id, 'Current pantryItems length:', pantryItems.length);
  pantryItems = pantryItems.filter(i => i.id !== id);
  console.log('Database: PantryItems after filter:', pantryItems.length);
  saveToStorage('pantry', pantryItems);
};

// Shopping List CRUD
export const getShoppingList = (): ShoppingListItem[] => {
  return [...shoppingList];
};

export const addShoppingListItem = (item: Omit<ShoppingListItem, 'id'>, id?: number) => {
  const newId = id ?? generateUniqueId('shopping');
  const newItem = { ...item, id: newId };
  shoppingList.push(newItem);
  saveToStorage('shopping', shoppingList);
  return newItem.id;
};

export const updateShoppingListItemStatus = (id: number, isPurchased: boolean) => {
  shoppingList = shoppingList.map(i => i.id === id ? { ...i, isPurchased } : i);
  saveToStorage('shopping', shoppingList);
};

export const deleteShoppingListItem = (id: number) => {
  shoppingList = shoppingList.filter(i => i.id !== id);
  saveToStorage('shopping', shoppingList);
};

export const clearShoppingList = () => {
  shoppingList = [];
  saveToStorage('shopping', []);
};

// Analytics & Logs
export const getWasteLog = (): WasteLogItem[] => {
  return [...wasteLog].sort((a, b) => b.dateWasted.localeCompare(a.dateWasted));
};

export const addToWasteLog = (item: Omit<WasteLogItem, 'id'>, id?: number) => {
  const newId = id ?? generateUniqueId('waste');
  const newItem = { ...item, id: newId, dateWasted: item.dateWasted };
  wasteLog.push(newItem);
  saveToStorage('waste', wasteLog);
  return newId;
};

export const getTotalWaste = (): number => {
  return wasteLog.reduce((sum, item) => sum + item.price, 0);
};

export const getPurchaseHistory = (): PurchaseLogItem[] => {
  return [...purchaseHistory].sort((a, b) => b.datePurchased.localeCompare(a.datePurchased));
};

export const addToPurchaseHistory = (item: Omit<PurchaseLogItem, 'id'>, id?: number) => {
  const newId = id ?? generateUniqueId('purchase');
  const newItem = { ...item, id: newId, datePurchased: item.datePurchased };
  purchaseHistory.push(newItem);
  saveToStorage('purchases', purchaseHistory);
  return newId;
};

// Meal Plan
export const getMealPlanItems = (): MealPlanItem[] => {
  return [...mealPlan].sort((a, b) => a.date.localeCompare(b.date));
};

export const addMealPlanItem = (item: Omit<MealPlanItem, 'id'>, id?: number) => {
  const newId = id ?? generateUniqueId('mealplan');
  const newItem = { ...item, id: newId };
  mealPlan.push(newItem);
  saveToStorage('mealplan', mealPlan);
  return newItem.id;
};

export const updateMealPlanItem = (item: MealPlanItem) => {
  mealPlan = mealPlan.map(m => m.id === item.id ? item : m);
  saveToStorage('mealplan', mealPlan);
};

export const deleteMealPlanItem = (id: number) => {
  mealPlan = mealPlan.filter(m => m.id !== id);
  saveToStorage('mealplan', mealPlan);
};

// Recipe CRUD
export const getSavedRecipes = (): SavedRecipe[] => {
  return [...savedRecipes].sort((a, b) => a.name.localeCompare(b.name));
};

export const getRecipeIngredients = (recipeId: number): RecipeIngredient[] => {
  return recipeIngredients.filter(ri => ri.recipeId === recipeId);
};

export const addRecipe = (recipe: Omit<SavedRecipe, 'id'>, ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[], id?: number) => {
  const newRecipeId = id ?? generateUniqueId('recipe');
  savedRecipes.push({ ...recipe, id: newRecipeId });
  ingredients.forEach(ing => {
    recipeIngredients.push({ ...ing, id: generateUniqueId('recipeIngredient'), recipeId: newRecipeId });
  });
  saveToStorage('recipes', savedRecipes);
  saveToStorage('ingredients', recipeIngredients);
  return newRecipeId;
};

export const deleteRecipe = (id: number) => {
  recipeIngredients = recipeIngredients.filter(ri => ri.recipeId !== id);
  savedRecipes = savedRecipes.filter(r => r.id !== id);
  saveToStorage('recipes', savedRecipes);
  saveToStorage('ingredients', recipeIngredients);
};
