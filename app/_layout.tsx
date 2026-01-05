import { theme } from "@/constants/theme";
import { AppProvider } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mencegah splash screen tertutup otomatis
SplashScreen.preventAutoHideAsync();

// Query client dengan konfigurasi optimal
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Terjadi Kesalahan</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Terjadi kesalahan yang tidak terduga'}
          </Text>
          <Text style={styles.errorHint}>
            Silakan restart aplikasi atau hubungi admin jika masalah berlanjut.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Loading Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Memuat aplikasi...</Text>
    </View>
  );
}

// Stack Navigator dengan konfigurasi yang lebih baik
function RootLayoutNav() {
  // Default screen options untuk konsistensi
  const defaultScreenOptions = {
    headerStyle: { 
      backgroundColor: theme.colors.primary 
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: '700' as const,
      fontSize: 18,
    },
    headerShadowVisible: false,
    animation: 'slide_from_right' as const,
  };

  return (
    <Stack screenOptions={defaultScreenOptions}>
      {/* Main User Screens */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <Stack.Screen 
        name="create-ticket" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      
      <Stack.Screen 
        name="ticket/[id]" 
        options={{ 
          headerShown: true,
          title: "Detail Tiket",
          presentation: 'card',
        }} 
      />

      {/* Admin Screens - Semua headerShown: false karena dah ada custom header :) */}
      <Stack.Screen 
        name="admin/login" 
        options={{ 
          headerShown: false, // Disable default header
          presentation: 'card',
        }} 
      />
      
      <Stack.Screen 
        name="admin/register" 
        options={{ 
          headerShown: false, // Disable default header
          presentation: 'card',
        }} 
      />
      
      <Stack.Screen 
        name="admin/dashboard" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      
      <Stack.Screen 
        name="admin/forgot-password" 
        options={{ 
          headerShown: false, // Disable default header
          presentation: 'card', // Changed from modal to card
        }} 
      />
      
      <Stack.Screen 
        name="admin/reset-password" 
        options={{ 
          headerShown: false, // Disable default header
          presentation: 'card', // Changed from modal to card
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulasi loading untuk resource initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sembunyikan splash screen
        await SplashScreen.hideAsync();
        
        setIsReady(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsReady(true); // Tetap lanjut meskipun ada error
      }
    }

    prepare();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (event === 'PASSWORD_RECOVERY') {
          // Redirect ke halaman reset password
          router.replace('/admin/reset-password');
        }

        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Redirect ke home jika di admin area
          const inAdminArea = segments[0] === 'admin' && segments[1] === 'dashboard';
          if (inAdminArea) {
            router.replace('/');
          }
        }

        if (event === 'USER_UPDATED') {
          console.log('User data updated');
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, segments]);

  // Show loading screen while app is preparing
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              {/* Status Bar Configuration */}
              <StatusBar 
                barStyle="dark-content" 
                backgroundColor="transparent"
                translucent
              />
              
              <RootLayoutNav />
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.lavenderLight,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.lavenderLight,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
