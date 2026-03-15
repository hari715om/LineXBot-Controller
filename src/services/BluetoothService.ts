/**
 * BluetoothService
 *
 * Singleton wrapper around react-native-bluetooth-classic.
 * Handles device discovery, connection, and serial communication
 * with the HC-05 Bluetooth module on the Arduino.
 */

import {Platform, PermissionsAndroid} from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

type StatusListener = (status: ConnectionStatus) => void;

class BluetoothService {
  private connectedDevice: BluetoothDevice | null = null;
  private statusListeners: StatusListener[] = [];
  private _status: ConnectionStatus = 'disconnected';

  // --------------- Permissions ---------------

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Platform.Version;

      if (typeof apiLevel === 'number' && apiLevel >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(results).every(
          r => r === PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('[BT] Permission error:', err);
      return false;
    }
  }

  // --------------- Status ---------------

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(s: ConnectionStatus) {
    this._status = s;
    this.statusListeners.forEach(fn => fn(s));
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  // --------------- Discovery ---------------

  async isEnabled(): Promise<boolean> {
    try {
      return await RNBluetoothClassic.isBluetoothEnabled();
    } catch {
      return false;
    }
  }

  async requestEnable(): Promise<boolean> {
    try {
      return await RNBluetoothClassic.requestBluetoothEnabled();
    } catch {
      return false;
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      return await RNBluetoothClassic.getBondedDevices();
    } catch (err) {
      console.error('[BT] Failed to get paired devices:', err);
      return [];
    }
  }

  // --------------- Connection ---------------

  async connect(device: BluetoothDevice): Promise<boolean> {
    try {
      this.setStatus('connecting');

      const connected = await device.connect({
        delimiter: '\n',
        charset: 'utf-8',
      });

      if (connected) {
        this.connectedDevice = device;
        this.setStatus('connected');
        return true;
      } else {
        this.setStatus('disconnected');
        return false;
      }
    } catch (err) {
      console.error('[BT] Connection error:', err);
      this.setStatus('disconnected');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connectedDevice) {
        await this.connectedDevice.disconnect();
      }
    } catch (err) {
      console.error('[BT] Disconnect error:', err);
    } finally {
      this.connectedDevice = null;
      this.setStatus('disconnected');
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.connectedDevice) {
        return false;
      }
      return await this.connectedDevice.isConnected();
    } catch {
      return false;
    }
  }

  // --------------- Communication ---------------

  /**
   * Send a single-character command to the connected device.
   * Simple and fast — no isConnected() check, just write.
   */
  async send(command: string): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }

    try {
      await this.connectedDevice.write(command);
      return true;
    } catch (err: any) {
      console.error('[BT] Send error:', err);
      // If native says "Not connected", clear state so UI goes back to BT screen
      if (err?.message?.includes('Not connected')) {
        this.connectedDevice = null;
        this.setStatus('disconnected');
      }
      return false;
    }
  }

  getConnectedDeviceName(): string | null {
    return this.connectedDevice?.name ?? null;
  }
}

export default new BluetoothService();
