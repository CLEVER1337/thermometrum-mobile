import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DeviceScreen from './DeviceScreen';
import DevicesScreen from './DevicesScreen';
import type { RootStackParamList } from './navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Devices" component={DevicesScreen} options={{ title: 'Thermometrum' }} />
          <Stack.Screen
            name="Device"
            component={DeviceScreen}
            options={({ route }) => ({ title: route.params.deviceId })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
