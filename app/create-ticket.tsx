import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import type { CreateTicketInput, TicketCategory } from '@/types/ticket';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  Send,
  Wifi,
  UserCircle,
  HardDrive,
  Code,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

const CATEGORIES: TicketCategory[] = ['Wifi', 'Account', 'Hardware', 'Software'];

const CATEGORY_ICONS = {
  Wifi: Wifi,
  Account: UserCircle,
  Hardware: HardDrive,
  Software: Code,
};

const CATEGORY_COLORS = {
  Wifi: '#ec4899',
  Account: '#8b5cf6',
  Hardware: '#f59e0b',
  Software: '#06b6d4',
};

export default function CreateTicketScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userIdentity, setUserIdentity } = useApp();

  const [formData, setFormData] = useState<CreateTicketInput>({
    nama: userIdentity?.nama || '',
    email: userIdentity?.email || '',
    hp: userIdentity?.phone || '',
    subject: '',
    category: 'Wifi',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTicketInput, string>>>({});

  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketInput) => {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([
          {
            ...data,
            status: 'DIAJUKAN',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return ticket;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      
      setUserIdentity({
        nama: formData.nama,
        email: formData.email,
        phone: formData.hp,
      });

      Alert.alert(
        'Berhasil! 🎉',
        'Tiket Anda telah dibuat. Tim IT akan segera menindaklanjuti.',
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
      
      console.error('Create ticket error:', error);
      
      let errorMessage = 'Gagal membuat tiket. Silakan coba lagi.';
      
      if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Gagal', errorMessage);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTicketInput, string>> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.hp.trim()) {
      newErrors.hp = 'Nomor HP wajib diisi';
    } else if (!/^[0-9+]{10,15}$/.test(formData.hp)) {
      newErrors.hp = 'Nomor HP tidak valid (10-15 digit)';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject wajib diisi';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Deskripsi minimal 20 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      createTicketMutation.mutate(formData);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const updateField = (field: keyof CreateTicketInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Buat Tiket Baru</Text>
              <Text style={styles.headerSubtitle}>Laporkan masalah IT Anda</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category Selection Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <FileText size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Kategori Layanan</Text>
            </View>
            <Text style={styles.cardDescription}>
              Pilih kategori yang sesuai dengan masalah Anda
            </Text>
            
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category];
                const color = CATEGORY_COLORS[category];
                const isSelected = formData.category === category;
                
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryCard,
                      isSelected && { 
                        borderColor: color,
                        backgroundColor: `${color}10`,
                      },
                    ]}
                    onPress={() => {
                      updateField('category', category);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${color}20` }
                    ]}>
                      <Icon size={24} color={color} />
                    </View>
                    <Text style={[
                      styles.categoryLabel,
                      isSelected && { color: color, fontWeight: '700' }
                    ]}>
                      {category}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkMark, { backgroundColor: color }]}>
                        <CheckCircle2 size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Personal Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <User size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Informasi Pribadi</Text>
            </View>
            <Text style={styles.cardDescription}>
              Kami akan menghubungi Anda melalui informasi ini
            </Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={[
                styles.inputContainer,
                errors.nama && styles.inputContainerError
              ]}>
                <View style={styles.inputIcon}>
                  <User size={18} color={theme.colors.textLight} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama}
                  onChangeText={(text) => updateField('nama', text)}
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              {errors.nama && (
                <Text style={styles.errorText}>⚠️ {errors.nama}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputContainer,
                errors.email && styles.inputContainerError
              ]}>
                <View style={styles.inputIcon}>
                  <Mail size={18} color={theme.colors.textLight} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="nama@example.com"
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>⚠️ {errors.email}</Text>
              )}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor HP</Text>
              <View style={[
                styles.inputContainer,
                errors.hp && styles.inputContainerError
              ]}>
                <View style={styles.inputIcon}>
                  <Phone size={18} color={theme.colors.textLight} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="08123456789"
                  value={formData.hp}
                  onChangeText={(text) => updateField('hp', text)}
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              {errors.hp && (
                <Text style={styles.errorText}>⚠️ {errors.hp}</Text>
              )}
            </View>
          </View>

          {/* Problem Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <MessageSquare size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Detail Masalah</Text>
            </View>
            <Text style={styles.cardDescription}>
              Jelaskan masalah Anda secara detail
            </Text>

            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Judul Masalah</Text>
              <View style={[
                styles.inputContainer,
                errors.subject && styles.inputContainerError
              ]}>
                <View style={styles.inputIcon}>
                  <FileText size={18} color={theme.colors.textLight} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: WiFi kampus tidak bisa connect"
                  value={formData.subject}
                  onChangeText={(text) => updateField('subject', text)}
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              {errors.subject && (
                <Text style={styles.errorText}>⚠️ {errors.subject}</Text>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deskripsi Lengkap</Text>
              <View style={[
                styles.textAreaContainer,
                errors.description && styles.inputContainerError
              ]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Jelaskan masalah Anda secara detail...&#10;&#10;Contoh: Saya tidak bisa connect ke WiFi kampus sejak pagi ini. Sudah coba restart HP tapi tetap tidak bisa."
                  value={formData.description}
                  onChangeText={(text) => updateField('description', text)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
              <View style={styles.characterCountContainer}>
                <Text style={[
                  styles.characterCount,
                  formData.description.length >= 20 && styles.characterCountValid
                ]}>
                  {formData.description.length} / 20 karakter minimum
                </Text>
              </View>
              {errors.description && (
                <Text style={styles.errorText}>⚠️ {errors.description}</Text>
              )}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              createTicketMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createTicketMutation.isPending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {createTicketMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Send size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Kirim Tiket</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lavenderLight,
  },
  header: {
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.lavenderLight,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lavenderLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  inputContainerError: {
    borderColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}05`,
  },
  inputIcon: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
  },
  textAreaContainer: {
    backgroundColor: theme.colors.lavenderLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  textArea: {
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  characterCountValid: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.lg,
  },
  submitButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
