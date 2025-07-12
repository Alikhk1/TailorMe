import { registerRootComponent } from 'expo';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import { setStatusBarStyle } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { AuthProvider } from './app/AuthContext';
import './firebaseConfig';
import RootNavigator from './app/navigation/RootNavigator'; // New navigator

function App() {
  useEffect(() => {
    const prepare = async () => {
      try {
        setStatusBarStyle('light');
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync('#1a0b4d');
          await NavigationBar.setButtonStyleAsync('light');
        }
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  return (
    <AuthProvider>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

registerRootComponent(App);
export default App;
