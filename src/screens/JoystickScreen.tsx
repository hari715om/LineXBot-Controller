/**
 * JoystickScreen
 *
 * Landscape-oriented advanced controller with a virtual joystick.
 * Left side: Joystick + direction label
 * Right side: Speed, Mode, connection info
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import BluetoothService from '../services/BluetoothService';
import RobotCommandService from '../services/RobotCommandService';
import type {ConnectionStatus} from '../services/BluetoothService';
import Joystick from '../components/Joystick';
import {
  CMD_STOP,
  CMD_SPEED_1,
  CMD_SPEED_2,
  CMD_SPEED_3,
  CMD_AUTO_MODE,
  CMD_MANUAL_MODE,
  CMD_SPIN,
  COMMAND_LABELS,
} from '../constants/commands';

interface Props {
  navigation: any;
}

const JoystickScreen: React.FC<Props> = ({navigation}) => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connected');
  const [deviceName, setDeviceName] = useState<string>('');
  const [activeDirection, setActiveDirection] = useState<string>('IDLE');
  const [activeSpeed, setActiveSpeed] = useState(2);
  const [activeMode, setActiveMode] = useState<'manual' | 'auto'>('auto');

  useEffect(() => {
    setDeviceName(BluetoothService.getConnectedDeviceName() ?? 'Unknown');
    const unsubscribe = BluetoothService.onStatusChange(status => {
      setConnectionStatus(status);
      if (status === 'disconnected') {
        Alert.alert('Disconnected', 'Connection lost.', [
          {text: 'OK', onPress: () => navigation.popToTop()},
        ]);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleDirectionChange = useCallback((dir: string | null) => {
    if (dir) {
      RobotCommandService.sendCommand(dir);
      const labels: Record<string, string> = {
        F: '▲ FORWARD',
        B: '▼ BACKWARD',
        L: '► RIGHT',
        R: '◄ LEFT',
      };
      setActiveDirection(labels[dir] || dir);
    } else {
      RobotCommandService.stop();
      setActiveDirection('IDLE');
    }
  }, []);

  const handleSpeed = useCallback((level: number, cmd: string) => {
    setActiveSpeed(level);
    RobotCommandService.sendCommand(cmd);
  }, []);

  const handleMode = useCallback((mode: 'manual' | 'auto') => {
    setActiveMode(mode);
    RobotCommandService.sendCommand(
      mode === 'auto' ? CMD_AUTO_MODE : CMD_MANUAL_MODE,
    );
  }, []);

  const handleSpin = useCallback(() => {
    RobotCommandService.sendCommand(CMD_SPIN);
    setActiveDirection('↻ SPINNING');
    setTimeout(() => setActiveDirection('IDLE'), 700);
  }, []);

  const statusColor =
    connectionStatus === 'connected'
      ? '#5BFFB0'
      : connectionStatus === 'connecting'
        ? '#FFD55B'
        : '#FF5B5B';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* LEFT: Joystick Area */}
      <View style={styles.leftPanel}>
        {/* Direction label */}
        <Text style={styles.directionLabel}>{activeDirection}</Text>

        {/* Joystick */}
        <Joystick onDirectionChange={handleDirectionChange} />

        {/* Spin button under joystick */}
        <TouchableOpacity
          style={styles.spinBtn}
          onPress={handleSpin}
          activeOpacity={0.7}>
          <Text style={styles.spinIcon}>↻</Text>
          <Text style={styles.spinLabel}>SPIN</Text>
        </TouchableOpacity>
      </View>

      {/* RIGHT: Controls Panel */}
      <View style={styles.rightPanel}>
        {/* Connection info */}
        <View style={styles.connInfo}>
          <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
          <Text style={styles.deviceText} numberOfLines={1}>
            {deviceName}
          </Text>
        </View>

        {/* Speed buttons */}
        <Text style={styles.sectionLabel}>SPEED</Text>
        <View style={styles.speedRow}>
          {[
            {l: 1, label: 'S', cmd: CMD_SPEED_1},
            {l: 2, label: 'M', cmd: CMD_SPEED_2},
            {l: 3, label: 'F', cmd: CMD_SPEED_3},
          ].map(s => (
            <TouchableOpacity
              key={s.l}
              style={[
                styles.speedBtn,
                activeSpeed === s.l && styles.speedBtnActive,
              ]}
              onPress={() => handleSpeed(s.l, s.cmd)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.speedText,
                  activeSpeed === s.l && styles.speedTextActive,
                ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mode buttons */}
        <Text style={styles.sectionLabel}>MODE</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'manual' && styles.modeBtnActiveManual,
            ]}
            onPress={() => handleMode('manual')}
            activeOpacity={0.7}>
            <Text style={styles.modeIcon}>🎮</Text>
            <Text
              style={[
                styles.modeText,
                activeMode === 'manual' && styles.modeTextActive,
              ]}>
              MAN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'auto' && styles.modeBtnActiveAuto,
            ]}
            onPress={() => handleMode('auto')}
            activeOpacity={0.7}>
            <Text style={styles.modeIcon}>🤖</Text>
            <Text
              style={[
                styles.modeText,
                activeMode === 'auto' && styles.modeTextActiveAuto,
              ]}>
              AUTO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backText}>← D-PAD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#060D1F',
  },

  // LEFT panel
  leftPanel: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#1A2A50',
  },
  directionLabel: {
    color: '#5B9EFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2A50',
    borderWidth: 1,
    borderColor: '#2E8A6A',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 16,
  },
  spinIcon: {
    color: '#5BFFB0',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  spinLabel: {
    color: '#5BFFB0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // RIGHT panel
  rightPanel: {
    flex: 2,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  connInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B3A',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1A2A50',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  deviceText: {
    color: '#8B9CC7',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    color: '#4A6090',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 4,
  },

  // Speed
  speedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  speedBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0D1B3A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2A50',
  },
  speedBtnActive: {
    backgroundColor: '#1A2A50',
    borderColor: '#5B9EFF',
  },
  speedText: {
    color: '#4A6090',
    fontSize: 14,
    fontWeight: '800',
  },
  speedTextActive: {
    color: '#5B9EFF',
  },

  // Mode
  modeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0D1B3A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2A50',
  },
  modeBtnActiveManual: {
    backgroundColor: '#1A2A50',
    borderColor: '#5B9EFF',
  },
  modeBtnActiveAuto: {
    backgroundColor: '#1A3A28',
    borderColor: '#5BFFB0',
  },
  modeIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  modeText: {
    color: '#4A6090',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeTextActive: {
    color: '#5B9EFF',
  },
  modeTextActiveAuto: {
    color: '#5BFFB0',
  },

  // Back button
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1A1A2A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  backText: {
    color: '#8B9CC7',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default JoystickScreen;
