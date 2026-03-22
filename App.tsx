/**
 * LineX Bot Controller App
 *
 * Root component with React Navigation stack.
 * BluetoothScreen → ControllerScreen
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BluetoothScreen from './src/screens/BluetoothScreen';
import ControllerScreen from './src/screens/ControllerScreen';
import JoystickScreen from './src/screens/JoystickScreen';

const Stack = createNativeStackNavigator();

import {RobotStateProvider} from './src/context/RobotStateContext';

const App: React.FC = () => {
  return (
    <RobotStateProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Bluetooth"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {backgroundColor: '#060D1F'},
          }}>
          <Stack.Screen
            name="Bluetooth"
            component={BluetoothScreen}
            options={{title: 'Connect'}}
          />
          <Stack.Screen
            name="Controller"
            component={ControllerScreen}
            options={{
              title: 'Controller',
              gestureEnabled: false, // prevent accidental back swipe
            }}
          />
          <Stack.Screen
            name="Joystick"
            component={JoystickScreen}
            options={{
              title: 'Joystick',
              gestureEnabled: false,
              orientation: 'landscape',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RobotStateProvider>
  );
};

export default App;
