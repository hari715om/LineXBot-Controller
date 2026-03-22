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

    BluetoothService.isConnected().then(alive => {
      if (!alive) {
        navigation.goBack();
      }
    });

    const unsubscribe = BluetoothService.onStatusChange(status => {
      setConnectionStatus(status);
      if (status === 'disconnected') {
        Alert.alert(
          'CRITICAL: SIGNAL LOST',
          'Telemetry connection to the drone was severed. Please reconnect.',
          [
            {
              text: 'ACKNOWLEDGE',
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
      'TERMINATE CONNECTION',
      'Are you sure you want to disconnect telemetry from the active drone?',
      [
        {text: 'CANCEL', style: 'cancel'},
        {
          text: 'TERMINATE',
          style: 'destructive',
          onPress: async () => {
            await BluetoothService.disconnect();
            navigation.goBack();
          },
        },
      ],
    );
  }, [navigation]);

  const isConnected = connectionStatus === 'connected';
  const statusColor = isConnected
    ? '#2ff801' // secondary_container (green glow)
    : connectionStatus === 'connecting'
      ? '#00f0ff' // primary_container
      : '#ffb4ab'; // error

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0e1320" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>PORTRAIT COMMAND CENTER</Text>
          <View style={styles.connectionBlock}>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: statusColor, shadowColor: statusColor},
              ]}
            />
            <Text style={styles.deviceName}>TARGET: {deviceName.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.disconnectBtn}
          onPress={handleDisconnect}
          activeOpacity={0.7}>
          <Text style={styles.disconnectIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Asymmetric Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Module: Joystick Entry */}
        <TouchableOpacity
          style={styles.joystickModeBtn}
          onPress={() => navigation.navigate('Joystick')}
          activeOpacity={0.7}>
          <Text style={styles.joystickModeIcon}>🕹️</Text>
          <Text style={styles.joystickModeText}>INITIATE LANDSCAPE JOYSTICK OVERRIDE</Text>
          <Text style={styles.joystickModeArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.moduleSpacer} />

        {/* Module: Main Control Pad */}
        <View style={styles.hudModule}>
          <ControlPad />
        </View>

        <View style={styles.moduleSpacer} />

        {/* Module: Speed & Mode Specs */}
        <View style={styles.hudModule}>
          <SpeedSlider />
          <View style={styles.innerSpacer} />
          <ModeSwitch />
        </View>

        <View style={styles.moduleSpacer} />

        {/* Module: Voice Command */}
        <View style={styles.hudModule}>
          <VoiceButton />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1320', // surface void
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 20,
    backgroundColor: '#161b28', // surface_container_low
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 73, 75, 0.4)', // outline_variant
  },
  headerLeft: {
    flex: 1,
    paddingRight: 20,
  },
  headerTitle: {
    color: '#00f0ff', // primary_container neon
    fontSize: 16,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  connectionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e1320',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceName: {
    color: '#b9cacb', // on_surface_variant
    fontSize: 10,
    fontFamily: 'Manrope',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  disconnectBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 0, 10, 0.1)', // error_container transparent
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.3)', // error ghost border
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectIcon: {
    color: '#ffb4ab',
    fontSize: 14,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  joystickModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00f0ff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  joystickModeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  joystickModeText: {
    color: '#dbfcff',
    fontSize: 11,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1.5,
    flex: 1,
  },
  joystickModeArrow: {
    color: '#00f0ff',
    fontSize: 18,
    fontWeight: '800',
  },
  hudModule: {
    backgroundColor: 'rgba(47, 53, 66, 0.15)', // Glassmorphism layer
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  moduleSpacer: {
    height: 24, // Strict No-line rule, section via whitespace
  },
  innerSpacer: {
    height: 16,
  },
  bottomSpacer: {
    height: 60,
  },
});

export default ControllerScreen;
