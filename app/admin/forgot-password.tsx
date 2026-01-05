import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Mail, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'rorkapp://admin/reset-password',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Email Terkirim!',
        'Silakan cek email Anda untuk reset password. Jangan lupa periksa folder spam.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Gagal mengirim email reset password.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      console.error('Reset password error:', error);
    },
  });

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email wajib diisi');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format email tidak valid');
      return false;
    }

    return true;
  };

  const handleResetPassword = () => {
    if (validateForm()) {
      resetPasswordMutation.mutate();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#DBEAFE', '#E0E7FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Link href="/admin/login" asChild>
              <TouchableOpacity style={styles.backButton}>
                <ArrowLeft size={20} color={theme.colors.primary} />
                <Text style={styles.backText}>Kembali ke Login</Text>
              </TouchableOpacity>
            </Link>

            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.iconWrapper}>
                  <LinearGradient
                    colors={['#3B82F6', '#60A5FA']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <KeyRound size={36} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={styles.sparkleContainer}>
                    <Send size={18} color="#3B82F6" />
                  </View>
                </View>
                
                <Text style={styles.title}>Lupa Password?</Text>
                <Text style={styles.subtitle}>
                  Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Admin</Text>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Mail size={20} color="#3B82F6" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="admin@example.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (error) setError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                      editable={!resetPasswordMutation.isPending}
                    />
                  </View>
                  {error && (
                    <Animated.View>
                      <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <LinearGradient
                    colors={['#DBEAFE', '#EFF6FF']}
                    style={styles.infoBoxGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Mail size={18} color="#3B82F6" style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      Kami akan mengirimkan link reset password ke email Anda. Link berlaku selama 1 jam.
                    </Text>
                  </LinearGradient>
                </View>

                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    resetPasswordMutation.isPending && styles.resetButtonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={resetPasswordMutation.isPending ? ['#60A5FA', '#60A5FA'] : ['#3B82F6', '#2563EB']}
                    style={styles.resetButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {resetPasswordMutation.isPending ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.resetButtonText}>Mengirim...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Send size={18} color="#FFFFFF" />
                        <Text style={styles.resetButtonText}>Kirim Link Reset</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Link href="/admin/login" asChild>
                  <TouchableOpacity style={styles.backToLoginButton}>
                    <Text style={styles.backToLoginText}>Kembali ke Login</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  iconBox: {
    width: 48,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  infoBox: {
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  infoBoxGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '500',
  },
  resetButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  resetButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  backToLoginButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.3,
  },
});
