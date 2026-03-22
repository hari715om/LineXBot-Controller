import React, {useRef, useState, useCallback} from 'react';
import {View, StyleSheet, PanResponder, Animated, Dimensions} from 'react-native';

const JOYSTICK_SIZE = 200; // slightly larger
const KNOB_SIZE = 80;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;
const DEAD_ZONE = 15;

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
    if (angle >= -45 && angle < 45) return 'L';      // Physical right -> send L (swapped)
    if (angle >= 45 && angle < 135) return 'F';
    if (angle >= -135 && angle < -45) return 'B';
    return 'R';
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
          friction: 6,
          tension: 50,
        }).start();
        emitDirection(null);
      },
    }),
  ).current;

  // Stitch dynamic colors
  const dirColor =
    currentDir === 'F'
      ? '#00f0ff' // primary_container
      : currentDir === 'B'
        ? '#af3200' // on_tertiary_container (red/critical)
        : currentDir === 'L' || currentDir === 'R'
          ? '#2ff801' // secondary_container (yellow/greenish)
          : 'rgba(47, 53, 66, 0.8)'; // surface_variant (idle glass)

  return (
    <View style={styles.container}>
      <View style={styles.indicatorTop}>
        <View style={[styles.indicator, currentDir === 'F' && styles.indicatorActive]} />
      </View>
      <View style={styles.indicatorRow}>
        <View style={[styles.indicator, currentDir === 'R' && styles.indicatorActiveYellow]} />
        
        <View style={styles.joystickBase}>
          <View style={styles.gridH} />
          <View style={styles.gridV} />
          <View style={styles.gridCircleOuter} />
          <View style={styles.gridCircleInner} />

          <Animated.View
            style={[
              styles.knob,
              {
                transform: [{translateX: pan.x}, {translateY: pan.y}],
                backgroundColor: dirColor,
                shadowColor: dirColor,
              },
              currentDir ? styles.knobActive : null
            ]}
            {...panResponder.panHandlers}>
            <View style={styles.knobInner} />
          </Animated.View>
        </View>
        
        <View style={[styles.indicator, currentDir === 'L' && styles.indicatorActiveYellow]} />
      </View>
      <View style={styles.indicatorBottom}>
        <View style={[styles.indicator, currentDir === 'B' && styles.indicatorActiveRed]} />
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
    backgroundColor: '#0e1320', // surface (the infinite void)
    borderWidth: 1,
    borderColor: 'rgba(132, 148, 149, 0.2)', // outline tint
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridH: {
    position: 'absolute',
    width: JOYSTICK_SIZE,
    height: 1,
    backgroundColor: 'rgba(59, 73, 75, 0.3)', // outline_variant
  },
  gridV: {
    position: 'absolute',
    width: 1,
    height: JOYSTICK_SIZE,
    backgroundColor: 'rgba(59, 73, 75, 0.3)',
  },
  gridCircleOuter: {
    position: 'absolute',
    width: JOYSTICK_SIZE * 0.75,
    height: JOYSTICK_SIZE * 0.75,
    borderRadius: JOYSTICK_SIZE * 0.375,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
  },
  gridCircleInner: {
    position: 'absolute',
    width: JOYSTICK_SIZE * 0.3,
    height: JOYSTICK_SIZE * 0.3,
    borderRadius: JOYSTICK_SIZE * 0.15,
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
    backgroundColor: '#161b28', // surface_container_low
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  knobActive: {
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  knobInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  indicatorTop: { marginBottom: 16 },
  indicatorBottom: { marginTop: 16 },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  indicator: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2f3542', // surface_variant
  },
  indicatorActive: {
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  indicatorActiveRed: {
    backgroundColor: '#ffb59e',
    shadowColor: '#ffb59e',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  indicatorActiveYellow: {
    backgroundColor: '#2ff801',
    shadowColor: '#2ff801',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default Joystick;
