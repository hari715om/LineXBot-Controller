/**
 * RobotCommandService
 *
 * High-level service that maps user actions and voice text
 * to Bluetooth commands via BluetoothService.
 */

import BluetoothService from './BluetoothService';
import {VOICE_COMMAND_MAP, CMD_STOP} from '../constants/commands';

class RobotCommandService {
  private lastSentCommand: string | null = null;

  /**
   * Send a direct command character to the robot.
   */
  async sendCommand(command: string): Promise<boolean> {
    this.lastSentCommand = command;
    return BluetoothService.send(command);
  }

  /**
   * Convenience: send the STOP command.
   */
  async stop(): Promise<boolean> {
    return this.sendCommand(CMD_STOP);
  }

  /**
   * Reset the debounce tracker when mic is toggled off
   */
  resetVoiceTracker(): void {
    this.lastSentCommand = null;
  }

  /**
   * Process a continuous voice recognition string from partial results.
   * Finds the most recently spoken phrase by scanning from the end of the string.
   */
  async processVoiceCommand(spokenText: string): Promise<string | null> {
    const normalized = spokenText.toLowerCase().trim();

    let bestMatchCmd: string | null = null;
    let highestIndex = -1;

    // Scan backwards: find the matching phrase closest to the end of the text
    for (const [phrase, cmd] of Object.entries(VOICE_COMMAND_MAP)) {
      const matchIndex = normalized.lastIndexOf(phrase);
      
      if (matchIndex > highestIndex) {
        highestIndex = matchIndex;
        bestMatchCmd = cmd;
      } else if (matchIndex === highestIndex && matchIndex !== -1) {
        // If two phrases match at the exact same index (e.g., "go" vs "go forward")
        // Choose the longer one to avoid partial overlaps overriding specific ones
        const currentBestPhraseLengths = Object.keys(VOICE_COMMAND_MAP)
          .filter(k => VOICE_COMMAND_MAP[k] === bestMatchCmd)
          .map(k => k.length);
        const currentBestLength = Math.max(...currentBestPhraseLengths);
        
        if (phrase.length > currentBestLength) {
          bestMatchCmd = cmd;
        }
      }
    }

    if (bestMatchCmd) {
      if (bestMatchCmd !== this.lastSentCommand) {
        await this.sendCommand(bestMatchCmd);
      }
      return bestMatchCmd;
    }

    return null;
  }
}

export default new RobotCommandService();
