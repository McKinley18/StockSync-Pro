import '@expo/metro-runtime';
import 'react-native-gesture-handler'; // Required for react-native-reanimated for some gesture-handler components
// import Animated from 'react-native-reanimated'; // Directly import Animated for global availability (removed as AnimatedPressable is removed)
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { useWindowDimensions, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'; // Re-enabled
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native'; // Added useNavigation
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { PantryProvider, usePantry } from './src/context/PantryContext';

// Icons (Lucide v1.8.0 compatible names)
import { 
  LayoutDashboard,
  ShoppingBasket,
  CirclePlus,
  Utensils,
  CalendarDays,
  ChartBar,
  Settings as SettingsIcon,
  ShoppingCart,
  Package, // Import Package icon
  Menu // Import Menu icon
} from 'lucide-react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import PantryListScreen from './src/screens/PantryListScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import RecipesHubScreen from './src/screens/RecipesHubScreen';
import MealPlannerScreen from './src/screens/MealPlannerScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CategoryManagementScreen from './src/screens/CategoryManagementScreen';
import StoreManagementScreen from './src/screens/StoreManagementScreen';

import ErrorBoundary from './src/components/ErrorBoundary';

const Drawer = createDrawerNavigator();

export type RootStackParamList = {
  Home: undefined;
  Pantry: undefined;
  AddItem: { itemId?: number };
  Recipes: undefined;
  Planner: undefined;
  Shopping: undefined;
  Insights: undefined;
  Settings: undefined;
  Categories: undefined;
  Stores: undefined;
  RecipeBook: undefined;
  RecipeDetail: { recipeId: number };
};

import AppText from './src/components/AppText';
// import AnimatedPressable from './src/components/AnimatedPressable'; // Removed - using TouchableOpacity directly

// Moved from above to ensure all necessary imports are available for NavigationRoot
import LoadingOverlay from './src/components/LoadingOverlay';

const CustomDrawerContent = (props: any) => {
  const { state, navigation } = props;
  const activeRouteName = state.routes[state.index].name;
  const { isDark } = usePantry();

  const sections = {
    'MAIN': ['Home', 'Pantry', 'AddItem', 'Shopping'],
    'PLANNING': ['Recipes', 'Planner'],
    'ANALYTICS': ['Insights', 'Settings'],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#ffffff' }}>
      <View style={[styles.drawerHeader, { 
        backgroundColor: isDark ? '#1e293b' : '#334155',
        borderBottomColor: isDark ? '#334155' : '#e2e8f0' 
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Package size={24} color="#ffffff" />
          <AppText weight="bold" style={styles.drawerTitle}>StockSync Pro</AppText>
        </View>
      </View>
      
      <DrawerContentScrollView {...props}>
        {Object.entries(sections).map(([sectionTitle, routes]) => (
          <View key={sectionTitle}>
            <AppText weight="bold" style={[styles.sectionHeader, { color: isDark ? '#475569' : '#94a3b8' }]}>{sectionTitle}</AppText>
            {routes.map((routeName) => {
              const route = state.routes.find(r => r.name === routeName);
              if (!route) return null;
              const descriptor = props.descriptors[route.key];
              const { title, drawerIcon } = descriptor.options;
              const isFocused = activeRouteName === routeName;
              
              return (
                <DrawerItem
                  key={routeName}
                  label={() => <AppText weight="medium" style={{ color: isFocused ? '#3b82f6' : (isDark ? '#94a3b8' : '#475569') }}>{title}</AppText>}
                  icon={({ color, size }) => drawerIcon({ color: isFocused ? '#3b82f6' : (isDark ? '#94a3b8' : '#475569'), size, focused: isFocused })}
                  focused={isFocused}
                  activeTintColor={'#3b82f6'}
                  inactiveTintColor={isDark ? '#94a3b8' : '#475569'}
                  onPress={() => navigation.navigate(routeName)}
                />
              );
            })}
          </View>
        ))}
      </DrawerContentScrollView>
      
      <View style={[styles.drawerFooter, { 
        backgroundColor: isDark ? '#1e293b' : '#334155',
        borderTopColor: isDark ? '#334155' : '#e2e8f0' 
      }]}>
        <View style={styles.footerRow}>
          {/* Settings moved to main drawer list */}
        </View>

        <AppText style={[styles.brandingText, { marginBottom: 10, fontSize: 9 }]}>
          Disclaimer: Sales figures and predictions are for organizational purposes only and may not reflect real-world values.
        </AppText>
        <AppText style={styles.brandingText}>© Monolith Studios v2.4.0</AppText>
      </View>
    </SafeAreaView>
  );
};

import * as Font from 'expo-font';

const PantryAppContent = () => {
  const { isLoading } = usePantry();
  // console.log('Rendering PantryAppContent. isLoading:', isLoading); // Removed
  return (
    <ErrorBoundary>
      <NavigationRoot />
      <LoadingOverlay isLoading={isLoading} />
    </ErrorBoundary>
  );
};

// New component for the Drawer Toggle button
const DrawerToggleButton = () => {
  console.log('DrawerToggleButton rendering');
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => { navigation.toggleDrawer(); }} style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <Menu size={24} color="#ffffff" />
    </TouchableOpacity>
  );
};

function NavigationRoot() {
  const dimensions = useWindowDimensions();
  const { isDark } = usePantry(); // Consistent use of isDark

  const isLargeScreen = dimensions.width >= 768;
  console.log('NavigationRoot - isLargeScreen:', isLargeScreen); // Add this log

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Drawer.Navigator
        id="root-drawer"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerType: isLargeScreen ? 'permanent' : 'front',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#0f172a' : '#1e293b',
            height: 70,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontFamily: 'Roboto-Bold', // Apply Roboto-Bold
            fontSize: 18,
          },
          headerLeft: ({ navigation: navProp }) => (
            isLargeScreen ? null : <DrawerToggleButton />
          ),
          drawerActiveTintColor: '#3b82f6',
          drawerInactiveTintColor: isDark ? '#94a3b8' : '#475569',
          drawerStyle: {
            width: 240,
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          },
        }}
      >
        <Drawer.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            drawerIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
            title: 'Dashboard'
          }}
        />
        <Drawer.Screen 
          name="Pantry" 
          component={PantryListScreen} 
          options={{
            drawerIcon: ({ color, size }) => <ShoppingBasket size={size} color={color} />,
            title: 'My Pantry'
          }}
        />
        <Drawer.Screen 
          name="AddItem" 
          component={AddItemScreen} 
          options={{
            drawerIcon: ({ color, size }) => <CirclePlus size={size} color={color} />,
            title: 'Add New Item'
          }}
        />
        <Drawer.Screen 
          name="Shopping" 
          component={ShoppingListScreen} 
          options={{
            drawerIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
            title: 'Shopping List'
          }}
        />
        <Drawer.Screen 
          name="Recipes" 
          component={RecipesHubScreen} 
          options={{
            drawerIcon: ({ color, size }) => <Utensils size={size} color={color} />,
            title: 'Recipe Hub'
          }}
        />
        <Drawer.Screen 
          name="Planner" 
          component={MealPlannerScreen} 
          options={{
            drawerIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
            title: 'Meal Planner'
          }}
        />
        <Drawer.Screen 
          name="Insights" 
          component={InsightsScreen} 
          options={{
            drawerIcon: ({ color, size }) => <ChartBar size={size} color={color} />,
            title: 'Financial Reports'
          }}
        />
        <Drawer.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            drawerIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
            title: 'Settings'
          }}
        />
        <Drawer.Screen
          name="Categories"
          component={CategoryManagementScreen}
          options={{
            drawerItemStyle: { height: 0 } // Hide from drawer
          }}
        />
        <Drawer.Screen
          name="Stores"
          component={StoreManagementScreen}
          options={{
            drawerItemStyle: { height: 0 } // Hide from drawer
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

import { ToastProvider } from './src/components/Toast';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // await SplashScreen.hideAsync(); // Removed
    }
  }, [fontsLoaded]);

  // if (!fontsLoaded) { // Temporarily removed blocking font loading
  //   return null;
  // }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ToastProvider>
        <PantryProvider>
          <PantryAppContent />
        </PantryProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    backgroundColor: '#334155', // A shade lighter than #1e293b
    height: 70, // Aligning height with main header
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold', // Apply Roboto-Bold
    color: '#ffffff',
  },
  drawerVersion: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Roboto-Regular', // Apply Roboto-Regular
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold', // Apply Roboto-Bold
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
});
