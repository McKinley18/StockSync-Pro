import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { CheckCircle, Circle, X, Copy } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import { useProfile } from '../context/ProfileContext';
import * as DB from '../utils/database';
import AppText from '../components/AppText';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "In what city were you born?",
  "What was the make and model of your first car?",
  "What is your favorite book or movie?",
  "What was the name of the street you grew up on?",
  "What was the name of your first boss?",
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { updateProfile, profile } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [question1, setQuestion1] = useState(SECURITY_QUESTIONS[0]);
  const [answer1, setAnswer1] = useState('');
  const [question2, setQuestion2] = useState(SECURITY_QUESTIONS[1]);
  const [answer2, setAnswer2] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isAgreementVisible, setIsAgreementVisible] = useState(false);

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
                      question1 !== '' &&
                      answer1.trim() !== '' &&
                      question2 !== '' &&
                      answer2.trim() !== '' &&
                      question1 !== question2 &&
                      agreementAccepted;

  const handleFinish = async () => {
    if (isFormValid) {
      try {
        const hashedA1 = DB.hashString(answer1.toLowerCase().trim());
        const hashedA2 = DB.hashString(answer2.toLowerCase().trim());
        
        await DB.setSecureItem('recovery_q1', question1);
        await DB.setSecureItem('recovery_a1', hashedA1);
        await DB.setSecureItem('recovery_q2', question2);
        await DB.setSecureItem('recovery_a2', hashedA2);
        await DB.setSecureItem('auth_token', 'true');

        // Create account with password hash
        DB.createAccount({
          firstName,
          lastName,
          email,
          password,
          zipCode
        });

        // Update profile in context to complete onboarding
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
        
        // Ensure database is updated explicitly for verification
        DB.updateUserProfile(newProfile);
        
        // Update profile in context to complete onboarding and refresh UI
        updateProfile(newProfile);
        
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Failed to create account or update profile:', error);
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

          <AppText weight="bold" style={[styles.label, { marginTop: 10 }]}>Security Questions</AppText>
          
          <AppText weight="medium" style={styles.label}>Security Question 1</AppText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={question1}
              onValueChange={(itemValue) => setQuestion1(itemValue)}
              style={styles.picker}
            >
              {SECURITY_QUESTIONS.map((q, index) => (
                <Picker.Item key={index} label={q} value={q} />
              ))}
            </Picker>
          </View>
          <TextInput 
            style={styles.input} 
            value={answer1} 
            onChangeText={setAnswer1} 
            placeholder="Answer 1"
            placeholderTextColor="#94a3b8"
          />

          <AppText weight="medium" style={styles.label}>Security Question 2</AppText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={question2}
              onValueChange={(itemValue) => setQuestion2(itemValue)}
              style={styles.picker}
            >
              {SECURITY_QUESTIONS.map((q, index) => (
                <Picker.Item key={index} label={q} value={q} />
              ))}
            </Picker>
          </View>
          <TextInput 
            style={styles.input} 
            value={answer2} 
            onChangeText={setAnswer2} 
            placeholder="Answer 2"
            placeholderTextColor="#94a3b8"
          />
          {question1 === question2 && (
            <AppText style={styles.errorText}>Please choose two different security questions.</AppText>
          )}
          
          <View style={styles.checkboxWrapper}>
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
            </TouchableOpacity>
            <AppText style={styles.disclaimer}>
              I agree to the{' '}
              <AppText 
                style={styles.link} 
                onPress={() => setIsAgreementVisible(true)}
              >
                User Agreement
              </AppText>
            </AppText>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, !isFormValid && styles.disabledButton]} 
          onPress={handleFinish}
          disabled={!isFormValid}
        >
          <AppText weight="bold" style={styles.buttonText}>Get Started</AppText>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAgreementVisible}
        onRequestClose={() => setIsAgreementVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText weight="bold" style={styles.modalTitle}>User Agreement</AppText>
              <TouchableOpacity onPress={() => setIsAgreementVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <AppText style={styles.modalText}>
                By using StockSync, you agree to the following terms and conditions:
                {"\n\n"}
                1. Data Privacy: We respect your privacy and will only use your data to provide and improve our services.
                {"\n\n"}
                2. User Conduct: You agree not to use the app for any illegal activities or to harass other users.
                {"\n\n"}
                3. Content Ownership: You retain ownership of any content you upload, but grant us a license to use it to provide our services.
                {"\n\n"}
                4. Limitation of Liability: StockSync is provided "as is" and we are not liable for any damages resulting from its use.
                {"\n\n"}
                5. Changes to Terms: We may update these terms from time to time, and your continued use of the app constitutes acceptance of the new terms.
                {"\n\n"}
                Thank you for choosing StockSync!
              </AppText>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setIsAgreementVisible(false)}
            >
              <AppText weight="bold" style={styles.modalCloseButtonText}>Close</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fcfcfc',
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    width: '100%',
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
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12
  },
  checkboxContainer: { 
    padding: 4
  },
  disclaimer: { 
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: '#0f172a',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  }
});

