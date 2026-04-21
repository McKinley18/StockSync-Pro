import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { usePantry } from '../context/PantryContext';
import AppText from '../components/AppText';
import { useTheme } from '@react-navigation/native';

const LocationSettingsScreen: React.FC = () => {
  const { zipcode, setZipcode } = usePantry();
  const [tempZip, setTempZip] = useState(zipcode || '');
  const { colors } = useTheme();

  const handleSave = () => {
    setZipcode(tempZip);
    Alert.alert('Saved', 'Zipcode saved successfully!');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText style={[styles.label, { color: colors.text }]}>Enter Zipcode</AppText>
      <TextInput 
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={tempZip}
        onChangeText={setTempZip}
        keyboardType="numeric"
        placeholder="e.g., 90210"
        placeholderTextColor="#94a3b8"
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <AppText style={styles.buttonText}>Save</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  input: { height: 50, borderRadius: 8, paddingHorizontal: 15, borderWidth: 1, marginBottom: 20, fontSize: 16 },
  button: { height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default LocationSettingsScreen;