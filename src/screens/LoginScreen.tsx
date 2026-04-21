import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Lock, Mail, Fingerprint, LogIn } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { verifyLogin } from '../utils/database';
import { useProfile } from '../context/ProfileContext';
import AppText from '../components/AppText';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToSignup: () => void;
  onNavigateToRecovery: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToSignup, onNavigateToRecovery }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await verifyLogin(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometrics Not Available', 'Your device does not support biometric authentication or no biometrics are enrolled.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        // In a real app, we'd check for a stored token or user ID
        // For this prototype, if biometric succeeds and we have a profile, we log in
        if (profile && profile.email) {
          onLoginSuccess(profile);
        } else {
          Alert.alert('No Account Found', 'Please log in with email and password first to enable biometrics.');
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'An error occurred during biometric authentication');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Lock size={40} color="#3b82f6" />
          </View>
          <AppText weight="bold" style={styles.title}>Secure Access</AppText>
          <AppText style={styles.subtitle}>Sign in to manage your pantry</AppText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.forgotPasswordContainer} 
            onPress={onNavigateToRecovery}
          >
            <AppText style={styles.forgotPasswordText}>Forgot Password?</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LogIn size={20} color="#fff" style={{ marginRight: 8 }} />
            <AppText weight="bold" style={styles.loginButtonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </AppText>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>OR</AppText>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.biometricButton} 
            onPress={handleBiometricLogin}
          >
            <Fingerprint size={24} color="#3b82f6" style={{ marginRight: 10 }} />
            <AppText weight="medium" style={styles.biometricButtonText}>
              Login with Biometrics
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>Don&apos;t have an account?</AppText>
          <TouchableOpacity onPress={onNavigateToSignup}>
            <AppText weight="bold" style={styles.signupLink}>Create Account</AppText>
          </TouchableOpacity>
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
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  biometricButtonText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    color: '#64748b',
    fontSize: 15,
  },
  signupLink: {
    color: '#3b82f6',
    fontSize: 15,
  },
});
