import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Lock, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { updateUserProfile, hashString, getUserProfile, getSecureItem } from '../utils/database';
import AppText from '../components/AppText';

interface RecoveryScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function RecoveryScreen({ onBack, onSuccess }: RecoveryScreenProps) {
  const [step, setStep] = useState(1); // 1: Questions, 2: Reset Password
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const question1 = await getSecureItem('recovery_q1');
    const question2 = await getSecureItem('recovery_q2');
    if (question1) setQ1(question1);
    if (question2) setQ2(question2);
    
    if (!question1 || !question2) {
      Alert.alert('Error', 'No security questions found for this device.');
      onBack();
    }
  };

  const handleVerifyAnswers = async () => {
    const hashedA1 = await getSecureItem('recovery_a1');
    const hashedA2 = await getSecureItem('recovery_a2');

    if (hashString(answer1.toLowerCase().trim()) === hashedA1 && 
        hashString(answer2.toLowerCase().trim()) === hashedA2) {
      setStep(2);
    } else {
      Alert.alert('Verification Failed', 'The answers provided do not match our records.');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      if (profile) {
        await updateUserProfile({
          ...profile,
          password: newPassword
        });
      }
      
      Alert.alert('Success', 'Your password has been reset successfully.');
      onSuccess();
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#64748b" />
          <AppText style={styles.backText}>Back to Login</AppText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <HelpCircle size={40} color="#3b82f6" />
          </View>
          <AppText weight="bold" style={styles.title}>Account Recovery</AppText>
          <AppText style={styles.subtitle}>
            {step === 1 ? 'Answer your security questions to reset your password' : 'Enter a new password for your account'}
          </AppText>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              <View style={styles.questionContainer}>
                <AppText weight="medium" style={styles.label}>{q1 || 'Security Question 1'}</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Your answer"
                  placeholderTextColor="#94a3b8"
                  value={answer1}
                  onChangeText={setAnswer1}
                />
              </View>

              <View style={styles.questionContainer}>
                <AppText weight="medium" style={styles.label}>{q2 || 'Security Question 2'}</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Your answer"
                  placeholderTextColor="#94a3b8"
                  value={answer2}
                  onChangeText={setAnswer2}
                />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyAnswers}>
                <AppText weight="bold" style={styles.buttonText}>Verify Answers</AppText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
                <AppText weight="bold" style={styles.buttonText}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  questionContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fcfcfc',
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#fcfcfc',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
