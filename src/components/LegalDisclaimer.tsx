import React from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView } from 'react-native';

export default function LegalDisclaimer({ visible, onAccept }: { visible: boolean, onAccept: () => void }) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Legal Disclaimer & Assumption of Risk</Text>
        <ScrollView style={styles.content}>
          <Text style={styles.text}>
            StockSync provides inventory and safety management based on user data. However, the system is an aid and 
            not a replacement for professional safety protocols.
          </Text>
          <Text style={styles.subtitle}>Assumption of Risk</Text>
          <Text style={styles.text}>
            By using this application, you acknowledge that you are responsible for final verification 
            of all safety data. You assume all risks associated with the use of the information provided 
            by StockSync.
          </Text>
        </ScrollView>
        <Button title="Accept" onPress={onAccept} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  text: { fontSize: 14, lineHeight: 20 },
  content: { flex: 1 }
});
