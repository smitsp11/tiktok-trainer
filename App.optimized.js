// Optimized App.js with Error Boundary and new providers
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

// Import optimized context providers
import { OptimizedContextProvider } from './src/context/OptimizedContextProvider';
import { OptimizedCameraProvider } from './src/context/OptimizedCameraProvider';
import { OptimizedProgressProvider } from './src/context/OptimizedProgressProvider';
import { ErrorBoundary } from './src/components';
import { COLORS } from './src/utils/constants';

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'TikTok Trainer' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ title: 'Record' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <OptimizedContextProvider>
          <OptimizedCameraProvider>
            <OptimizedProgressProvider>
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
                      headerStyle: { backgroundColor: COLORS.primary },
                      headerTintColor: COLORS.white,
                      headerTitleStyle: { fontWeight: 'bold' },
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
              <StatusBar style="light" />
            </OptimizedProgressProvider>
          </OptimizedCameraProvider>
        </OptimizedContextProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

