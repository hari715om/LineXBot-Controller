/**
 * ControlPad Component
 *
 * D-pad style directional controller with Forward, Backward,
 * Left, Right, Stop, and Spin buttons in a cross layout.
 *
 * Directional buttons send the command on press and STOP on release.
 */

import React, {useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import RobotCommandService from '../services/RobotCommandService';
import {
  CMD_FORWARD,
  CMD_BACKWARD,
  CMD_LEFT,
  CMD_RIGHT,
  CMD_STOP,
  CMD_SPIN,
} from '../constants/commands';

const ControlPad: React.FC = () => {
  const handlePressIn = useCallback((cmd: string) => {
    RobotCommandService.sendCommand(cmd);
  }, []);

  const handlePressOut = useCallback(() => {
    RobotCommandService.stop();
  }, []);

  const handleSpin = useCallback(() => {
    RobotCommandService.sendCommand(CMD_SPIN);
  }, []);

  const handleStop = useCallback(() => {
    RobotCommandService.stop();
  }, []);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.sectionTitle}>CONTROLS</Text>

      {/* D-Pad */}
      <View style={styles.dpadContainer}>
        {/* Top row — Forward */}
        <View style={styles.dpadRow}>
          <DirectionButton
            label="▲"
            subtitle="FWD"
            command={CMD_FORWARD}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.btnUp}
          />
        </View>

        {/* Middle row — Left, Stop, Right */}
        <View style={styles.dpadRow}>
          <DirectionButton
            label="◄"
            subtitle="LEFT"
            command={CMD_RIGHT}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.btnSide}
          />
          <TouchableOpacity
            style={[styles.dpadBtn, styles.btnCenter]}
            onPress={handleStop}
            activeOpacity={0.7}>
            <Text style={styles.stopIcon}>■</Text>
            <Text style={styles.btnSubtitle}>STOP</Text>
          </TouchableOpacity>
          <DirectionButton
            label="►"
            subtitle="RIGHT"
            command={CMD_LEFT}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.btnSide}
          />
        </View>

        {/* Bottom row — Backward */}
        <View style={styles.dpadRow}>
          <DirectionButton
            label="▼"
            subtitle="BWD"
            command={CMD_BACKWARD}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.btnDown}
          />
        </View>
      </View>

      {/* Spin button */}
      <TouchableOpacity
        style={styles.spinBtn}
        onPress={handleSpin}
        activeOpacity={0.7}>
        <Text style={styles.spinIcon}>↻</Text>
        <Text style={styles.spinLabel}>SPIN 360°</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---- Sub-component for directional buttons ----

interface DirectionButtonProps {
  label: string;
  subtitle: string;
  command: string;
  onPressIn: (cmd: string) => void;
  onPressOut: () => void;
  style?: object;
}

const DirectionButton: React.FC<DirectionButtonProps> = ({
  label,
  subtitle,
  command,
  onPressIn,
  onPressOut,
  style,
}) => (
  <TouchableOpacity
    style={[styles.dpadBtn, style]}
    onPressIn={() => onPressIn(command)}
    onPressOut={onPressOut}
    activeOpacity={0.6}>
    <Text style={styles.btnArrow}>{label}</Text>
    <Text style={styles.btnSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// ---- Styles ----

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
    marginBottom: 16,
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadBtn: {
    width: 76,
    height: 76,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  btnUp: {
    backgroundColor: '#1A2A50',
    borderWidth: 1,
    borderColor: '#2E4A8A',
  },
  btnDown: {
    backgroundColor: '#1A2A50',
    borderWidth: 1,
    borderColor: '#2E4A8A',
  },
  btnSide: {
    backgroundColor: '#1A2A50',
    borderWidth: 1,
    borderColor: '#2E4A8A',
  },
  btnCenter: {
    backgroundColor: '#4A1A1A',
    borderWidth: 1,
    borderColor: '#8B3A3A',
  },
  btnArrow: {
    color: '#5B9EFF',
    fontSize: 28,
    fontWeight: '700',
  },
  stopIcon: {
    color: '#FF5B5B',
    fontSize: 24,
    fontWeight: '700',
  },
  btnSubtitle: {
    color: '#6B7FAA',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1,
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2A50',
    borderWidth: 1,
    borderColor: '#2E8A6A',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 16,
  },
  spinIcon: {
    color: '#5BFFB0',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 8,
  },
  spinLabel: {
    color: '#5BFFB0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default ControlPad;
