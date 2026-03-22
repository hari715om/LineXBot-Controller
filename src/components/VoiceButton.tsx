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
  }, []);

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

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

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
        setError('MIC PERMISSION DENIED');
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
        setError('VOICE SYSTEM FAILURE');
        setIsListening(false);
        stopPulseAnimation();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>VOCAL OVERRIDE</Text>

      <Animated.View style={[{transform: [{scale: pulseAnim}]}, isListening && styles.glowRing]}>
        <TouchableOpacity
          style={[styles.micBtn, isListening && styles.micBtnActive]}
          onPress={toggleListening}
          activeOpacity={0.7}>
          <Text style={[styles.micIcon, isListening && styles.micIconActive]}>
            {isListening ? '🔴' : '🎤'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={[styles.statusText, isListening && styles.statusTextActive]}>
        {isListening ? 'AWAITING COMMAND...' : 'SYSTEM IDLE'}
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
    backgroundColor: '#161b28', // surface_container_low
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
    backgroundColor: '#af3200', // on_tertiary_container / red glow base
    borderColor: '#ffcfc1',
    shadowColor: '#ffcfc1',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  glowRing: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 181, 158, 0.3)',
    padding: 6,
  },
  micIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  micIconActive: {
    opacity: 1,
  },
  statusText: {
    color: '#849495',
    fontSize: 10,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 16,
  },
  statusTextActive: {
    color: '#ffb59e', // tertiary_fixed_dim
  },
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
    color: '#dee2f4', // on_surface
    fontSize: 14,
    fontFamily: 'Manrope',
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 8,
  },
  matchBadge: {
    backgroundColor: '#0f6d00', // on_secondary_container
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  matchText: {
    color: '#79ff5b', // secondary_fixed
    fontSize: 11,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  errorBadge: {
    backgroundColor: 'rgba(147, 0, 10, 0.2)', // error_container transparent
    borderWidth: 1,
    borderColor: '#ffb4ab', // error
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffb4ab', // error (high contrast text)
    fontSize: 12,
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});

export default VoiceButton;
