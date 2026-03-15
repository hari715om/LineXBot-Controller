/**
 * Joystick Component
 *
 * Custom virtual joystick built with PanResponder.
 * Maps analog stick position to direction commands.
 * Sends STOP when finger lifts.
 */

import React, {useRef, useState, useCallback} from 'react';
import {View, StyleSheet, PanResponder, Animated, Dimensions} from 'react-native';

const JOYSTICK_SIZE = 180;
const KNOB_SIZE = 70;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;
const DEAD_ZONE = 15; // Ignore tiny movements

interface JoystickProps {
  onDirectionChange: (direction: string | null) => void;
}

type Direction = 'F' | 'B' | 'L' | 'R' | null;

const Joystick: React.FC<JoystickProps> = ({onDirectionChange}) => {
  const pan = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const [currentDir, setCurrentDir] = useState<Direction>(null);
  const lastDirRef = useRef<Direction>(null);

  const getDirection = useCallback((x: number, y: number): Direction => {
    const distance = Math.sqrt(x * x + y * y);
    if (distance < DEAD_ZONE) return null;

    const angle = Math.atan2(-y, x) * (180 / Math.PI);
    // angle: 0=right, 90=up, -90=down, 180/-180=left
    if (angle >= -45 && angle < 45) return 'L';      // Physical right → send L (swapped)
    if (angle >= 45 && angle < 135) return 'F';       // Up → Forward
    if (angle >= -135 && angle < -45) return 'B';     // Down → Backward
    return 'R';                                        // Physical left → send R (swapped)
  }, []);

  const emitDirection = useCallback(
    (dir: Direction) => {
      if (dir !== lastDirRef.current) {
        lastDirRef.current = dir;
        setCurrentDir(dir);
        onDirectionChange(dir);
      }
    },
    [onDirectionChange],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({x: 0, y: 0});
        pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (_, gesture) => {
        let dx = gesture.dx;
        let dy = gesture.dy;

        // Clamp to circle
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_DISTANCE) {
          dx = (dx / dist) * MAX_DISTANCE;
          dy = (dy / dist) * MAX_DISTANCE;
        }

        pan.setValue({x: dx, y: dy});
        const dir = getDirection(dx, dy);
        emitDirection(dir);
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: false,
          friction: 5,
          tension: 40,
        }).start();
        emitDirection(null);
      },
    }),
  ).current;

  const dirColor =
    currentDir === 'F'
      ? '#5B9EFF'
      : currentDir === 'B'
        ? '#FF5B5B'
        : currentDir === 'L' || currentDir === 'R'
          ? '#FFD55B'
          : '#3A4A6A';

  return (
    <View style={styles.container}>
      {/* Direction indicators */}
      <View style={styles.indicatorTop}>
        <View
          style={[
            styles.indicator,
            currentDir === 'F' && styles.indicatorActive,
          ]}
        />
      </View>
      <View style={styles.indicatorRow}>
        <View
          style={[
            styles.indicator,
            (currentDir === 'R') && styles.indicatorActiveYellow,
          ]}
        />
        {/* Joystick base */}
        <View style={styles.joystickBase}>
          {/* Grid lines for visual effect */}
          <View style={styles.gridH} />
          <View style={styles.gridV} />
          <View style={styles.gridCircle} />

          {/* Draggable knob */}
          <Animated.View
            style={[
              styles.knob,
              {
                transform: [{translateX: pan.x}, {translateY: pan.y}],
                backgroundColor: dirColor,
                borderColor: dirColor,
              },
            ]}
            {...panResponder.panHandlers}>
            <View style={styles.knobInner} />
          </Animated.View>
        </View>
        <View
          style={[
            styles.indicator,
            (currentDir === 'L') && styles.indicatorActiveYellow,
          ]}
        />
      </View>
      <View style={styles.indicatorBottom}>
        <View
          style={[
            styles.indicator,
            currentDir === 'B' && styles.indicatorActiveRed,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystickBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: '#0A1530',
    borderWidth: 2,
    borderColor: '#1A2A50',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridH: {
    position: 'absolute',
    width: JOYSTICK_SIZE - 20,
    height: 1,
    backgroundColor: '#1A2A50',
  },
  gridV: {
    position: 'absolute',
    width: 1,
    height: JOYSTICK_SIZE - 20,
    backgroundColor: '#1A2A50',
  },
  gridCircle: {
    position: 'absolute',
    width: JOYSTICK_SIZE * 0.5,
    height: JOYSTICK_SIZE * 0.5,
    borderRadius: JOYSTICK_SIZE * 0.25,
    borderWidth: 1,
    borderColor: '#1A2A50',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B9EFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  knobInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  indicatorTop: {
    marginBottom: 8,
  },
  indicatorBottom: {
    marginTop: 8,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A2030',
  },
  indicatorActive: {
    backgroundColor: '#5B9EFF',
    shadowColor: '#5B9EFF',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorActiveRed: {
    backgroundColor: '#FF5B5B',
    shadowColor: '#FF5B5B',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorActiveYellow: {
    backgroundColor: '#FFD55B',
    shadowColor: '#FFD55B',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default Joystick;
