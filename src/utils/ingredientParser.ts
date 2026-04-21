export function normalizeIngredient(ingredient: string): string {
  // Common units to strip
  const units = [
    'cups', 'cup', 'lbs', 'lb', 'oz', 'kg', 'g', 'ml', 'liters', 'cartons', 
    'bags', 'boxes', 'tsp', 'tbsp', 'pinches', 'pinch', 'tablespoons', 'tablespoon', 'teaspoons', 'teaspoon'
  ];
  
  // Common descriptors to strip
  const descriptors = [
    'chopped', 'organic', 'fresh', 'large', 'small', 'medium', 'diced', 'minced', 'sliced', 'peeled'
  ];

  let name = ingredient.toLowerCase();

  // Strip numbers (including fractions like 1/2)
  name = name.replace(/\d+(\/\d+)?/g, '');

  // Strip units
  units.forEach(unit => {
    const regex = new RegExp(`\\b${unit}\\b`, 'g');
    name = name.replace(regex, '');
  });

  // Strip descriptors
  descriptors.forEach(desc => {
    const regex = new RegExp(`\\b${desc}\\b`, 'g');
    name = name.replace(regex, '');
  });

  // Remove "of" and extra spaces
  name = name.replace(/\bof\b/g, '');
  name = name.trim().replace(/\s+/g, ' ');

  // Very basic plural to singular (could be expanded)
  if (name.endsWith('s') && !name.endsWith('ss')) {
    name = name.slice(0, -1);
  }

  return name;
}
