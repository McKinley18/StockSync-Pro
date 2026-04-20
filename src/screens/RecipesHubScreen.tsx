import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { usePantry } from '../context/PantryContext';
import RecipeBookScreen from './RecipeBookScreen';
import RecipeScreen from './RecipeScreen';

const RecipesHubScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const [activeTab, setActiveTab] = useState<'library' | 'discover'>('library');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'library' && styles.activeTab]} 
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'library' ? '#3b82f6' : '#64748b' }]}>My Library</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]} 
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'discover' ? '#3b82f6' : '#64748b' }]}>Discover New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'library' ? <RecipeBookScreen /> : <RecipeScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#3b82f6' },
  tabText: { fontSize: 15, fontWeight: '700' },
  content: { flex: 1 }
});

export default RecipesHubScreen;
