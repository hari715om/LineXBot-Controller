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
      <Text style={styles.sectionTitle}>OPERATIONAL MODE</Text>

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.modeBtn,
            styles.modeBtnLeft,
            activeMode === 'manual' && styles.modeBtnActive,
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
          <Text style={styles.modeSubtitle}>TACTICAL OVERRIDE</Text>
          {activeMode === 'manual' && <View style={styles.activeGlow} />}
        </TouchableOpacity>

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
          <Text style={styles.modeSubtitle}>AI SUPERVISION</Text>
          {activeMode === 'auto' && <View style={styles.activeGlowAuto} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionTitle: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#161b28', // surface_container_low
    width: '100%',
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    position: 'relative',
  },
  modeBtnLeft: {
    marginRight: 2,
  },
  modeBtnRight: {
    marginLeft: 2,
  },
  modeBtnActive: {
    backgroundColor: '#252a37', // surface_container_high
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  modeBtnActiveAuto: {
    backgroundColor: '#252a37',
    borderWidth: 1,
    borderColor: 'rgba(47, 248, 1, 0.3)', // secondary_container
  },
  modeIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  modeLabel: {
    color: '#b9cacb',
    fontSize: 14,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
  },
  modeLabelActive: {
    color: '#00f0ff', // primary_container (manual)
  },
  modeLabelActiveAuto: {
    color: '#2ff801', // secondary_container (auto)
  },
  modeSubtitle: {
    color: '#849495',
    fontSize: 9,
    fontFamily: 'Manrope',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeGlow: {
    position: 'absolute',
    bottom: -10,
    width: 40,
    height: 10,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowRadius: 15,
    shadowOpacity: 1,
    elevation: 10,
    borderRadius: 10,
  },
  activeGlowAuto: {
    position: 'absolute',
    bottom: -10,
    width: 40,
    height: 10,
    backgroundColor: '#2ff801',
    shadowColor: '#2ff801',
    shadowRadius: 15,
    shadowOpacity: 1,
    elevation: 10,
    borderRadius: 10,
  },
});

export default ModeSwitch;
