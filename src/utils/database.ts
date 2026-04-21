import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const setSecureItem = async (key: string, value: string) => {
  console.log('DB: Setting Secure Item:', key);
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return Promise.resolve();
  }
  return await SecureStore.setItemAsync(key, value);
};

export const getSecureItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

export const hashString = (str: string) => {
  try { return btoa(str); } catch (e) { return str; }
};

export const updateUserProfile = async (data: any) => {
  console.log('DB: Updating User Profile');
  if (Platform.OS === 'web') {
    localStorage.setItem('user_profile', JSON.stringify(data));
  }
  return Promise.resolve(data);
};

// Add placeholder exports for other required functions to prevent import crashes
export const createAccount = async (userData: any) => {
  console.log('Creating Account:', userData.email);
  return Promise.resolve();
};

export const verifyLogin = async (email: string, pass: string) => {
  return Promise.resolve({ email });
};

export const getUserProfile = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem('user_profile');
    return data ? JSON.parse(data) : null;
  }
  return null;
};

// Exporting necessary constants for App.tsx/PantryContext.tsx
export const CATEGORIES = ['Produce', 'Dairy', 'Meat & Seafood', 'Grains & Pasta', 'Canned Goods', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Other'];
export const UNITS = ['items', 'lbs', 'oz', 'kg', 'g', 'ml', 'liters', 'cartons', 'bags', 'boxes', 'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon'];
export const initDatabase = () => console.log('Mock DB Init');
export const getPantryItems = () => [];
export const getShoppingList = () => [];
export const getWasteLog = () => [];
export const getPurchaseHistory = () => [];
export const getMealPlanItems = () => [];
export const getSavedRecipes = () => [];
export const getCategories = () => [];
export const addPantryItem = () => 1;
export const updatePantryItem = () => {};
export const deletePantryItem = () => {};
export const addShoppingListItem = () => 1;
export const updateShoppingListItemStatus = () => {};
export const deleteShoppingListItem = () => {};
export const clearShoppingList = () => {};
export const addToWasteLog = () => {};
export const getTotalWaste = () => 0;
export const addToPurchaseHistory = () => {};
export const addMealPlanItem = () => 1;
export const updateMealPlanItem = () => {};
export const deleteMealPlanItem = () => {};
export const addRecipe = () => 1;
export const deleteRecipe = () => {};
export const getRecipeIngredients = () => [];
export const addCategory = () => 1;
export const deleteCategory = () => {};
export const updateLiabilityStatus = () => {};
export const updatePassword = () => {};
