/**
 * BluetoothScreen
 *
 * Initial screen of the app. Handles:
 * - Checking Bluetooth is enabled
 * - Requesting permissions
 * - Listing paired devices
 * - Connecting to a selected device (HC-05)
 * - Navigating to ControllerScreen on success
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import {BluetoothDevice} from 'react-native-bluetooth-classic';
import BluetoothService from '../services/BluetoothService';
import type {ConnectionStatus} from '../services/BluetoothService';

interface Props {
  navigation: any;
}

const BluetoothScreen: React.FC<Props> = ({navigation}) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(
    null,
  );
  const [btEnabled, setBtEnabled] = useState(true);

  // Subscribe to connection status
  useEffect(() => {
    const unsubscribe = BluetoothService.onStatusChange(status => {
      setConnectionStatus(status);
    });
    return unsubscribe;
  }, []);

  // Initial setup
  useEffect(() => {
    initBluetooth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initBluetooth = async () => {
    // Request permissions
    const permGranted = await BluetoothService.requestPermissions();
    if (!permGranted) {
      Alert.alert(
        'Permissions Required',
        'Bluetooth and Location permissions are needed to connect to the robot.',
      );
      return;
    }

    // Check Bluetooth is enabled
    const enabled = await BluetoothService.isEnabled();
    setBtEnabled(enabled);

    if (!enabled) {
      const userEnabled = await BluetoothService.requestEnable();
      setBtEnabled(userEnabled);
      if (!userEnabled) {
        return;
      }
    }

    // Fetch paired devices
    scanDevices();
  };

  const scanDevices = async () => {
    setScanning(true);
    const paired = await BluetoothService.getPairedDevices();
    setDevices(paired);
    setScanning(false);
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setConnectingDeviceId(device.id);
    const success = await BluetoothService.connect(device);

    if (success) {
      navigation.navigate('Controller');
    } else {
      Alert.alert(
        'Connection Failed',
        `Could not connect to ${device.name || device.id}. Make sure the device is powered on and in range.`,
      );
    }
    setConnectingDeviceId(null);
  };

  const renderDevice = ({item}: {item: BluetoothDevice}) => {
    const isConnecting = connectingDeviceId === item.id;
    const isHC05 =
      item.name?.toLowerCase().includes('hc-05') ||
      item.name?.toLowerCase().includes('hc05');

    return (
      <TouchableOpacity
        style={[styles.deviceCard, isHC05 && styles.deviceCardHighlight]}
        onPress={() => connectToDevice(item)}
        disabled={isConnecting}
        activeOpacity={0.7}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceIcon}>{isHC05 ? '🤖' : '📱'}</Text>
          <View style={styles.deviceText}>
            <Text style={styles.deviceName}>
              {item.name || 'Unknown Device'}
            </Text>
            <Text style={styles.deviceId}>{item.id}</Text>
            {isHC05 && (
              <Text style={styles.deviceBadge}>← LineX Bot</Text>
            )}
          </View>
        </View>
        {isConnecting ? (
          <ActivityIndicator color="#5B9EFF" size="small" />
        ) : (
          <Text style={styles.connectArrow}>→</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>⚡</Text>
        <Text style={styles.title}>LineX Bot</Text>
        <Text style={styles.subtitle}>CONTROLLER</Text>
      </View>

      {/* Bluetooth Status */}
      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusDot,
            btEnabled ? styles.statusDotOn : styles.statusDotOff,
          ]}
        />
        <Text style={styles.statusText}>
          Bluetooth {btEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>

      {/* Device List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PAIRED DEVICES</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={scanDevices}
            disabled={scanning}>
            <Text style={styles.refreshText}>
              {scanning ? '...' : '↻ Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        {scanning ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#5B9EFF" size="large" />
            <Text style={styles.loadingText}>Scanning devices...</Text>
          </View>
        ) : devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyText}>No paired devices found</Text>
            <Text style={styles.emptyHint}>
              Pair your HC-05 module in{'\n'}Android Bluetooth settings first
            </Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            renderItem={renderDevice}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Make sure HC-05 is powered on and paired
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060D1F',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subtitle: {
    color: '#5B9EFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 2,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#0D1B3A',
    borderWidth: 1,
    borderColor: '#1A2A50',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotOn: {
    backgroundColor: '#5BFFB0',
  },
  statusDotOff: {
    backgroundColor: '#FF5B5B',
  },
  statusText: {
    color: '#8B9CC7',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#8B9CC7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A2A50',
  },
  refreshText: {
    color: '#5B9EFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D1B3A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A2A50',
    padding: 16,
    marginBottom: 10,
  },
  deviceCardHighlight: {
    borderColor: '#2E8A6A',
    backgroundColor: '#0D2A1F',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  deviceId: {
    color: '#4A6090',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  deviceBadge: {
    color: '#5BFFB0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  connectArrow: {
    color: '#5B9EFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#5A6A8A',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyText: {
    color: '#8B9CC7',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#4A6090',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 30,
  },
  footerText: {
    color: '#3A4A6A',
    fontSize: 12,
    fontWeight: '500',
  },
});


export default BluetoothScreen;
