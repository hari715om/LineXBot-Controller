import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import RobotCommandService from '../services/RobotCommandService';
import {VOICE_COMMAND_MAP, COMMAND_LABELS} from '../constants/commands';
import {useRobotState} from '../context/RobotStateContext';

const {VoiceCommand} = NativeModules;
const voiceEmitter = new NativeEventEmitter(VoiceCommand);

// Safety timeout — if Android never fires onResults after finger release,
// cancel after this many ms to prevent UI hanging forever
const RESULT_TIMEOUT_MS = 3000;

const VoiceButton: React.FC = () => {
  const [isListening, setIsListening]       = useState(false);
  const [spokenText, setSpokenText]         = useState('');
  const [matchedCommand, setMatchedCommand] = useState('');
  const [error, setError]                   = useState('');
  const [pulseAnim]                         = useState(new Animated.Value(1));

  const pulseRef          = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef        = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef    = useRef(false); // ref mirror for use inside callbacks

  const {activeMode} = useRobotState();

  // ── Sync ref with state ──────────────────────────────────────────────────
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearResultTimeout();
      // cancelAndDestroy — not stopListening — on unmount
      VoiceCommand.cancelAndDestroy();
      voiceEmitter.removeAllListeners('onVoiceResult');
      voiceEmitter.removeAllListeners('onVoiceError');
      RobotCommandService.resetVoiceTracker();
    };
  }, []);

  // ── Permission ───────────────────────────────────────────────────────────
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }, []);

  // ── Animation ────────────────────────────────────────────────────────────
  const startPulse = useCallback(() => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.25, duration: 600, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1,    duration: 600, useNativeDriver: true}),
      ]),
    );
    pulseRef.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseRef.current?.stop();
    pulseRef.current = null;
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // ── Timeout helpers ──────────────────────────────────────────────────────
  const clearResultTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startResultTimeout = useCallback(() => {
    clearResultTimeout();
    timeoutRef.current = setTimeout(() => {
      // Android never responded — hard cancel
      VoiceCommand.cancelAndDestroy();
      voiceEmitter.removeAllListeners('onVoiceResult');
      voiceEmitter.removeAllListeners('onVoiceError');
      stopPulse();
      setIsListening(false);
      setError('No response — try again');
      RobotCommandService.resetVoiceTracker();
    }, RESULT_TIMEOUT_MS);
  }, [clearResultTimeout, stopPulse]);

  // ── Reset UI to idle ─────────────────────────────────────────────────────
  const resetToIdle = useCallback(() => {
    clearResultTimeout();
    stopPulse();
    setIsListening(false);
    RobotCommandService.resetVoiceTracker();
  }, [clearResultTimeout, stopPulse]);

  // ── Start listening (finger down) ────────────────────────────────────────
  const startListening = useCallback(async () => {
    // Guard — don't start if already listening (double tap protection)
    if (isListeningRef.current) return;

    const hasPerm = await requestMicPermission();
    if (!hasPerm) {
      setError('MIC PERMISSION DENIED');
      return;
    }

    setSpokenText('');
    setMatchedCommand('');
    setError('');
    setIsListening(true);
    startPulse();

    // Register listeners BEFORE calling native start
    const resultSub = voiceEmitter.addListener(
      'onVoiceResult',
      async (text: string) => {
        clearResultTimeout();
        resultSub.remove();
        errorSub.remove();

        if (!text) {
          // Empty result — no speech detected
          resetToIdle();
          return;
        }

        setSpokenText(text);

        const cmd = await RobotCommandService.processVoiceCommand(text);
        if (cmd) {
          setMatchedCommand(COMMAND_LABELS[cmd] ?? cmd);
          setError('');
        } else {
          setMatchedCommand('');
          setError(`Unknown: "${text}"`);
        }

        resetToIdle();
      },
    );

    const errorSub = voiceEmitter.addListener(
      'onVoiceError',
      (errMsg: string) => {
        clearResultTimeout();
        resultSub.remove();
        errorSub.remove();
        console.warn('[Voice] Native error:', errMsg);
        setError('Could not recognize — try again');
        resetToIdle();
      },
    );

    VoiceCommand.startListening();
  }, [
    requestMicPermission,
    startPulse,
    clearResultTimeout,
    resetToIdle,
  ]);

  // ── Stop listening (finger up) ───────────────────────────────────────────
  const stopListeningOnRelease = useCallback(() => {
    if (!isListeningRef.current) return;

    // Tell Android: stop recording NOW, evaluate immediately
    // Recognizer stays alive — onResults will fire shortly after
    VoiceCommand.stopListening();

    // Start safety timeout in case onResults never fires
    startResultTimeout();
  }, [startResultTimeout]);

  // ── Press handlers ───────────────────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    if (activeMode === 'auto') {
      setError('SWITCH TO MANUAL MODE FIRST');
      return;
    }
    startListening();
  }, [activeMode, startListening]);

  const handlePressOut = useCallback(() => {
    stopListeningOnRelease();
  }, [stopListeningOnRelease]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>VOCAL OVERRIDE</Text>

      <Animated.View
        style={[
          {transform: [{scale: pulseAnim}]},
          isListening && styles.glowRing,
        ]}>
        <TouchableOpacity
          style={[
            styles.micBtn,
            isListening && styles.micBtnActive,
            activeMode === 'auto' && styles.micBtnDisabled,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}>
          <Text style={[styles.micIcon, isListening && styles.micIconActive]}>
            {activeMode === 'auto' ? '🔒' : isListening ? '🔴' : '🎤'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={[styles.statusText, isListening && styles.statusTextActive]}>
        {isListening ? 'LISTENING...' : activeMode === 'auto' ? 'LOCKED' : 'HOLD TO SPEAK'}
      </Text>

      {spokenText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.spokenText}>"{spokenText.toUpperCase()}"</Text>
          {matchedCommand ? (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>ACTION: {matchedCommand}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBadge}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionTitle: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#161b28',
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00dbe9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  micBtnActive: {
    backgroundColor: '#af3200',
    borderColor: '#ffcfc1',
    shadowColor: '#ffcfc1',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  micBtnDisabled: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(59, 73, 75, 0.2)',
    opacity: 0.45,
  },
  glowRing: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 181, 158, 0.3)',
    padding: 6,
  },
  micIcon: {fontSize: 32, opacity: 0.6},
  micIconActive: {opacity: 1},
  statusText: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 16,
  },
  statusTextActive: {color: '#ffb59e'},
  resultContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#161b28',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.2)',
  },
  spokenText: {
    color: '#dee2f4',
    fontSize: 14,
    fontFamily: 'Manrope',
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 8,
  },
  matchBadge: {
    backgroundColor: '#0f6d00',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  matchText: {
    color: '#79ff5b',
    fontSize: 11,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  errorBadge: {
    backgroundColor: 'rgba(147, 0, 10, 0.2)',
    borderWidth: 1,
    borderColor: '#ffb4ab',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 12,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});

export default VoiceButton;
