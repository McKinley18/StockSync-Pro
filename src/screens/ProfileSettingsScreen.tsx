import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import AppText from '../components/AppText';
import { useTheme } from '@react-navigation/native';
import { Save, User } from 'lucide-react-native';

export default function ProfileSettingsScreen() {
  const { colors } = useTheme();
  const { profile, updateProfile } = useProfile();
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [zipCode, setZipCode] = useState(profile?.zipCode || '');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !zipCode.trim()) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (zipCode.trim().length !== 5 || !/^\d+$/.test(zipCode.trim())) {
      Alert.alert('Error', 'Please enter a valid 5-digit zip code.');
      return;
    }

    try {
      const updatedProfile = {
        ...profile!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        zipCode: zipCode.trim(),
      };
      await updateProfile(updatedProfile);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                <User size={40} color={colors.primary} />
            </View>
            <AppText weight="bold" style={[styles.title, { color: colors.text }]}>User Profile</AppText>
            <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>Update your personal information</AppText>
        </View>

        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText weight="medium" style={[styles.label, { color: colors.text }]}>First Name</AppText>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
            value={firstName} 
            onChangeText={setFirstName} 
            placeholder="Enter your first name"
            placeholderTextColor="#94a3b8"
          />

          <AppText weight="medium" style={[styles.label, { color: colors.text }]}>Last Name</AppText>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
            value={lastName} 
            onChangeText={setLastName} 
            placeholder="Enter your last name"
            placeholderTextColor="#94a3b8"
          />

          <AppText weight="medium" style={[styles.label, { color: colors.text }]}>Email</AppText>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppText weight="medium" style={[styles.label, { color: colors.text }]}>Zip Code</AppText>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} 
            value={zipCode} 
            onChangeText={setZipCode} 
            placeholder="5-digit zip code"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            maxLength={5}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSave}
          >
            <Save size={20} color="#fff" style={{ marginRight: 8 }} />
            <AppText weight="bold" style={styles.buttonText}>Save Changes</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  label: { 
    fontSize: 14, 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1, 
    padding: 12, 
    marginBottom: 20, 
    borderRadius: 8,
    fontSize: 16,
  },
  button: { 
    backgroundColor: '#3b82f6', 
    flexDirection: 'row',
    padding: 16, 
    marginTop: 10, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16
  }
});
