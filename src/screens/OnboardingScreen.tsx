import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';
import AppText from '../components/AppText';

export default function OnboardingScreen() {
  const { updateProfile, profile } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const validatePassword = (pass: string) => {
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    const hasMinLength = pass.length >= 8;
    return hasNumber && hasSymbol && hasMinLength;
  };

  const isPasswordValid = validatePassword(password);

  const isFormValid = firstName.trim() !== '' && 
                      lastName.trim() !== '' && 
                      email.trim() !== '' && 
                      isPasswordValid && 
                      zipCode.trim().length === 5 &&
                      /^\d+$/.test(zipCode) &&
                      agreementAccepted;

  const handleFinish = async () => {
    if (isFormValid) {
      try {
        // Construct a full profile object as expected by the database and context
        const newProfile = {
          ...profile,
          firstName,
          lastName,
          email,
          zipCode,
          liability_accepted: 1,
          allergies: profile?.allergies || '',
          dislikes: profile?.dislikes || '',
          frequent_items: profile?.frequent_items || '',
        };
        
        await updateProfile(newProfile);
        // The App component will re-render and show NavigationRoot because profile.liability_accepted is now true
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <CheckCircle size={48} color="#3b82f6" />
          <AppText weight="bold" style={styles.title}>Welcome to StockSync</AppText>
          <AppText style={styles.subtitle}>Let&apos;s get your pantry set up</AppText>
        </View>

        <View style={styles.form}>
          <AppText weight="medium" style={styles.label}>First Name</AppText>
          <TextInput 
            style={styles.input} 
            value={firstName} 
            onChangeText={setFirstName} 
            placeholder="Enter your first name"
            placeholderTextColor="#94a3b8"
          />

          <AppText weight="medium" style={styles.label}>Last Name</AppText>
          <TextInput 
            style={styles.input} 
            value={lastName} 
            onChangeText={setLastName} 
            placeholder="Enter your last name"
            placeholderTextColor="#94a3b8"
          />

          <AppText weight="medium" style={styles.label}>Email</AppText>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppText weight="medium" style={styles.label}>Password</AppText>
          <TextInput 
            style={[styles.input, password.length > 0 && !isPasswordValid && styles.inputError]} 
            value={password} 
            onChangeText={setPassword} 
            placeholder="Create a password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
          />
          {password.length > 0 && !isPasswordValid && (
            <AppText style={styles.errorText}>
              Password must be at least 8 characters long, include a number and a symbol.
            </AppText>
          )}

          <AppText weight="medium" style={styles.label}>Zip Code</AppText>
          <TextInput 
            style={styles.input} 
            value={zipCode} 
            onChangeText={setZipCode} 
            placeholder="5-digit zip code"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            maxLength={5}
          />
          
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreementAccepted(!agreementAccepted)}
            activeOpacity={0.7}
          >
            {agreementAccepted ? (
              <CheckCircle size={24} color="#3b82f6" />
            ) : (
              <Circle size={24} color="#94a3b8" />
            )}
            <AppText style={styles.disclaimer}>
              I agree to the User Agreement and accept the liability disclaimer.
            </AppText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, !isFormValid && styles.disabledButton]} 
          onPress={handleFinish}
          disabled={!isFormValid}
        >
          <AppText weight="bold" style={styles.buttonText}>Get Started</AppText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, 
    backgroundColor: '#f8fafc',
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#0f172a',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  label: { 
    fontSize: 14, 
    color: '#475569', 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    padding: 12, 
    marginBottom: 20, 
    borderRadius: 8,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#fcfcfc'
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 15,
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginTop: 10,
    gap: 12
  },
  disclaimer: { 
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  button: { 
    backgroundColor: '#3b82f6', 
    padding: 18, 
    marginTop: 40, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: { 
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16
  }
});
