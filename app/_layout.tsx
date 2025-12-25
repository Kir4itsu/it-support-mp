import { AppProvider } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Mencegah splash screen tertutup otomatis
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
      {/* Mendaftarkan halaman reset-password agar bisa diakses */}
      <Stack.Screen 
        name="admin/reset-password" 
        options={{ 
          headerShown: true,
          title: "Reset Password",
          headerStyle: { backgroundColor: '#7c3aed' },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Sembunyikan splash screen saat aplikasi siap
    SplashScreen.hideAsync();

    // Listener untuk menangkap event autentikasi dari Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Jika user datang dari link email reset password, paksa pindah ke halaman reset
        router.replace('/admin/reset-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

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