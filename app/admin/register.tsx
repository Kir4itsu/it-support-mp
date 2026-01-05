import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, User, UserPlus, Sparkles, Shield } from 'lucide-react-native';
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

export default function AdminRegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
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

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Registrasi Berhasil!',
        'Silakan cek email Anda untuk verifikasi akun. Jangan lupa periksa folder spam jika email tidak muncul di inbox.',
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
      
      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';
      
      if (error?.message?.includes('User already registered')) {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (error?.message?.includes('Unable to validate email')) {
        errorMessage = 'Format email tidak valid.';
      } else if (error?.message?.includes('Database error')) {
        errorMessage = 'Terjadi kesalahan database. Pastikan SQL schema sudah dijalankan dengan benar.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Registrasi Gagal', errorMessage);
      console.error('Register error:', error);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      registerMutation.mutate();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#DDD6FE', '#EDE9FE', '#FFFFFF']}
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
            <Link href="/" asChild>
              <TouchableOpacity style={styles.backButton}>
                <ArrowLeft size={20} color={theme.colors.primary} />
                <Text style={styles.backText}>Kembali</Text>
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
                    colors={['#7C3AED', '#8B5CF6']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <UserPlus size={36} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={styles.sparkleContainer}>
                    <Shield size={20} color="#7C3AED" fill="#7C3AED" />
                  </View>
                </View>
                
                <Text style={styles.title}>Buat Akun Admin</Text>
                <Text style={styles.subtitle}>
                  Daftar untuk mengelola tiket IT Support
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Nama Lengkap <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <User size={20} color={theme.colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChangeText={(text) => updateField('name', text)}
                      placeholderTextColor="#9CA3AF"
                      editable={!registerMutation.isPending}
                    />
                  </View>
                  {errors.name && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.name}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Email <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Mail size={20} color={theme.colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChangeText={(text) => updateField('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                      editable={!registerMutation.isPending}
                    />
                  </View>
                  {errors.email && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Password <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Lock size={20} color={theme.colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChangeText={(text) => updateField('password', text)}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                      editable={!registerMutation.isPending}
                    />
                  </View>
                  {errors.password && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Konfirmasi Password <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <View style={styles.iconBox}>
                      <Lock size={20} color={theme.colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChangeText={(text) => updateField('confirmPassword', text)}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                      editable={!registerMutation.isPending}
                    />
                  </View>
                  {errors.confirmPassword && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <LinearGradient
                    colors={['#EDE9FE', '#F3F0FF']}
                    style={styles.infoBoxGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.infoIconBox}>
                      <Sparkles size={18} color="#7C3AED" fill="#7C3AED" />
                    </View>
                    <Text style={styles.infoText}>
                      Setelah registrasi, Anda akan menerima email verifikasi. Pastikan untuk cek folder spam jika email tidak muncul di inbox.
                    </Text>
                  </LinearGradient>
                </View>

                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    registerMutation.isPending && styles.registerButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={registerMutation.isPending}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={registerMutation.isPending ? ['#A78BFA', '#A78BFA'] : ['#7C3AED', '#6D28D9']}
                    style={styles.registerButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {registerMutation.isPending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Sudah punya akun? </Text>
                  <Link href="/admin/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Masuk di sini</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
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
    marginBottom: 28,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
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
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  required: {
    color: '#EF4444',
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
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  infoBoxGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconBox: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  registerButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '700',
  },
});
