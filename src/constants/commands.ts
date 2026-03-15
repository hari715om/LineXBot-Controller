/**
 * Robot Command Constants
 *
 * Single-character commands sent over Bluetooth to the Arduino.
 * Must match the command parsing in the Arduino sketch.
 */

// Direction commands
export const CMD_FORWARD = 'F';
export const CMD_BACKWARD = 'B';
export const CMD_LEFT = 'L';
export const CMD_RIGHT = 'R';
export const CMD_STOP = 'S';
export const CMD_SPIN = 'G';

// Speed commands
export const CMD_SPEED_1 = '1';
export const CMD_SPEED_2 = '2';
export const CMD_SPEED_3 = '3';

// Mode commands
export const CMD_AUTO_MODE = 'A';
export const CMD_MANUAL_MODE = 'M';

/**
 * Voice-to-command mapping.
 * Keys are lowercased voice recognition results.
 * Values are the Bluetooth command characters.
 */
export const VOICE_COMMAND_MAP: Record<string, string> = {
  forward: CMD_FORWARD,
  'go forward': CMD_FORWARD,
  'move forward': CMD_FORWARD,
  ahead: CMD_FORWARD,

  backward: CMD_BACKWARD,
  'go backward': CMD_BACKWARD,
  'move backward': CMD_BACKWARD,
  back: CMD_BACKWARD,
  reverse: CMD_BACKWARD,

  left: CMD_RIGHT,
  'turn left': CMD_RIGHT,
  'go left': CMD_RIGHT,

  right: CMD_LEFT,
  'turn right': CMD_LEFT,
  'go right': CMD_LEFT,

  stop: CMD_STOP,
  halt: CMD_STOP,
  'shut down': CMD_STOP,

  spin: CMD_SPIN,
  rotate: CMD_SPIN,
  '360': CMD_SPIN,

  'speed 1': CMD_SPEED_1,
  'speed one': CMD_SPEED_1,
  slow: CMD_SPEED_1,

  'speed 2': CMD_SPEED_2,
  'speed two': CMD_SPEED_2,
  medium: CMD_SPEED_2,

  'speed 3': CMD_SPEED_3,
  'speed three': CMD_SPEED_3,
  fast: CMD_SPEED_3,

  auto: CMD_AUTO_MODE,
  'auto mode': CMD_AUTO_MODE,
  automatic: CMD_AUTO_MODE,
  'line follow': CMD_AUTO_MODE,

  manual: CMD_MANUAL_MODE,
  'manual mode': CMD_MANUAL_MODE,
};

/**
 * All supported command labels for UI display
 */
export const COMMAND_LABELS: Record<string, string> = {
  [CMD_FORWARD]: 'Forward',
  [CMD_BACKWARD]: 'Backward',
  [CMD_LEFT]: 'Left',
  [CMD_RIGHT]: 'Right',
  [CMD_STOP]: 'Stop',
  [CMD_SPIN]: 'Spin',
  [CMD_SPEED_1]: 'Speed 1',
  [CMD_SPEED_2]: 'Speed 2',
  [CMD_SPEED_3]: 'Speed 3',
  [CMD_AUTO_MODE]: 'Auto',
  [CMD_MANUAL_MODE]: 'Manual',
};
