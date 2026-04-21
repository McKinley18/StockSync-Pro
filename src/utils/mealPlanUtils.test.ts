import { describe, it, expect } from 'vitest';
import { analyzeMealPlan, ShoppingListItem } from './mealPlanUtils';
import { PantryItem, SavedRecipe, RecipeIngredient } from '../utils/database';

describe('mealPlanUtils', () => {
  const pantryItems: PantryItem[] = [
    { id: 1, name: 'Onion', quantity: 1, unit: 'items', threshold: 0, price: 1, category: 'Produce' },
    { id: 2, name: 'Spinach', quantity: 0, unit: 'items', threshold: 0, price: 2, category: 'Produce' },
    { id: 3, name: 'Chicken', quantity: 0, unit: 'items', threshold: 0, price: 5, category: 'Meat' }
  ];

  const recipes: SavedRecipe[] = [{ id: 1, name: 'Test Recipe', instructions: '' }];
  
  const ingredientsMap: Record<number, RecipeIngredient[]> = {
    1: [
      { id: 1, recipeId: 1, name: 'Onion', quantity: 3, unit: 'items' },
      { id: 2, recipeId: 1, name: 'Spinach', quantity: 1, unit: 'items' },
      { id: 3, recipeId: 1, name: 'Chicken', quantity: 1, unit: 'items' }
    ]
  };

  it('should correctly subtract pantry stock', () => {
    const list = analyzeMealPlan(recipes, pantryItems, ingredientsMap);
    expect(list['Produce'][0].name).toBe('onion');
    expect(list['Produce'][0].quantityNeeded).toBe(2);
  });

  it('should group items by category', () => {
    const list = analyzeMealPlan(recipes, pantryItems, ingredientsMap);
    expect(list).toHaveProperty('Produce');
    expect(list).toHaveProperty('Meat');
  });

  it('should flag items on the recall list', () => {
    const list = analyzeMealPlan(recipes, pantryItems, ingredientsMap);
    // Spinach is in RECALL_ALERTS in mealPlanUtils
    const spinach = list['Produce'].find(i => i.name === 'spinach');
    expect(spinach?.isFlagged).toBe(true);
  });
});
