/**
 * ControllerScreen
 *
 * Main robot controller screen.
 * Assembles ControlPad, SpeedSlider, ModeSwitch, and VoiceButton.
 * Shows connection status and provides a disconnect button.
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import BluetoothService from '../services/BluetoothService';
import type {ConnectionStatus} from '../services/BluetoothService';
import ControlPad from '../components/ControlPad';
import SpeedSlider from '../components/SpeedSlider';
import ModeSwitch from '../components/ModeSwitch';
import VoiceButton from '../components/VoiceButton';

interface Props {
  navigation: any;
}

const ControllerScreen: React.FC<Props> = ({navigation}) => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connected');
  const [deviceName, setDeviceName] = useState<string>('');

  useEffect(() => {
    setDeviceName(BluetoothService.getConnectedDeviceName() ?? 'Unknown');

    // Verify connection is alive (handles hot-reload / stale state)
    BluetoothService.isConnected().then(alive => {
      if (!alive) {
        navigation.goBack();
      }
    });

    const unsubscribe = BluetoothService.onStatusChange(status => {
      setConnectionStatus(status);
      if (status === 'disconnected') {
        Alert.alert(
          'Disconnected',
          'Connection to the robot was lost. Please reconnect.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleDisconnect = useCallback(async () => {
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect from the robot?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await BluetoothService.disconnect();
            navigation.goBack();
          },
        },
      ],
    );
  }, [navigation]);

  const statusColor =
    connectionStatus === 'connected'
      ? '#5BFFB0'
      : connectionStatus === 'connecting'
        ? '#FFD55B'
        : '#FF5B5B';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>LineX Bot</Text>
          <View style={styles.connectionInfo}>
            <View
              style={[styles.statusDot, {backgroundColor: statusColor}]}
            />
            <Text style={styles.deviceName}>{deviceName}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.disconnectBtn}
          onPress={handleDisconnect}
          activeOpacity={0.7}>
          <Text style={styles.disconnectText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable controller area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Control Pad */}
        <ControlPad />

        {/* Joystick Mode Button */}
        <TouchableOpacity
          style={styles.joystickModeBtn}
          onPress={() => navigation.navigate('Joystick')}
          activeOpacity={0.7}>
          <Text style={styles.joystickModeIcon}>🕹️</Text>
          <Text style={styles.joystickModeText}>JOYSTICK MODE</Text>
          <Text style={styles.joystickModeArrow}>→</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Speed Selector */}
        <SpeedSlider />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Mode Switch */}
        <ModeSwitch />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Voice Button */}
        <VoiceButton />

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060D1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0A1530',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2A50',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  deviceName: {
    color: '#6B7FAA',
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#5A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectText: {
    color: '#FF5B5B',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2A50',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  joystickModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1B3A',
    borderWidth: 1,
    borderColor: '#5B9EFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  joystickModeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  joystickModeText: {
    color: '#5B9EFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    flex: 1,
  },
  joystickModeArrow: {
    color: '#5B9EFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ControllerScreen;
