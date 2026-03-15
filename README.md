# LineX Bot Controller 🤖🚙

A custom React Native Android application built to remotely control an Arduino-powered line-following robot via Bluetooth Classic (HC-05 module). 

## Features
- **Bluetooth Connection:** Auto-scans and connects to HC-05 paired devices.
- **Dual Control Interfaces:**
  - Classic Portrait D-Pad controls.
  - Landscape Virtual Joystick for precise 360-degree analog control.
- **Robot Modes:** Toggle instantly between Manual (Bluetooth) and Auto (Line Follower) modes via the app.
- **Speed Control:** Remote 3-tier speed adjustment (Slow/Medium/Fast).
- **Voice Commands:** Tap the mic to move forward, reverse, or spin via speech recognition.

## Tech Stack
- **Framework:** React Native CLI (TypeScript)
- **Bluetooth:** `react-native-bluetooth-classic` (RFCOMM Serial)
- **Voice:** `@react-native-voice/voice`
- **Hardware required:** Arduino Uno/Nano, HC-05 Module, L298N Motor Driver, 3x IR Sensors.

## Quick Start
1. Power on the robot and pair your Android phone to the HC-05 module in system settings (PIN: `1234`).
2. Download and install the latest [app-release.apk](/android/app/build/outputs/apk/release/app-release.apk) onto your phone.
3. Open the app, select `HC-05`, and start driving!

*(For developers: To build from source, run `npm install` followed by `npx react-native run-android`)*
