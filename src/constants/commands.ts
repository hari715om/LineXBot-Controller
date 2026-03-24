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
  // Forward
  forward: CMD_FORWARD, 'go forward': CMD_FORWARD, 'move forward': CMD_FORWARD,
  ahead: CMD_FORWARD, straight: CMD_FORWARD, 'drive up': CMD_FORWARD, 'push forward': CMD_FORWARD,
  
  // Backward
  backward: CMD_BACKWARD, 'go backward': CMD_BACKWARD, 'move backward': CMD_BACKWARD,
  back: CMD_BACKWARD, reverse: CMD_BACKWARD, 'go back': CMD_BACKWARD, 'drive back': CMD_BACKWARD,
  
  // Left -> Right logic inverted per physical robot constraint
  left: CMD_RIGHT, 'turn left': CMD_RIGHT, 'go left': CMD_RIGHT, 'steer left': CMD_RIGHT, 'pan left': CMD_RIGHT,
  
  // Right -> Left logic inverted
  right: CMD_LEFT, 'turn right': CMD_LEFT, 'go right': CMD_LEFT, 'steer right': CMD_LEFT, 'pan right': CMD_LEFT,
  
  // Stop
  stop: CMD_STOP, halt: CMD_STOP, 'shut down': CMD_STOP, brake: CMD_STOP, freeze: CMD_STOP, 'kill switch': CMD_STOP,
  
  // Spin
  spin: CMD_SPIN, rotate: CMD_SPIN, '360': CMD_SPIN, twirl: CMD_SPIN, 'spin around': CMD_SPIN,
  
  // Speeds
  'speed 1': CMD_SPEED_1, 'speed one': CMD_SPEED_1, slow: CMD_SPEED_1, 'gear 1': CMD_SPEED_1, 'speed minimum': CMD_SPEED_1,
  'speed 2': CMD_SPEED_2, 'speed two': CMD_SPEED_2, medium: CMD_SPEED_2, 'gear 2': CMD_SPEED_2, 'speed normal': CMD_SPEED_2,
  'speed 3': CMD_SPEED_3, 'speed three': CMD_SPEED_3, fast: CMD_SPEED_3, 'gear 3': CMD_SPEED_3, 'speed maximum': CMD_SPEED_3,
  
  // Modes
  auto: CMD_AUTO_MODE, 'auto mode': CMD_AUTO_MODE, automatic: CMD_AUTO_MODE, 'line follow': CMD_AUTO_MODE, 'self drive': CMD_AUTO_MODE,
  manual: CMD_MANUAL_MODE, 'manual mode': CMD_MANUAL_MODE, 'user control': CMD_MANUAL_MODE, 'take control': CMD_MANUAL_MODE,
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

/**
 * Voice aliases for fuzzy matching.
 * Each entry has the spoken alias, the command it maps to,
 * and a weight (higher = preferred when scores are equal).
 * Kept separate from VOICE_COMMAND_MAP so exact matching still
 * runs first and fuzzy is only used as fallback.
 */
export interface VoiceAlias {
  alias: string;
  cmd: string;
  weight: number;
}

export const VOICE_ALIASES: VoiceAlias[] = [
  // ── Forward ──────────────────────────────────────────────
  {alias: 'forward',      cmd: CMD_FORWARD, weight: 10},
  {alias: 'go forward',   cmd: CMD_FORWARD, weight: 10},
  {alias: 'move forward', cmd: CMD_FORWARD, weight: 10},
  {alias: 'go front',     cmd: CMD_FORWARD, weight: 9},
  {alias: 'ahead',        cmd: CMD_FORWARD, weight: 8},
  {alias: 'straight',     cmd: CMD_FORWARD, weight: 8},
  {alias: 'advance',      cmd: CMD_FORWARD, weight: 7},

  // ── Backward ─────────────────────────────────────────────
  {alias: 'backward',     cmd: CMD_BACKWARD, weight: 10},
  {alias: 'go backward',  cmd: CMD_BACKWARD, weight: 10},
  {alias: 'reverse',      cmd: CMD_BACKWARD, weight: 10},
  {alias: 'back',         cmd: CMD_BACKWARD, weight: 9},
  {alias: 'go back',      cmd: CMD_BACKWARD, weight: 9},
  {alias: 'move back',    cmd: CMD_BACKWARD, weight: 8},

  // ── Left (inverted per your robot constraint) ─────────────
  {alias: 'left',         cmd: CMD_RIGHT, weight: 10},
  {alias: 'turn left',    cmd: CMD_RIGHT, weight: 10},
  {alias: 'go left',      cmd: CMD_RIGHT, weight: 9},
  {alias: 'steer left',   cmd: CMD_RIGHT, weight: 8},

  // ── Right (inverted) ──────────────────────────────────────
  {alias: 'right',        cmd: CMD_LEFT, weight: 10},
  {alias: 'turn right',   cmd: CMD_LEFT, weight: 10},
  {alias: 'go right',     cmd: CMD_LEFT, weight: 9},
  {alias: 'steer right',  cmd: CMD_LEFT, weight: 8},

  // ── Stop ──────────────────────────────────────────────────
  {alias: 'stop',         cmd: CMD_STOP, weight: 10},
  {alias: 'halt',         cmd: CMD_STOP, weight: 10},
  {alias: 'brake',        cmd: CMD_STOP, weight: 9},
  {alias: 'freeze',       cmd: CMD_STOP, weight: 8},
  {alias: 'pause',        cmd: CMD_STOP, weight: 7},

  // ── Spin ──────────────────────────────────────────────────
  {alias: 'spin',         cmd: CMD_SPIN, weight: 10},
  {alias: 'rotate',       cmd: CMD_SPIN, weight: 9},
  {alias: 'spin around',  cmd: CMD_SPIN, weight: 9},
  {alias: 'turn around',  cmd: CMD_SPIN, weight: 8},

  // ── Speeds ────────────────────────────────────────────────
  {alias: 'slow',         cmd: CMD_SPEED_1, weight: 9},
  {alias: 'speed one',    cmd: CMD_SPEED_1, weight: 8},
  {alias: 'speed 1',      cmd: CMD_SPEED_1, weight: 8},
  {alias: 'medium',       cmd: CMD_SPEED_2, weight: 9},
  {alias: 'speed two',    cmd: CMD_SPEED_2, weight: 8},
  {alias: 'speed 2',      cmd: CMD_SPEED_2, weight: 8},
  {alias: 'fast',         cmd: CMD_SPEED_3, weight: 9},
  {alias: 'speed three',  cmd: CMD_SPEED_3, weight: 8},
  {alias: 'speed 3',      cmd: CMD_SPEED_3, weight: 8},

  // ── Modes ─────────────────────────────────────────────────
  {alias: 'auto',         cmd: CMD_AUTO_MODE,   weight: 10},
  {alias: 'auto mode',    cmd: CMD_AUTO_MODE,   weight: 10},
  {alias: 'automatic',    cmd: CMD_AUTO_MODE,   weight: 9},
  {alias: 'line follow',  cmd: CMD_AUTO_MODE,   weight: 8},
  {alias: 'manual',       cmd: CMD_MANUAL_MODE, weight: 10},
  {alias: 'manual mode',  cmd: CMD_MANUAL_MODE, weight: 10},
];
