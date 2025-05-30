import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { AuthProvider } from './src/contexts/AuthContext'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  )
}


