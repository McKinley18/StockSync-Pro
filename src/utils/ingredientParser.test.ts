import { describe, it, expect } from 'vitest';
import { parseIngredient } from './ingredientParser';

describe('ingredientParser', () => {
  it('should parse "2 cups of chopped red onions" to "red onion"', () => {
    expect(parseIngredient('2 cups of chopped red onions')).toBe('red onion');
  });

  it('should parse "1/2 lb of organic fresh chicken" to "chicken"', () => {
    expect(parseIngredient('1/2 lb of organic fresh chicken')).toBe('chicken');
  });
});
