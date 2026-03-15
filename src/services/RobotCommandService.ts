/**
 * RobotCommandService
 *
 * High-level service that maps user actions and voice text
 * to Bluetooth commands via BluetoothService.
 */

import BluetoothService from './BluetoothService';
import {VOICE_COMMAND_MAP, CMD_STOP} from '../constants/commands';

class RobotCommandService {
  /**
   * Send a direct command character to the robot.
   */
  async sendCommand(command: string): Promise<boolean> {
    return BluetoothService.send(command);
  }

  /**
   * Convenience: send the STOP command.
   */
  async stop(): Promise<boolean> {
    return this.sendCommand(CMD_STOP);
  }

  /**
   * Process a voice recognition result string.
   * Tries to match against the VOICE_COMMAND_MAP.
   *
   * @returns The command sent, or null if unrecognized.
   */
  async processVoiceCommand(spokenText: string): Promise<string | null> {
    const normalized = spokenText.toLowerCase().trim();

    // Direct match
    if (VOICE_COMMAND_MAP[normalized]) {
      const cmd = VOICE_COMMAND_MAP[normalized];
      await this.sendCommand(cmd);
      return cmd;
    }

    // Partial / fuzzy match — check if spoken text contains a known phrase
    for (const [phrase, cmd] of Object.entries(VOICE_COMMAND_MAP)) {
      if (normalized.includes(phrase)) {
        await this.sendCommand(cmd);
        return cmd;
      }
    }

    console.warn(`[Voice] Unrecognized command: "${spokenText}"`);
    return null;
  }
}

export default new RobotCommandService();
