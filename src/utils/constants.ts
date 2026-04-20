import { 
  Apple, 
  Droplets, 
  Beef, 
  Wheat, 
  Container, 
  Cookie, 
  CupSoda, 
  Snowflake, 
  Croissant, 
  CircleQuestionMark,
  LucideIcon 
} from 'lucide-react-native';

export const CATEGORY_ICONS: { [key: string]: LucideIcon } = {
  'Produce': Apple,
  'Dairy': Droplets,
  'Meat & Seafood': Beef,
  'Grains & Pasta': Wheat,
  'Canned Goods': Container,
  'Snacks': Cookie,
  'Beverages': CupSoda,
  'Frozen': Snowflake,
  'Bakery': Croissant,
  'Other': CircleQuestionMark
};

export const ITEM_PREDICTIONS: { [key: string]: { category: string, unit: string } } = {
  'milk': { category: 'Dairy', unit: 'liters' },
  'eggs': { category: 'Dairy', unit: 'items' },
  'bread': { category: 'Bakery', unit: 'items' },
  'apple': { category: 'Produce', unit: 'items' },
  'banana': { category: 'Produce', unit: 'items' },
  'chicken': { category: 'Meat & Seafood', unit: 'lbs' },
  'beef': { category: 'Meat & Seafood', unit: 'lbs' },
  'rice': { category: 'Grains & Pasta', unit: 'bags' },
  'pasta': { category: 'Grains & Pasta', unit: 'boxes' },
  'water': { category: 'Beverages', unit: 'liters' },
  'soda': { category: 'Beverages', unit: 'items' },
  'chips': { category: 'Snacks', unit: 'bags' },
  'cereal': { category: 'Bakery', unit: 'boxes' },
  'cheese': { category: 'Dairy', unit: 'lbs' },
  'yogurt': { category: 'Dairy', unit: 'items' },
  'tomato': { category: 'Produce', unit: 'items' },
  'onion': { category: 'Produce', unit: 'items' },
  'potato': { category: 'Produce', unit: 'lbs' },
  'carrot': { category: 'Produce', unit: 'bags' }
};
