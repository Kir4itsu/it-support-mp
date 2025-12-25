import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import type { CreateTicketInput, TicketCategory } from '@/types/ticket';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
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

export default function CreateTicketScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userIdentity, setUserIdentity } = useApp();

  const [formData, setFormData] = useState<CreateTicketInput>({
    nama: '',
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
        email: formData.email,
        phone: formData.hp,
      });

      Alert.alert(
        'Berhasil!',
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
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Gagal membuat tiket. Silakan coba lagi.';
      
      if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      if (error?.hint) {
        errorMessage += `\n\nHint: ${error.hint}`;
      }
      
      Alert.alert('Error Detail', errorMessage);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nama Lengkap <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.nama && styles.inputError]}
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChangeText={(text) => updateField('nama', text)}
                placeholderTextColor={theme.colors.textLight}
              />
              {errors.nama && <Text style={styles.errorText}>{errors.nama}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="nama@example.com"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textLight}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nomor HP <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.hp && styles.inputError]}
                placeholder="08123456789"
                value={formData.hp}
                onChangeText={(text) => updateField('hp', text)}
                keyboardType="phone-pad"
                placeholderTextColor={theme.colors.textLight}
              />
              {errors.hp && <Text style={styles.errorText}>{errors.hp}</Text>}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Detail Masalah</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Kategori <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => {
                      updateField('category', category);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.category === category && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Subject <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.subject && styles.inputError]}
                placeholder="Contoh: Tidak bisa connect ke WiFi kampus"
                value={formData.subject}
                onChangeText={(text) => updateField('subject', text)}
                placeholderTextColor={theme.colors.textLight}
              />
              {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Deskripsi Masalah <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="Jelaskan masalah Anda secara detail (minimal 20 karakter)"
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={theme.colors.textLight}
              />
              <View style={styles.characterCount}>
                <Text style={styles.characterCountText}>
                  {formData.description.length} karakter
                </Text>
              </View>
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>
          </View>
        </ScrollView>

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
            {createTicketMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Kirim Tiket</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lavenderLight,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
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
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    height: 120,
    paddingTop: theme.spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  characterCountText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.lg,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
