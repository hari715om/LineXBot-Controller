/**
 * SpeedSlider Component
 *
 * 3-step segmented speed selector.
 * Sends '1', '2', or '3' to the robot when tapped.
 */

import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import RobotCommandService from '../services/RobotCommandService';
import {CMD_SPEED_1, CMD_SPEED_2, CMD_SPEED_3} from '../constants/commands';

const SPEEDS = [
  {label: 'SLOW', value: CMD_SPEED_1, level: 1},
  {label: 'MED', value: CMD_SPEED_2, level: 2},
  {label: 'FAST', value: CMD_SPEED_3, level: 3},
];

const SpeedSlider: React.FC = () => {
  const [activeSpeed, setActiveSpeed] = useState(1);

  const handleSpeedPress = useCallback((speed: typeof SPEEDS[0]) => {
    setActiveSpeed(speed.level);
    RobotCommandService.sendCommand(speed.value);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SPEED</Text>

      <View style={styles.segmentContainer}>
        {SPEEDS.map(speed => {
          const isActive = activeSpeed === speed.level;
          return (
            <TouchableOpacity
              key={speed.value}
              style={[
                styles.segment,
                isActive && styles.segmentActive,
                speed.level === 1 && styles.segmentFirst,
                speed.level === 3 && styles.segmentLast,
              ]}
              onPress={() => handleSpeedPress(speed)}
              activeOpacity={0.7}>
              {/* Speed bars indicator */}
              <View style={styles.barsContainer}>
                {[1, 2, 3].map(bar => (
                  <View
                    key={bar}
                    style={[
                      styles.bar,
                      {height: 6 + bar * 5},
                      bar <= speed.level
                        ? isActive
                          ? styles.barActiveHighlight
                          : styles.barFilled
                        : styles.barEmpty,
                    ]}
                  />
                ))}
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
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#8B9CC7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2E4A8A',
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1B3A',
  },
  segmentFirst: {
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  segmentLast: {
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
  },
  segmentActive: {
    backgroundColor: '#1A2A50',
  },
  segmentLabel: {
    color: '#4A6090',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
  segmentLabelActive: {
    color: '#5B9EFF',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 22,
    gap: 3,
  },
  bar: {
    width: 6,
    borderRadius: 2,
  },
  barFilled: {
    backgroundColor: '#2E4A8A',
  },
  barActiveHighlight: {
    backgroundColor: '#5B9EFF',
  },
  barEmpty: {
    backgroundColor: '#1A2030',
  },
});

export default SpeedSlider;
