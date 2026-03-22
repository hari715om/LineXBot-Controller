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
      <Text style={styles.sectionTitle}>TACTICAL CONTROLS</Text>

      <View style={styles.dpadContainer}>
        <View style={styles.dpadRow}>
          <DirectionButton
            label="▲"
            subtitle="FWD"
            command={CMD_FORWARD}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </View>

        <View style={styles.dpadRow}>
          <DirectionButton
            label="◄"
            subtitle="LEFT"
            command={CMD_RIGHT}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
          <TouchableOpacity
            style={[styles.dpadBtn, styles.btnCenter]}
            onPress={handleStop}
            activeOpacity={0.7}>
            <Text style={styles.stopIcon}>■</Text>
            <Text style={styles.btnSubtitleCenter}>Halt</Text>
          </TouchableOpacity>
          <DirectionButton
            label="►"
            subtitle="RIGHT"
            command={CMD_LEFT}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </View>

        <View style={styles.dpadRow}>
          <DirectionButton
            label="▼"
            subtitle="BWD"
            command={CMD_BACKWARD}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.spinBtn}
        onPress={handleSpin}
        activeOpacity={0.7}>
        <Text style={styles.spinIcon}>↻</Text>
        <Text style={styles.spinLabel}>INITIATE SPIN 360°</Text>
      </TouchableOpacity>
    </View>
  );
};

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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  dpadContainer: {
    alignItems: 'center',
    backgroundColor: '#161b28',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.4)',
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadBtn: {
    width: 88,
    height: 88,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    backgroundColor: '#252a37',
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
    shadowColor: '#00dbe9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  btnCenter: {
    backgroundColor: 'rgba(175, 50, 0, 0.15)',
    borderColor: 'rgba(255, 181, 158, 0.4)',
    shadowColor: '#af3200',
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  btnArrow: {
    color: '#dbfcff',
    fontSize: 32,
    fontWeight: '600',
  },
  stopIcon: {
    color: '#ffb59e',
    fontSize: 28,
    fontWeight: '800',
  },
  btnSubtitle: {
    color: '#b9cacb',
    fontSize: 10,
    fontFamily: 'Manrope',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1.5,
  },
  btnSubtitleCenter: {
    color: '#ffb59e',
    fontSize: 10,
    fontFamily: 'Manrope',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1.5,
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.5)', 
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: '#00f0ff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  spinIcon: {
    color: '#00f0ff',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 10,
  },
  spinLabel: {
    color: '#00f0ff',
    fontSize: 12,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default ControlPad;
