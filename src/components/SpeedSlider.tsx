import React, {useCallback} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useRobotState} from '../context/RobotStateContext';
import {CMD_SPEED_1, CMD_SPEED_2, CMD_SPEED_3} from '../constants/commands';

const SPEEDS = [
  {label: 'LEVEL 1', value: CMD_SPEED_1, level: 1},
  {label: 'LEVEL 2', value: CMD_SPEED_2, level: 2},
  {label: 'LEVEL 3', value: CMD_SPEED_3, level: 3},
];

const SpeedSlider: React.FC = () => {
  const {activeSpeed, setSpeed} = useRobotState();

  const handleSpeedPress = useCallback((speed: typeof SPEEDS[0]) => {
    setSpeed(speed.level);
  }, [setSpeed]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>VELOCITY METRICS</Text>

      <View style={styles.segmentContainer}>
        {SPEEDS.map(speed => {
          const isActive = activeSpeed === speed.level;
          return (
            <TouchableOpacity
              key={speed.value}
              style={[
                styles.segment,
                isActive && styles.segmentActive,
              ]}
              onPress={() => handleSpeedPress(speed)}
              activeOpacity={0.7}>
              
              <View style={styles.indicatorArea}>
                <View style={[styles.glowDot, isActive && styles.glowDotActive]} />
              </View>
              
              <Text
                style={[
                  styles.segmentLabel,
                  isActive && styles.segmentLabelActive,
                ]}>
                {speed.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  segmentContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'flex-start',
    backgroundColor: '#161b28', // surface_container_low
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  segmentActive: {
    backgroundColor: '#252a37', // surface_container_high
    borderColor: 'rgba(0, 240, 255, 0.4)', // inset neon border
    shadowColor: '#00dbe9',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  indicatorArea: {
    marginBottom: 10,
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2f3542', // surface_variant
  },
  glowDotActive: {
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  segmentLabel: {
    color: '#b9cacb',
    fontSize: 11,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  segmentLabelActive: {
    color: '#dbfcff', // primary
  },
});

export default SpeedSlider;
