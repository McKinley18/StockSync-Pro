# StockSync Pro Application Architecture

This document outlines the architectural overview, core components, and design considerations for the StockSync Pro application. It serves as a comprehensive reference for understanding the application's structure, data flow, and the integration points for advanced features.

---

## **I. Core Principles & Design Patterns**

StockSync Pro is built with a focus on modularity, maintainability, and extensibility, leveraging React Native's capabilities for cross-platform development (targeting web primarily, with potential for native).

*   **Modular Architecture:** The application is organized into logical units:
    *   **Components (`src/components`):** Reusable UI elements (e.g., `AppText`, `EmptyState`, `LoadingOverlay`).
    *   **Screens (`src/screens`):** Full-page views of the application (e.g., `HomeScreen`, `PantryListScreen`).
    *   **Contexts (`src/context`):** Global state management (e.g., `PantryContext`).
    *   **Utilities (`src/utils`):** Helper functions, data models, database interactions.
    *   **Constants (`src/constants`):** Static data, configurations.
*   **Centralized State Management (`PantryContext`):** The `PantryContext` acts as the single source of truth for application data (pantry items, shopping list, etc.) and exposes functions for data manipulation. This simplifies data flow and ensures consistency across the app.
*   **Theming (Dark/Light Mode):** Utilizes `react-navigation`'s theming capabilities and `useColorScheme` for system preference, ensuring a polished user experience across different lighting conditions.
*   **Navigation Structure:** Implemented using `react-navigation`'s `Drawer.Navigator` for primary navigation and `NativeStackScreenProps` for screen-specific routes, providing a clear and extensible routing solution.
*   **Error Handling (`ErrorBoundary`, `Toast`):** A global `ErrorBoundary` catches unexpected UI errors, preventing app crashes, while a `Toast` notification system provides non-intrusive user feedback for actions.
*   **Mock Database (`database.web.ts`):** For web development, a mock database using `localStorage` ensures data persistence without requiring a backend, facilitating rapid prototyping and development.

---

## **II. Key Internal Components & Their Responsibilities**

This section details the primary architectural components and their roles.

*   **`App.tsx` (Root Component & Setup):**
    *   Initializes global providers (`ToastProvider`, `PantryProvider`).
    *   Configures `react-navigation`'s `NavigationContainer` and `Drawer.Navigator`.
    *   Manages font loading (`@expo-google-fonts/roboto`).
    *   Handles top-level layout (`GestureHandlerRootView`).
    *   Defines the overall navigation structure and screen options (e.g., `headerLeft` for the hamburger menu).
*   **`src/context/PantryContext.tsx` (Central State & Business Logic):**
    *   **Role:** Manages all core application state related to pantry items, shopping lists, meal plans, purchase history, etc. It provides the API for interacting with this data.
    *   **Responsibilities:**
        *   Fetches and updates data from the underlying data layer (`../utils/database`).
        *   Manages `isLoading` state for UI feedback.
        *   Calculates derived states (e.g., `predictions`, `lowStockItems`).
        *   Integrates `useToast` for user notifications on data changes.
        *   Implements core business logic for `addItem`, `updateItem`, `removeItem`, `consumeItem`, `wasteItem`, `toggleShoppingStatus`, `addMeal`, `saveRecipe`, etc.
*   **`src/utils/database.ts` / `src/utils/database.web.ts` (Data Persistence Layer):**
    *   **Role:** Provides platform-agnostic (via `database.ts`) and platform-specific (via `database.web.ts` for localStorage) mechanisms for storing and retrieving application data.
    *   **`database.web.ts` Responsibilities:**
        *   Manages `localStorage` interactions (`saveToStorage`, `loadFromStorage`).
        *   Implements CRUD operations for `PantryItem`, `ShoppingListItem`, `MealPlanItem`, `Category`, `SavedRecipe`, etc.
        *   Generates unique IDs for new items using a persistent `nextId` counter.
        *   Populates initial mock data if `localStorage` is empty.
*   **`src/components/AppText.tsx` (Consistent Typography):**
    *   **Role:** Ensures consistent application of custom fonts (`Roboto`) across all text elements, providing a professional and branded look.
    *   **Responsibilities:** Wraps native `Text` component, applies default font styles, and supports different font weights.
*   **`src/components/EmptyState.tsx` (User Feedback for Empty States):**
    *   **Role:** Displays engaging messages and actions when lists or data sets are empty, improving user experience.
    *   **Responsibilities:** Renders an icon, title, description, and an optional action button.
*   **`src/components/SkeletonLoader.tsx` (Loading Indicators):**
    *   **Role:** Provides animated placeholder content during data loading, enhancing perceived performance and professionalism.
    *   **Responsibilities:** Renders customizable animated "skeleton" shapes.
*   **`src/components/LoadingOverlay.tsx` (Full-Screen Loading):**
    *   **Role:** Provides a full-screen overlay with a spinner during critical loading operations, blocking user interaction and giving clear feedback.
    *   **Responsibilities:** Displays a spinner and optional text, handling visibility via `isLoading` prop.
*   **`src/components/Toast.tsx` (Non-Intrusive Notifications):**
    *   **Role:** Delivers transient, non-blocking feedback to the user for actions (e.g., "Item added successfully").
    *   **Responsibilities:** Manages a queue of toast messages, animates their appearance and disappearance.
*   **Screens (`src/screens/*.tsx`):**
    *   **Role:** Each screen (`HomeScreen`, `PantryListScreen`, `AddItemScreen`, etc.) is responsible for presenting specific UI and interacting with `PantryContext` to display and manipulate data.
    *   **Responsibilities:** Fetching relevant data via `usePantry()`, rendering UI components, handling user input, and navigating between screens.

---

## **III. Advanced Features - Component Breakdown**

This section details the proposed architecture for implementing advanced features, focusing on the internal components and logical flows required.

### **A. Smart Sales & Specials Matching**
*   **Motive:** To empower users to save money by automatically finding and matching sales/specials to their shopping list items from selected stores.
*   **Process Overview:**
    1.  User selects preferred stores and sales sources.
    2.  System fetches sales data from external APIs/services.
    3.  A product matching engine identifies sales relevant to the user's shopping list.
    4.  Users are notified of matched deals.
*   **Required Internal Components:**
    *   **`StoreManagerService` (`src/services/StoreManagerService.ts` - NEW):**
        *   **Responsibility:** Manages user's preferred stores, including their names, associated external API keys/endpoints, and other configurations.
        *   **Integration:** `SettingsScreen` (for user preferences), `PantryContext` (to inform `SalesFetcherService`).
    *   **`ExternalSalesAPIAdapter` (`src/services/ExternalSalesAPIAdapter.ts` - NEW):**
        *   **Responsibility:** Abstracts interactions with various external sales/deals APIs (e.g., store-specific APIs, third-party aggregators). Standardizes incoming sales data into a common `Deal` format.
        *   **Integration:** Called by `SalesFetcherService`. Requires API key management (via environment variables).
    *   **`SalesFetcherService` (`src/services/SalesFetcherService.ts` - NEW):**
        *   **Responsibility:** Orchestrates fetching sales data from `ExternalSalesAPIAdapter` for selected stores, potentially on a scheduled basis or on demand.
        *   **Integration:** `PantryContext` (to trigger fetches), `DealStore` (to persist data).
    *   **`DealStore` (`src/context/DealContext.tsx` or integrated into `PantryContext` - NEW/ENHANCEMENT):**
        *   **Responsibility:** Stores and manages active sales data within the application state.
        *   **Integration:** `PantryContext` (to provide deals to other components), `SalesFetcherService` (to update data).
    *   **`ProductMatchingEngine` (`src/services/ProductMatchingEngine.ts` - NEW):**
        *   **Responsibility:** Implements advanced logic to compare items on the `ShoppingList` (e.g., "milk") with available `Deal` items (e.g., "Organic Whole Milk, 1 Gallon"). This involves fuzzy string matching, semantic analysis, and unit conversions.
        *   **Integration:** `PantryContext` (to process shopping list vs. deals).
    *   **`DealNotificationService` (`src/services/DealNotificationService.ts` - NEW):**
        *   **Responsibility:** Manages user alerts for matched deals (e.g., push notifications, in-app alerts).
        *   **Integration:** `PantryContext` (to trigger notifications based on `ProductMatchingEngine` results).
    *   **UI Components:**
        *   `StoreManagementScreen` (Existing, but enhanced): To configure preferred stores.
        *   `DealCardComponent` (NEW): To display individual deal information.
        *   Integration into `ShoppingListScreen`: Highlight items on sale, dedicated "Deals" section.

### **B. Intelligent Recipe Suggestions**
*   **Motive:** To help users discover recipes they can make with existing pantry ingredients, reduce food waste, and plan meals efficiently.
*   **Process Overview:**
    1.  System analyzes user's `Pantry` contents.
    2.  Queries external `Recipe API` with available ingredients.
    3.  Displays relevant recipes, highlighting ingredients the user has and listing missing ones.
*   **Required Internal Components:**
    *   **`RecipeAPIAdapter` (`src/services/RecipeAPIAdapter.ts` - NEW):**
        *   **Responsibility:** Handles communication with external Recipe APIs (e.g., Spoonacular, Edamam). Standardizes recipe data into internal `Recipe` and `RecipeIngredient` data models.
        *   **Integration:** Called by `RecipeSuggestorService`. Requires API key management.
    *   **`RecipeSuggestorService` (`src/services/RecipeSuggestorService.ts` - NEW):**
        *   **Responsibility:** Orchestrates the process of querying `RecipeAPIAdapter` based on current `Pantry` items. Filters and ranks recipes by pantry coverage, dietary preferences, etc.
        *   **Integration:** `PantryContext` (to get pantry items), `RecipeBrowseScreen` (to provide suggestions).
    *   **`RecipeDataModel` (Enhancement to existing `SavedRecipe`/`RecipeIngredient` - ENHANCEMENT):**
        *   **Responsibility:** Expands to include more detailed recipe information (e.g., instructions, image URLs, prep/cook times, nutritional info).
    *   **UI Components:**
        *   `RecipesHubScreen` (Existing, but enhanced): To integrate recipe suggestions and browsing.
        *   `RecipeDetailScreen` (Existing, but enhanced): To display recipe details, highlighting pantry vs. missing ingredients, and options to add missing items to shopping list.
        *   `RecipeFilterComponents` (NEW): For filtering by cuisine, diet, etc.

### **C. Barcode Scanning & Image Autopopulation**
*   **Motive:** To streamline the process of adding new items to the pantry or shopping list by automating data entry using phone's capabilities.
*   **Process Overview:**
    1.  User scans barcode or takes a picture of an item.
    2.  External API is queried for product information.
    3.  `AddItemScreen` is pre-populated with fetched data.
*   **Required Internal Components:**
    *   **`BarcodeScannerService` (`src/services/BarcodeScannerService.ts` - NEW):**
        *   **Responsibility:** Encapsulates the logic for interacting with `expo-barcode-scanner`. Provides camera access, scanning functionality, and barcode data extraction.
        *   **Integration:** `AddItemScreen`.
    *   **`ProductLookupAPIAdapter` (`src/services/ProductLookupAPIAdapter.ts` - NEW):**
        *   **Responsibility:** Handles communication with external product information APIs (e.g., Open Food Facts API, UPCItemDB). Standardizes product data into an internal format.
        *   **Integration:** Called by `ProductInfoFetcherService`. Requires API key management.
    *   **`ProductInfoFetcherService` (`src/services/ProductInfoFetcherService.ts` - NEW):**
        *   **Responsibility:** Orchestrates fetching product details using `ProductLookupAPIAdapter` based on a barcode.
        *   **Integration:** `AddItemScreen` (to retrieve product data after scan).
    *   **`ImageAnalyzerService` (`src/services/ImageAnalyzerService.ts` - NEW - for Image Recognition):**
        *   **Responsibility:** Integrates with advanced image recognition/OCR APIs (e.g., Google Cloud Vision, Amazon Rekognition). Processes images to extract text or identify products. This is significantly more complex and resource-intensive.
        *   **Integration:** `AddItemScreen` (as an alternative to barcode scanning).
    *   **`DataNormalizerService` (`src/services/DataNormalizerService.ts` - NEW/ENHANCEMENT):**
        *   **Responsibility:** Cleans and standardizes raw product data received from APIs into a format suitable for `PantryItem` (e.g., unit conversions, category mapping, brand standardization).
        *   **Integration:** `ProductInfoFetcherService`, `ImageAnalyzerService`.
    *   **UI Components:**
        *   `AddItemScreen` (Existing, but heavily enhanced): To display barcode scanner view, pre-populate form fields, and allow user override/correction of fetched data.
        *   `ImageCaptureScreen` (NEW - if implementing image recognition): To manage taking and processing product photos.

---

## **IV. Development Workflow & Guidelines**

*   **Local Development:**
    *   `npm install`
    *   `npx expo start --web` (for web development)
    *   `npx expo start` (for native development with Expo Go)
*   **Vercel Deployment:**
    *   Ensure project is pushed to GitHub.
    *   Vercel project configured with Build Command: `npx expo export -p web` and Output Directory: `dist`.
    *   Automatic deployments on `main` branch pushes.
*   **Coding Standards:** Adhere to existing ESLint/Prettier configurations (if any) and TypeScript best practices. Focus on readability, maintainability, and reusability.
*   **Troubleshooting:**
    *   "White screen on Vercel": Check build logs for errors, verify Vercel output directory (`dist`), ensure no blocking JS errors in browser console.
    *   "Localhost issues": Clear local caches (`rm -rf .expo .cache node_modules && npm install --force`), force kill Expo processes (`lsof -i :8081` then `kill -9 <PID>`), restart with `--clear`.

---
