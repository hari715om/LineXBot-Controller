/**
 * ModeSwitch Component
 *
 * Toggle between Auto (line follower) and Manual (Bluetooth control) modes.
 */

import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import RobotCommandService from '../services/RobotCommandService';
import {CMD_AUTO_MODE, CMD_MANUAL_MODE} from '../constants/commands';

const ModeSwitch: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'manual' | 'auto'>('auto');

  const handleAutoPress = useCallback(() => {
    setActiveMode('auto');
    RobotCommandService.sendCommand(CMD_AUTO_MODE);
  }, []);

  const handleManualPress = useCallback(() => {
    setActiveMode('manual');
    RobotCommandService.sendCommand(CMD_MANUAL_MODE);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>MODE</Text>

      <View style={styles.switchContainer}>
        {/* Manual mode button */}
        <TouchableOpacity
          style={[
            styles.modeBtn,
            styles.modeBtnLeft,
            activeMode === 'manual' && styles.modeBtnActiveManual,
          ]}
          onPress={handleManualPress}
          activeOpacity={0.7}>
          <Text style={styles.modeIcon}>🎮</Text>
          <Text
            style={[
              styles.modeLabel,
              activeMode === 'manual' && styles.modeLabelActive,
            ]}>
            MANUAL
          </Text>
          <Text style={styles.modeSubtitle}>BT Control</Text>
        </TouchableOpacity>

        {/* Auto mode button */}
        <TouchableOpacity
          style={[
            styles.modeBtn,
            styles.modeBtnRight,
            activeMode === 'auto' && styles.modeBtnActiveAuto,
          ]}
          onPress={handleAutoPress}
          activeOpacity={0.7}>
          <Text style={styles.modeIcon}>🤖</Text>
          <Text
            style={[
              styles.modeLabel,
              activeMode === 'auto' && styles.modeLabelActiveAuto,
            ]}>
            AUTO
          </Text>
          <Text style={styles.modeSubtitle}>Line Follow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#8B9CC7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2E4A8A',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#0D1B3A',
  },
  modeBtnLeft: {
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
    borderRightWidth: 0.5,
    borderRightColor: '#2E4A8A',
  },
  modeBtnRight: {
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    borderLeftWidth: 0.5,
    borderLeftColor: '#2E4A8A',
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
    fontSize: 20,
    marginBottom: 4,
  },
  modeLabel: {
    color: '#4A6090',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modeLabelActive: {
    color: '#5B9EFF',
  },
  modeLabelActiveAuto: {
    color: '#5BFFB0',
  },
  modeSubtitle: {
    color: '#3A4A6A',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default ModeSwitch;
