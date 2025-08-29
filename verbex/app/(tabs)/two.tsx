import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { getToken, removeToken } from '../../lib/auth';

export default function SettingsTab() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoConfirmTransactions, setAutoConfirmTransactions] = useState(false);
  const [blockchainNetwork, setBlockchainNetwork] = useState('avalanche');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await removeToken();
      setIsAuthenticated(false);
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleNetworkChange = () => {
    const networks = ['avalanche', 'polygon', 'ethereum'];
    const currentIndex = networks.indexOf(blockchainNetwork);
    const nextIndex = (currentIndex + 1) % networks.length;
    setBlockchainNetwork(networks[nextIndex]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Please login to access settings</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your Verbex experience</Text>
      </View>

      <ScrollView style={styles.settingsContainer}>
        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice & Audio</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Voice Assistant</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: '#374151', true: '#2563eb' }}
              thumbColor={voiceEnabled ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Blockchain Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blockchain</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Network</Text>
            <TouchableOpacity style={styles.networkButton} onPress={handleNetworkChange}>
              <Text style={styles.networkButtonText}>{blockchainNetwork.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto-confirm Transactions</Text>
            <Switch
              value={autoConfirmTransactions}
              onValueChange={setAutoConfirmTransactions}
              trackColor={{ false: '#374151', true: '#2563eb' }}
              thumbColor={autoConfirmTransactions ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0c',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  networkButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  networkButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
  },
});
