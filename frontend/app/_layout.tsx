import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ImageBackground } from 'react-native'
import { useAuthStore } from '../store/authStore'

export default function RootLayout() {
  const { loadFromStorage, isLoaded } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [])

  if (!isLoaded) return null;

  return (
    <>
      <ImageBackground
      source={require('../assets/background/bgfargosilat.png')}
      style={{flex:1}}
      // resizeMethod='repeat'
      resizeMode='repeat'
      >
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(official)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </ImageBackground>
    </>
  )
}