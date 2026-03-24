package com.linexbotapp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class VoiceCommandPackage : ReactPackage {
    override fun createNativeModules(
        ctx: ReactApplicationContext
    ): List<NativeModule> = listOf(VoiceCommandModule(ctx))

    override fun createViewManagers(
        ctx: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
