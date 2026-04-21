import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Tag, Store, ChevronRight, Moon, Sun } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { usePantry } from '../context/PantryContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isDark, setThemeMode } = usePantry();

  const SettingsItem = ({ icon: Icon, title, subtitle, onPress }: { icon: any, title: string, subtitle: string, onPress: () => void }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
        <Icon size={22} color="#3b82f6" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={styles.titleText}>StockSync</Text>
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Preferences</Text>
        
        <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            {isDark ? <Moon size={22} color="#3b82f6" /> : <Sun size={22} color="#3b82f6" />}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Dark Mode</Text>
            <Text style={styles.subtitle}>Switch between light and midnight themes.</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
            trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
          />
        </View>

        <SettingsItem 
          icon={Tag} 
          title="Inventory Categories" 
          subtitle="Add, rename, or delete storage zones."
          onPress={() => navigation.navigate('Categories')}
        />
        <SettingsItem 
          icon={Store} 
          title="Preferred Stores" 
          subtitle="Manage stores for smart sales alerts."
          onPress={() => navigation.navigate('Stores')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>System</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 Pro</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Database</Text>
            <Text style={styles.infoValue}>Local SQLite</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Cloud Sync</Text>
            <Text style={[styles.infoValue, { color: '#10b981' }]}>Active</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
  titleText: { fontSize: 28, fontWeight: 'bold', color: '#3b82f6', marginBottom: 5 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  infoCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#64748b' }
});

export default SettingsScreen;
