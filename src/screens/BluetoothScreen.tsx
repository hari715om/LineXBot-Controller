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
            <Text style={[styles.deviceName, isHC05 && styles.deviceNameHighlight]}>
              {item.name || 'Unknown Target'}
            </Text>
            <Text style={styles.deviceId}>ID: {item.id}</Text>
            {isHC05 && (
              <Text style={styles.deviceBadge}>[ PRIMARY TARGET IDENTIFIED ]</Text>
            )}
          </View>
        </View>
        {isConnecting ? (
          <ActivityIndicator color="#00f0ff" size="small" />
        ) : (
          <Text style={[styles.connectArrow, isHC05 && styles.connectArrowHighlight]}>
            CONNECT →
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0e1320" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RADAR SCAN</Text>
        <Text style={styles.subtitle}>LINE-X BOT TELEMETRY APP</Text>
      </View>

      {/* Bluetooth Status */}
      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusDot,
            btEnabled ? styles.statusDotOn : styles.statusDotOff,
          ]}
        />
        <Text style={[styles.statusText, !btEnabled && styles.statusTextHighContrast]}>
          BLUETOOTH {btEnabled ? 'ACTIVE' : 'OFFLINE'}
        </Text>
      </View>

      {/* Device List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DETECTED TARGETS</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={scanDevices}
            disabled={scanning}>
            <Text style={styles.refreshText}>
              {scanning ? 'SCANNING...' : '↻ RESCAN'}
            </Text>
          </TouchableOpacity>
        </View>

        {scanning ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#00f0ff" size="large" />
            <Text style={styles.loadingText}>SWEEPING FREQUENCIES...</Text>
          </View>
        ) : devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyText}>NO SIGNALS DETECTED</Text>
            <Text style={styles.emptyHint}>
              Ensure HC-05 module is powered on and paired to Android System via Settings.
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
          SECURE CONNECTION PROTOCOL • DEEP SPACE HUD
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1320', // surface
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    color: '#dee2f4',
    fontSize: 28,
    fontFamily: 'Space Grotesk',
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#00f0ff',
    fontSize: 10,
    fontFamily: 'Manrope',
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 6,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#161b28', // surface_container_low
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusDotOn: {
    backgroundColor: '#2ff801', // secondary_container
    shadowColor: '#2ff801',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  statusDotOff: {
    backgroundColor: '#ffb4ab', // error
    shadowColor: '#ffb4ab',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  statusText: {
    color: '#b9cacb',
    fontSize: 12,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statusTextHighContrast: {
    color: '#ffb4ab', // error
    fontWeight: '900',
  },
  section: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  refreshText: {
    color: '#00f0ff',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1f2c', // surface_container
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.3)',
    padding: 18,
    marginBottom: 12,
  },
  deviceCardHighlight: {
    backgroundColor: '#252a37', // surface_container_high
    borderColor: '#00f0ff', // primary_container
    shadowColor: '#00f0ff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 24,
    marginRight: 16,
    opacity: 0.8,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    color: '#dee2f4',
    fontSize: 16,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
  },
  deviceNameHighlight: {
    color: '#dbfcff',
  },
  deviceId: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Manrope',
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 1,
  },
  deviceBadge: {
    color: '#2ff801', // secondary_container
    fontSize: 9,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1.5,
  },
  connectArrow: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1,
  },
  connectArrowHighlight: {
    color: '#00f0ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00f0ff',
    fontSize: 12,
    fontFamily: 'Space Grotesk',
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyText: {
    color: '#b9cacb',
    fontSize: 14,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  emptyHint: {
    color: '#849495',
    fontSize: 11,
    fontFamily: 'Manrope',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    marginHorizontal: 30,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: 'rgba(59, 73, 75, 0.6)',
    fontSize: 8,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default BluetoothScreen;
