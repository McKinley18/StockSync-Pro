// StockSync Audit Date: 2026-04-20
import { Platform } from 'react-native';

// Dynamically export based on platform to ensure Web uses the Mock and Native uses SQLite
let databaseModule: any;

if (Platform.OS === 'web') {
  databaseModule = require('./database.web');
} else {
  // Use a different approach to avoid bundling issues on web if sqlite is imported
  const SQLite = require('expo-sqlite');
  
  let db = SQLite.openDatabaseSync('pantry.db');

  const CATEGORIES = [
    'Produce', 'Dairy', 'Meat & Seafood', 'Grains & Pasta', 'Canned Goods', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Other'
  ];

  databaseModule = {
    CATEGORIES,
    UNITS: ['items', 'lbs', 'oz', 'kg', 'g', 'ml', 'liters', 'cartons', 'bags', 'boxes', 'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon'],
    initDatabase: () => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE);
        CREATE TABLE IF NOT EXISTS pantry_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, barcode TEXT, quantity REAL NOT NULL, unit TEXT DEFAULT 'items', threshold REAL NOT NULL, price REAL DEFAULT 0, category TEXT DEFAULT 'Other', expirationDate TEXT);
        CREATE TABLE IF NOT EXISTS shopping_list (id INTEGER PRIMARY KEY AUTOINCREMENT, itemId INTEGER, name TEXT NOT NULL, quantityNeeded REAL NOT NULL, unit TEXT DEFAULT 'items', isPurchased INTEGER DEFAULT 0, FOREIGN KEY (itemId) REFERENCES pantry_items (id));
        CREATE TABLE IF NOT EXISTS waste_log (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, dateWasted TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS purchase_history (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, datePurchased TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS meal_plan (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, mealType TEXT NOT NULL, name TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS saved_recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, instructions TEXT, category TEXT);
        CREATE TABLE IF NOT EXISTS recipe_ingredients (id INTEGER PRIMARY KEY AUTOINCREMENT, recipeId INTEGER NOT NULL, name TEXT NOT NULL, quantity REAL NOT NULL, unit TEXT NOT NULL, FOREIGN KEY (recipeId) REFERENCES saved_recipes (id));
        CREATE TABLE IF NOT EXISTS user_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, firstName TEXT, lastName TEXT, email TEXT, zipCode TEXT, allergies TEXT, dislikes TEXT, liability_accepted INTEGER DEFAULT 0, preferred_store TEXT, frequent_items TEXT);
      `);
      
      const countRes = db.getFirstSync('SELECT COUNT(*) as count FROM categories');
      if (countRes && countRes.count === 0) {
        CATEGORIES.forEach(cat => db.runSync('INSERT INTO categories (name) VALUES (?)', [cat]));
      }

      const migrations = [
        'ALTER TABLE pantry_items ADD COLUMN price REAL DEFAULT 0;',
        "ALTER TABLE pantry_items ADD COLUMN category TEXT DEFAULT 'Other';",
        "ALTER TABLE pantry_items ADD COLUMN unit TEXT DEFAULT 'items';",
        "ALTER TABLE shopping_list ADD COLUMN unit TEXT DEFAULT 'items';",
        "ALTER TABLE saved_recipes ADD COLUMN category TEXT;",
        "ALTER TABLE user_profiles ADD COLUMN preferred_store TEXT;",
        "ALTER TABLE user_profiles ADD COLUMN firstName TEXT;",
        "ALTER TABLE user_profiles ADD COLUMN lastName TEXT;",
        "ALTER TABLE user_profiles ADD COLUMN email TEXT;",
        "ALTER TABLE user_profiles ADD COLUMN zipCode TEXT;"
      ];
      migrations.forEach(m => { try { db.execSync(m); } catch (e) {} });
    },
    getCategories: () => db.getAllSync('SELECT * FROM categories ORDER BY name ASC'),
    addCategory: (name: string) => db.runSync('INSERT INTO categories (name) VALUES (?)', [name]),
    deleteCategory: (id: number) => db.runSync('DELETE FROM categories WHERE id = ?', [id]),
    getPantryItems: () => db.getAllSync('SELECT * FROM pantry_items ORDER BY name ASC'),
    addPantryItem: (item: any) => {
      const result = db.runSync('INSERT INTO pantry_items (name, barcode, quantity, unit, threshold, price, category, expirationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.name, item.barcode || null, item.quantity, item.unit, item.threshold, item.price, item.category, item.expirationDate || null]);
      return result.lastInsertRowId;
    },
    updatePantryItem: (item: any) => db.runSync('UPDATE pantry_items SET name = ?, barcode = ?, quantity = ?, unit = ?, threshold = ?, price = ?, category = ?, expirationDate = ? WHERE id = ?', [item.name, item.barcode || null, item.quantity, item.unit, item.threshold, item.price, item.category, item.expirationDate || null, item.id]),
    deletePantryItem: (id: number) => db.runSync('DELETE FROM pantry_items WHERE id = ?', [id]),
    getShoppingList: () => db.getAllSync('SELECT * FROM shopping_list'),
    addShoppingListItem: (item: any) => db.runSync('INSERT INTO shopping_list (itemId, name, quantityNeeded, unit, isPurchased) VALUES (?, ?, ?, ?, ?)', [item.itemId || null, item.name, item.quantityNeeded, item.unit, item.isPurchased ? 1 : 0]),
    updateShoppingListItemStatus: (id: number, isPurchased: boolean) => db.runSync('UPDATE shopping_list SET isPurchased = ? WHERE id = ?', [isPurchased ? 1 : 0, id]),
    deleteShoppingListItem: (id: number) => db.runSync('DELETE FROM shopping_list WHERE id = ?', [id]),
    clearShoppingList: () => db.runSync('DELETE FROM shopping_list'),
    getWasteLog: () => db.getAllSync('SELECT * FROM waste_log ORDER BY dateWasted DESC'),
    addToWasteLog: (item: any) => db.runSync('INSERT INTO waste_log (name, price, dateWasted) VALUES (?, ?, ?)', [item.name, item.price, item.dateWasted]),
    getTotalWaste: () => {
      const result = db.getFirstSync('SELECT SUM(price) as total FROM waste_log');
      return result?.total || 0;
    },
    getPurchaseHistory: () => db.getAllSync('SELECT * FROM purchase_history ORDER BY datePurchased DESC'),
    addToPurchaseHistory: (item: any) => db.runSync('INSERT INTO purchase_history (name, price, datePurchased) VALUES (?, ?, ?)', [item.name, item.price, item.datePurchased]),
    getMealPlanItems: () => db.getAllSync('SELECT * FROM meal_plan ORDER BY date ASC'),
    addMealPlanItem: (item: any) => db.runSync('INSERT INTO meal_plan (date, mealType, name) VALUES (?, ?, ?)', [item.date, item.mealType, item.name]),
    updateMealPlanItem: (item: any) => db.runSync('UPDATE meal_plan SET date = ?, mealType = ?, name = ? WHERE id = ?', [item.date, item.mealType, item.name, item.id]),
    deleteMealPlanItem: (id: number) => db.runSync('DELETE FROM meal_plan WHERE id = ?', [id]),
    getSavedRecipes: () => db.getAllSync('SELECT * FROM saved_recipes ORDER BY name ASC'),
    getRecipeIngredients: (recipeId: number) => db.getAllSync('SELECT * FROM recipe_ingredients WHERE recipeId = ?', [recipeId]),
    addRecipe: (recipe: any, ingredients: any[]) => {
      const recipeRes = db.runSync('INSERT INTO saved_recipes (name, instructions, category) VALUES (?, ?, ?)', [recipe.name, recipe.instructions, recipe.category]);
      const recipeId = recipeRes.lastInsertRowId;
      ingredients.forEach(ing => db.runSync('INSERT INTO recipe_ingredients (recipeId, name, quantity, unit) VALUES (?, ?, ?, ?)', [recipeId, ing.name, ing.quantity, ing.unit]));
      return recipeId;
    },
    deleteRecipe: (id: number) => {
      db.runSync('DELETE FROM recipe_ingredients WHERE recipeId = ?', [id]);
      db.runSync('DELETE FROM saved_recipes WHERE id = ?', [id]);
    },
    getUserProfile: () => db.getFirstSync('SELECT * FROM user_profiles LIMIT 1'),
    saveUserProfile: (profile: any) => {
      const existing = db.getFirstSync('SELECT * FROM user_profiles LIMIT 1');
      if (existing) {
        db.runSync('UPDATE user_profiles SET firstName = ?, lastName = ?, email = ?, zipCode = ?, allergies = ?, dislikes = ?, liability_accepted = ?, preferred_store = ?, frequent_items = ? WHERE id = ?', [profile.firstName, profile.lastName, profile.email, profile.zipCode, profile.allergies, profile.dislikes, profile.liability_accepted ? 1 : 0, profile.preferred_store, profile.frequent_items, existing.id]);
      } else {
        db.runSync('INSERT INTO user_profiles (firstName, lastName, email, zipCode, allergies, dislikes, liability_accepted, preferred_store, frequent_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [profile.firstName, profile.lastName, profile.email, profile.zipCode, profile.allergies, profile.dislikes, profile.liability_accepted ? 1 : 0, profile.preferred_store, profile.frequent_items]);
      }
    },
    updateLiabilityStatus: (accepted: boolean) => {
      const existing = db.getFirstSync('SELECT * FROM user_profiles LIMIT 1');
      if (existing) {
        db.runSync('UPDATE user_profiles SET liability_accepted = ? WHERE id = ?', [accepted ? 1 : 0, existing.id]);
      } else {
        db.runSync('INSERT INTO user_profiles (firstName, lastName, email, zipCode, allergies, dislikes, liability_accepted, preferred_store, frequent_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['', '', '', '', '', '', accepted ? 1 : 0, '', '']);
      }
    }
  };
}

export const CATEGORIES = databaseModule.CATEGORIES;
export const UNITS = databaseModule.UNITS;
export const initDatabase = databaseModule.initDatabase;
export const getCategories = databaseModule.getCategories;
export const addCategory = databaseModule.addCategory;
export const deleteCategory = databaseModule.deleteCategory;
export const getPantryItems = databaseModule.getPantryItems;
export const addPantryItem = databaseModule.addPantryItem;
export const updatePantryItem = databaseModule.updatePantryItem;
export const deletePantryItem = databaseModule.deletePantryItem;
export const getShoppingList = databaseModule.getShoppingList;
export const addShoppingListItem = databaseModule.addShoppingListItem;
export const updateShoppingListItemStatus = databaseModule.updateShoppingListItemStatus;
export const deleteShoppingListItem = databaseModule.deleteShoppingListItem;
export const clearShoppingList = databaseModule.clearShoppingList;
export const getWasteLog = databaseModule.getWasteLog;
export const addToWasteLog = databaseModule.addToWasteLog;
export const getTotalWaste = databaseModule.getTotalWaste;
export const getPurchaseHistory = databaseModule.getPurchaseHistory;
export const addToPurchaseHistory = databaseModule.addToPurchaseHistory;
export const getMealPlanItems = databaseModule.getMealPlanItems;
export const addMealPlanItem = databaseModule.addMealPlanItem;
export const updateMealPlanItem = databaseModule.updateMealPlanItem;
export const deleteMealPlanItem = databaseModule.deleteMealPlanItem;
export const getSavedRecipes = databaseModule.getSavedRecipes;
export const getRecipeIngredients = databaseModule.getRecipeIngredients;
export const addRecipe = databaseModule.addRecipe;
export const deleteRecipe = databaseModule.deleteRecipe;
export const getUserProfile = databaseModule.getUserProfile;
export const saveUserProfile = databaseModule.saveUserProfile;
export const updateUserProfile = saveUserProfile;
export const updateLiabilityStatus = databaseModule.updateLiabilityStatus;

export interface PantryItem { id?: number; name: string; barcode?: string; quantity: number; unit: string; threshold: number; price: number; category: string; expirationDate?: string; }
export interface UserProfile { id?: number; firstName?: string; lastName?: string; email?: string; zipCode?: string; allergies: string; dislikes: string; liability_accepted: number; preferred_store?: string; frequent_items: string; }
export interface Category { id?: number; name: string; }
export interface ShoppingListItem { id?: number; itemId?: number; name: string; quantityNeeded: number; unit: string; isPurchased: boolean; }
export interface WasteLogItem { id?: number; name: string; price: number; dateWasted: string; }
export interface PurchaseLogItem { id?: number; name: string; price: number; datePurchased: string; }
export interface MealPlanItem { id?: number; date: string; mealType: string; name:string; }
export interface SavedRecipe { id?: number; name: string; instructions: string; category?: string; }
export interface RecipeIngredient { id?: number; recipeId: number; name: string; quantity: number; unit: string; }
