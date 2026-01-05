import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react-native';
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

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/admin/dashboard' as any);
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Login gagal. Silakan periksa email dan password Anda.';
      
      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah.';
      } else if (error?.message?.includes('Email not confirmed')) {
        errorMessage = 'Email belum diverifikasi. Silakan cek inbox/spam Anda.';
      } else if (error?.message?.includes('not confirmed')) {
        errorMessage = 'Akun belum diverifikasi. Periksa email verifikasi di inbox atau folder spam.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Gagal', errorMessage);
      console.error('Login error:', error);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      loginMutation.mutate();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8D5F2', '#F5EBFF', '#FFFFFF']}
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
                    colors={['#8B5CF6', '#A78BFA']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Lock size={36} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={styles.sparkleContainer}>
                    <Sparkles size={20} color="#8B5CF6" fill="#8B5CF6" />
                  </View>
                </View>
                
                <Text style={styles.title}>Selamat Datang!</Text>
                <Text style={styles.subtitle}>
                  Login sebagai Admin IT Support
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Admin</Text>
                  <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Mail size={20} color={theme.colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="admin@example.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                      editable={!loginMutation.isPending}
                    />
                  </View>
                  {errors.email && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <View style={styles.iconBox}>
                      <Lock size={20} color={theme.colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Masukkan password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                      editable={!loginMutation.isPending}
                    />
                  </View>
                  {errors.password && (
                    <Animated.View>
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </Animated.View>
                  )}
                </View>

                <Link href="/admin/forgot-password" asChild>
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loginMutation.isPending && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loginMutation.isPending}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={loginMutation.isPending ? ['#A78BFA', '#A78BFA'] : ['#8B5CF6', '#7C3AED']}
                    style={styles.loginButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loginMutation.isPending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Masuk</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Belum punya akun admin? </Text>
                  <Link href="/admin/register" asChild>
                    <TouchableOpacity>
                      <Text style={styles.registerLink}>Daftar di sini</Text>
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
    shadowColor: '#8B5CF6',
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
    shadowColor: '#8B5CF6',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '700',
  },
});
