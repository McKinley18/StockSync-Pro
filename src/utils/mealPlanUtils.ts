import { parseIngredient } from './ingredientParser';
import { PantryItem, SavedRecipe, RecipeIngredient } from '../utils/database';

// Mock Recall Alert list
const RECALL_ALERTS = ['spinach', 'romaine lettuce', 'ground beef'];

export interface ShoppingListItem {
  name: string;
  quantityNeeded: number;
  unit: string;
  category: string;
  isFlagged: boolean;
}

export function analyzeMealPlan(recipes: SavedRecipe[], pantryItems: PantryItem[], ingredientsMap: Record<number, RecipeIngredient[]>): Record<string, ShoppingListItem[]> {
  const shoppingList: Record<string, ShoppingListItem[]> = {};

  recipes.forEach(recipe => {
    const ingredients = ingredientsMap[recipe.id!] || [];
    
    ingredients.forEach(ing => {
      const normalizedIng = parseIngredient(ing.name);
      const pantryItem = pantryItems.find(p => parseIngredient(p.name) === normalizedIng);
      
      const stock = pantryItem ? pantryItem.quantity : 0;
      const needed = ing.quantity - stock;

      if (needed > 0) {
        const category = pantryItem?.category || 'Other';
        const isFlagged = RECALL_ALERTS.some(alert => normalizedIng.includes(alert));

        if (!shoppingList[category]) {
          shoppingList[category] = [];
        }

        const existingItem = shoppingList[category].find(item => item.name === normalizedIng);
        if (existingItem) {
          existingItem.quantityNeeded += needed;
        } else {
          shoppingList[category].push({
            name: normalizedIng,
            quantityNeeded: needed,
            unit: ing.unit,
            category: category,
            isFlagged: isFlagged
          });
        }
      }
    });
  });

  return shoppingList;
}
