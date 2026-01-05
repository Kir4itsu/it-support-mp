import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
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

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        Alert.alert(
          'Link Tidak Valid',
          'Link reset password tidak valid atau sudah kedaluwarsa. Silakan request link baru.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/admin/forgot-password' as any),
            },
          ]
        );
        return;
      }

      setIsSessionReady(true);
      console.log('Session ready for password reset');
    } catch (error) {
      console.error('Session check error:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan. Silakan coba lagi.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/admin/forgot-password' as any),
          },
        ]
      );
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Password Berhasil Diubah!',
        'Password Anda telah berhasil diubah. Silakan login dengan password baru.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/admin/login' as any),
          },
        ]
      );
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Gagal mengubah password. Silakan coba lagi.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      console.error('Update password error:', error);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = () => {
    if (validateForm()) {
      updatePasswordMutation.mutate();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  if (!isSessionReady) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#C7D2FE', '#DDD6FE', '#FFFFFF']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContent}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.loadingIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Shield size={40} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <ActivityIndicator size="large" color="#6366F1" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Memverifikasi link...</Text>
          <Text style={styles.loadingSubtext}>Mohon tunggu sebentar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#C7D2FE', '#DDD6FE', '#FFFFFF']}
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
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Lock size={36} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={styles.sparkleContainer}>
                    <CheckCircle size={20} color="#10B981" fill="#10B981" />
                  </View>
                </View>
                
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Buat password baru yang kuat dan mudah diingat
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password Baru</Text>
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Lock size={20} color="#6366F1" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#9CA3AF"
                      editable={!updatePasswordMutation.isPending}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Konfirmasi Password</Text>
                  <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Lock size={20} color="#6366F1" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ketik ulang password baru"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#9CA3AF"
                      editable={!updatePasswordMutation.isPending}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.strengthBox}>
                  <LinearGradient
                    colors={['#ECFDF5', '#D1FAE5']}
                    style={styles.strengthBoxGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Shield size={18} color="#10B981" style={styles.strengthIcon} />
                    <View style={styles.strengthTextContainer}>
                      <Text style={styles.strengthTitle}>Tips Password Kuat:</Text>
                      <Text style={styles.strengthText}>
                        • Minimal 6 karakter{'\n'}
                        • Kombinasi huruf & angka{'\n'}
                        • Gunakan karakter unik
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    updatePasswordMutation.isPending && styles.resetButtonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={updatePasswordMutation.isPending}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={updatePasswordMutation.isPending ? ['#818CF8', '#818CF8'] : ['#6366F1', '#8B5CF6']}
                    style={styles.resetButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {updatePasswordMutation.isPending ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.resetButtonText}>Mengubah...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <CheckCircle size={18} color="#FFFFFF" />
                        <Text style={styles.resetButtonText}>Ubah Password</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
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
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingSpinner: {
    marginVertical: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '700',
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
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
    shadowColor: '#6366F1',
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
    padding: 4,
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
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6366F1',
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
  eyeButton: {
    padding: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  strengthBox: {
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  strengthBoxGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  strengthIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  strengthTextContainer: {
    flex: 1,
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 6,
  },
  strengthText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
    fontWeight: '500',
  },
  resetButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366F1',
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
});
