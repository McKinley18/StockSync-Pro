import '@expo/metro-runtime';
import 'react-native-gesture-handler'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useCallback, useMemo } from 'react';
import { useWindowDimensions, View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'; 
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native'; 
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { ToastProvider } from './src/components/Toast';
import { PantryProvider, usePantry } from './src/context/PantryContext'; 
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import * as Font from 'expo-font';

// Icons
import { 
  LayoutDashboard,
  ShoppingBasket,
  CirclePlus,
  Utensils,
  CalendarDays,
  ChartBar,
  Settings as SettingsIcon,
  User,
  ShoppingCart,
  Package, 
  Menu 
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
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import CategoryManagementScreen from './src/screens/CategoryManagementScreen';
import StoreManagementScreen from './src/screens/StoreManagementScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LocationSettingsScreen from './src/screens/LocationSettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RecoveryScreen from './src/screens/RecoveryScreen';

// Components
import ErrorBoundary from './src/components/ErrorBoundary';
import AppText from './src/components/AppText';
import LoadingOverlay from './src/components/LoadingOverlay';
import * as LocalAuthentication from 'expo-local-authentication';

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
  ProfileSettings: undefined;
  LocationSettings: undefined;
  Recovery: undefined;
  Categories: undefined;
  Stores: undefined;
  RecipeBook: undefined;
  RecipeDetail: { recipeId: number };
};

const MyDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3b82f6',
    background: '#f1f5f9',
    card: '#cbd5e1',
    text: '#1e293b',
    border: '#94a3b8',
    notification: 'rgb(255, 69, 58)',
    textSecondary: '#475569',
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3b82f6',
    background: '#0F172A',
    card: 'rgba(30, 41, 59, 0.7)',
    text: '#f8fafc',
    border: '#334155',
    notification: 'rgb(255, 69, 58)',
    textSecondary: '#94a3b8',
  },
};

const CustomDrawerContent = (props: any) => {
  const { state, navigation, theme } = props;
  const activeRouteName = state.routes[state.index].name;
  const colors = theme.colors;

  const baseDrawerHeaderStyle = { 
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    height: 70,
    justifyContent: 'center' as const,
    width: '100%' as const,
    flexDirection: 'row' as const, 
    alignItems: 'center' as const, 
    gap: 10,
    zIndex: 10,
    overflow: 'hidden' as const,
  };

  const baseDrawerFooterStyle = {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    width: '100%' as const,
    zIndex: 10,
    overflow: 'hidden' as const,
  };

  const headerStyleComputed = [baseDrawerHeaderStyle, { 
    backgroundColor: '#475569',
    borderBottomColor: colors.border 
  }];
  const footerStyleComputed = [baseDrawerFooterStyle, { 
    backgroundColor: '#475569',
    borderTopColor: colors.border 
  }];

  const sections = {
    'MAIN': ['Home', 'Pantry', 'AddItem', 'Shopping'],
    'PLANNING': ['Recipes', 'Planner'],
    'ANALYTICS': ['Insights', 'Settings', 'ProfileSettings'],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={headerStyleComputed}>
        <Package size={24} color="#ffffff" />
        <AppText weight="bold" style={[styles.drawerTitle, { color: '#ffffff' }]}>StockSync</AppText>
      </View>
      
      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: colors.card }}>
        {Object.entries(sections).map(([sectionTitle, routes]) => (
          <View key={sectionTitle}>
            <AppText weight="bold" style={[styles.sectionHeader, { color: colors.textSecondary }]}>{sectionTitle}</AppText>
            {routes.map((routeName) => {
              const route = state.routes.find((r: any) => r.name === routeName);
              if (!route) return null;
              const descriptor = props.descriptors[route.key];
              const { title, drawerIcon } = descriptor.options;
              const isFocused = activeRouteName === routeName;
              
              return (
                <DrawerItem
                  key={routeName}
                  label={() => <AppText weight="medium" style={{ color: isFocused ? colors.primary : colors.text }}>{title}</AppText>}
                  icon={({ color, size }) => drawerIcon({ color: isFocused ? colors.primary : colors.text, size, focused: isFocused })}
                  focused={isFocused}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.text}
                  onPress={() => navigation.navigate(routeName)}
                />
              );
            })}
          </View>
        ))}
      </DrawerContentScrollView>
      
      <View style={footerStyleComputed}>
        <AppText style={[styles.brandingText, { marginBottom: 10, fontSize: 9, color: '#ffffff' }]}>
          Disclaimer: Sales figures and predictions are for organizational purposes only and may not reflect real-world values.
        </AppText>
        <AppText style={[styles.brandingText, { color: '#ffffff' }]}>© Monolith Studios v2.4.0</AppText>
      </View>
    </SafeAreaView>
  );
};

const PantryAppContent = () => {
  const { isLoading } = usePantry();
  const { profile, loading: profileLoading } = useProfile();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showSignup, setShowSignup] = React.useState(false);

  React.useEffect(() => {
    // Check for stored session or attempt biometric login on mount
    const checkBiometric = async () => {
      if (profile && profile.email && !isLoggedIn) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with Biometrics',
          });
          if (result.success) {
            setIsLoggedIn(true);
          }
        }
      }
    };
    
    if (!profileLoading) {
      checkBiometric();
    }
  }, [profile, profileLoading, isLoggedIn]);

  if (profileLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  // Auth flow logic
  if (!isLoggedIn && !showSignup) {
    return (
      <LoginScreen 
        onLoginSuccess={() => setIsLoggedIn(true)} 
        onNavigateToSignup={() => setShowSignup(true)} 
      />
    );
  }

  if (showSignup || !profile || !profile.liability_accepted) {
    return (
      <OnboardingScreen 
        onComplete={() => {
          setShowSignup(false);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <NavigationRoot />
      <LoadingOverlay isLoading={isLoading} />
    </ErrorBoundary>
  );
};

const DrawerToggleButton = () => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity onPress={() => { navigation.toggleDrawer(); }} style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <Menu size={24} color="#ffffff" />
    </TouchableOpacity>
  );
};

function NavigationRoot() {
  const dimensions = useWindowDimensions();
  const { isDark } = usePantry();
  const isLargeScreen = dimensions.width >= 768;

  return (
    <NavigationContainer theme={isDark ? MyDarkTheme : MyDefaultTheme}>
      <Drawer.Navigator
        id="root-drawer"
        drawerContent={(props) => <CustomDrawerContent {...props} theme={isDark ? MyDarkTheme : MyDefaultTheme} />} 
        screenOptions={{
          drawerType: isLargeScreen ? 'permanent' : 'front',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0f172a',
            height: 70,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontFamily: 'Roboto-Bold',
            fontSize: 18,
          },
          headerLeft: () => (
            isLargeScreen ? null : <DrawerToggleButton />
          ),
          drawerActiveTintColor: isDark ? MyDarkTheme.colors.primary : MyDefaultTheme.colors.primary,
          drawerInactiveTintColor: isDark ? MyDarkTheme.colors.textSecondary : MyDefaultTheme.colors.textSecondary,
          drawerStyle: {
            width: 240,
            backgroundColor: isDark ? MyDarkTheme.colors.card : MyDefaultTheme.colors.card,
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
          name="ProfileSettings" 
          component={ProfileSettingsScreen} 
          options={{
            drawerIcon: ({ color, size }) => <User size={size} color={color} />,
            title: 'User Profile'
          }}
        />
        <Drawer.Screen 
          name="LocationSettings" 
          component={LocationSettingsScreen} 
          options={{
            drawerIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
            title: 'Location Settings'
          }}
        />
        <Drawer.Screen
          name="Categories"
          component={CategoryManagementScreen}
          options={{
            drawerItemStyle: { height: 0 }
          }}
        />
        <Drawer.Screen
          name="Stores"
          component={StoreManagementScreen}
          options={{
            drawerItemStyle: { height: 0 }
          }}
        />
        <Drawer.Screen
          name="Recovery"
          component={RecoveryScreen}
          options={{
            drawerItemStyle: { height: 0 }
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-500Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ToastProvider> 
        <ProfileProvider>
          <PantryProvider>
            <PantryAppContent />
          </PantryProvider>
        </ProfileProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#ffffff',
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  brandingText: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.8,
  },
  footerRow: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  }
});
