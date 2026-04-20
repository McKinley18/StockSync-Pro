import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TriangleAlert, RefreshCcw, House } from 'lucide-react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <TriangleAlert size={48} color="#ef4444" />
            </View>
            <Text style={styles.title}>System Interruption</Text>
            <Text style={styles.message}>
              StockSync encountered an unexpected error. Don't worry, your data is safe in the local database.
            </Text>
            
            <ScrollView style={styles.errorScroll}>
              <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.resetBtn} onPress={this.handleReset}>
              <RefreshCcw size={20} color="white" />
              <Text style={styles.resetBtnText}>Restart Component</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeBtn} onPress={() => window.location.reload()}>
              <House size={18} color="#64748b" />
              <Text style={styles.homeBtnText}>Reload Entire App</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 30, width: '100%', maxWidth: 450, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  message: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  errorScroll: { width: '100%', maxHeight: 100, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 24 },
  errorText: { fontFamily: 'monospace', fontSize: 12, color: '#ef4444' },
  resetBtn: { backgroundColor: '#3b82f6', width: '100%', padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12 },
  resetBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  homeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  homeBtnText: { color: '#64748b', fontWeight: '600', fontSize: 14 }
});

export default ErrorBoundary;
