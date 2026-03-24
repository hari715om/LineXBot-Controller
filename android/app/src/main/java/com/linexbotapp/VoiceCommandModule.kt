package com.linexbotapp

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class VoiceCommandModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var recognizer: SpeechRecognizer? = null

    override fun getName() = "VoiceCommand"

    @ReactMethod
    fun startListening() {
        UiThreadUtil.runOnUiThread {
            // Destroy any existing instance before creating a new one
            // Guards against rapid double-tap creating two recognizers
            recognizer?.destroy()
            recognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)

            recognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onResults(results: Bundle?) {
                    val matches = results
                        ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    val text = matches?.firstOrNull() ?: ""
                    emit("onVoiceResult", text)
                    // Clean up AFTER result is emitted — not before
                    destroyRecognizer()
                }

                override fun onError(error: Int) {
                    if (error != SpeechRecognizer.ERROR_NO_MATCH &&
                        error != SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                        emit("onVoiceError", "code:$error")
                    } else {
                        // Emit empty result so JS side can reset UI cleanly
                        emit("onVoiceResult", "")
                    }
                    destroyRecognizer()
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })

            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(
                    RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                )
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
            }

            recognizer?.startListening(intent)
        }
    }

    // Called on finger RELEASE — tells Android to stop recording
    // and evaluate the audio immediately. Does NOT destroy.
    @ReactMethod
    fun stopListening() {
        UiThreadUtil.runOnUiThread {
            recognizer?.stopListening()
            // destroy() is intentionally NOT called here
            // Android needs the recognizer alive to fire onResults
        }
    }

    // Called on cancel, unmount, or timeout — hard stop with cleanup
    @ReactMethod
    fun cancelAndDestroy() {
        UiThreadUtil.runOnUiThread {
            recognizer?.cancel()
            destroyRecognizer()
        }
    }

    private fun destroyRecognizer() {
        recognizer?.destroy()
        recognizer = null
    }

    private fun emit(event: String, data: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, data)
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
