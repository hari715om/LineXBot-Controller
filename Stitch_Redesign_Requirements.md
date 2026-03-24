# Stitch Redesign Requirements

## 1. Theme & Aesthetic
- **Style:** Minimalist, high-tech, cyberpunk-inspired mobile game UI.
- **Color Palette:** Dark mode optimized. Use deep backgrounds (e.g., #060D1F or darker), neon accents (cyan, bright green, electric pink/orange), and glassmorphism sub-panels.
- **Typography:** Futuristic or highly legible technical font for labels and metrics.

## 2. Visual Hierarchy
- **Primary Focal Points:** 
  - *Initial View* (`BluetoothScreen`): The Paired Devices list (with emphasis on the HC-05 robot target card).
  - *Portrait Mode* (`ControllerScreen`): The `ControlPad` D-pad cluster and the Voice Command button.
  - *Landscape Mode* (`JoystickScreen`): The analog `Joystick` on the left panel.
- **Secondary Elements:** Speed Sliders and Mode Switches.
- **Persistent Elements:** Connection Status and Disconnect/Back Controls pinned to non-intrusive edges (Header / Top Right Panel).

## 3. Component Roster & Wiring

To ensure zero logic breakage, the redesign must incorporate identically named components and wire up the same state/props. Note: many individual components manage their own state and invoke `RobotCommandService` directly.

### Initial View (`BluetoothScreen`)
1. **Header**
   - *Static Elements:* Logo, Title, Subtitle.
2. **Bluetooth Status Bar**
   - *State Variable:* `btEnabled` (boolean).
3. **Paired Devices Section Header**
   - *State Variable:* `scanning` (boolean).
   - *Execution Function:* `scanDevices()`.
4. **Device List Area**
   - *State Variables:* `devices` (array), `scanning` (boolean), `connectingDeviceId` (string | null).
   - *Child Element (Device Card):* Display device name/ID. Needs distinct visual highlight/badge ("← LineX Bot") if name includes 'HC-05'.
   - *Execution Function:* `connectToDevice(item)` (invoked on card press).

### Portrait Mode Elements (`ControllerScreen`)
1. **Header / Connection Info**
   - *State Variables:* `connectionStatus` ('connected', 'connecting', 'disconnected'), `deviceName` (string).
   - *Execution Function:* `handleDisconnect` (onPress).
2. **ControlPad (D-Pad)**
   - *Structure needed:* 4 directional buttons (FWD, BWD, LEFT, RIGHT), 1 Center STOP button, and 1 SPIN 360° button.
   - *Execution Functions (Internal):* `handlePressIn(cmd)`, `handlePressOut()`, `handleSpin()`, `handleStop()`. Commands sent directly to service on press/release.
3. **Joystick Mode Button**
   - *Prop:* `onPress={() => navigation.navigate('Joystick')}`.
4. **SpeedSlider**
   - *State Variable (Internal):* `activeSpeed` (1, 2, 3).
   - *Execution Function (Internal):* `handleSpeedPress(speed)`.
5. **ModeSwitch**
   - *State Variable (Internal):* `activeMode` ('manual', 'auto').
   - *Execution Functions (Internal):* `handleAutoPress()`, `handleManualPress()`.
6. **VoiceButton**
   - *State Variables (Internal):* `isListening` (boolean), `spokenText` (string), `matchedCommand` (string), `error` (string).
   - *Execution Function (Internal):* `toggleListening()`.

### Landscape Mode Elements (`JoystickScreen`)
1. **Left Panel: Active Direction Label**
   - *State Variable:* `activeDirection` ('IDLE', '▲ FORWARD', '↻ SPINNING', etc.).
2. **Left Panel: Virtual Joystick**
   - *Props Required:* `onDirectionChange={(direction) => ...}`
   - *Interaction:* Draggable 360-degree knob emitting 'F', 'B', 'L', 'R', or `null` (release).
3. **Left Panel: Spin Button**
   - *Execution Function:* `handleSpin()`.
4. **Right Panel: Connection Info**
   - *State Variables:* `connectionStatus`, `deviceName`.
5. **Right Panel: Speed Controls (3 Distinct Buttons)**
   - *State Variable:* `activeSpeed` (1, 2, 3).
   - *Execution Function:* `handleSpeed(level, cmd)`.
6. **Right Panel: Mode Controls (Manual vs Auto)**
   - *State Variable:* `activeMode` ('manual', 'auto').
   - *Execution Function:* `handleMode(mode)`.
7. **Right Panel: Back Button**
   - *Execution Function:* `navigation.goBack()`.

## 4. State Indicators & Visual Cues

- **Bluetooth Initial Phase (`BluetoothScreen`):**
  - *System Status:* Dot indicator for system Bluetooth state (Green = Enabled, Red = Disabled).
  - *Scanning:* Active visual loader when fetching devices.
  - *Target Device Highlight:* The 'HC-05' (LineX Bot) card needs a distinct neon border or background color to stand out clearly from other random paired devices.
  - *Connecting Action:* Inline loading indicator inside the specific device card when connection is in progress.
- **In-App Connection Status (`Controller / Joystick`):** 
  - Glowing indicator required (e.g., Green = Connected, Yellow = Connecting, Red = Disconnected).
- **Control Pad / Joystick Active State:** 
  - Visual feedback required on D-pad press (e.g., highlight, neon glow, or inner shadow).
  - Joystick knob should glow or leave a subtle neon trail while dragged. The compass-point indicators should light up matching the input.
- **Speed & Mode Selection:**
  - Clearly distinct active states (e.g., filled neon block vs outlined stroke for inactive).
  - Segmented bars for Speed (e.g., 1, 2, or 3 bars illuminating based on active level).
- **Voice Button Status:**
  - *Standard State:* Minimal mic icon.
  - *Listening State:* Accent color (e.g., Red) with a pulsing radar/glow animation. Real-time text (`spokenText`) and matched command badge (`matchedCommand`) must appear cleanly below it when active.
