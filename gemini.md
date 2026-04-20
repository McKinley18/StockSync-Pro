# StockSync Pro - Project Documentation
**Author:** Monolith Studios
**Status:** In Development (Stability Phase - STABILIZED)

## 🎯 Project Mission
Build a professional-grade, sophisticated pantry management application that tracks inventory, monetary waste, meal plans, and grocery sales with localized date formats and cross-platform reliability.

---

## 🛠 Tech Stack
- **Framework:** React Native (Expo SDK 55)
- **Styling:** Vanilla StyleSheet (Professional Slate & Blue Theme)
- **Icons:** `lucide-react-native` (v1.8.0 - see Icon Naming section)
- **Database:** `expo-sqlite` (Native) / In-Memory Mock (Web)
- **Navigation:** `@react-navigation/drawer` (Shortened 240px responsive sidebar)
- **Utility:** Custom date handling for MM-DD-YYYY display with ISO storage.

---

## 📂 Project Structure
- `/App.tsx`: Main entry point & unified Navigation Root.
- `/src/context/PantryContext.tsx`: Centralized state management (inventory, waste, theme).
- `/src/utils/database.ts`: SQLite schema and native sync functions.
- `/src/utils/database.web.ts`: Mock database implementation for browser previews.
- `/src/utils/dateUtils.ts`: Formatters for localized dates.
- `/src/screens/`: 
  - `HomeScreen`: Dashboard stats & expiration alerts.
  - `PantryList`: Searchable/Filterable inventory.
  - `AddItem`: Smart form with autocomplete.
  - `RecipesHub`: Tabbed view for saved/discovery recipes.
  - `MealPlanner`: Weekly sync between pantry and plans.
  - `Insights`: Financial waste reports & CSV export.

---

## 🗄 Data Model
### PantryItem
```typescript
{
  id: number;
  name: string;
  barcode: string;
  quantity: number;
  unit: string;      // lbs, oz, liters, etc.
  threshold: number; // For low stock alerts
  price: number;     // For waste calculation
  category: string;
  expirationDate: string; // ISO Format
}
```

---

## 🎨 UI/UX Guidelines
- **Color Palette:** 
  - Slate (Primary): `#1e293b` (Main Header)
  - Light Slate: `#334155` (Sidebar Header/Footer)
  - Blue (Accent): `#3b82f6` (Buttons/Active Tabs)
  - Dark Mode: "Midnight" theme (`#0f172a`)
- **Navigation:**
  - **Unified Header:** All tabs share a consistent slate-colored header (70px height).
  - **Sidebar (240px):** Permanent on desktop, front on mobile.
  - **Header Left:** Hamburger menu removed for a cleaner sidebar-centric interface.
  - **Sidebar Header:** Styled with `#334155` to match top navigation height.
  - **Sidebar Footer:** Styled with `#334155`, contains Settings, About Us, and Copyright.
- **Date Format:** Strictly **MM-DD-YYYY** in all UI inputs and displays.

---

## 💡 Key Logic & Features
1.  **Blue Basket Logic:** Recipes check inventory. Missing items are automatically added to the Shopping List with a results modal showing "Stock Matches" vs "Added to List".
2.  **Waste Tracking:** When items are deleted/removed, the monetary value is logged to calculate "Sunk Cost".
3.  **Smart Autocomplete:** The `AddItem` screen predicts Category and Unit based on the item name (e.g., "Milk" -> "Dairy", "Liters").
4.  **Stability Suite:** Global `ErrorBoundary` and `GestureHandlerRootView` ensure reliability across environments.

---

## ⚠️ Icon Naming (Lucide v1.8.0 Compatibility)
Due to version constraints, use these specific names:
- ✅ **CircleCheckBig** (NOT CheckCircle2)
- ✅ **CircleX** (NOT XCircle)
- ✅ **TriangleAlert** (NOT AlertTriangle)
- ✅ **ChartBar** (NOT BarChart)
- ✅ **Settings** (Aliased as `SettingsIcon`)
- ✅ **CircleQuestionMark** (NOT CircleHelp)
- ✅ **CirclePlus** (NOT PlusCircle)
- ✅ **House** (NOT Home)

---

## ✅ Resolved Issues
- **Fixed:** Persistent White Screen (Web) by standardizing exports and correcting Metro project root configuration.
- **Fixed:** Navigation crashes in Settings and Meal Planner by aligning route names and implementing missing database functions.
- **Fixed:** Layout inconsistencies across tabs by implementing a unified global header.

---

## 🛠 Development Workflow
- **Start Web:** `npx expo start --web --clear` (Run from `/Users/mckinley/desktop/stocksync`)
- **Native Check:** Ensure `database.ts` is updated alongside `database.web.ts`.
- **Project Structure Fix:** Use `App.js` as a bridge to `App.tsx` for Metro resolution.
