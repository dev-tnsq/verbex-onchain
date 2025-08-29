import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthProvider';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'Verbex - Your Gateway to Modern DeFi'
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            title: 'Login - Verbex'
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: 'Verbex'
          }} 
        />
        <Stack.Screen 
          name="(voice)" 
          options={{ 
            headerShown: false,
            title: 'Voice Mode - Verbex'
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
