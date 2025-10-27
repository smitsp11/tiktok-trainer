import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PromptCardScreen from './src/screens/PromptCardScreen';

// Import context providers
import { ContextProvider } from './src/context/ContextProvider';
import { CameraProvider } from './src/context/CameraProvider';
import { ProgressProvider } from './src/context/ProgressProvider';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF0050',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#FF0050',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ContextProvider>
        <CameraProvider>
          <ProgressProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen 
                  name="Main" 
                  component={TabNavigator} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="PromptCard" 
                  component={PromptCardScreen}
                  options={{
                    title: 'Recording Prompt',
                    headerStyle: { backgroundColor: '#FF0050' },
                    headerTintColor: '#fff',
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="light" />
          </ProgressProvider>
        </CameraProvider>
      </ContextProvider>
    </SafeAreaProvider>
  );
}
