/**
 * VoiceButton Component
 *
 * Microphone button that uses @react-native-voice/voice
 * for speech-to-text, then maps the recognized text to a
 * robot command via RobotCommandService.
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import RobotCommandService from '../services/RobotCommandService';
import {COMMAND_LABELS} from '../constants/commands';

const VoiceButton: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [matchedCommand, setMatchedCommand] = useState('');
  const [error, setError] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Request microphone permission (Android)
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }, []);

  // Set up Voice event handlers
  useEffect(() => {
    const onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] ?? '';
      setSpokenText(text);
      processCommand(text);
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
      console.warn('[Voice] Error:', e.error);
      setError('Could not recognize speech');
      setIsListening(false);
      stopPulseAnimation();
    };

    const onSpeechEnd = () => {
      setIsListening(false);
      stopPulseAnimation();
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process recognized text
  const processCommand = async (text: string) => {
    const cmd = await RobotCommandService.processVoiceCommand(text);
    if (cmd) {
      setMatchedCommand(COMMAND_LABELS[cmd] ?? cmd);
      setError('');
    } else {
      setMatchedCommand('');
      setError(`Unknown: "${text}"`);
    }
  };

  // Pulse animation while listening
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // Toggle listening
  const toggleListening = async () => {
    if (isListening) {
      try {
        await Voice.stop();
      } catch (e) {
        console.error('[Voice] Stop error:', e);
      }
      setIsListening(false);
      stopPulseAnimation();
    } else {
      const hasPerm = await requestMicPermission();
      if (!hasPerm) {
        setError('Microphone permission denied');
        return;
      }

      setSpokenText('');
      setMatchedCommand('');
      setError('');
      setIsListening(true);
      startPulseAnimation();

      try {
        await Voice.start('en-US');
      } catch (e) {
        console.error('[Voice] Start error:', e);
        setError('Failed to start voice recognition');
        setIsListening(false);
        stopPulseAnimation();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>VOICE COMMAND</Text>

      {/* Microphone button */}
      <Animated.View style={{transform: [{scale: pulseAnim}]}}>
        <TouchableOpacity
          style={[styles.micBtn, isListening && styles.micBtnActive]}
          onPress={toggleListening}
          activeOpacity={0.7}>
          <Text style={styles.micIcon}>{isListening ? '🔴' : '🎤'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Status text */}
      <Text style={styles.statusText}>
        {isListening
          ? 'Listening...'
          : 'Tap to speak'}
      </Text>

      {/* Result display */}
      {spokenText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.spokenText}>"{spokenText}"</Text>
          {matchedCommand ? (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>→ {matchedCommand}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Error display */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#8B9CC7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1A2A50',
    borderWidth: 2,
    borderColor: '#2E4A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: {
    backgroundColor: '#3A1A1A',
    borderColor: '#FF5B5B',
  },
  micIcon: {
    fontSize: 28,
  },
  statusText: {
    color: '#5A6A8A',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  spokenText: {
    color: '#8B9CC7',
    fontSize: 13,
    fontStyle: 'italic',
  },
  matchBadge: {
    backgroundColor: '#1A3A28',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
  matchText: {
    color: '#5BFFB0',
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF5B5B',
    fontSize: 12,
    marginTop: 8,
  },
});

export default VoiceButton;
