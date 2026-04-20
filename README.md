# StockSync Pro

StockSync Pro is a professional-grade pantry management application designed to help users efficiently track food inventory, manage shopping lists, plan meals, and reduce food waste. Built with React Native and Expo, it offers a cross-platform experience with a focus on a polished UI/UX and advanced features for modern household management.

---

## 🚀 Core Features (Current)

*   **Dashboard:** Provides real-time insights into inventory value, waste tracking, and upcoming expirations.
*   **Pantry Management:** Organize items by category, set thresholds for low-stock alerts, and perform quick actions like consuming, wasting, or removing items.
*   **Shopping List:** Automatically generate shopping lists based on low-stock pantry items, manage purchased/unpurchased items, and track purchase history.
*   **Meal Planner:** Plan meals for the week, linking to saved recipes and helping identify required ingredients.
*   **Recipe Hub:** Save and manage favorite recipes, including ingredients.
*   **Theming:** Supports dynamic Light and Dark modes.
*   **Responsive UI:** Adapts layout for optimal viewing on various screen sizes (mobile, tablet, desktop).
*   **Professional UX:** Incorporates Toast notifications, Empty State components, Skeleton Loaders, and Loading Overlays for a smooth user experience.

---

## 🛠 Technology Stack

*   **Framework:** React Native & Expo SDK
*   **Language:** TypeScript
*   **Navigation:** React Navigation (Drawer & Stack navigators)
*   **State Management:** React Context API (`PantryContext`)
*   **Data Persistence (Web):** Browser `localStorage` (via `src/utils/database.web.ts`)
*   **Styling:** React Native `StyleSheet`
*   **Icons:** Lucide Icons (`lucide-react-native`)
*   **Fonts:** Roboto (`@expo-google-fonts/roboto`)

---

## 🏁 Getting Started (Local Development)

### Prerequisites

*   Node.js (v18 or newer)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/McKinley18/StockSync-Pro.git
    cd StockSync-Pro
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

To start the web development server and open in your browser (recommended for local development):
```bash
npx expo start --web
```
(This will usually open on `http://localhost:8081` or the next available port).

To run on iOS or Android (requires Expo Go app or a native development build):
```bash
npx expo start --ios
# or
npx expo start --android
```

---

## ☁️ Deployment

The web version of StockSync Pro is continuously deployed via **Vercel** directly from the `main` branch of the GitHub repository.

*   **Live Web App:** [https://stock-sync-pro.vercel.app/](https://stock-sync-pro.vercel.app/) (Note: May currently have known issues on mobile or specific browsers due to ongoing development and debugging.)

### Vercel Configuration:

*   **Build Command:** `npx expo export -p web`
*   **Output Directory:** `dist`

---

## ✨ Future Enhancements (Planned)

The architecture is designed to support the integration of advanced features, including:

*   **Smart Sales & Specials Matching:** Automating the discovery and matching of grocery sales/ads to your shopping list.
*   **Intelligent Recipe Suggestions:** Suggesting recipes based on available pantry ingredients and dietary preferences.
*   **Barcode Scanning & Image Autopopulation:** Streamlining item entry by scanning barcodes or analyzing product images.

(Refer to `ARCHITECTURE.md` for a detailed breakdown of components required for these features.)

---

## ⚠️ Known Issues / Warnings (Current Development State)

*   **Mobile Hamburger Menu (Vercel Deployment):** Currently, the hamburger menu icon may not appear or function correctly on the Vercel-deployed web app when viewed on mobile browsers. This is under active investigation.
*   **Pantry Item Removal (Vercel Deployment):** The "Remove" button for pantry items is currently not functioning as expected on the Vercel-deployed web app. This is under active investigation.
*   **Local Development Instability:** Some local development environments may experience persistent Expo process issues or aggressive caching, leading to discrepancies between local and deployed behavior. Clearing caches and ensuring all Expo processes are terminated often resolves this.
*   `props.pointerEvents` deprecation warning may appear in console logs from third-party libraries. This is currently non-critical and external to the application's core logic.

---
© 2026 Monolith Studios. All rights reserved.
