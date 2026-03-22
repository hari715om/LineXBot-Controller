import React, {useState, useEffect, useCallback} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, StatusBar, Alert} from 'react-native';
import BluetoothService from '../services/BluetoothService';
import RobotCommandService from '../services/RobotCommandService';
import type {ConnectionStatus} from '../services/BluetoothService';
import {useRobotState} from '../context/RobotStateContext';
import Joystick from '../components/Joystick';
import {
  CMD_STOP,
  CMD_SPEED_1,
  CMD_SPEED_2,
  CMD_SPEED_3,
  CMD_AUTO_MODE,
  CMD_MANUAL_MODE,
  CMD_SPIN,
} from '../constants/commands';

interface Props {
  navigation: any;
}

const JoystickScreen: React.FC<Props> = ({navigation}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [deviceName, setDeviceName] = useState<string>('');
  const [activeDirection, setActiveDirection] = useState<string>('IDLE');
  
  const {activeSpeed, setSpeed, activeMode, setMode} = useRobotState();

  useEffect(() => {
    setDeviceName(BluetoothService.getConnectedDeviceName() ?? 'Unknown');
    const unsubscribe = BluetoothService.onStatusChange(status => {
      setConnectionStatus(status);
      if (status === 'disconnected') {
        Alert.alert('CRITICAL EVENT', 'Telemetry signal lost.', [
          {text: 'ACKNOWLEDGE', onPress: () => navigation.popToTop()},
        ]);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleDirectionChange = useCallback((dir: string | null) => {
    if (dir) {
      RobotCommandService.sendCommand(dir);
      const labels: Record<string, string> = {
        F: 'TRANSLATING NORTH',
        B: 'TRANSLATING SOUTH',
        L: 'TRANSLATING EAST',
        R: 'TRANSLATING WEST',
      };
      setActiveDirection(labels[dir] || dir);
    } else {
      RobotCommandService.stop();
      setActiveDirection('IDLE (AWAITING INPUT)');
    }
  }, []);

  const handleSpeed = useCallback((level: number, cmd: string) => {
    setSpeed(level);
  }, [setSpeed]);

  const handleMode = useCallback((mode: 'manual' | 'auto') => {
    setMode(mode);
  }, [setMode]);

  const handleSpin = useCallback(() => {
    RobotCommandService.sendCommand(CMD_SPIN);
    setActiveDirection('INITIATING GYROSCOPE SPIN');
    setTimeout(() => setActiveDirection('IDLE (AWAITING INPUT)'), 700);
  }, []);

  const isConnected = connectionStatus === 'connected';
  const statusColor = isConnected
    ? '#2ff801'
    : connectionStatus === 'connecting'
      ? '#00f0ff'
      : '#ffb4ab';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* LEFT: Tactical Joystick Area */}
      <View style={styles.leftPanel}>
        <View style={styles.telemetryOverlay}>
          <Text style={styles.telemetryLabel}>VECTOR TRAJECTORY</Text>
          <Text style={styles.directionData}>{activeDirection}</Text>
        </View>

        <Joystick onDirectionChange={handleDirectionChange} />

        <TouchableOpacity
          style={styles.spinBtn}
          onPress={handleSpin}
          activeOpacity={0.7}>
          <Text style={styles.spinIcon}>↻</Text>
          <Text style={styles.spinLabel}>OVERRIDE: 360° SPIN</Text>
        </TouchableOpacity>
      </View>

      {/* RIGHT: Controls HUD */}
      <View style={styles.rightPanel}>
        <View style={styles.rightHeader}>
          <View style={styles.connInfo}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={styles.deviceText} numberOfLines={1}>
              {deviceName}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backText}>✕ ABORT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.specsContainer}>
          <View style={styles.specSection}>
            <Text style={styles.sectionLabel}>THRUST PROTOCOL</Text>
            <View style={styles.speedRow}>
              {[
                {l: 1, label: 'L-1', cmd: CMD_SPEED_1},
                {l: 2, label: 'L-2', cmd: CMD_SPEED_2},
                {l: 3, label: 'L-3', cmd: CMD_SPEED_3},
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
                  {activeSpeed === s.l && <View style={styles.speedGlow} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.specSection}>
            <Text style={styles.sectionLabel}>OPERATIONAL MODE</Text>
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
                    activeMode === 'manual' && styles.modeTextActiveManual,
                  ]}>
                  MANUAL
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
                  AI AUTO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0e1320', // deep space surface
  },

  // LEFT panel: Tactical Void
  leftPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  telemetryOverlay: {
    position: 'absolute',
    top: 24,
    left: 40,
  },
  telemetryLabel: {
    color: '#849495',
    fontSize: 9,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  directionData: {
    color: '#00f0ff',
    fontSize: 16,
    fontFamily: 'Space Grotesk',
    fontWeight: '900',
    letterSpacing: 2,
  },
  spinBtn: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  spinIcon: {
    color: '#00f0ff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  spinLabel: {
    color: '#00f0ff',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // RIGHT panel: HUD Specs
  rightPanel: {
    width: 320,
    backgroundColor: '#161b28', // surface_container_low
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(59, 73, 75, 0.3)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  rightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e1320',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
    flex: 1,
    marginRight: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  deviceText: {
    color: '#b9cacb',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(147, 0, 10, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.3)',
  },
  backText: {
    color: '#ffb4ab',
    fontSize: 9,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1,
  },
  specsContainer: {
    gap: 32,
  },
  specSection: {},
  sectionLabel: {
    color: '#849495',
    fontSize: 9,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#252a37',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
    position: 'relative',
  },
  speedBtnActive: {
    borderColor: '#00f0ff',
  },
  speedText: {
    color: '#b9cacb',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1,
  },
  speedTextActive: {
    color: '#00f0ff',
  },
  speedGlow: {
    position: 'absolute',
    bottom: -1,
    width: 24,
    height: 3,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 4,
    borderRadius: 2,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#252a37',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
  },
  modeBtnActiveManual: {
    borderColor: '#00f0ff',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  modeBtnActiveAuto: {
    borderColor: '#2ff801',
    backgroundColor: 'rgba(47, 248, 1, 0.05)',
  },
  modeIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  modeText: {
    color: '#849495',
    fontSize: 9,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  modeTextActiveManual: {
    color: '#00f0ff',
  },
  modeTextActiveAuto: {
    color: '#2ff801',
  },
});

export default JoystickScreen;
