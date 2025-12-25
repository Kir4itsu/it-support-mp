import { AppProvider } from "@/contexts/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="create-ticket" 
        options={{ 
          headerShown: true,
          title: "Buat Tiket Baru",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="ticket/[id]" 
        options={{ 
          headerShown: true,
          title: "Detail Tiket",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="admin/login" 
        options={{ 
          headerShown: true,
          title: "Admin Login",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="admin/register" 
        options={{ 
          headerShown: true,
          title: "Admin Register",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="admin/dashboard" 
        options={{ 
          headerShown: true,
          title: "Admin Dashboard",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="admin/forgot-password" 
        options={{ 
          headerShown: true,
          title: "Lupa Password",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AppProvider>
    </QueryClientProvider>
  );
}
