import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { usePantry } from '../context/PantryContext';
import { Code, Globe, Mail } from 'lucide-react-native';

const Footer: React.FC = () => {
  const { isDark } = usePantry();

  return (
    <View style={[styles.footer, { backgroundColor: isDark ? '#0f172a' : '#1e293b' }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.brand}>StockSync Pro</Text>
          <Text style={styles.tagline}>Smart kitchen management for the modern home.</Text>
        </View>

        <View style={styles.linksRow}>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.copyright}>
          © 2026 Monolith Studios. All rights reserved. Built with Expo & Love.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  content: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  section: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  linkItem: {},
  linkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  socialIcon: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
});

export default Footer;
